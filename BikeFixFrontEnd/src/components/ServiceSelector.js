import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Build,
  AttachMoney,
  AccessTime,
} from '@mui/icons-material';

// Lista de serviços padrão disponíveis no sistema
const DEFAULT_SERVICES = [
  {
    name: 'Manutenção Geral',
    description: 'Revisão completa da bike incluindo ajustes e lubrificação',
    basePrice: 80,
    estimatedTime: 120,
    category: 'maintenance'
  },
  {
    name: 'Troca de Pneus',
    description: 'Substituição de pneus e câmaras de ar',
    basePrice: 45,
    estimatedTime: 30,
    category: 'repair'
  },
  {
    name: 'Ajuste de Freios',
    description: 'Regulagem e manutenção do sistema de freios',
    basePrice: 35,
    estimatedTime: 45,
    category: 'adjustment'
  },
  {
    name: 'Ajuste de Câmbio',
    description: 'Regulagem do sistema de transmissão',
    basePrice: 40,
    estimatedTime: 60,
    category: 'adjustment'
  },
  {
    name: 'Lubrificação',
    description: 'Lubrificação completa da corrente e componentes',
    basePrice: 25,
    estimatedTime: 30,
    category: 'maintenance'
  },
  {
    name: 'Reparo de Pneus',
    description: 'Conserto de furos e troca de câmaras',
    basePrice: 15,
    estimatedTime: 20,
    category: 'repair'
  },
  {
    name: 'Manutenção de E-bikes',
    description: 'Serviços especializados para bicicletas elétricas',
    basePrice: 120,
    estimatedTime: 90,
    category: 'specialized'
  },
  {
    name: 'Suspensão MTB',
    description: 'Manutenção e regulagem de suspensões',
    basePrice: 120,
    estimatedTime: 150,
    category: 'specialized'
  },
  {
    name: 'Freios Hidráulicos',
    description: 'Manutenção de freios a disco hidráulicos',
    basePrice: 90,
    estimatedTime: 90,
    category: 'specialized'
  },
  {
    name: 'Tubeless Setup',
    description: 'Conversão para sistema tubeless',
    basePrice: 80,
    estimatedTime: 60,
    category: 'specialized'
  }
];

const ServiceSelector = ({ selectedServices = [], onServicesChange, error }) => {
  const [services, setServices] = useState([]);
  const [customServices, setCustomServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceTime, setNewServiceTime] = useState('');

  useEffect(() => {
    // Inicializar com serviços padrão
    const initialServices = DEFAULT_SERVICES.map(service => ({
      ...service,
      id: service.name.toLowerCase().replace(/\s+/g, '-'),
      selected: selectedServices.some(selected => selected.name === service.name)
    }));
    setServices(initialServices);
  }, [selectedServices]);

  const handleServiceToggle = (serviceId) => {
    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        return { ...service, selected: !service.selected };
      }
      return service;
    });
    setServices(updatedServices);

    // Notificar componente pai sobre mudanças
    const selectedServicesList = [...updatedServices.filter(s => s.selected), ...customServices];
    onServicesChange(selectedServicesList.map(({ selected, id, category, ...service }) => service));
  };

  const handleCustomServiceAdd = () => {
    if (!newServiceName.trim() || !newServiceDescription.trim() || !newServicePrice || !newServiceTime) {
      return;
    }

    const customService = {
      name: newServiceName.trim(),
      description: newServiceDescription.trim(),
      basePrice: parseFloat(newServicePrice),
      estimatedTime: parseInt(newServiceTime),
      category: 'custom'
    };

    const updatedCustomServices = [...customServices, customService];
    setCustomServices(updatedCustomServices);

    // Limpar campos
    setNewServiceName('');
    setNewServiceDescription('');
    setNewServicePrice('');
    setNewServiceTime('');

    // Notificar componente pai
    const selectedServicesList = [...services.filter(s => s.selected), ...updatedCustomServices];
    onServicesChange(selectedServicesList.map(({ selected, id, category, ...service }) => service));
  };

  const handleCustomServiceRemove = (index) => {
    const updatedCustomServices = customServices.filter((_, i) => i !== index);
    setCustomServices(updatedCustomServices);

    // Notificar componente pai
    const selectedServicesList = [...services.filter(s => s.selected), ...updatedCustomServices];
    onServicesChange(selectedServicesList.map(({ selected, id, category, ...service }) => service));
  };

  const getCategoryLabel = (category) => {
    const labels = {
      maintenance: 'Manutenção',
      repair: 'Reparo',
      adjustment: 'Ajuste',
      specialized: 'Especializado',
      custom: 'Personalizado'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      maintenance: 'primary',
      repair: 'secondary',
      adjustment: 'success',
      specialized: 'warning',
      custom: 'info'
    };
    return colors[category] || 'default';
  };

  return (
    <Box>
      <FormControl component="fieldset" error={!!error} sx={{ width: '100%' }}>
        <FormLabel component="legend" sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 600 }}>
          Serviços Oferecidos *
        </FormLabel>
        
        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Selecione os serviços que sua oficina oferece. Você pode personalizar preços e tempos posteriormente.
        </Typography>

        <FormGroup>
          <Grid container spacing={2}>
            {services.map((service) => (
              <Grid item xs={12} md={6} key={service.id}>
                <Card 
                  variant={service.selected ? "elevation" : "outlined"}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      elevation: 2,
                      transform: 'translateY(-2px)'
                    },
                    ...(service.selected && {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.50'
                    })
                  }}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <CardContent sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={service.selected}
                            onChange={() => handleServiceToggle(service.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {service.name}
                            </Typography>
                            <Chip 
                              label={getCategoryLabel(service.category)} 
                              size="small" 
                              color={getCategoryColor(service.category)}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                        sx={{ alignItems: 'flex-start', m: 0 }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 4 }}>
                      {service.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, ml: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AttachMoney sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          R$ {service.basePrice}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {service.estimatedTime}min
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </FormGroup>

        {/* Serviços personalizados */}
        {customServices.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Serviços Personalizados
            </Typography>
            <Grid container spacing={2}>
              {customServices.map((service, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {service.name}
                        </Typography>
                        <Chip 
                          label="Remover" 
                          size="small" 
                          color="error" 
                          variant="outlined"
                          onClick={() => handleCustomServiceRemove(index)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {service.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AttachMoney sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                            R$ {service.basePrice}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {service.estimatedTime}min
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Adicionar serviço personalizado */}
        <Box sx={{ mt: 3, p: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Build /> Adicionar Serviço Personalizado
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Serviço"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Preço Base (R$)"
                type="number"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Descrição"
                value={newServiceDescription}
                onChange={(e) => setNewServiceDescription(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tempo Estimado (min)"
                type="number"
                value={newServiceTime}
                onChange={(e) => setNewServiceTime(e.target.value)}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">min</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Chip
                  label="Adicionar Serviço"
                  color="primary"
                  onClick={handleCustomServiceAdd}
                  sx={{ cursor: 'pointer', px: 2, py: 1 }}
                  disabled={!newServiceName.trim() || !newServiceDescription.trim() || !newServicePrice || !newServiceTime}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </FormControl>
    </Box>
  );
};

export default ServiceSelector;