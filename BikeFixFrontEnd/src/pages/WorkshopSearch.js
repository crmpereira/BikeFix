import React, { useState, useEffect } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Phone,
  Schedule,
  Star,
  FilterList,
  ExpandMore,
  Build,
  DirectionsBike,
  Verified,
  AccessTime,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const WorkshopSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('rating');
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dados mockados para demonstração
  const mockWorkshops = [
    {
      id: 1,
      name: 'Bike Center',
      address: 'Rua das Flores, 123 - Centro',
      city: 'São Paulo',
      phone: '(11) 1234-5678',
      rating: 4.8,
      reviewCount: 156,
      services: ['Manutenção Preventiva', 'Troca de Pneus', 'Ajuste de Freios'],
      priceRange: 'R$ 50 - R$ 200',
      openHours: '08:00 - 18:00',
      verified: true,
      distance: '2.3 km',
      image: null,
    },
    {
      id: 2,
      name: 'Speed Bikes',
      address: 'Av. Paulista, 456 - Bela Vista',
      city: 'São Paulo',
      phone: '(11) 9876-5432',
      rating: 4.5,
      reviewCount: 89,
      services: ['Manutenção Completa', 'Upgrade de Componentes', 'Limpeza'],
      priceRange: 'R$ 80 - R$ 350',
      openHours: '09:00 - 19:00',
      verified: true,
      distance: '4.1 km',
      image: null,
    },
    {
      id: 3,
      name: 'Ciclo Repair',
      address: 'Rua Augusta, 789 - Consolação',
      city: 'São Paulo',
      phone: '(11) 5555-1234',
      rating: 4.2,
      reviewCount: 67,
      services: ['Reparo de Pneus', 'Ajuste de Câmbio', 'Soldas'],
      priceRange: 'R$ 30 - R$ 150',
      openHours: '08:30 - 17:30',
      verified: false,
      distance: '6.7 km',
      image: null,
    },
  ];

  useEffect(() => {
    setWorkshops(mockWorkshops);
  }, []);

  const handleSearch = () => {
    setLoading(true);
    // Simular busca
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workshop.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = location === '' || workshop.city.toLowerCase().includes(location.toLowerCase());
    return matchesSearch && matchesLocation;
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
                value={serviceType}
                label="Tipo de Serviço"
                onChange={(e) => setServiceType(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="manutencao">Manutenção</MenuItem>
                <MenuItem value="reparo">Reparo</MenuItem>
                <MenuItem value="upgrade">Upgrade</MenuItem>
                <MenuItem value="limpeza">Limpeza</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
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
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={500}
                  valueLabelFormat={(value) => `R$ ${value}`}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">R$ 0</Typography>
                  <Typography variant="body2">R$ 500+</Typography>
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

      {/* Resultados */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {filteredWorkshops.length} oficinas encontradas
        </Typography>
      </Box>

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
                        {workshop.rating} ({workshop.reviewCount} avaliações)
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
                  {workshop.services.slice(0, 3).map((service, index) => (
                    <Chip
                      key={index}
                      label={service}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {workshop.services.length > 3 && (
                    <Chip
                      label={`+${workshop.services.length - 3}`}
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