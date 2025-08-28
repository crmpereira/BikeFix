const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Referências
  cyclist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Ciclista é obrigatório']
  },
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Oficina é obrigatória']
  },
  
  // Dados do agendamento
  appointmentDate: {
    type: Date,
    required: [true, 'Data do agendamento é obrigatória']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Horário do agendamento é obrigatório']
  },
  
  // IDs das bikes selecionadas (referência às bikes do usuário)
  bikeIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User.cyclistData.bikes'
  }],
  
  // Dados da bicicleta (mantido para compatibilidade)
  bikeInfo: {
    brand: String,
    model: String,
    year: Number,
    type: {
      type: String,
      enum: ['road', 'mountain', 'hybrid', 'electric', 'bmx', 'other']
    },
    serialNumber: String,
    currentKm: Number
  },
  
  // Tipo de serviço
  serviceType: {
    type: String,
    enum: ['basic', 'complete', 'custom'],
    required: [true, 'Tipo de serviço é obrigatório']
  },
  
  // Serviços solicitados
  requestedServices: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    estimatedPrice: Number,
    estimatedTime: Number // em minutos
  }],
  
  // Descrição do problema
  problemDescription: {
    type: String,
    maxlength: [1000, 'Descrição não pode ter mais de 1000 caracteres']
  },
  
  // Status do agendamento
  status: {
    type: String,
    enum: [
      'pending',      // Aguardando confirmação da oficina
      'confirmed',    // Confirmado pela oficina
      'in_progress',  // Em andamento
      'waiting_approval', // Aguardando aprovação de orçamento adicional
      'completed',    // Concluído
      'cancelled',    // Cancelado
      'rejected'      // Rejeitado pela oficina
    ],
    default: 'pending'
  },
  
  // Orçamentos adicionais
  additionalBudgets: [{
    description: {
      type: String,
      required: true
    },
    items: [{
      name: String,
      description: String,
      price: Number,
      quantity: { type: Number, default: 1 }
    }],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: Date,
    cyclistResponse: String // Comentário do ciclista
  }],
  
  // Valores
  pricing: {
    basePrice: {
      type: Number,
      default: 0
    },
    additionalPrice: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      default: 0
    }
  },
  
  // Serviços realizados
  completedServices: [{
    name: String,
    description: String,
    price: Number,
    completedAt: Date
  }],
  
  // Peças trocadas
  replacedParts: [{
    name: {
      type: String,
      required: true
    },
    brand: String,
    partNumber: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    },
    warranty: {
      period: Number, // em meses
      description: String
    }
  }],
  
  // Notas e observações
  workshopNotes: {
    type: String,
    maxlength: [2000, 'Notas não podem ter mais de 2000 caracteres']
  },
  cyclistNotes: {
    type: String,
    maxlength: [1000, 'Notas não podem ter mais de 1000 caracteres']
  },
  
  // Avaliação
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedAt: Date
  },
  
  // Datas importantes
  confirmedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  
  // Motivo do cancelamento
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['cyclist', 'workshop', 'admin']
  },
  
  // Notificações enviadas
  notificationsSent: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms']
    },
    recipient: {
      type: String,
      enum: ['cyclist', 'workshop', 'both']
    },
    subject: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }]
}, {
  timestamps: true
});

// Middleware para calcular preço total
appointmentSchema.pre('save', function(next) {
  if (this.isModified('pricing.basePrice') || this.isModified('pricing.additionalPrice')) {
    this.pricing.totalPrice = (this.pricing.basePrice || 0) + (this.pricing.additionalPrice || 0);
  }
  next();
});

// Métodos do schema
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  const hoursDifference = (appointmentDateTime - now) / (1000 * 60 * 60);
  
  return hoursDifference > 24 && ['pending', 'confirmed'].includes(this.status);
};

appointmentSchema.methods.addAdditionalBudget = function(budgetData) {
  this.additionalBudgets.push(budgetData);
  this.status = 'waiting_approval';
  return this.save();
};

appointmentSchema.methods.approveAdditionalBudget = function(budgetId, response) {
  const budget = this.additionalBudgets.id(budgetId);
  if (budget) {
    budget.status = 'approved';
    budget.respondedAt = new Date();
    budget.cyclistResponse = response;
    
    this.pricing.additionalPrice += budget.totalAmount;
    this.status = 'confirmed';
  }
  return this.save();
};

appointmentSchema.methods.rejectAdditionalBudget = function(budgetId, response) {
  const budget = this.additionalBudgets.id(budgetId);
  if (budget) {
    budget.status = 'rejected';
    budget.respondedAt = new Date();
    budget.cyclistResponse = response;
    
    this.status = 'confirmed';
  }
  return this.save();
};

// Índices para performance
appointmentSchema.index({ cyclist: 1, appointmentDate: -1 });
appointmentSchema.index({ workshop: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);