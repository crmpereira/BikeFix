const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Referência ao agendamento
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  
  // Dados do pagamento
  amount: {
    type: Number,
    required: true
  },
  
  platformFee: {
    type: Number,
    required: true
  },
  
  workshopAmount: {
    type: Number,
    required: true
  },
  
  // Status do pagamento
  status: {
    type: String,
    enum: ['pending', 'processing', 'approved', 'rejected', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Método de pagamento
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'pix', 'bank_transfer'],
    required: true
  },
  
  // Dados do Mercado Pago
  mercadoPago: {
    paymentId: String,
    preferenceId: String,
    collectorId: String,
    externalReference: String,
    paymentMethodId: String,
    paymentTypeId: String,
    installments: Number,
    transactionAmount: Number,
    netReceivedAmount: Number,
    totalPaidAmount: Number,
    overpaidAmount: Number,
    dateCreated: Date,
    dateApproved: Date,
    dateLastUpdated: Date,
    moneyReleaseDate: Date,
    operationType: String,
    issuerName: String,
    paymentMethodType: String,
    statusDetail: String,
    description: String,
    liveMode: Boolean,
    sponsorId: String,
    processingMode: String,
    merchantAccountId: String,
    acquirer: String,
    pointOfInteraction: {
      type: String,
      businessInfo: {
        unit: String,
        subUnit: String
      }
    }
  },
  
  // Split de pagamento
  split: {
    platformTransfer: {
      amount: Number,
      status: String,
      transferId: String,
      dateCreated: Date
    },
    workshopTransfer: {
      amount: Number,
      status: String,
      transferId: String,
      dateCreated: Date
    }
  },
  
  // Dados do comprador
  payer: {
    id: String,
    email: String,
    identification: {
      type: String,
      number: String
    },
    firstName: String,
    lastName: String,
    phone: {
      areaCode: String,
      number: String
    },
    address: {
      zipCode: String,
      streetName: String,
      streetNumber: String
    }
  },
  
  // Dados da transação
  transactionData: {
    qrCode: String,
    qrCodeBase64: String,
    ticketUrl: String,
    sandboxInitPoint: String,
    initPoint: String
  },
  
  // Histórico de status
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    mercadoPagoData: mongoose.Schema.Types.Mixed
  }],
  
  // Tentativas de processamento
  attempts: {
    type: Number,
    default: 0
  },
  
  // Dados de reembolso
  refund: {
    refundId: String,
    amount: Number,
    reason: String,
    status: String,
    dateCreated: Date,
    uniqueSequenceNumber: String
  },
  
  // Metadados adicionais
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: String,
    campaignId: String,
    couponCode: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar updatedAt
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para adicionar entrada no histórico de status
paymentSchema.methods.addStatusHistory = function(status, details, mercadoPagoData) {
  this.statusHistory.push({
    status,
    details,
    mercadoPagoData,
    timestamp: new Date()
  });
  this.status = status;
};

// Método para processar split de pagamento
paymentSchema.methods.processSplit = async function() {
  // Implementar lógica de split usando Mercado Pago Marketplace
  // Transferir comissão para conta da plataforma
  // Transferir valor líquido para conta da oficina
};

// Método estático para buscar pagamentos por agendamento
paymentSchema.statics.findByAppointment = function(appointmentId) {
  return this.find({ appointment: appointmentId }).sort({ createdAt: -1 });
};

// Método estático para buscar pagamentos por status
paymentSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Método estático para obter estatísticas de pagamento
paymentSchema.statics.getPaymentStats = async function(filters = {}) {
  const matchStage = {};
  
  if (filters.startDate && filters.endDate) {
    matchStage.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  if (filters.status) {
    matchStage.status = filters.status;
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalPlatformFee: { $sum: '$platformFee' },
        totalWorkshopAmount: { $sum: '$workshopAmount' },
        totalPayments: { $sum: 1 },
        averageAmount: { $avg: '$amount' },
        statusDistribution: {
          $push: '$status'
        },
        paymentMethodDistribution: {
          $push: '$paymentMethod'
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalAmount: 0,
    totalPlatformFee: 0,
    totalWorkshopAmount: 0,
    totalPayments: 0,
    averageAmount: 0,
    statusDistribution: [],
    paymentMethodDistribution: []
  };
};

module.exports = mongoose.model('Payment', paymentSchema);