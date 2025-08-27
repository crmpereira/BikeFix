import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  CalendarToday,
  Build,
  LocationOn,
  Phone,
  Schedule,
  CheckCircle,
  AttachMoney,
  Verified,
  DirectionsBike,
  PriorityHigh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import workshopService from '../services/workshopService';
import appointmentService from '../services/appointmentService';

const Appointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    description: '',
    bikeModel: '',
    bikeYear: '',
    urgency: 'normal',
  });
  const [loading, setLoading] = useState(false);
  const [workshops, setWorkshops] = useState([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);

  const steps = ['Definir Urgência', 'Escolher Oficina', 'Selecionar Serviço', 'Agendar Data', 'Serviços para sua Bike', 'Confirmar'];

  // Carregar oficinas da API
  const loadWorkshops = async () => {
    try {
      setLoadingWorkshops(true);
      const response = await workshopService.getWorkshops();
      
      if (response.success && response.data) {
        const formattedWorkshops = response.data.map(workshop => 
          workshopService.formatWorkshopForFrontend(workshop)
        );
        setWorkshops(formattedWorkshops);
      } else {
        throw new Error(response.message || 'Erro ao carregar oficinas');
      }
    } catch (error) {
      console.error('Erro ao carregar oficinas:', error);
      toast.error('Erro ao carregar oficinas');
    } finally {
      setLoadingWorkshops(false);
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    if (!user) {
      toast.error('Você precisa estar logado para agendar um serviço');
      navigate('/login');
    } else {
      loadWorkshops();
    }
  }, [user, navigate]);



  const handleNext = () => {
    if (activeStep === 1 && !selectedWorkshop) {
      toast.error('Selecione uma oficina');
      return;
    }
    if (activeStep === 2 && selectedServices.length === 0) {
      toast.error('Selecione pelo menos um serviço');
      return;
    }
    if (activeStep === 3 && (!appointmentData.date || !appointmentData.time)) {
      toast.error('Selecione data e horário');
      return;
    }
    // Step 4 (Detalhes da Bike) é opcional, não precisa de validação obrigatória
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Função para converter minutos em formato horas:minutos
  const formatDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} min`;
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
    try {
      const appointmentPayload = {
        workshopId: selectedWorkshop.id,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        serviceType: 'custom',
        requestedServices: selectedServices.map(service => ({
          name: service.name,
          price: service.basePrice,
          duration: service.estimatedTime
        })),
        bikeInfo: {
          model: appointmentData.bikeModel,
          year: appointmentData.bikeYear ? parseInt(appointmentData.bikeYear) : undefined
        },
        description: appointmentData.description,
        urgency: appointmentData.urgency
      };

      const response = await appointmentService.createAppointment(appointmentPayload);
      
      if (response.success) {
        toast.success('Agendamento realizado com sucesso! A oficina entrará em contato para confirmar.');
        navigate('/dashboard');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error(error.message || 'Erro ao realizar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Defina o nível de urgência do seu serviço
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Esta informação nos ajuda a priorizar seu atendimento e destacar as oficinas mais adequadas
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Nível de Urgência</InputLabel>
                <Select
                  value={appointmentData.urgency}
                  label="Nível de Urgência"
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, urgency: e.target.value }))}
                >
                  <MenuItem value="low">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>Baixa - Posso aguardar alguns dias</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="normal">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>Normal - Alguns dias seria ideal</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="high">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriorityHigh color="error" />
                      <Typography sx={{ color: 'error.main', fontWeight: 600 }}>Alta - Preciso urgente!</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {appointmentData.urgency === 'high' && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    🚨 Serviço marcado como URGENTE!
                  </Typography>
                  <Typography variant="body2">
                    As oficinas serão destacadas para atendimento prioritário. Você pode esperar uma resposta mais rápida.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Escolha uma oficina próxima a você
              </Typography>
              {appointmentData.urgency === 'high' && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PriorityHigh />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Serviço marcado como URGENTE - As oficinas estão destacadas para atendimento prioritário
                    </Typography>
                  </Box>
                </Alert>
              )}
            </Grid>
            {loadingWorkshops ? (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <Typography>Carregando oficinas...</Typography>
                </Box>
              </Grid>
            ) : workshops.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  Nenhuma oficina encontrada. Tente novamente mais tarde.
                </Alert>
              </Grid>
            ) : workshops.map((workshop) => (
              <Grid item xs={12} md={6} key={workshop.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedWorkshop?.id === workshop.id ? 2 : 1,
                    borderColor: selectedWorkshop?.id === workshop.id ? 'primary.main' : 
                                appointmentData.urgency === 'high' ? 'error.main' : 'divider',
                    '&:hover': { borderColor: appointmentData.urgency === 'high' ? 'error.main' : 'primary.main' },
                    backgroundColor: appointmentData.urgency === 'high' ? 'error.light' : 'background.paper',
                    boxShadow: appointmentData.urgency === 'high' ? '0 4px 20px rgba(244, 67, 54, 0.3)' : 1
                  }}
                  onClick={() => setSelectedWorkshop(workshop)}
                >
                  <CardContent>
                    {appointmentData.urgency === 'high' && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        mb: 1, 
                        p: 1, 
                        backgroundColor: 'error.main', 
                        color: 'error.contrastText',
                        borderRadius: 1
                      }}>
                        <PriorityHigh fontSize="small" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ATENDIMENTO PRIORITÁRIO PARA URGÊNCIA
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: appointmentData.urgency === 'high' ? 'error.main' : 'primary.main', mr: 2 }}>
                        <Build />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {workshop.name}
                          </Typography>
                          {workshop.verified && (
                            <Verified color="primary" fontSize="small" />
                          )}
                          {appointmentData.urgency === 'high' && (
                            <Chip 
                              icon={<PriorityHigh />} 
                              label="URGENTE" 
                              color="error" 
                              size="small" 
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={workshop.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {workshop.rating} ({workshop.reviewCount})
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

                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                      {workshop.distance}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {selectedServices.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mt: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total de Serviço Previsto:
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      R$ {selectedServices.reduce((total, service) => total + service.basePrice, 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Tempo Total Previsto:
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatDuration(selectedServices.reduce((total, service) => total + service.estimatedTime, 0))}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Selecione o serviço desejado
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Oficina selecionada: <strong>{selectedWorkshop?.name}</strong>
              </Typography>
              {!selectedWorkshop?.services || selectedWorkshop.services.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Esta oficina não possui serviços cadastrados no momento.
                </Alert>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Selecione um ou mais serviços ({selectedWorkshop.services.length} disponíveis)
                </Typography>
              )}
            </Grid>
            {selectedWorkshop?.services.map((service) => (
              <Grid item xs={12} md={6} key={service.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedServices.some(s => s.id === service.id) ? 2 : 1,
                    borderColor: selectedServices.some(s => s.id === service.id) ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => {
                    const isSelected = selectedServices.some(s => s.id === service.id);
                    if (isSelected) {
                      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
                    } else {
                      setSelectedServices([...selectedServices, service]);
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {service.name}
                      </Typography>
                      {selectedServices.some(s => s.id === service.id) && (
                        <CheckCircle sx={{ color: 'primary.main', fontSize: 20 }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body1" color="primary" sx={{ fontWeight: 600 }}>
                          R$ {service.basePrice}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {service.estimatedTime} min
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Agende a data e horário
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Serviços selecionados:
              </Typography>
              <Box sx={{ mb: 3 }}>
                {selectedServices.map((service, index) => (
                  <Chip
                    key={service.id}
                    label={`${service.name} - R$ ${service.basePrice}`}
                    sx={{ mr: 1, mb: 1 }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {selectedServices.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Nenhum serviço selecionado
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data"
                type="date"
                value={appointmentData.date}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                size={window.innerWidth < 768 ? 'small' : 'medium'}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size={window.innerWidth < 768 ? 'small' : 'medium'}>
                <InputLabel>Horário</InputLabel>
                <Select
                  value={appointmentData.time}
                  label="Horário"
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, time: e.target.value }))}
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
        );

      case 4:
        return (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Informações da sua bike
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Nos conte mais sobre sua bike para um atendimento personalizado
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size={window.innerWidth < 768 ? 'small' : 'medium'}>
                <InputLabel>Tipo de Bike</InputLabel>
                <Select
                  value={appointmentData.bikeModel}
                  label="Tipo de Bike"
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, bikeModel: e.target.value }))}
                >
                  <MenuItem value="">Selecione o tipo</MenuItem>
                  <MenuItem value="Mountain Bike">Mountain Bike</MenuItem>
                  <MenuItem value="Speed/Road Bike">Speed/Road Bike</MenuItem>
                  <MenuItem value="Híbrida">Híbrida</MenuItem>
                  <MenuItem value="BMX">BMX</MenuItem>
                  <MenuItem value="Urbana/City Bike">Urbana/City Bike</MenuItem>
                  <MenuItem value="Elétrica">Elétrica</MenuItem>
                  <MenuItem value="Dobrável">Dobrável</MenuItem>
                  <MenuItem value="Fixa/Fixed Gear">Fixa/Fixed Gear</MenuItem>
                  <MenuItem value="Cruiser">Cruiser</MenuItem>
                  <MenuItem value="Gravel">Gravel</MenuItem>
                  <MenuItem value="Infantil">Infantil</MenuItem>
                  <MenuItem value="Outro">Outro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ano da Bike"
                value={appointmentData.bikeYear}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, bikeYear: e.target.value }))}
                placeholder="Ex: 2020"
                size={window.innerWidth < 768 ? 'small' : 'medium'}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição do Problema"
                multiline
                rows={window.innerWidth < 768 ? 3 : 4}
                value={appointmentData.description}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o problema ou observações sobre o serviço..."
                size={window.innerWidth < 768 ? 'small' : 'medium'}
              />
            </Grid>
          </Grid>
        );

      case 5:
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Confirme os dados do seu agendamento
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Build />
                </ListItemIcon>
                <ListItemText
                  primary="Oficina"
                  secondary={selectedWorkshop?.name}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <DirectionsBike />
                </ListItemIcon>
                <ListItemText
                  primary="Serviços"
                  secondary={
                    <Box>
                      {selectedServices.map((service, index) => (
                        <Typography key={service.id} variant="body2" component="div">
                          {service.name} - R$ {service.basePrice} ({service.estimatedTime} min)
                        </Typography>
                      ))}
                      {selectedServices.length > 0 && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Total: R$ {selectedServices.reduce((total, service) => total + service.basePrice, 0)} 
                            ({formatDuration(selectedServices.reduce((total, service) => total + service.estimatedTime, 0))})
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CalendarToday />
                </ListItemIcon>
                <ListItemText
                  primary="Data e Horário"
                  secondary={`${new Date(appointmentData.date).toLocaleDateString('pt-BR')} às ${appointmentData.time}`}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {appointmentData.urgency === 'high' ? <PriorityHigh color="error" /> : <Schedule />}
                </ListItemIcon>
                <ListItemText
                  primary="Urgência"
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: appointmentData.urgency === 'high' ? 'error.main' : 'text.secondary',
                          fontWeight: appointmentData.urgency === 'high' ? 600 : 400
                        }}
                      >
                        {appointmentData.urgency === 'low' && 'Baixa - Posso aguardar'}
                        {appointmentData.urgency === 'normal' && 'Normal - Alguns dias'}
                        {appointmentData.urgency === 'high' && 'Alta - Preciso urgente!'}
                      </Typography>
                      {appointmentData.urgency === 'high' && (
                        <Chip label="URGENTE" color="error" size="small" sx={{ fontWeight: 600 }} />
                      )}
                    </Box>
                  }
                />
              </ListItem>
              
              {appointmentData.bikeModel && (
                <ListItem>
                  <ListItemText
                    primary="Bike"
                    secondary={`${appointmentData.bikeModel} ${appointmentData.bikeYear ? `(${appointmentData.bikeYear})` : ''}`}
                  />
                </ListItem>
              )}
              
              {appointmentData.description && (
                <ListItem>
                  <ListItemText
                    primary="Observações"
                    secondary={appointmentData.description}
                  />
                </ListItem>
              )}
            </List>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              A oficina entrará em contato para confirmar o agendamento e fornecer mais detalhes.
            </Alert>
          </Paper>
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
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 600,
        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
        textAlign: { xs: 'center', md: 'left' }
      }}>
        Novo Agendamento
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ 
        mb: 4,
        fontSize: { xs: '1rem', md: '1.25rem' },
        textAlign: { xs: 'center', md: 'left' }
      }}>
        Agende um serviço para sua bike em poucos passos
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
          orientation={window.innerWidth < 600 ? 'vertical' : 'horizontal'}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Voltar
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleConfirmAppointment}
              disabled={loading}
              startIcon={<CheckCircle />}
            >
              {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Próximo
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Appointment;