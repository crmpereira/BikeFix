// Versão simplificada do Mercado Pago Service para desenvolvimento local
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

class MercadoPagoServiceDev {
  
  /**
   * Criar preferência de pagamento (versão de desenvolvimento)
   */
  async createPaymentPreference(appointmentId, paymentData) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('cyclist', 'name email phone')
        .populate('workshop', 'name workshopData');
      
      if (!appointment) {
        throw new Error('Agendamento não encontrado');
      }
      
      const { cyclist, workshop } = appointment;
      const totalAmount = appointment.pricing.totalPrice;
      const platformFee = appointment.pricing.platformFee;
      const workshopAmount = appointment.pricing.workshopAmount;
      
      // Simular resposta do Mercado Pago para desenvolvimento
      const mockResponse = {
        id: 'dev-preference-' + Date.now(),
        init_point: `http://localhost:3000/payment/mock?appointment=${appointmentId}`,
        sandbox_init_point: `http://localhost:3000/payment/mock?appointment=${appointmentId}`,
        collector_id: 'dev-collector',
        client_id: 'dev-client',
        marketplace: 'NONE',
        operation_type: 'regular_payment',
        additional_info: '',
        external_reference: appointmentId,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        date_created: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
      
      // Salvar dados do pagamento no banco
      const payment = new Payment({
        appointment: appointmentId,
        amount: totalAmount,
        platformFee: platformFee,
        workshopAmount: workshopAmount,
        status: 'pending',
        paymentMethod: paymentData.paymentMethod || 'credit_card',
        mercadoPago: {
          preferenceId: mockResponse.id,
          externalReference: appointmentId,
          description: `Serviço de Bike - ${workshop.name}`,
          liveMode: false // sempre false em desenvolvimento
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
          initPoint: mockResponse.init_point,
          sandboxInitPoint: mockResponse.sandbox_init_point
        },
        metadata: {
          userAgent: paymentData.userAgent,
          ipAddress: paymentData.ipAddress,
          source: 'web',
          environment: 'development'
        }
      });
      
      await payment.save();
      
      // Atualizar status do agendamento
      appointment.payment = {
        status: 'pending',
        paymentId: payment._id,
        amount: totalAmount,
        createdAt: new Date()
      };
      
      await appointment.save();
      
      return {
        success: true,
        data: {
          preferenceId: mockResponse.id,
          initPoint: mockResponse.init_point,
          sandboxInitPoint: mockResponse.sandbox_init_point,
          paymentId: payment._id,
          amount: totalAmount,
          externalReference: appointmentId,
          expires: mockResponse.expires,
          expirationDate: mockResponse.expiration_date_to
        }
      };
      
    } catch (error) {
      console.error('Erro ao criar preferência de pagamento (dev):', error);
      throw error;
    }
  }
  
  /**
   * Processar webhook (versão de desenvolvimento)
   */
  async processWebhook(webhookData) {
    try {
      console.log('Processando webhook de desenvolvimento:', webhookData);
      
      // Simular processamento de webhook
      return {
        success: true,
        message: 'Webhook processado com sucesso (desenvolvimento)',
        data: webhookData
      };
      
    } catch (error) {
      console.error('Erro ao processar webhook (dev):', error);
      throw error;
    }
  }
  
  /**
   * Processar split de pagamento (versão de desenvolvimento)
   */
  async processSplitPayment(payment) {
    try {
      console.log('Processando split de pagamento (desenvolvimento):', payment._id);
      
      // Simular split de pagamento
      payment.splitPayment = {
        status: 'completed',
        platformAmount: payment.platformFee,
        workshopAmount: payment.workshopAmount,
        processedAt: new Date(),
        transferId: 'dev-transfer-' + Date.now()
      };
      
      await payment.save();
      
      return {
        success: true,
        message: 'Split de pagamento processado (desenvolvimento)'
      };
      
    } catch (error) {
      console.error('Erro ao processar split (dev):', error);
      throw error;
    }
  }
  
  /**
   * Processar reembolso (versão de desenvolvimento)
   */
  async processRefund(paymentId, amount, reason) {
    try {
      const payment = await Payment.findById(paymentId);
      
      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }
      
      console.log('Processando reembolso (desenvolvimento):', paymentId);
      
      // Simular reembolso
      payment.refund = {
        refundId: 'dev-refund-' + Date.now(),
        amount: amount || payment.amount,
        reason: reason || 'Cancelamento do serviço',
        status: 'approved',
        processedAt: new Date()
      };
      
      payment.status = 'refunded';
      await payment.save();
      
      return {
        success: true,
        message: 'Reembolso processado (desenvolvimento)',
        refundId: payment.refund.refundId
      };
      
    } catch (error) {
      console.error('Erro ao processar reembolso (dev):', error);
      throw error;
    }
  }
  
  /**
   * Obter status do pagamento (versão de desenvolvimento)
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('appointment', 'cyclist workshop status')
        .populate('appointment.cyclist', 'name email')
        .populate('appointment.workshop', 'name');
      
      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }
      
      // Simular dados do Mercado Pago
      const mockMPData = {
        id: payment.mercadoPago.paymentId || 'dev-payment-' + Date.now(),
        status: payment.status,
        status_detail: payment.status === 'approved' ? 'accredited' : 'pending_payment',
        operation_type: 'regular_payment',
        date_created: payment.createdAt.toISOString(),
        date_approved: payment.status === 'approved' ? new Date().toISOString() : null,
        money_release_date: payment.status === 'approved' ? new Date().toISOString() : null,
        transaction_amount: payment.amount,
        net_received_amount: payment.workshopAmount,
        total_paid_amount: payment.amount,
        fee_details: [{
          type: 'mercadopago_fee',
          amount: payment.platformFee,
          fee_payer: 'collector'
        }],
        external_reference: payment.mercadoPago.externalReference,
        description: payment.mercadoPago.description,
        live_mode: false
      };
      
      return {
        success: true,
        data: {
          payment: payment,
          mercadoPagoData: mockMPData,
          environment: 'development'
        }
      };
      
    } catch (error) {
      console.error('Erro ao obter status do pagamento (dev):', error);
      throw error;
    }
  }
}

module.exports = new MercadoPagoServiceDev();