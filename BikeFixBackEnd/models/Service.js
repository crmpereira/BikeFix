const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // Dados básicos do serviço
  name: {
    type: String,
    required: [true, 'Nome do serviço é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  
  // Categoria do serviço
  category: {
    type: String,
    enum: [
      'basic_maintenance',    // Manutenção básica
      'complete_maintenance', // Manutenção completa
      'brake_system',        // Sistema de freios
      'transmission',        // Transmissão
      'wheels_tires',       // Rodas e pneus
      'suspension',         // Suspensão
      'electrical',         // Sistema elétrico (e-bikes)
      'frame_repair',       // Reparo de quadro
      'custom_service',     // Serviço personalizado
      'emergency_repair'    // Reparo emergencial
    ],
    required: [true, 'Categoria é obrigatória']
  },
  
  // Tipo de serviço predefinido
  serviceType: {
    type: String,
    enum: ['basic', 'complete', 'custom'],
    required: [true, 'Tipo de serviço é obrigatório']
  },
  
  // Preço base
  basePrice: {
    type: Number,
    required: [true, 'Preço base é obrigatório'],
    min: [0, 'Preço não pode ser negativo']
  },
  
  // Tempo estimado em minutos
  estimatedTime: {
    type: Number,
    required: [true, 'Tempo estimado é obrigatório'],
    min: [15, 'Tempo mínimo é 15 minutos']
  },
  
  // Itens inclusos no serviço
  includedItems: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    isOptional: {
      type: Boolean,
      default: false
    }
  }],
  
  // Peças comumente necessárias
  commonParts: [{
    name: String,
    description: String,
    averagePrice: Number,
    isRequired: {
      type: Boolean,
      default: false
    }
  }],
  
  // Ferramentas necessárias
  requiredTools: [{
    name: String,
    description: String
  }],
  
  // Nível de dificuldade
  difficultyLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  
  // Frequência recomendada
  recommendedFrequency: {
    type: String,
    enum: [
      'weekly',
      'monthly', 
      'quarterly',
      'semi_annual',
      'annual',
      'as_needed'
    ],
    default: 'as_needed'
  },
  
  // Quilometragem recomendada para o serviço
  recommendedKm: {
    min: Number,
    max: Number
  },
  
  // Status do serviço
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Oficina que oferece o serviço (se específico)
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null = serviço padrão do sistema
  },
  
  // Instruções especiais
  specialInstructions: {
    type: String,
    maxlength: [1000, 'Instruções não podem ter mais de 1000 caracteres']
  },
  
  // Garantia oferecida
  warranty: {
    period: {
      type: Number, // em meses
      default: 3
    },
    description: {
      type: String,
      default: 'Garantia padrão do serviço'
    },
    conditions: String
  },
  
  // Estatísticas
  stats: {
    timesRequested: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  
  // Tags para busca
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // Imagens do serviço
  images: [{
    url: String,
    description: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Middleware para atualizar estatísticas
serviceSchema.methods.updateRating = function(newRating) {
  const totalScore = this.stats.averageRating * this.stats.totalRatings;
  this.stats.totalRatings += 1;
  this.stats.averageRating = (totalScore + newRating) / this.stats.totalRatings;
  return this.save();
};

// Método para incrementar contador de solicitações
serviceSchema.methods.incrementRequests = function() {
  this.stats.timesRequested += 1;
  return this.save();
};

// Método para verificar se o serviço é recomendado baseado na quilometragem
serviceSchema.methods.isRecommendedForKm = function(currentKm) {
  if (!this.recommendedKm.min && !this.recommendedKm.max) {
    return false;
  }
  
  const min = this.recommendedKm.min || 0;
  const max = this.recommendedKm.max || Infinity;
  
  return currentKm >= min && currentKm <= max;
};

// Índices para performance
serviceSchema.index({ category: 1, serviceType: 1 });
serviceSchema.index({ workshop: 1, isActive: 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ basePrice: 1 });
serviceSchema.index({ 'stats.averageRating': -1 });

// Serviços padrão do sistema
serviceSchema.statics.getDefaultServices = function() {
  return [
    {
      name: 'Revisão Básica',
      description: 'Verificação geral da bicicleta, ajustes básicos e lubrificação',
      category: 'basic_maintenance',
      serviceType: 'basic',
      basePrice: 50,
      estimatedTime: 60,
      includedItems: [
        { name: 'Verificação de freios', description: 'Teste e ajuste básico' },
        { name: 'Verificação de marchas', description: 'Ajuste de câmbio' },
        { name: 'Lubrificação da corrente', description: 'Limpeza e lubrificação' },
        { name: 'Verificação de pneus', description: 'Pressão e desgaste' }
      ],
      recommendedFrequency: 'monthly',
      tags: ['básico', 'manutenção', 'preventiva']
    },
    {
      name: 'Revisão Completa',
      description: 'Manutenção completa com desmontagem e verificação detalhada',
      category: 'complete_maintenance',
      serviceType: 'complete',
      basePrice: 150,
      estimatedTime: 180,
      includedItems: [
        { name: 'Desmontagem completa', description: 'Desmontagem de componentes principais' },
        { name: 'Limpeza profunda', description: 'Limpeza detalhada de todos os componentes' },
        { name: 'Verificação de desgaste', description: 'Análise de peças e componentes' },
        { name: 'Ajustes precisos', description: 'Calibragem de freios, câmbio e suspensão' },
        { name: 'Lubrificação completa', description: 'Lubrificação de todos os pontos necessários' }
      ],
      recommendedFrequency: 'quarterly',
      tags: ['completa', 'detalhada', 'preventiva']
    }
  ];
};

module.exports = mongoose.model('Service', serviceSchema);