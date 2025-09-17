const { validationResult } = require('express-validator');
const User = require('../models/User');
const mongoose = require('mongoose');
const { geocodeUserAddress } = require('../services/geocodingService');

// Obter perfil do usuário
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar perfil do usuário
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    // Buscar o usuário para verificar o tipo
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    let updateData = { ...req.body };

    // Processar dados de endereço
    const hasAddressData = updateData.address && (
      updateData.address.street || 
      updateData.address.city || 
      updateData.address.state || 
      updateData.address.zipCode
    );
    
    console.log('Dados recebidos para atualização:', updateData);
    console.log('Tem dados de endereço:', hasAddressData);
    
    if (hasAddressData) {
      console.log('Dados de endereço detectados:', updateData.address);
    }

    // Atualizar dados do usuário
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    // Se há dados de endereço, tentar geocodificar
    if (hasAddressData) {
      console.log('Dados de endereço detectados, tentando geocodificação...');
      
      try {
        // Geocodificar o endereço
        const userDataWithCoordinates = await geocodeUserAddress(user.toObject(), currentUser.userType === 'workshop' ? 'workshop' : currentUser.userType);
        
        // Se conseguiu geocodificar, atualizar com as coordenadas
        if (userDataWithCoordinates.address?.coordinates) {
          const finalUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { 'address.coordinates': userDataWithCoordinates.address.coordinates } },
            { new: true, runValidators: true }
          ).select('-password');
          
          console.log('Perfil atualizado com coordenadas:', finalUser.address);
          
          res.json({
            success: true,
            message: 'Perfil atualizado com sucesso (incluindo coordenadas)',
            data: finalUser
          });
        } else {
          console.log('Geocodificação falhou, mas dados de endereço foram salvos');
          res.json({
            success: true,
            message: 'Perfil atualizado com sucesso (coordenadas não disponíveis)',
            data: user
          });
        }
      } catch (geocodeError) {
        console.error('Erro na geocodificação:', geocodeError);
        res.json({
          success: true,
          message: 'Perfil atualizado com sucesso (erro na geocodificação)',
          data: user
        });
      }
    } else {
      // Atualização normal sem dados de endereço
      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: user
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter bikes do usuário
const getUserBikes = async (req, res) => {
  try {
    console.log('=== BUSCANDO BIKES DO USUÁRIO ===');
    console.log('User ID:', req.user.id);
    
    const user = await User.findById(req.user.id).select('cyclistData.bikes');

    if (!user) {
      console.log('Usuário não encontrado para ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const bikes = user.cyclistData?.bikes || [];
    console.log('Bikes encontradas:', bikes.length);
    console.log('Bikes:', bikes.map(bike => ({ id: bike._id, brand: bike.brand, model: bike.model })));
    console.log('===============================');

    res.json({
      success: true,
      data: bikes
    });
  } catch (error) {
    console.error('Erro ao buscar bikes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Adicionar nova bike
const addUserBike = async (req, res) => {
  try {
    console.log('=== ADICIONANDO NOVA BIKE ===');
    console.log('User ID:', req.user.id);
    console.log('Dados recebidos:', req.body);
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { brand, model, year, type, serialNumber, purchaseDate, lastMaintenance, totalKm } = req.body;

    const newBike = {
      _id: new mongoose.Types.ObjectId(),
      brand,
      model,
      year,
      type,
      serialNumber: serialNumber || '',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
      totalKm: totalKm || 0
    };

    console.log('Nova bike criada:', newBike);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { 'cyclistData.bikes': newBike } },
      { new: true, runValidators: true }
    ).select('cyclistData.bikes');

    if (!user) {
      console.log('Usuário não encontrado para ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('Bike adicionada com sucesso. Total de bikes:', user.cyclistData?.bikes?.length || 0);
    console.log('============================');

    res.status(201).json({
      success: true,
      message: 'Bike adicionada com sucesso',
      data: newBike
    });
  } catch (error) {
    console.error('Erro ao adicionar bike:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar bike existente
const updateUserBike = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { bikeId } = req.params;
    const { brand, model, year, type, serialNumber, purchaseDate, lastMaintenance, totalKm } = req.body;

    const updateData = {
      'cyclistData.bikes.$.brand': brand,
      'cyclistData.bikes.$.model': model,
      'cyclistData.bikes.$.year': year,
      'cyclistData.bikes.$.type': type,
      'cyclistData.bikes.$.serialNumber': serialNumber || '',
      'cyclistData.bikes.$.purchaseDate': purchaseDate ? new Date(purchaseDate) : null,
      'cyclistData.bikes.$.lastMaintenance': lastMaintenance ? new Date(lastMaintenance) : null,
      'cyclistData.bikes.$.totalKm': totalKm || 0
    };

    const user = await User.findOneAndUpdate(
      { _id: req.user.id, 'cyclistData.bikes._id': bikeId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('cyclistData.bikes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário ou bike não encontrado'
      });
    }

    const updatedBike = user.cyclistData.bikes.find(bike => bike._id.toString() === bikeId);

    res.json({
      success: true,
      message: 'Bike atualizada com sucesso',
      data: updatedBike
    });
  } catch (error) {
    console.error('Erro ao atualizar bike:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar bike
const deleteUserBike = async (req, res) => {
  try {
    const { bikeId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { 'cyclistData.bikes': { _id: bikeId } } },
      { new: true }
    ).select('cyclistData.bikes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Bike removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar bike:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserBikes,
  addUserBike,
  updateUserBike,
  deleteUserBike
};