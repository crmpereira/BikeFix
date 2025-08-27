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
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import workshopService from '../services/workshopService';
import { toast } from 'react-toastify';

const WorkshopSearch = () => {
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    state: '',
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
  const [availableServices] = useState([
    'Manutenção Preventiva',
    'Reparo de Freios',
    'Troca de Pneus',
    'Ajuste de Câmbio',
    'Limpeza Completa',
    'Upgrade de Componentes',
    'Revisão Geral'
  ]);

  // Carregar oficinas ao montar o componente
  useEffect(() => {
    loadWorkshops();
  }, []);

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
        console.log('✅ Oficinas formatadas:', formattedWorkshops.length, 'oficinas');
        setWorkshops(formattedWorkshops);
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
  }, [filters, initialLoad]);

  const handleSearch = () => {
    console.log('🔍 Botão BUSCAR pressionado');
    console.log('📋 Filtros atuais:', filters);
    
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
        const distanceValue = parseFloat(workshop.distance.replace(' km', ''));
        if (distanceValue > filters.maxDistance) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          if (a.distance && b.distance) {
            const distA = parseFloat(a.distance.replace(' km', ''));
            const distB = parseFloat(b.distance.replace(' km', ''));
            return distA - distB;
          }
          return 0;
        case 'price':
          // Ordenar por menor preço (extrair valor mínimo da faixa de preços)
          const getPriceValue = (priceRange) => {
            if (!priceRange || priceRange === 'Consultar') return 999999;
            const match = priceRange.match(/R\$ (\d+)/);
            return match ? parseInt(match[1]) : 999999;
          };
          return getPriceValue(a.priceRange) - getPriceValue(b.priceRange);
        case 'reviews':
          return (b.ratingCount || 0) - (a.ratingCount || 0);
        default:
          return b.rating - a.rating;
      }
    });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Buscar Oficinas
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Encontre a oficina perfeita para sua bike
      </Typography>

      {/* Filtros de Busca */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar oficinas ou serviços"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Localização"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Serviço</InputLabel>
              <Select
                value={filters.services.length > 0 ? filters.services[0] : ''}
                label="Tipo de Serviço"
                onChange={(e) => setFilters({ ...filters, services: e.target.value ? [e.target.value] : [] })}
              >
                <MenuItem value="">Todos</MenuItem>
                {availableServices.map((service) => (
                  <MenuItem key={service} value={service}>
                    {service}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
              <Button
                fullWidth
                variant="contained"
                size="medium"
                onClick={handleSearch}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => {
                  const defaultFilters = {
                    search: '',
                    city: '',
                    state: '',
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
              >
                Limpar
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
      
      {!initialLoad && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {loading ? 'Buscando...' : `${filteredWorkshops.length} oficinas encontradas`}
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {filteredWorkshops.map((workshop) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={workshop.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-2px)' },
                transition: 'transform 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: { xs: 'flex-start', sm: 'center' }, 
                  mb: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 2 }
                }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: { xs: 0, sm: 2 } }}>
                    <Build />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      flexWrap: { xs: 'wrap', sm: 'nowrap' }
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}>
                        {workshop.name}
                      </Typography>
                      {workshop.verified && (
                        <Verified color="primary" fontSize="small" />
                      )}
                    </Box>
                    <Box sx={{ 
                       display: 'flex', 
                       alignItems: { xs: 'flex-start', sm: 'center' },
                       gap: 1,
                       flexDirection: { xs: 'column', sm: 'row' }
                     }}>
                      <Rating value={workshop.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        {workshop.rating} ({workshop.ratingCount || workshop.reviewCount} avaliações)
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {workshop.address}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {workshop.phone}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {workshop.openHours}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Serviços:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {workshop.serviceNames.slice(0, 3).map((serviceName, index) => (
                    <Chip
                      key={index}
                      label={serviceName}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {workshop.serviceNames.length > 3 && (
                    <Chip
                      label={`+${workshop.serviceNames.length - 3}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                    {workshop.priceRange}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {workshop.distance}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  to={`/workshops/${workshop.id}`}
                >
                  Ver Detalhes
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

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