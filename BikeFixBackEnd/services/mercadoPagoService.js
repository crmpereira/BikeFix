const mercadopago = require('mercadopago');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  sandbox: process.env.NODE_ENV !== 'production'
});

class MercadoPagoService {
  
  /**
   * Criar preferência de pagamento
   */
  async createPaymentPreference(appointmentId, paymentData) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('cyclist', 'name email phone')
        .populate('workshop', 'name email workshopData');
      
      if (!appointment) {
        throw new Error('Agendamento não encontrado');
      }
      
      const { cyclist, workshop } = appointment;
      const totalAmount = appointment.pricing.totalPrice;
      const platformFee = appointment.pricing.platformFee;
      const workshopAmount = appointment.pricing.workshopAmount;
      
      // Criar preferência no Mercado Pago
      const preference = {
        items: [{
          id: appointmentId,
          title: `Serviço de Bike - ${workshop.name}`,
          description: `Agendamento de serviço de bicicleta`,
          category_id: 'services',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: totalAmount
        }],
        
        payer: {
          name: cyclist.name,
          email: cyclist.email,
          phone: {
            area_code: cyclist.phone?.substring(0, 2) || '11',
            number: cyclist.phone?.substring(2) || '999999999'
          },
          identification: {
            type: paymentData.identificationType || 'CPF',
            number: paymentData.identificationNumber || '00000000000'
          },
          address: {
            street_name: paymentData.address?.street || 'Rua Principal',
            street_number: paymentData.address?.number || '123',
            zip_code: paymentData.address?.zipCode || '01000000'
          }
        },
        
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`
        },
        
        auto_return: 'approved',
        
        external_reference: appointmentId,
        
        notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
        
        statement_descriptor: 'BIKEFIX',
        
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        
        // Configuração de split de pagamento (Marketplace)
        marketplace: process.env.MERCADO_PAGO_MARKETPLACE_ID,
        
        // Taxas e comissões
        marketplace_fee: platformFee,
        
        // Dados adicionais
        additional_info: {
          items: [{
            id: appointmentId,
            title: `Serviço de Bike - ${workshop.name}`,
            description: appointment.description || 'Serviço de manutenção de bicicleta',
            picture_url: workshop.workshopData?.profileImage || null,
            category_id: 'services',
            quantity: 1,
            unit_price: totalAmount
          }],
          payer: {
            first_name: cyclist.name.split(' ')[0],
            last_name: cyclist.name.split(' ').slice(1).join(' '),
            phone: {
              area_code: cyclist.phone?.substring(0, 2) || '11',
              number: cyclist.phone?.substring(2) || '999999999'
            },
            address: {
              street_name: paymentData.address?.street || 'Rua Principal',
              street_number: parseInt(paymentData.address?.number) || 123,
              zip_code: paymentData.address?.zipCode || '01000000'
            },
            registration_date: cyclist.createdAt.toISOString()
          },
          shipments: {
            receiver_address: {
              zip_code: workshop.workshopData?.address?.zipCode || '01000000',
              street_name: workshop.workshopData?.address?.street || 'Rua da Oficina',
              street_number: parseInt(workshop.workshopData?.address?.number) || 456,
              floor: workshop.workshopData?.address?.complement || '',
              apartment: ''
            }
          }
        },
        
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12,
          default_installments: 1
        }
      };
      
      const response = await mercadopago.preferences.create(preference);
      
      // Salvar dados do pagamento no banco
      const payment = new Payment({
        appointment: appointmentId,
        amount: totalAmount,
        platformFee: platformFee,
        workshopAmount: workshopAmount,
        status: 'pending',
        paymentMethod: paymentData.paymentMethod || 'credit_card',
        mercadoPago: {
          preferenceId: response.body.id,
          externalReference: appointmentId,
          description: `Serviço de Bike - ${workshop.name}`,
          liveMode: process.env.NODE_ENV === 'production'
        },
        payer: {
          email: cyclist.email,
          firstName: cyclist.name.split(' ')[0],
          lastName: cyclist.name.split(' ').slice(1).join(' '),
          identification: {
            type: paymentData.identificationType || 'CPF',
            number: paymentData.identificationNumber || '00000000000'
          },
          phone: {
            areaCode: cyclist.phone?.substring(0, 2) || '11',
            number: cyclist.phone?.substring(2) || '999999999'
          },
          address: {
            zipCode: paymentData.address?.zipCode || '01000000',
            streetName: paymentData.address?.street || 'Rua Principal',
            streetNumber: paymentData.address?.number || '123'
          }
        },
        transactionData: {
          initPoint: response.body.init_point,
          sandboxInitPoint: response.body.sandbox_init_point
        },
        metadata: {
          userAgent: paymentData.userAgent,
          ipAddress: paymentData.ipAddress,
          source: 'web'
        }
      });
      
      payment.addStatusHistory('pending', 'Preferência de pagamento criada');
      await payment.save();
      
      return {
        preferenceId: response.body.id,
        initPoint: response.body.init_point,
        sandboxInitPoint: response.body.sandbox_init_point,
        paymentId: payment._id
      };
      
    } catch (error) {
      console.error('Erro ao criar preferência de pagamento:', error);
      throw error;
    }
  }
  
  /**
   * Processar webhook do Mercado Pago
   */
  async processWebhook(webhookData) {
    try {
      const { type, data } = webhookData;
      
      if (type === 'payment') {
        const paymentId = data.id;
        
        // Buscar dados do pagamento no Mercado Pago
        const mpPayment = await mercadopago.payment.findById(paymentId);
        const paymentInfo = mpPayment.body;
        
        // Buscar pagamento no banco de dados
        const payment = await Payment.findOne({
          'mercadoPago.externalReference': paymentInfo.external_reference
        });
        
        if (!payment) {
          console.error('Pagamento não encontrado:', paymentInfo.external_reference);
          return;
        }
        
        // Atualizar dados do pagamento
        payment.mercadoPago = {
          ...payment.mercadoPago,
          paymentId: paymentInfo.id,
          paymentMethodId: paymentInfo.payment_method_id,
          paymentTypeId: paymentInfo.payment_type_id,
          installments: paymentInfo.installments,
          transactionAmount: paymentInfo.transaction_amount,
          netReceivedAmount: paymentInfo.net_received_amount,
          totalPaidAmount: paymentInfo.total_paid_amount,
          overpaidAmount: paymentInfo.overpaid_amount,
          dateCreated: new Date(paymentInfo.date_created),
          dateApproved: paymentInfo.date_approved ? new Date(paymentInfo.date_approved) : null,
          dateLastUpdated: new Date(paymentInfo.date_last_updated),
          moneyReleaseDate: paymentInfo.money_release_date ? new Date(paymentInfo.money_release_date) : null,
          operationType: paymentInfo.operation_type,
          issuerName: paymentInfo.issuer?.name,
          paymentMethodType: paymentInfo.payment_method?.type,
          statusDetail: paymentInfo.status_detail,
          processingMode: paymentInfo.processing_mode,
          merchantAccountId: paymentInfo.merchant_account_id,
          acquirer: paymentInfo.acquirer
        };
        
        // Atualizar status baseado no status do Mercado Pago
        let newStatus = 'pending';
        switch (paymentInfo.status) {
          case 'approved':
            newStatus = 'approved';
            break;
          case 'pending':
            newStatus = 'processing';
            break;
          case 'rejected':
            newStatus = 'rejected';
            break;
          case 'cancelled':
            newStatus = 'cancelled';
            break;
          case 'refunded':
            newStatus = 'refunded';
            break;
        }
        
        payment.addStatusHistory(newStatus, `Status atualizado via webhook: ${paymentInfo.status_detail}`, paymentInfo);
        
        // Se pagamento foi aprovado, processar split
        if (newStatus === 'approved') {
          await this.processSplitPayment(payment);
          
          // Atualizar status do agendamento
          const appointment = await Appointment.findById(payment.appointment);
          if (appointment && appointment.status === 'confirmed') {
            appointment.status = 'in_progress';
            await appointment.save();
          }
        }
        
        await payment.save();
        
        return payment;
      }
      
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }
  
  /**
   * Processar split de pagamento
   */
  async processSplitPayment(payment) {
    try {
      const appointment = await Appointment.findById(payment.appointment)
        .populate('workshop', 'workshopData.mercadoPagoAccountId');
      
      if (!appointment || !appointment.workshop.workshopData?.mercadoPagoAccountId) {
        throw new Error('Dados da oficina não encontrados para split');
      }
      
      const workshopAccountId = appointment.workshop.workshopData.mercadoPagoAccountId;
      
      // Criar transferência para a oficina (valor líquido)
      const transfer = {
        amount: payment.workshopAmount,
        currency_id: 'BRL',
        receiver_id: workshopAccountId,
        description: `Pagamento serviço - Agendamento ${payment.appointment}`,
        external_reference: `${payment.appointment}_workshop_transfer`
      };
      
      const transferResponse = await mercadopago.money_requests.create(transfer);
      
      // Atualizar dados do split no pagamento
      payment.split = {
        platformTransfer: {
          amount: payment.platformFee,
          status: 'completed',
          dateCreated: new Date()
        },
        workshopTransfer: {
          amount: payment.workshopAmount,
          status: transferResponse.body.status,
          transferId: transferResponse.body.id,
          dateCreated: new Date(transferResponse.body.date_created)
        }
      };
      
      payment.addStatusHistory('approved', 'Split de pagamento processado com sucesso');
      await payment.save();
      
      return transferResponse.body;
      
    } catch (error) {
      console.error('Erro ao processar split de pagamento:', error);
      payment.addStatusHistory('approved', `Erro no split: ${error.message}`);
      await payment.save();
      throw error;
    }
  }
  
  /**
   * Processar reembolso
   */
  async processRefund(paymentId, amount, reason) {
    try {
      const payment = await Payment.findById(paymentId);
      
      if (!payment || !payment.mercadoPago.paymentId) {
        throw new Error('Pagamento não encontrado');
      }
      
      const refundData = {
        amount: amount || payment.amount,
        reason: reason || 'Cancelamento do serviço'
      };
      
      const refundResponse = await mercadopago.refund.create({
        payment_id: payment.mercadoPago.paymentId,
        amount: refundData.amount,
        reason: refundData.reason
      });
      
      // Atualizar dados do reembolso
      payment.refund = {
        refundId: refundResponse.body.id,
        amount: refundResponse.body.amount,
        reason: refundData.reason,
        status: refundResponse.body.status,
        dateCreated: new Date(refundResponse.body.date_created),
        uniqueSequenceNumber: refundResponse.body.unique_sequence_number
      };
      
      payment.addStatusHistory('refunded', `Reembolso processado: R$ ${refundData.amount}`);
      await payment.save();
      
      return refundResponse.body;
      
    } catch (error) {
      console.error('Erro ao processar reembolso:', error);
      throw error;
    }
  }
  
  /**
   * Buscar status de pagamento
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('appointment', 'status cyclist workshop')
        .populate('appointment.cyclist', 'name email')
        .populate('appointment.workshop', 'name');
      
      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }
      
      // Se tem ID do Mercado Pago, buscar status atualizado
      if (payment.mercadoPago.paymentId) {
        const mpPayment = await mercadopago.payment.findById(payment.mercadoPago.paymentId);
        const paymentInfo = mpPayment.body;
        
        // Atualizar status se necessário
        if (paymentInfo.status !== payment.status) {
          let newStatus = 'pending';
          switch (paymentInfo.status) {
            case 'approved':
              newStatus = 'approved';
              break;
            case 'pending':
              newStatus = 'processing';
              break;
            case 'rejected':
              newStatus = 'rejected';
              break;
            case 'cancelled':
              newStatus = 'cancelled';
              break;
            case 'refunded':
              newStatus = 'refunded';
              break;
          }
          
          payment.addStatusHistory(newStatus, `Status sincronizado: ${paymentInfo.status_detail}`);
          await payment.save();
        }
      }
      
      return payment;
      
    } catch (error) {
      console.error('Erro ao buscar status do pagamento:', error);
      throw error;
    }
  }
}

module.exports = new MercadoPagoService();