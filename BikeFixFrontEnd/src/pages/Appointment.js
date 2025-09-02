import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Avatar,
  Chip,
  Rating,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
import {
  CalendarToday,
  Build,
  Add,
  LocationOn,
  Phone,
  Schedule,
  CheckCircle,
  AttachMoney,
  Verified,
  DirectionsBike,
  PriorityHigh,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import workshopService from '../services/workshopService';
import appointmentService from '../services/appointmentService';
import bikeService from '../services/bikeService';
import { formatAddressCompact } from '../utils/addressFormatter';

const Appointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [userBikes, setUserBikes] = useState([]);
  const [selectedBikes, setSelectedBikes] = useState([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);
  const [loadingBikes, setLoadingBikes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    urgency: 'medium',
    description: ''
  });

  const steps = [
    'Selecionar Oficina',
    'Escolher Serviços',
    'Data e Horário',
    'Selecionar Bikes',
    'Confirmação'
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const loadWorkshops = useCallback(async () => {
    try {
      setLoadingWorkshops(true);
      const response = await workshopService.getAllWorkshops();
      
      if (response.success && response.data) {
        const formattedWorkshops = response.data.map(workshop => ({
          ...workshop,
          id: workshop._id
        }));
        setWorkshops(formattedWorkshops);
      } else {
        toast.error('Erro ao carregar oficinas');
      }
    } catch (error) {
      console.error('Erro ao carregar oficinas:', error);
      toast.error('Erro ao carregar oficinas');
    } finally {
      setLoadingWorkshops(false);
    }
  }, []);

  const loadUserBikes = useCallback(async () => {
    try {
      setLoadingBikes(true);
      const response = await bikeService.getUserBikes();
      setUserBikes(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar bikes:', error);
      toast.error('Erro ao carregar suas bikes');
    } finally {
      setLoadingBikes(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    } else {
      loadWorkshops();
      loadUserBikes();
    }
  }, [user, navigate, loadWorkshops, loadUserBikes]);

  const handleNext = () => {
    // Validações específicas para cada step
    if (userBikes.length === 0) {
      toast.error('Você precisa cadastrar pelo menos uma bike antes de agendar um serviço.');
      navigate('/my-bikes');
      return;
    }

    if (activeStep === 0 && !selectedWorkshop) {
      toast.error('Selecione uma oficina');
      return;
    }
    if (activeStep === 1 && selectedServices.length === 0) {
      toast.error('Selecione pelo menos um serviço');
      return;
    }
    if (activeStep === 2 && (!appointmentData.date || !appointmentData.time)) {
      toast.error('Selecione data e horário');
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const formatDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleConfirmAppointment = async () => {
    setLoading(true);
    if (userBikes.length === 0) {
      toast.error('Você precisa cadastrar pelo menos uma bike antes de agendar um serviço.');
      navigate('/my-bikes');
      setLoading(false);
      return;
    }

    try {
      const appointmentPayload = {
        workshopId: selectedWorkshop._id,
        date: appointmentData.date,
        time: appointmentData.time,
        urgency: appointmentData.urgency,
        requestedServices: selectedServices.map(service => ({
          name: service.name,
          price: service.price,
          estimatedTime: service.estimatedTime
        })),
        bikeInfo: {
          brand: selectedBikes[0]?.brand || '',
          model: selectedBikes[0]?.model || '',
          year: selectedBikes[0]?.year || '',
          type: selectedBikes[0]?.type || ''
        },
        description: appointmentData.description
      };

      const response = await appointmentService.createAppointment(appointmentPayload);
      
      if (response.success) {
        toast.success('Agendamento realizado com sucesso!');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Erro ao realizar agendamento');
      }
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      toast.error('Erro ao confirmar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Paper sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              color: 'white',
              borderRadius: 3
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                🔧 Escolha a Oficina Ideal
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Selecione a oficina que melhor atende suas necessidades
              </Typography>
            </Paper>

            {appointmentData.urgency === 'high' && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 3,
                  '& .MuiAlert-icon': {
                    color: '#ff9800'
                  }
                }}
              >
                ⚡ Agendamento URGENTE - Priorizando oficinas com disponibilidade imediata
              </Alert>
            )}

            {loadingWorkshops ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : workshops.length === 0 ? (
              <Alert severity="info">
                Nenhuma oficina encontrada. Tente novamente mais tarde.
              </Alert>
            ) : workshops.map((workshop) => (
              <Card 
                key={workshop.id} 
                sx={{
                  mb: 2,
                  cursor: 'pointer',
                  border: selectedWorkshop?.id === workshop.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    borderColor: '#1976d2'
                  }
                }}
                onClick={() => setSelectedWorkshop(workshop)}
              >
                <CardContent sx={{ p: 3 }}>
                  {appointmentData.urgency === 'high' && (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      p: 1,
                      bgcolor: '#fff3e0',
                      borderRadius: 2,
                      border: '1px solid #ffb74d'
                    }}>
                      <PriorityHigh sx={{ color: '#ff9800', mr: 1 }} />
                      <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 600 }}>
                        Disponível para atendimento urgente
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: selectedWorkshop?.id === workshop.id ? '#1976d2' : '#f5f5f5',
                        color: selectedWorkshop?.id === workshop.id ? 'white' : '#666',
                        mr: 2,
                        width: 50,
                        height: 50
                      }}
                    >
                      <Build />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {workshop.name}
                        </Typography>
                        {workshop.verified && (
                          <Verified sx={{ color: '#4caf50', fontSize: 20 }} />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatAddressCompact(workshop.address)}
                          </Typography>
                        </Box>
                        {workshop.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" color="text.secondary">
                              {workshop.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    {selectedWorkshop?.id === workshop.id && (
                      <CheckCircle sx={{ color: '#4caf50', fontSize: 28 }} />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={workshop.rating || 0} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        ({workshop.reviewCount || 0} avaliações)
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#1976d2',
                        fontWeight: 600,
                        bgcolor: '#e3f2fd',
                        px: 2,
                        py: 0.5,
                        borderRadius: 2
                      }}
                    >
                      {workshop.services?.length || 0} serviços
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Paper sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              color: 'white',
              borderRadius: 3
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                🛠️ Selecione os Serviços
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Escolha os serviços que sua bike precisa
              </Typography>
            </Paper>

            {appointmentData.urgency === 'high' && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 3,
                  '& .MuiAlert-icon': {
                    color: '#ff9800'
                  }
                }}
              >
                ⚡ Serviços com prioridade URGENTE serão executados primeiro
              </Alert>
            )}

            {!selectedWorkshop?.services || selectedWorkshop.services.length === 0 ? (
              <Alert 
                severity="info" 
                sx={{ 
                  textAlign: 'center',
                  py: 3
                }}
              >
                Esta oficina ainda não cadastrou seus serviços.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {selectedWorkshop?.services.map((service) => {
                  const isSelected = selectedServices.some(s => s.name === service.name);
                  return (
                    <Grid item xs={12} md={6} key={service.name}>
                      <Card 
                        sx={{
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            borderColor: '#1976d2'
                          }
                        }}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedServices(prev => prev.filter(s => s.name !== service.name));
                          } else {
                            setSelectedServices(prev => [...prev, service]);
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {service.name}
                            </Typography>
                            {isSelected && (
                              <Box sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                borderRadius: '50%',
                                width: 24,
                                height: 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <CheckCircle sx={{ fontSize: 16 }} />
                              </Box>
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AttachMoney sx={{ color: '#4caf50', fontSize: 20 }} />
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: '#4caf50',
                                  fontWeight: 700
                                }}
                              >
                                R$ {service.price}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Schedule sx={{ color: '#666', fontSize: 20 }} />
                              <Typography variant="body2" color="text.secondary">
                                {service.estimatedTime} min
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {selectedServices.length > 0 && (
              <Paper sx={{
                mt: 3,
                p: 3,
                bgcolor: '#f8f9fa',
                borderRadius: 3,
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                  📋 Resumo dos Serviços Selecionados
                </Typography>
                <Grid container spacing={2}>
                  {selectedServices.map((service, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        border: '1px solid #e0e0e0'
                      }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          {service.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            R$ {service.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.estimatedTime} min
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                {selectedServices.length > 0 && (
                  <Box sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: '#e3f2fd',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                      Total: R$ {selectedServices.reduce((sum, service) => sum + parseFloat(service.price), 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 600 }}>
                      Tempo estimado: {formatDuration(selectedServices.reduce((sum, service) => sum + service.estimatedTime, 0))}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Paper sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              color: 'white',
              borderRadius: 3
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                📅 Data e Horário
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Escolha quando você quer levar sua bike
              </Typography>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data"
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0]
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1976d2'
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Horários Disponíveis
                  </Typography>
                </Box>
                <FormControl fullWidth>
                  <InputLabel>Selecione o horário</InputLabel>
                  <Select
                    value={appointmentData.time}
                    label="Selecione o horário"
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, time: e.target.value }))}
                    sx={{
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2'
                      }
                    }}
                  >
                    {timeSlots.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Paper sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              color: 'white',
              borderRadius: 3
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                🚴‍♂️ Selecionar Bikes
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Escolha qual(is) bike(s) precisam do serviço
              </Typography>
            </Paper>

            {loadingBikes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : userBikes.length === 0 ? (
              <Paper sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: '#f8f9fa',
                borderRadius: 3,
                border: '2px dashed #dee2e6'
              }}>
                <Box sx={{ mb: 3 }}>
                  <DirectionsBike sx={{ fontSize: 60, color: '#6c757d', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#495057', mb: 1 }}>
                    Nenhuma Bike Cadastrada
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Você precisa cadastrar pelo menos uma bike antes de agendar um serviço.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/my-bikes')}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Cadastrar Primeira Bike
                  </Button>
                </Box>
              </Paper>
            ) : (
              <>
                <Paper sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: '#e8f5e8',
                  borderRadius: 3,
                  border: '1px solid #c8e6c9'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsBike sx={{ color: '#4caf50' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      {userBikes.length} bike{userBikes.length > 1 ? 's' : ''} cadastrada{userBikes.length > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Paper>

                <Grid container spacing={2}>
                  {userBikes.map((bike) => {
                    const isSelected = selectedBikes.some(b => b._id === bike._id);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={bike._id}>
                        <Card 
                          sx={{
                            cursor: 'pointer',
                            border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                              borderColor: '#1976d2'
                            }
                          }}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedBikes(prev => prev.filter(b => b._id !== bike._id));
                            } else {
                              setSelectedBikes(prev => [...prev, bike]);
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                              <DirectionsBike sx={{ 
                                fontSize: 40, 
                                color: isSelected ? '#1976d2' : '#666' 
                              }} />
                              {isSelected && (
                                <Box sx={{
                                  bgcolor: '#4caf50',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: 28,
                                  height: 28,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <CheckCircle sx={{ fontSize: 18 }} />
                                </Box>
                              )}
                            </Box>
                            
                            <Typography variant="h6" sx={{
                              fontWeight: 600,
                              mb: 2,
                              color: isSelected ? '#1976d2' : 'inherit'
                            }}>
                              {bike.brand} {bike.model}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                bgcolor: '#f5f5f5',
                                borderRadius: 2
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                                  Ano:
                                </Typography>
                                <Typography variant="body2">{bike.year}</Typography>
                              </Box>
                              
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                bgcolor: '#e3f2fd',
                                borderRadius: 2
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                  Tipo:
                                </Typography>
                                <Typography variant="body2">
                                  {bike.type === 'road' ? 'Speed/Estrada' :
                                   bike.type === 'mountain' ? 'Mountain Bike' :
                                   bike.type === 'hybrid' ? 'Híbrida' :
                                   bike.type === 'electric' ? 'Elétrica' : bike.type}
                                </Typography>
                              </Box>
                              
                              {bike.totalKm > 0 && (
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  p: 1,
                                  bgcolor: '#fff3e0',
                                  borderRadius: 2
                                }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#f57c00' }}>
                                    KM:
                                  </Typography>
                                  <Typography variant="body2">{bike.totalKm.toLocaleString()} km</Typography>
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {selectedBikes.length > 0 && (
                  <Paper sx={{
                    mt: 3,
                    p: 3,
                    bgcolor: '#f8f9fa',
                    borderRadius: 3,
                    border: '1px solid #e9ecef'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                      🚴‍♂️ Bikes Selecionadas
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedBikes.map((bike) => (
                        <Chip
                          key={bike._id}
                          label={`${bike.brand} ${bike.model}`}
                          onDelete={() => {
                            setSelectedBikes(prev => prev.filter(b => b._id !== bike._id));
                          }}
                          sx={{
                            bgcolor: '#e3f2fd',
                            color: '#1976d2',
                            fontWeight: 600,
                            '& .MuiChip-deleteIcon': {
                              color: '#1976d2',
                              '&:hover': {
                                color: '#d32f2f'
                              }
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                )}

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Descreva o problema ou observações (opcional)"
                    value={appointmentData.description}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ex: Freio fazendo barulho, corrente pulando, etc..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#1976d2'
                        }
                      }
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Paper sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
              color: 'white',
              borderRadius: 3
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                ✅ Confirmação do Agendamento
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Revise todos os detalhes antes de confirmar
              </Typography>
            </Paper>

            <Grid container spacing={3}>
              {/* Oficina Selecionada */}
              <Grid item xs={12} md={6}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Build sx={{ color: '#1976d2', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      Oficina Selecionada
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedWorkshop?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    📍 {formatAddressCompact(selectedWorkshop?.address)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📞 {selectedWorkshop?.phone}
                  </Typography>
                </Paper>
              </Grid>

              {/* Data e Horário */}
              <Grid item xs={12} md={6}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday sx={{ color: '#1976d2', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      Data e Horário
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    📅 {new Date(appointmentData.date).toLocaleDateString('pt-BR')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    🕐 {appointmentData.time}
                  </Typography>
                </Paper>
              </Grid>

              {/* Serviços Selecionados */}
              <Grid item xs={12}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e0e0e0'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Build sx={{ color: '#1976d2', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      Serviços Selecionados
                    </Typography>
                  </Box>
                  {selectedServices.map((service, index) => (
                    <Box key={index} sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < selectedServices.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <Typography variant="body1">{service.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {service.estimatedTime} min
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#4caf50' }}>
                          R$ {service.price}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  {selectedServices.length > 0 && (
                    <Box sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: '2px solid #e0e0e0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Total
                      </Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                          R$ {selectedServices.reduce((sum, service) => sum + parseFloat(service.price), 0).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tempo estimado: {formatDuration(selectedServices.reduce((sum, service) => sum + service.estimatedTime, 0))}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Nível de Urgência */}
              <Grid item xs={12} md={6}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PriorityHigh sx={{ color: '#1976d2', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      Nível de Urgência
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {appointmentData.urgency === 'high' && (
                      <Chip label="URGENTE" color="error" sx={{ fontWeight: 600 }} />
                    )}
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {appointmentData.urgency === 'high' ? 'Alta' : 
                       appointmentData.urgency === 'medium' ? 'Média' : 'Baixa'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Bikes Selecionadas */}
              {selectedBikes.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DirectionsBike sx={{ color: '#1976d2', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        Bikes Selecionadas
                      </Typography>
                    </Box>
                    {selectedBikes.map((bike, index) => (
                      <Box key={bike._id} sx={{
                        py: 1,
                        borderBottom: index < selectedBikes.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {bike.brand} {bike.model}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {bike.year} • {bike.type === 'road' ? 'Speed/Estrada' :
                                        bike.type === 'mountain' ? 'Mountain Bike' :
                                        bike.type === 'hybrid' ? 'Híbrida' :
                                        bike.type === 'electric' ? 'Elétrica' : bike.type}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}

              {/* Observações */}
              {appointmentData.description && (
                <Grid item xs={12}>
                  <Paper sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid #e0e0e0'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        📝 Observações
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{
                      bgcolor: '#f8f9fa',
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid #e9ecef'
                    }}>
                      {appointmentData.description}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>

            {/* Alerta Final */}
            <Paper sx={{
              mt: 3,
              p: 3,
              bgcolor: '#e8f5e8',
              borderRadius: 3,
              border: '1px solid #c8e6c9'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  Próximos Passos
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: 'success.dark', lineHeight: 1.6 }}>
                📞 A oficina entrará em contato para confirmar o agendamento e fornecer mais detalhes sobre o atendimento.
                <br />
                📧 Você também receberá um e-mail de confirmação com todos os dados do agendamento.
              </Typography>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper sx={{ 
        p: { xs: 2, md: 4 },
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        mb: 4
      }}>
        {/* Cabeçalho Moderno */}
        <Box sx={{
          background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
          borderRadius: 3,
          p: 3,
          mb: 4,
          color: 'white',
          textAlign: 'center'
        }}>
          <CalendarToday sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            Agendar Serviço
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Encontre a oficina ideal e agende o melhor horário para sua bike
          </Typography>
        </Box>

        {/* Stepper Responsivo */}
        <Stepper 
          activeStep={activeStep} 
          orientation={window.innerWidth < 768 ? 'vertical' : 'horizontal'}
          sx={{
            mb: 4,
            '& .MuiStepLabel-root': {
              cursor: 'pointer'
            },
            '& .MuiStepIcon-root': {
              fontSize: '1.5rem'
            }
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    fontWeight: activeStep === index ? 600 : 400
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Conteúdo do Step */}
        <Paper sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          bgcolor: '#fafafa',
          border: '1px solid #e0e0e0',
          mb: 4
        }}>
          {renderStepContent(activeStep)}
        </Paper>

        {/* Botões de Navegação Modernos */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              border: '2px solid #e0e0e0',
              color: activeStep === 0 ? '#ccc' : '#666',
              '&:hover': {
                borderColor: activeStep === 0 ? '#e0e0e0' : '#1976d2',
                bgcolor: activeStep === 0 ? 'transparent' : '#f5f5f5'
              },
              '&:disabled': {
                borderColor: '#e0e0e0',
                color: '#ccc'
              }
            }}
          >
            Voltar
          </Button>

          {/* Indicador de Progresso */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {activeStep + 1} de {steps.length}
            </Typography>
            <Box sx={{
              width: 100,
              height: 4,
              bgcolor: '#e0e0e0',
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <Box sx={{
                width: `${((activeStep + 1) / steps.length) * 100}%`,
                height: '100%',
                bgcolor: '#1976d2',
                transition: 'width 0.3s ease'
              }} />
            </Box>
          </Box>

          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleConfirmAppointment}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #43a047 0%, #5cb85c 100%)',
                    boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    background: '#ccc',
                    boxShadow: 'none'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Próximo
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Appointment;