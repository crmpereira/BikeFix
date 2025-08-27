const User = require('../models/User');

// Buscar todas as oficinas aprovadas com filtros
const getWorkshops = async (req, res) => {
  try {
    const {
      search,
      city,
      state,
      services,
      minRating,
      maxDistance,
      minPrice,
      maxPrice,
      lat,
      lng,
      radius = 10
    } = req.query;
    
    // Construir filtro base
    let filter = {
      userType: 'workshop',
      'workshopData.isApproved': true,
      isVerified: true,
      // Filtrar apenas oficinas que tenham pelo menos um serviço cadastrado
      'workshopData.services': { $exists: true, $not: { $size: 0 } }
    };
    
    // Aplicar filtros de busca
    if (search) {
      filter.$or = [
        { 'workshopData.businessName': { $regex: search, $options: 'i' } },
        { 'workshopData.description': { $regex: search, $options: 'i' } },
        { 'workshopData.services.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (city) {
      filter['workshopData.address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (state) {
      filter['workshopData.address.state'] = { $regex: state, $options: 'i' };
    }
    
    if (minRating) {
      filter['workshopData.rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Filtro por serviços
    if (services) {
      const serviceArray = Array.isArray(services) ? services : [services];
      filter['workshopData.services.name'] = { $in: serviceArray };
    }
    
    // Buscar oficinas
    let workshops = await User.find(filter)
      .select('name email phone workshopData')
      .sort({ 'workshopData.rating.average': -1 });

    // Filtro por faixa de preço (aplicado após busca)
    if (minPrice || maxPrice) {
      workshops = workshops.filter(workshop => {
        const services = workshop.workshopData.services || [];
        if (services.length === 0) return true; // Se não tem serviços, incluir na busca
        
        const prices = services.map(service => service.basePrice || 0).filter(price => price > 0);
        if (prices.length === 0) return true; // Se não tem preços válidos, incluir na busca
        
        const minServicePrice = Math.min(...prices);
        const maxServicePrice = Math.max(...prices);
        
        let matchesPrice = true;
        if (minPrice) {
          matchesPrice = matchesPrice && maxServicePrice >= parseFloat(minPrice);
        }
        if (maxPrice) {
          matchesPrice = matchesPrice && minServicePrice <= parseFloat(maxPrice);
        }
        
        return matchesPrice;
      });
    }

    // Filtro por proximidade geográfica
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);
      
      workshops = workshops.filter(workshop => {
        const coordinates = workshop.workshopData.address.coordinates;
        if (!coordinates || !coordinates.lat || !coordinates.lng) return false;
        
        const distance = calculateDistance(userLat, userLng, coordinates.lat, coordinates.lng);
        
        return distance <= maxRadius;
      }).map(workshop => {
        const coordinates = workshop.workshopData.address.coordinates;
        const distance = calculateDistance(userLat, userLng, coordinates.lat, coordinates.lng);
        
        return {
          ...workshop.toObject(),
          distance: distance
        };
      }).sort((a, b) => a.distance - b.distance);
    }
    
    // Formatar dados para o frontend
    const formattedWorkshops = workshops.map(workshop => ({
      id: workshop._id,
      name: workshop.workshopData.businessName,
      owner: workshop.name,
      email: workshop.email,
      phone: workshop.phone,
      description: workshop.workshopData.description,
      address: {
        street: workshop.workshopData.address.street,
        city: workshop.workshopData.address.city,
        state: workshop.workshopData.address.state,
        zipCode: workshop.workshopData.address.zipCode,
        coordinates: workshop.workshopData.address.coordinates
      },
      workingHours: workshop.workshopData.workingHours,
      services: (workshop.workshopData.services || []).map((service, index) => {
        const serviceObj = service.toObject ? service.toObject() : service;
        return {
          id: `${workshop._id}_service_${index}`,
          name: serviceObj.name,
          description: serviceObj.description,
          basePrice: serviceObj.basePrice,
          estimatedTime: serviceObj.estimatedTime
        };
      }),
      rating: workshop.workshopData.rating,
      verified: workshop.isVerified,
      cnpj: workshop.workshopData.cnpj,
      serviceDetails: workshop.workshopData.serviceDetails || [],
      distance: workshop.distance || null
    }));
    
    res.json({
      success: true,
      message: 'Oficinas encontradas com sucesso',
      data: formattedWorkshops,
      count: formattedWorkshops.length,
      filters: {
        minPrice,
        maxPrice,
        minRating,
        services,
        city,
        state,
        search,
        radius
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar oficinas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Função auxiliar para calcular distância entre dois pontos
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Arredondar para 2 casas decimais
}

// Buscar oficina por ID
const getWorkshopById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const workshop = await User.findOne({
      _id: id,
      userType: 'workshop',
      'workshopData.isApproved': true
    }).select('name email phone workshopData');
    
    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Oficina não encontrada'
      });
    }
    
    // Formatar dados para o frontend
    const formattedWorkshop = {
      id: workshop._id,
      name: workshop.workshopData.businessName,
      owner: workshop.name,
      email: workshop.email,
      phone: workshop.phone,
      description: workshop.workshopData.description,
      address: {
        street: workshop.workshopData.address.street,
        city: workshop.workshopData.address.city,
        state: workshop.workshopData.address.state,
        zipCode: workshop.workshopData.address.zipCode,
        coordinates: workshop.workshopData.address.coordinates
      },
      workingHours: workshop.workshopData.workingHours,
      services: (workshop.workshopData.services || []).map((service, index) => {
        const serviceObj = service.toObject ? service.toObject() : service;
        return {
          id: `${workshop._id}_service_${index}`,
          name: serviceObj.name,
          description: serviceObj.description,
          basePrice: serviceObj.basePrice,
          estimatedTime: serviceObj.estimatedTime
        };
      }),
      rating: workshop.workshopData.rating,
      verified: workshop.isVerified,
      cnpj: workshop.workshopData.cnpj
    };
    
    res.json({
      success: true,
      message: 'Oficina encontrada com sucesso',
      data: formattedWorkshop
    });
    
  } catch (error) {
    console.error('Erro ao buscar oficina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar oficinas próximas (por coordenadas)
const getNearbyWorkshops = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius em km
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas (lat, lng) são obrigatórias'
      });
    }
    
    // Converter para números
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInKm = parseFloat(radius);
    
    // Buscar oficinas aprovadas
    const workshops = await User.find({
      userType: 'workshop',
      'workshopData.isApproved': true,
      isVerified: true,
      'workshopData.address.coordinates.lat': { $exists: true },
      'workshopData.address.coordinates.lng': { $exists: true },
      // Filtrar apenas oficinas que tenham pelo menos um serviço cadastrado
      'workshopData.services': { $exists: true, $not: { $size: 0 } }
    }).select('name email phone workshopData');
    
    // Calcular distância e filtrar por raio
    const nearbyWorkshops = workshops.filter(workshop => {
      const workshopLat = workshop.workshopData.address.coordinates.lat;
      const workshopLng = workshop.workshopData.address.coordinates.lng;
      
      // Fórmula de Haversine para calcular distância
      const R = 6371; // Raio da Terra em km
      const dLat = (workshopLat - latitude) * Math.PI / 180;
      const dLng = (workshopLng - longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(workshopLat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance <= radiusInKm;
    }).map(workshop => {
      // Calcular distância exata para cada oficina
      const workshopLat = workshop.workshopData.address.coordinates.lat;
      const workshopLng = workshop.workshopData.address.coordinates.lng;
      
      const R = 6371;
      const dLat = (workshopLat - latitude) * Math.PI / 180;
      const dLng = (workshopLng - longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(workshopLat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return {
        id: workshop._id,
        name: workshop.workshopData.businessName,
        owner: workshop.name,
        email: workshop.email,
        phone: workshop.phone,
        description: workshop.workshopData.description,
        address: {
          street: workshop.workshopData.address.street,
          city: workshop.workshopData.address.city,
          state: workshop.workshopData.address.state,
          zipCode: workshop.workshopData.address.zipCode,
          coordinates: workshop.workshopData.address.coordinates
        },
        workingHours: workshop.workshopData.workingHours,
        services: workshop.workshopData.services,
        rating: workshop.workshopData.rating,
        verified: workshop.isVerified,
        distance: Math.round(distance * 10) / 10 // Arredondar para 1 casa decimal
      };
    }).sort((a, b) => a.distance - b.distance); // Ordenar por distância
    
    res.json({
      success: true,
      message: 'Oficinas próximas encontradas com sucesso',
      data: nearbyWorkshops,
      count: nearbyWorkshops.length,
      searchRadius: radiusInKm
    });
    
  } catch (error) {
    console.error('Erro ao buscar oficinas próximas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar serviços de uma oficina
const getWorkshopServices = async (req, res) => {
  try {
    const { id } = req.params;
    
    const workshop = await User.findOne({
      _id: id,
      userType: 'workshop',
      'workshopData.isApproved': true
    }).select('workshopData.services workshopData.businessName');
    
    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Oficina não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Serviços encontrados com sucesso',
      data: {
        workshopName: workshop.workshopData.businessName,
        services: workshop.workshopData.services
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar serviços da oficina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getWorkshops,
  getWorkshopById,
  getNearbyWorkshops,
  getWorkshopServices
};