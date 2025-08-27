const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Agendamento é obrigatório']
  },
  
  // Dados da avaliação
  rating: {
    type: Number,
    required: [true, 'Nota é obrigatória'],
    min: [1, 'Nota mínima é 1'],
    max: [5, 'Nota máxima é 5']
  },
  
  comment: {
    type: String,
    maxlength: [1000, 'Comentário não pode ter mais de 1000 caracteres']
  },
  
  // Avaliações específicas
  serviceQuality: {
    type: Number,
    min: 1,
    max: 5
  },
  
  priceValue: {
    type: Number,
    min: 1,
    max: 5
  },
  
  punctuality: {
    type: Number,
    min: 1,
    max: 5
  },
  
  communication: {
    type: Number,
    min: 1,
    max: 5
  },
  
  // Status da avaliação
  status: {
    type: String,
    enum: ['active', 'hidden', 'reported'],
    default: 'active'
  },
  
  // Resposta da oficina
  workshopResponse: {
    comment: {
      type: String,
      maxlength: [500, 'Resposta não pode ter mais de 500 caracteres']
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Dados de moderação
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verifiedAt: Date,
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Reportes
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'fake', 'spam', 'offensive', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending'
    }
  }],
  
  // Útil/Não útil
  helpfulVotes: {
    helpful: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    notHelpful: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true
});

// Índices
reviewSchema.index({ workshop: 1, rating: -1 });
reviewSchema.index({ cyclist: 1, createdAt: -1 });
reviewSchema.index({ appointment: 1 }, { unique: true }); // Uma avaliação por agendamento
reviewSchema.index({ status: 1, createdAt: -1 });

// Middleware para atualizar estatísticas da oficina
reviewSchema.post('save', async function() {
  try {
    const Review = this.constructor;
    const User = mongoose.model('User');
    
    // Calcular nova média de avaliações da oficina
    const stats = await Review.aggregate([
      { $match: { workshop: this.workshop, status: 'active' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          averageServiceQuality: { $avg: '$serviceQuality' },
          averagePriceValue: { $avg: '$priceValue' },
          averagePunctuality: { $avg: '$punctuality' },
          averageCommunication: { $avg: '$communication' }
        }
      }
    ]);
    
    if (stats.length > 0) {
      const workshopStats = stats[0];
      
      // Atualizar dados da oficina
      await User.findByIdAndUpdate(this.workshop, {
        'workshopData.rating': Math.round(workshopStats.averageRating * 10) / 10,
        'workshopData.reviewCount': workshopStats.totalReviews,
        'workshopData.detailedRating': {
          serviceQuality: Math.round(workshopStats.averageServiceQuality * 10) / 10,
          priceValue: Math.round(workshopStats.averagePriceValue * 10) / 10,
          punctuality: Math.round(workshopStats.averagePunctuality * 10) / 10,
          communication: Math.round(workshopStats.averageCommunication * 10) / 10
        }
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar estatísticas da oficina:', error);
  }
});

// Método para verificar se o usuário pode avaliar
reviewSchema.statics.canUserReview = async function(cyclistId, appointmentId) {
  const Appointment = mongoose.model('Appointment');
  
  // Verificar se o agendamento existe e pertence ao ciclista
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    cyclist: cyclistId,
    status: 'completed'
  });
  
  if (!appointment) {
    return { canReview: false, reason: 'Agendamento não encontrado ou não concluído' };
  }
  
  // Verificar se já existe uma avaliação para este agendamento
  const existingReview = await this.findOne({ appointment: appointmentId });
  
  if (existingReview) {
    return { canReview: false, reason: 'Agendamento já foi avaliado' };
  }
  
  return { canReview: true, appointment };
};

// Método para obter estatísticas de uma oficina
reviewSchema.statics.getWorkshopStats = async function(workshopId) {
  const stats = await this.aggregate([
    { $match: { workshop: mongoose.Types.ObjectId(workshopId), status: 'active' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        },
        averageServiceQuality: { $avg: '$serviceQuality' },
        averagePriceValue: { $avg: '$priceValue' },
        averagePunctuality: { $avg: '$punctuality' },
        averageCommunication: { $avg: '$communication' }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      detailedRating: {
        serviceQuality: 0,
        priceValue: 0,
        punctuality: 0,
        communication: 0
      }
    };
  }
  
  const result = stats[0];
  
  // Calcular distribuição de notas
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    averageRating: Math.round(result.averageRating * 10) / 10,
    totalReviews: result.totalReviews,
    ratingDistribution: distribution,
    detailedRating: {
      serviceQuality: Math.round(result.averageServiceQuality * 10) / 10,
      priceValue: Math.round(result.averagePriceValue * 10) / 10,
      punctuality: Math.round(result.averagePunctuality * 10) / 10,
      communication: Math.round(result.averageCommunication * 10) / 10
    }
  };
};

module.exports = mongoose.model('Review', reviewSchema);