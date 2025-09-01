import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Rating,
  Avatar,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  IconButton,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Phone,
  Schedule,
  FilterList,
  ExpandMore,
  Build,
  DirectionsBike,
  Verified,
  AccessTime,
  ViewList,
  Map as MapIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import workshopService from '../services/workshopService';
import { geocodeCEP } from '../services/geocodingService';
import { validateCEP } from '../services/cepService';
import LeafletMap from '../components/LeafletMap';
import { toast } from 'react-toastify';

const WorkshopSearch = () => {
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    state: '',
    cep: '',
    minRating: 0,
    maxDistance: 50,
    services: [],
    minPrice: 0,
    maxPrice: 200
  });
  const [sortBy, setSortBy] = useState('rating');
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'map'
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [searchingNearby, setSearchingNearby] = useState(false);
  const [availableServices] = useState([
    'Manutenção Preventiva',
    'Reparo de Freios',
    'Troca de Pneus',
    'Ajuste de Câmbio',
    'Limpeza Completa',
    'Upgrade de Componentes',
    'Revisão Geral'
  ]);

  const loadWorkshops = useCallback(async (searchFilters = {}) => {
    try {
      console.log('🚀 Iniciando loadWorkshops com filtros:', searchFilters);
      setLoading(true);
      setError(null);
      
      // Combinar filtros atuais com filtros de busca
      const apiFilters = {
        ...filters,
        ...searchFilters
      };
      
      // Remover filtros vazios e valores padrão
      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key] === '' || 
            (Array.isArray(apiFilters[key]) && apiFilters[key].length === 0)) {
          delete apiFilters[key];
        }
        // Remover valores padrão para campos específicos
        if (key === 'minPrice' && apiFilters[key] === 0) {
          delete apiFilters[key];
        }
        if (key === 'maxPrice' && apiFilters[key] === 200) {
          delete apiFilters[key];
        }
        if (key === 'maxDistance' && apiFilters[key] === 50) {
          delete apiFilters[key];
        }
      });
      
      let response;
      
      // Sempre usar getWorkshops para manter consistência
      console.log('🎯 Buscando oficinas com filtros:', apiFilters);
      response = await workshopService.getWorkshops(apiFilters);
      
      console.log('📡 Resposta da API:', response);
      
      if (response.success && response.data) {
        const formattedWorkshops = response.data.map(workshop => 
          workshopService.formatWorkshopForFrontend(workshop)
        );
        
        // Ordenar oficinas por proximidade se houver localização do usuário
        const sortedWorkshops = workshopService.sortWorkshopsByProximity(
          formattedWorkshops, 
          userLocation, 
          sortBy
        );
        
        console.log('✅ Oficinas formatadas e ordenadas:', sortedWorkshops.length, 'oficinas');
        setWorkshops(sortedWorkshops);
      } else {
        console.log('❌ Erro na resposta:', response.message);
        throw new Error(response.message || 'Erro ao carregar oficinas');
      }
    } catch (error) {
      console.error('Erro ao carregar oficinas:', error);
      setError(error.message || 'Erro ao carregar oficinas');
      toast.error('Erro ao carregar oficinas');
    } finally {
      setLoading(false);
      if (initialLoad) {
        setInitialLoad(false);
      }
    }
  }, [filters, initialLoad, sortBy, userLocation]);

  // Função para buscar por CEP
  const searchByCEP = async (cep) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!validateCEP(cep)) {
        toast.error('CEP inválido. Use o formato 12345-678');
        return;
      }
      
      console.log('🔍 Buscando coordenadas para CEP:', cep);
      const coordinates = await geocodeCEP(cep);
      
      if (coordinates) {
        console.log('📍 Coordenadas encontradas:', coordinates);
        
        // Atualizar localização do usuário com as coordenadas do CEP
        setUserLocation({
          lat: coordinates.lat,
          lng: coordinates.lng
        });
        
        // Buscar oficinas próximas às coordenadas do CEP
        const searchFilters = {
          search: filters.search,
          city: filters.city,
          state: filters.state,
          minRating: filters.minRating,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          services: filters.services,
          radius: filters.maxDistance,
          lat: coordinates.lat,
          lng: coordinates.lng
        };
        
        loadWorkshops(searchFilters);
        toast.success('Localização encontrada! Buscando oficinas próximas...');
      } else {
        toast.error('Não foi possível encontrar a localização para este CEP');
      }
    } catch (error) {
      console.error('Erro ao buscar por CEP:', error);
      toast.error('Erro ao buscar localização do CEP');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    console.log('🔍 Botão BUSCAR pressionado');
    console.log('📋 Filtros atuais:', filters);
    
    // Se há um CEP preenchido, buscar por CEP
    if (filters.cep && filters.cep.length >= 8) {
      searchByCEP(filters.cep);
      return;
    }
    
    const searchFilters = {
      search: filters.search,
      city: filters.city,
      state: filters.state,
      minRating: filters.minRating,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      services: filters.services,
      radius: filters.maxDistance
    };
    
    console.log('🎯 Filtros de busca:', searchFilters);
    loadWorkshops(searchFilters);
  };

  const filteredWorkshops = workshops
    .filter(workshop => {
      // Filtro de avaliação mínima
      if (filters.minRating > 0 && workshop.rating < filters.minRating) return false;
      
      // Filtro de distância (se disponível)
      if (workshop.distance && filters.maxDistance) {
        const distanceValue = typeof workshop.distance === 'number' 
          ? workshop.distance 
          : parseFloat(workshop.distance.toString().replace(' km', ''));
        if (distanceValue > filters.maxDistance) return false;
      }
      
      return true;
    });
    // Nota: A ordenação agora é feita pela função sortWorkshopsByProximity no serviço

  // Obter localização do usuário
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo limite para obter localização.';
            break;
          default:
            errorMessage = 'Erro desconhecido ao obter localização.';
            break;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  };

  // Buscar oficinas próximas
  const searchNearbyWorkshops = useCallback(async () => {
    if (!userLocation) {
      getUserLocation();
      return;
    }

    setSearchingNearby(true);
    setLoading(true);
    setError(null);

    try {
      const response = await workshopService.getNearbyWorkshops(
          userLocation.lat,
          userLocation.lng,
          filters.maxDistance || 10
        );

      if (response.success) {
        const formattedWorkshops = response.data.map(workshop => 
          workshopService.formatWorkshopForFrontend(workshop)
        );
        
        // Ordenar oficinas por proximidade
        const sortedWorkshops = workshopService.sortWorkshopsByProximity(
          formattedWorkshops, 
          userLocation, 
          'distance' // Para busca próxima, sempre ordenar por distância
        );
        
        setWorkshops(sortedWorkshops);
      } else {
        setError(response.message || 'Erro ao buscar oficinas próximas');
      }
    } catch (error) {
      console.error('Erro ao buscar oficinas próximas:', error);
      setError('Erro ao buscar oficinas próximas. Tente novamente.');
    } finally {
      setLoading(false);
      setSearchingNearby(false);
    }
  }, [userLocation, filters.maxDistance]);

  // Carregar oficinas ao montar o componente
  useEffect(() => {
    // Primeiro tentar obter localização do usuário
    getUserLocation();
    // Carregar oficinas iniciais
    loadWorkshops();
  }, [loadWorkshops]);

  // Quando a localização do usuário for obtida, buscar oficinas próximas automaticamente
  useEffect(() => {
    if (userLocation && !searchingNearby) {
      searchNearbyWorkshops();
    }
  }, [userLocation, searchingNearby, searchNearbyWorkshops]);

  // Reordenar oficinas quando o critério de ordenação mudar
  useEffect(() => {
    if (workshops.length > 0) {
      const sortedWorkshops = workshopService.sortWorkshopsByProximity(
        workshops,
        userLocation,
        sortBy
      );
      setWorkshops(sortedWorkshops);
    }
  }, [sortBy, userLocation, workshops]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Buscar Oficinas
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
        Encontre a oficina perfeita para sua bike
      </Typography>

      {/* Seção de Localização Automática */}
      <Paper sx={{ 
        p: 3, 
        mb: 4,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
        border: '1px solid #e1f5fe'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
            Localização Inteligente
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Encontre oficinas próximas a você automaticamente
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: 'center'
        }}>
          <Button
            variant="contained"
            size="large"
            onClick={getUserLocation}
            disabled={loading}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5,
              px: 3,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(25,118,210,0.4)'
              }
            }}
            startIcon={<LocationOn />}
          >
            🎯 Detectar Minha Localização
          </Button>
          
          <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
            ou
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
            <TextField
              label="Digite seu CEP"
              value={filters.cep || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                const formattedCEP = value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5, 8)}` : value;
                setFilters({ ...filters, cep: formattedCEP });
              }}
              size="medium"
              placeholder="12345-678"
              inputProps={{ maxLength: 9 }}
              sx={{ 
                minWidth: '150px',
                '& .MuiOutlinedInput-root': { borderRadius: 2 } 
              }}
            />
            <Button
              variant="outlined"
              size="large"
              onClick={() => filters.cep && searchByCEP(filters.cep)}
              disabled={!filters.cep || loading}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                px: 2
              }}
            >
              🔍 Buscar
            </Button>
          </Box>
        </Box>
        
        {/* Status da Localização */}
        {userLocation && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'success.light', 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Verified sx={{ color: 'success.dark' }} />
            <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 600 }}>
              ✅ Localização detectada! Mostrando oficinas próximas.
            </Typography>
          </Box>
        )}
        
        {locationError && (
          <Alert 
            severity="warning" 
            sx={{ mt: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={getUserLocation}
                sx={{ textTransform: 'none' }}
              >
                Tentar Novamente
              </Button>
            }
          >
            {locationError}
          </Alert>
        )}
      </Paper>

      {/* Filtros de Busca - Design Moderno */}
      <Paper sx={{ 
        p: { xs: 2, md: 3 }, 
        mb: 4,
        borderRadius: 4,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(25, 118, 210, 0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #1976d2, #42a5f5, #64b5f6)'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Search sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
            Buscar Oficinas
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          {/* Busca Principal */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Buscar por nome ou especialidade"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              size="medium"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontSize: '1.1rem'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {/* Localização */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Cidade"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              size="medium"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Estado"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value.toUpperCase() })}
              size="medium"
              inputProps={{ maxLength: 2 }}
              placeholder="SP"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={3}>
            <TextField
              fullWidth
              label="CEP"
              value={filters.cep || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                const formattedCEP = value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5, 8)}` : value;
                setFilters({ ...filters, cep: formattedCEP });
              }}
              size="medium"
              placeholder="12345-678"
              inputProps={{ maxLength: 9 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Serviço</InputLabel>
              <Select
                value={filters.services.length > 0 ? filters.services[0] : ''}
                label="Tipo de Serviço"
                onChange={(e) => setFilters({ ...filters, services: e.target.value ? [e.target.value] : [] })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todos os Serviços</MenuItem>
                {availableServices.map((service) => (
                  <MenuItem key={service} value={service}>
                    🔧 {service}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Botões de Ação */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2, 
              mt: 2 
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSearch}
                disabled={loading}
                sx={{
                  flex: { xs: 1, sm: 2 },
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
                startIcon={<Search />}
              >
                {loading ? '🔍 Buscando...' : '🔍 Buscar Oficinas'}
              </Button>
              
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={searchNearbyWorkshops}
                disabled={searchingNearby || loading}
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5
                }}
                startIcon={<LocationOn />}
              >
                {searchingNearby ? '📍 Localizando...' : '📍 Próximas'}
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  const defaultFilters = {
                    search: '',
                    city: '',
                    state: '',
                    cep: '',
                    minRating: 0,
                    maxDistance: 50,
                    services: [],
                    minPrice: 0,
                    maxPrice: 200
                  };
                  setFilters(defaultFilters);
                  loadWorkshops({});
                }}
                disabled={loading}
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5
                }}
              >
                🗑️ Limpar
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Filtros Avançados */}
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <FilterList sx={{ mr: 1 }} />
            <Typography>Filtros Avançados</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Faixa de Preço</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    label="Preço Mínimo"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: parseFloat(e.target.value) || 0 })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Preço Máximo"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: parseFloat(e.target.value) || 500 })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    size="small"
                    fullWidth
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Distância Máxima</Typography>
                <Box sx={{ px: 2, mb: 2 }}>
                  <Slider
                    value={filters.maxDistance}
                    onChange={(e, newValue) => setFilters({ ...filters, maxDistance: newValue })}
                    min={1}
                    max={100}
                    step={5}
                    marks={[
                      { value: 5, label: '5km' },
                      { value: 25, label: '25km' },
                      { value: 50, label: '50km' },
                      { value: 100, label: '100km' }
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}km`}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Avaliação Mínima</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Rating
                    value={filters.minRating}
                    onChange={(e, newValue) => setFilters({ ...filters, minRating: newValue || 0 })}
                    precision={0.5}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {filters.minRating > 0 ? `${filters.minRating} estrelas ou mais` : 'Qualquer avaliação'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Ordenar por</InputLabel>
                  <Select
                    value={sortBy}
                    label="Ordenar por"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="rating">Melhor Avaliação</MenuItem>
                    <MenuItem value="distance">Mais Próximo</MenuItem>
                    <MenuItem value="price">Menor Preço</MenuItem>
                    <MenuItem value="reviews">Mais Avaliações</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Loading e Error States */}
      {initialLoad && loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={loadWorkshops} sx={{ ml: 2 }}>
            Tentar Novamente
          </Button>
        </Alert>
      )}
      
      {locationError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {locationError}
          <Button onClick={getUserLocation} sx={{ ml: 2 }}>
            Tentar Obter Localização
          </Button>
        </Alert>
      )}
      
      {!initialLoad && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {loading ? 'Buscando...' : `${filteredWorkshops.length} oficinas encontradas`}
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(event, newViewMode) => {
              if (newViewMode !== null) {
                setViewMode(newViewMode);
              }
            }}
            aria-label="modo de visualização"
            size="small"
          >
            <ToggleButton value="list" aria-label="visualização em lista">
              <ViewList sx={{ mr: 1 }} />
              Lista
            </ToggleButton>
            <ToggleButton value="map" aria-label="visualização em mapa">
              <MapIcon sx={{ mr: 1 }} />
              Mapa
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {viewMode === 'list' ? (
        <Grid container spacing={3}>
          {filteredWorkshops.map((workshop) => (
            <Grid item xs={12} sm={6} md={6} lg={4} key={workshop.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 4,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(25, 118, 210, 0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: workshop.rating >= 4.5 
                  ? 'linear-gradient(90deg, #ff9800, #ffc107)'
                  : 'linear-gradient(90deg, #1976d2, #42a5f5)'
              },
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                '& .workshop-avatar': {
                  transform: 'scale(1.1) rotate(5deg)'
                }
              }
            }}>
              <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                {/* Header da Oficina */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  gap: 2
                }}>
                  <Box 
                    className="workshop-avatar"
                    sx={{
                      width: { xs: 56, sm: 64 },
                      height: { xs: 56, sm: 64 },
                      borderRadius: '50%',
                      background: workshop.rating >= 4.5
                        ? 'linear-gradient(135deg, #ff9800, #ffc107)'
                        : 'linear-gradient(135deg, #1976d2, #42a5f5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                    <Build sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mb: 0.5
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {workshop.name}
                      </Typography>
                      {workshop.verified && (
                        <Verified color="primary" fontSize="small" />
                      )}
                    </Box>
                    <Box sx={{ 
                       display: 'flex', 
                       alignItems: 'center',
                       gap: 1
                     }}>
                      <Rating value={workshop.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        fontWeight: 500
                      }}>
                        {workshop.rating} ({workshop.ratingCount || workshop.reviewCount})
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Informações de Localização */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  mb: 2,
                  p: 2,
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)',
                  borderRadius: 3,
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #1976d2, #42a5f5)'
                  }
                }}>
                  <LocationOn sx={{ fontSize: 18, color: 'primary.main', mr: 1, mt: 0.2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, mb: 0.5 }}>
                      📍 {workshop.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {workshop.city}, {workshop.state} • CEP: {workshop.zipCode}
                    </Typography>
                    {workshop.distance && (
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, mt: 0.5 }}>
                        📏 {workshop.distance}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Contato e Horário */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ fontSize: 16, color: 'primary.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      📞 {workshop.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ fontSize: 16, color: 'primary.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      🕒 {workshop.openHours}
                    </Typography>
                  </Box>
                </Box>

                {/* Serviços */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                    🔧 Serviços Oferecidos:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {workshop.serviceNames.slice(0, 3).map((serviceName, index) => (
                      <Chip
                        key={index}
                        label={serviceName}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                          color: '#1976d2',
                          fontWeight: 600,
                          border: '1px solid rgba(25, 118, 210, 0.2)',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                          }
                        }}
                      />
                    ))}
                    {workshop.serviceNames.length > 3 && (
                      <Chip
                        label={`+${workshop.serviceNames.length - 3} mais`}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                          color: '#f57c00',
                          fontWeight: 700,
                          border: '1px solid rgba(245, 124, 0, 0.2)',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #ffe0b2 0%, #ffcc02 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(245, 124, 0, 0.3)'
                          }
                        }}
                      />
                    )}
                </Box>
                </Box>

                {/* Informações de Preço e Distância */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                  borderRadius: 3,
                  mb: 2,
                  border: '1px solid rgba(76, 175, 80, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #4caf50, #8bc34a)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      💰 {workshop.priceRange || 'Consulte valores'}
                    </Typography>
                  </Box>
                  {workshop.distance && (
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                      📍 {workshop.distance}
                    </Typography>
                  )}
                </Box>
              </CardContent>

              {/* Botões de Ação */}
              <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  to={`/workshops/${workshop.id}`}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 1.5,
                    fontSize: '1rem',
                    background: workshop.rating >= 4.5
                      ? 'linear-gradient(135deg, #ff9800 0%, #ffc107 50%, #ffeb3b 100%)'
                      : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #64b5f6 100%)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      transition: 'left 0.6s ease'
                    },
                    '&:hover': {
                      background: workshop.rating >= 4.5
                        ? 'linear-gradient(135deg, #f57c00 0%, #ff9800 50%, #ffc107 100%)'
                        : 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
                      transform: 'translateY(-3px) scale(1.02)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                      '&::before': {
                        left: '100%'
                      }
                    }
                  }}
                >
                  {workshop.rating >= 4.5 ? '⭐ Ver Oficina Premium' : '🔍 Ver Detalhes'}
                </Button>
              </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ height: '600px', width: '100%', mb: 3 }}>
          <LeafletMap 
            workshops={filteredWorkshops}
            userLocation={userLocation}
            onWorkshopSelect={(workshop) => {
              console.log('Oficina selecionada:', workshop);
            }}
            height="600px"
          />
        </Box>
      )}

      {filteredWorkshops.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <DirectionsBike sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma oficina encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tente ajustar os filtros de busca ou expandir a área de localização.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default WorkshopSearch;