const mongoose = require('mongoose');

const commissionConfigSchema = new mongoose.Schema({
  // Taxa padrão da plataforma (em decimal, ex: 0.10 = 10%)
  defaultRate: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.10
  },
  
  // Taxas específicas por oficina (opcional)
  workshopSpecificRates: [{
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    reason: {
      type: String,
      maxlength: 500
    }
  }],
  
  // Taxas por faixa de valor (opcional)
  tieredRates: [{
    minAmount: {
      type: Number,
      required: true,
      min: 0
    },
    maxAmount: {
      type: Number,
      required: true
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    }
  }],
  
  // Configurações gerais
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Valor mínimo de comissão (em reais)
  minimumCommission: {
    type: Number,
    default: 1.00,
    min: 0
  },
  
  // Valor máximo de comissão (em reais, opcional)
  maximumCommission: {
    type: Number,
    min: 0
  },
  
  // Histórico de alterações
  changeHistory: [{
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changeDate: {
      type: Date,
      default: Date.now
    },
    previousRate: {
      type: Number
    },
    newRate: {
      type: Number
    },
    reason: {
      type: String,
      maxlength: 500
    }
  }]
}, {
  timestamps: true
});

// Método para obter a taxa de comissão para uma oficina específica
commissionConfigSchema.methods.getRateForWorkshop = function(workshopId, totalAmount = 0) {
  // 1. Verificar se há taxa específica para a oficina
  const workshopRate = this.workshopSpecificRates.find(rate => 
    rate.workshop.toString() === workshopId.toString() &&
    (!rate.endDate || rate.endDate > new Date())
  );
  
  if (workshopRate) {
    return workshopRate.rate;
  }
  
  // 2. Verificar taxas por faixa de valor
  if (totalAmount > 0 && this.tieredRates.length > 0) {
    const tieredRate = this.tieredRates.find(tier => 
      totalAmount >= tier.minAmount && totalAmount <= tier.maxAmount
    );
    
    if (tieredRate) {
      return tieredRate.rate;
    }
  }
  
  // 3. Retornar taxa padrão
  return this.defaultRate;
};

// Método para calcular comissão com base nas regras configuradas
commissionConfigSchema.methods.calculateCommission = function(workshopId, totalAmount) {
  const rate = this.getRateForWorkshop(workshopId, totalAmount);
  let commission = totalAmount * rate;
  
  // Aplicar valor mínimo
  if (commission < this.minimumCommission) {
    commission = this.minimumCommission;
  }
  
  // Aplicar valor máximo (se configurado)
  if (this.maximumCommission && commission > this.maximumCommission) {
    commission = this.maximumCommission;
  }
  
  return {
    rate: rate,
    commission: commission,
    workshopAmount: totalAmount - commission
  };
};

// Método estático para obter configuração ativa
commissionConfigSchema.statics.getActiveConfig = async function() {
  let config = await this.findOne({ isActive: true });
  
  // Se não existir configuração, criar uma padrão
  if (!config) {
    config = new this({
      defaultRate: 0.10,
      isActive: true,
      minimumCommission: 1.00
    });
    await config.save();
  }
  
  return config;
};

// Método para registrar alteração de taxa
commissionConfigSchema.methods.recordRateChange = function(changedBy, previousRate, newRate, reason) {
  this.changeHistory.push({
    changedBy,
    previousRate,
    newRate,
    reason
  });
};

// Índices para performance
commissionConfigSchema.index({ isActive: 1 });
commissionConfigSchema.index({ 'workshopSpecificRates.workshop': 1 });
commissionConfigSchema.index({ 'workshopSpecificRates.endDate': 1 });

module.exports = mongoose.model('CommissionConfig', commissionConfigSchema);