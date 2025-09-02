const CommissionConfig = require('../models/CommissionConfig');
const User = require('../models/User');

// Obter configuração atual de comissão
const getCommissionConfig = async (req, res) => {
  try {
    const config = await CommissionConfig.getActiveConfig()
      .populate('workshopSpecificRates.workshop', 'name email')
      .populate('changeHistory.changedBy', 'name email');

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Erro ao buscar configuração de comissão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar taxa padrão de comissão
const updateDefaultRate = async (req, res) => {
  try {
    const { defaultRate, reason } = req.body;

    // Validar se o usuário é admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem alterar as configurações de comissão'
      });
    }

    // Validar taxa
    if (defaultRate < 0 || defaultRate > 1) {
      return res.status(400).json({
        success: false,
        message: 'Taxa deve estar entre 0% e 100%'
      });
    }

    const config = await CommissionConfig.getActiveConfig();
    const previousRate = config.defaultRate;

    // Registrar alteração no histórico
    config.recordRateChange(req.user.id, previousRate, defaultRate, reason);
    
    config.defaultRate = defaultRate;
    await config.save();

    res.status(200).json({
      success: true,
      message: 'Taxa padrão atualizada com sucesso',
      data: config
    });
  } catch (error) {
    console.error('Erro ao atualizar taxa padrão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Definir taxa específica para uma oficina
const setWorkshopSpecificRate = async (req, res) => {
  try {
    const { workshopId, rate, endDate, reason } = req.body;

    // Validar se o usuário é admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem definir taxas específicas'
      });
    }

    // Validar taxa
    if (rate < 0 || rate > 1) {
      return res.status(400).json({
        success: false,
        message: 'Taxa deve estar entre 0% e 100%'
      });
    }

    // Verificar se a oficina existe
    const workshop = await User.findOne({ _id: workshopId, userType: 'workshop' });
    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Oficina não encontrada'
      });
    }

    const config = await CommissionConfig.getActiveConfig();

    // Remover taxa específica anterior (se existir)
    config.workshopSpecificRates = config.workshopSpecificRates.filter(
      item => item.workshop.toString() !== workshopId
    );

    // Adicionar nova taxa específica
    config.workshopSpecificRates.push({
      workshop: workshopId,
      rate,
      endDate: endDate ? new Date(endDate) : undefined,
      reason
    });

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Taxa específica definida com sucesso',
      data: config
    });
  } catch (error) {
    console.error('Erro ao definir taxa específica:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Remover taxa específica de uma oficina
const removeWorkshopSpecificRate = async (req, res) => {
  try {
    const { workshopId } = req.params;

    // Validar se o usuário é admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem remover taxas específicas'
      });
    }

    const config = await CommissionConfig.getActiveConfig();

    // Remover taxa específica
    const initialLength = config.workshopSpecificRates.length;
    config.workshopSpecificRates = config.workshopSpecificRates.filter(
      item => item.workshop.toString() !== workshopId
    );

    if (config.workshopSpecificRates.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Taxa específica não encontrada para esta oficina'
      });
    }

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Taxa específica removida com sucesso',
      data: config
    });
  } catch (error) {
    console.error('Erro ao remover taxa específica:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Configurar taxas por faixa de valor
const setTieredRates = async (req, res) => {
  try {
    const { tieredRates, reason } = req.body;

    // Validar se o usuário é admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem configurar taxas por faixa'
      });
    }

    // Validar estrutura das faixas
    if (!Array.isArray(tieredRates)) {
      return res.status(400).json({
        success: false,
        message: 'Faixas de taxa devem ser um array'
      });
    }

    // Validar cada faixa
    for (const tier of tieredRates) {
      if (tier.minAmount < 0 || tier.maxAmount <= tier.minAmount || tier.rate < 0 || tier.rate > 1) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos nas faixas de taxa'
        });
      }
    }

    const config = await CommissionConfig.getActiveConfig();
    
    // Registrar alteração no histórico
    config.recordRateChange(req.user.id, 'tiered_rates', 'tiered_rates', reason);
    
    config.tieredRates = tieredRates;
    await config.save();

    res.status(200).json({
      success: true,
      message: 'Taxas por faixa configuradas com sucesso',
      data: config
    });
  } catch (error) {
    console.error('Erro ao configurar taxas por faixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar configurações gerais (valores mínimo e máximo)
const updateGeneralSettings = async (req, res) => {
  try {
    const { minimumCommission, maximumCommission, reason } = req.body;

    // Validar se o usuário é admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem alterar configurações gerais'
      });
    }

    // Validar valores
    if (minimumCommission < 0 || (maximumCommission && maximumCommission < minimumCommission)) {
      return res.status(400).json({
        success: false,
        message: 'Valores de comissão inválidos'
      });
    }

    const config = await CommissionConfig.getActiveConfig();
    
    // Registrar alteração no histórico
    config.recordRateChange(req.user.id, 'general_settings', 'general_settings', reason);
    
    config.minimumCommission = minimumCommission;
    if (maximumCommission !== undefined) {
      config.maximumCommission = maximumCommission;
    }
    
    await config.save();

    res.status(200).json({
      success: true,
      message: 'Configurações gerais atualizadas com sucesso',
      data: config
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações gerais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter histórico de alterações
const getChangeHistory = async (req, res) => {
  try {
    // Validar se o usuário é admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem visualizar o histórico'
      });
    }

    const config = await CommissionConfig.getActiveConfig()
      .populate('changeHistory.changedBy', 'name email');

    res.status(200).json({
      success: true,
      data: config.changeHistory.sort((a, b) => b.changeDate - a.changeDate)
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Simular cálculo de comissão
const simulateCommission = async (req, res) => {
  try {
    const { workshopId, totalAmount } = req.body;

    if (!workshopId || !totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID da oficina e valor total são obrigatórios'
      });
    }

    const config = await CommissionConfig.getActiveConfig();
    const calculation = config.calculateCommission(workshopId, totalAmount);

    res.status(200).json({
      success: true,
      data: {
        totalAmount,
        ...calculation
      }
    });
  } catch (error) {
    console.error('Erro ao simular comissão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getCommissionConfig,
  updateDefaultRate,
  setWorkshopSpecificRate,
  removeWorkshopSpecificRate,
  setTieredRates,
  updateGeneralSettings,
  getChangeHistory,
  simulateCommission
};