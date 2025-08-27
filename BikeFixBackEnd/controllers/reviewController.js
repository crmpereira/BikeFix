const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Criar nova avaliação
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { appointmentId, rating, comment, serviceQuality, priceValue, punctuality, communication } = req.body;
    const cyclistId = req.user.id;

    // Verificar se o usuário pode avaliar este agendamento
    const canReview = await Review.canUserReview(cyclistId, appointmentId);
    
    if (!canReview.canReview) {
      return res.status(400).json({
        success: false,
        message: canReview.reason
      });
    }

    const appointment = canReview.appointment;

    // Criar a avaliação
    const review = new Review({
      cyclist: cyclistId,
      workshop: appointment.workshop,
      appointment: appointmentId,
      rating,
      comment,
      serviceQuality,
      priceValue,
      punctuality,
      communication
    });

    await review.save();

    // Atualizar o agendamento com a avaliação
    await Appointment.findByIdAndUpdate(appointmentId, {
      'rating.score': rating,
      'rating.comment': comment,
      'rating.ratedAt': new Date()
    });

    // Popular dados para resposta
    await review.populate([
      { path: 'cyclist', select: 'name' },
      { path: 'workshop', select: 'name workshopData.businessName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Avaliação criada com sucesso',
      data: review
    });

  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter avaliações de uma oficina
const getWorkshopReviews = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    // Verificar se a oficina existe
    const workshop = await User.findOne({ _id: workshopId, userType: 'workshop' });
    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Oficina não encontrada'
      });
    }

    // Definir ordenação
    let sortOption = { createdAt: -1 }; // Mais recentes primeiro
    if (sort === 'rating_high') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === 'rating_low') {
      sortOption = { rating: 1, createdAt: -1 };
    } else if (sort === 'helpful') {
      sortOption = { 'helpfulVotes.helpful': -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    // Buscar avaliações
    const reviews = await Review.find({ 
      workshop: workshopId, 
      status: 'active' 
    })
    .populate('cyclist', 'name')
    .populate('appointment', 'serviceType appointmentDate')
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));

    // Contar total de avaliações
    const total = await Review.countDocuments({ 
      workshop: workshopId, 
      status: 'active' 
    });

    // Obter estatísticas da oficina
    const stats = await Review.getWorkshopStats(workshopId);

    res.json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: reviews.length,
          totalReviews: total
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter avaliações de um ciclista
const getCyclistReviews = async (req, res) => {
  try {
    const cyclistId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ cyclist: cyclistId })
      .populate('workshop', 'name workshopData.businessName')
      .populate('appointment', 'serviceType appointmentDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ cyclist: cyclistId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: reviews.length,
          totalReviews: total
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar avaliações do ciclista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Responder a uma avaliação (apenas oficinas)
const respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    const workshopId = req.user.id;

    // Verificar se a avaliação existe e pertence à oficina
    const review = await Review.findOne({ 
      _id: reviewId, 
      workshop: workshopId 
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Verificar se já existe uma resposta
    if (review.workshopResponse.comment) {
      return res.status(400).json({
        success: false,
        message: 'Esta avaliação já foi respondida'
      });
    }

    // Adicionar resposta
    review.workshopResponse = {
      comment,
      respondedAt: new Date(),
      respondedBy: workshopId
    };

    await review.save();

    res.json({
      success: true,
      message: 'Resposta adicionada com sucesso',
      data: review
    });

  } catch (error) {
    console.error('Erro ao responder avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Marcar avaliação como útil/não útil
const voteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { vote } = req.body; // 'helpful' ou 'not_helpful'
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Remover voto anterior se existir
    review.helpfulVotes.helpful = review.helpfulVotes.helpful.filter(
      id => !id.equals(userId)
    );
    review.helpfulVotes.notHelpful = review.helpfulVotes.notHelpful.filter(
      id => !id.equals(userId)
    );

    // Adicionar novo voto
    if (vote === 'helpful') {
      review.helpfulVotes.helpful.push(userId);
    } else if (vote === 'not_helpful') {
      review.helpfulVotes.notHelpful.push(userId);
    }

    await review.save();

    res.json({
      success: true,
      message: 'Voto registrado com sucesso',
      data: {
        helpful: review.helpfulVotes.helpful.length,
        notHelpful: review.helpfulVotes.notHelpful.length
      }
    });

  } catch (error) {
    console.error('Erro ao votar em avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Reportar avaliação
const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Verificar se o usuário já reportou esta avaliação
    const existingReport = review.reports.find(
      report => report.reportedBy.equals(userId)
    );

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Você já reportou esta avaliação'
      });
    }

    // Adicionar report
    review.reports.push({
      reportedBy: userId,
      reason,
      description
    });

    await review.save();

    res.json({
      success: true,
      message: 'Avaliação reportada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao reportar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter estatísticas de avaliações (para admin)
const getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          },
          totalReports: { $sum: { $size: '$reports' } },
          activeReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          hiddenReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'hidden'] }, 1, 0] }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          totalReports: 0,
          activeReviews: 0,
          hiddenReviews: 0
        }
      });
    }

    const result = stats[0];
    
    // Calcular distribuição de notas
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalReviews: result.totalReviews,
        averageRating: Math.round(result.averageRating * 10) / 10,
        ratingDistribution: distribution,
        totalReports: result.totalReports,
        activeReviews: result.activeReviews,
        hiddenReviews: result.hiddenReviews
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createReview,
  getWorkshopReviews,
  getCyclistReviews,
  respondToReview,
  voteReview,
  reportReview,
  getReviewStats
};