const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Destinatário
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Destinatário é obrigatório']
  },
  
  // Remetente (opcional, pode ser sistema)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Tipo de notificação
  type: {
    type: String,
    enum: [
      'appointment_created',      // Agendamento criado
      'appointment_confirmed',    // Agendamento confirmado
      'appointment_rejected',     // Agendamento rejeitado
      'appointment_cancelled',    // Agendamento cancelado
      'appointment_reminder',     // Lembrete de agendamento
      'budget_received',          // Orçamento adicional recebido
      'budget_approved',          // Orçamento aprovado
      'budget_rejected',          // Orçamento rejeitado
      'service_started',          // Serviço iniciado
      'service_completed',        // Serviço concluído
      'rating_request',           // Solicitação de avaliação
      'workshop_approved',        // Oficina aprovada (admin)
      'workshop_rejected',        // Oficina rejeitada (admin)
      'system_maintenance',       // Manutenção do sistema
      'promotional',              // Promocional
      'general'                   // Geral
    ],
    required: [true, 'Tipo de notificação é obrigatório']
  },
  
  // Título da notificação
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    maxlength: [100, 'Título não pode ter mais de 100 caracteres']
  },
  
  // Mensagem
  message: {
    type: String,
    required: [true, 'Mensagem é obrigatória'],
    maxlength: [500, 'Mensagem não pode ter mais de 500 caracteres']
  },
  
  // Dados adicionais (JSON)
  data: {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    budgetId: String,
    workshopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actionUrl: String, // URL para ação específica
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  
  // Status da notificação
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  
  // Canais de envio
  channels: {
    email: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    push: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    sms: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    inApp: {
      enabled: { type: Boolean, default: true },
      read: { type: Boolean, default: false },
      readAt: Date
    }
  },
  
  // Prioridade
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Agendamento para envio
  scheduledFor: {
    type: Date,
    default: null
  },
  
  // Expiração
  expiresAt: {
    type: Date,
    default: null
  },
  
  // Tentativas de envio
  attempts: {
    count: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    lastAttempt: Date,
    errors: [{
      channel: String,
      error: String,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  
  // Metadados
  metadata: {
    source: {
      type: String,
      enum: ['system', 'user', 'admin', 'automated'],
      default: 'system'
    },
    category: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Middleware para definir expiração automática
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt && this.type !== 'general') {
    // Define expiração padrão baseada no tipo
    const expirationDays = {
      'appointment_reminder': 1,
      'budget_received': 7,
      'rating_request': 30,
      'promotional': 30
    };
    
    const days = expirationDays[this.type] || 7;
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  next();
});

// Métodos do schema
notificationSchema.methods.markAsRead = function() {
  this.channels.inApp.read = true;
  this.channels.inApp.readAt = new Date();
  this.status = 'read';
  return this.save();
};

notificationSchema.methods.markAsSent = function(channel) {
  if (this.channels[channel]) {
    this.channels[channel].sent = true;
    this.channels[channel].sentAt = new Date();
    
    // Atualiza status geral se pelo menos um canal foi enviado
    const anySent = Object.values(this.channels).some(ch => ch.sent);
    if (anySent && this.status === 'pending') {
      this.status = 'sent';
    }
  }
  return this.save();
};

notificationSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  return this.save();
};

notificationSchema.methods.markAsFailed = function(channel, error) {
  if (this.channels[channel]) {
    this.channels[channel].error = error;
  }
  
  this.attempts.count += 1;
  this.attempts.lastAttempt = new Date();
  this.attempts.errors.push({
    channel,
    error,
    timestamp: new Date()
  });
  
  if (this.attempts.count >= this.attempts.maxAttempts) {
    this.status = 'failed';
  }
  
  return this.save();
};

notificationSchema.methods.canRetry = function() {
  return this.attempts.count < this.attempts.maxAttempts && 
         this.status !== 'failed' && 
         (!this.expiresAt || this.expiresAt > new Date());
};

// Métodos estáticos
notificationSchema.statics.createAppointmentNotification = function(type, recipient, appointmentData) {
  const titles = {
    'appointment_created': 'Novo agendamento recebido',
    'appointment_confirmed': 'Agendamento confirmado',
    'appointment_rejected': 'Agendamento rejeitado',
    'appointment_cancelled': 'Agendamento cancelado',
    'appointment_reminder': 'Lembrete: agendamento amanhã'
  };
  
  const messages = {
    'appointment_created': `Você recebeu um novo agendamento para ${appointmentData.date}`,
    'appointment_confirmed': `Seu agendamento para ${appointmentData.date} foi confirmado`,
    'appointment_rejected': `Seu agendamento para ${appointmentData.date} foi rejeitado`,
    'appointment_cancelled': `Agendamento para ${appointmentData.date} foi cancelado`,
    'appointment_reminder': `Lembre-se: você tem um agendamento amanhã às ${appointmentData.time}`
  };
  
  return new this({
    recipient,
    type,
    title: titles[type],
    message: messages[type],
    data: {
      appointmentId: appointmentData.appointmentId,
      actionUrl: `/appointments/${appointmentData.appointmentId}`
    },
    channels: {
      email: { enabled: true },
      push: { enabled: true },
      inApp: { enabled: true }
    }
  });
};

notificationSchema.statics.createBudgetNotification = function(type, recipient, budgetData) {
  const titles = {
    'budget_received': 'Novo orçamento recebido',
    'budget_approved': 'Orçamento aprovado',
    'budget_rejected': 'Orçamento rejeitado'
  };
  
  const messages = {
    'budget_received': `Você recebeu um orçamento adicional de R$ ${budgetData.amount}`,
    'budget_approved': `Orçamento de R$ ${budgetData.amount} foi aprovado`,
    'budget_rejected': `Orçamento de R$ ${budgetData.amount} foi rejeitado`
  };
  
  return new this({
    recipient,
    type,
    title: titles[type],
    message: messages[type],
    data: {
      appointmentId: budgetData.appointmentId,
      budgetId: budgetData.budgetId,
      actionUrl: `/appointments/${budgetData.appointmentId}/budget/${budgetData.budgetId}`
    },
    priority: 'high',
    channels: {
      email: { enabled: true },
      push: { enabled: true },
      inApp: { enabled: true }
    }
  });
};

// Índices para performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ 'channels.inApp.read': 1, recipient: 1 });

module.exports = mongoose.model('Notification', notificationSchema);