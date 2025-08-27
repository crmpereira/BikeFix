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
  Divider,
} from '@mui/material';
import {
  Search,
  CalendarToday,
  Build,
  CheckCircle,
  LocationOn,
  Phone,
  Schedule,
  AttachMoney,
  DirectionsBike,
  Verified,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Appointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    description: '',
    bikeModel: '',
    bikeYear: '',
    urgency: 'normal',
  });
  const [loading, setLoading] = useState(false);

  const steps = ['Escolher Oficina', 'Selecionar Serviço', 'Agendar Data', 'Confirmar'];

  // Dados mockados
  const mockWorkshops = [
    {
      id: 1,
      name: 'Bike Center',
      address: 'Rua das Flores, 123 - Centro',
      phone: '(11) 1234-5678',
      rating: 4.8,
      reviewCount: 156,
      verified: true,
      distance: '2.3 km',
      services: [
        { id: 1, name: 'Manutenção Preventiva', price: 'R$ 80,00', duration: '2 horas' },
        { id: 2, name: 'Troca de Pneus', price: 'R$ 45,00', duration: '30 min' },
        { id: 3, name: 'Ajuste de Freios', price: 'R$ 35,00', duration: '45 min' },
        { id: 4, name: 'Ajuste de Câmbio', price: 'R$ 40,00', duration: '1 hora' },
      ],
    },
    {
      id: 2,
      name: 'Speed Bikes',
      address: 'Av. Paulista, 456 - Bela Vista',
      phone: '(11) 9876-5432',
      rating: 4.5,
      reviewCount: 89,
      verified: true,
      distance: '4.1 km',
      services: [
        { id: 1, name: 'Manutenção Completa', price: 'R$ 120,00', duration: '3 horas' },
        { id: 2, name: 'Upgrade de Componentes', price: 'R$ 200,00', duration: '4 horas' },
        { id: 3, name: 'Limpeza Profunda', price: 'R$ 60,00', duration: '1 hora' },
      ],
    },
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    if (!user) {
      toast.error('Você precisa estar logado para agendar um serviço');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (activeStep === 0 && !selectedWorkshop) {
      toast.error('Selecione uma oficina');
      return;
    }
    if (activeStep === 1 && !selectedService) {
      toast.error('Selecione um serviço');
      return;
    }
    if (activeStep === 2 && (!appointmentData.date || !appointmentData.time)) {
      toast.error('Selecione data e horário');
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleConfirmAppointment = async () => {
    setLoading(true);
    try {
      // Simular envio do agendamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Agendamento realizado com sucesso! A oficina entrará em contato para confirmar.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao realizar agendamento. Tente novamente.');
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
                Escolha uma oficina próxima a você
              </Typography>
            </Grid>
            {mockWorkshops.map((workshop) => (
              <Grid item xs={12} md={6} key={workshop.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedWorkshop?.id === workshop.id ? 2 : 1,
                    borderColor: selectedWorkshop?.id === workshop.id ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setSelectedWorkshop(workshop)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
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
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Selecione o serviço desejado
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Oficina selecionada: <strong>{selectedWorkshop?.name}</strong>
              </Typography>
            </Grid>
            {selectedWorkshop?.services.map((service) => (
              <Grid item xs={12} md={6} key={service.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedService?.id === service.id ? 2 : 1,
                    borderColor: selectedService?.id === service.id ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {service.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body1" color="primary" sx={{ fontWeight: 600 }}>
                          {service.price}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {service.duration}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Escolha data e horário
              </Typography>
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
              <FormControl fullWidth size={window.innerWidth < 768 ? 'small' : 'medium'}>
                <InputLabel>Urgência</InputLabel>
                <Select
                  value={appointmentData.urgency}
                  label="Urgência"
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, urgency: e.target.value }))}
                >
                  <MenuItem value="low">Baixa - Posso aguardar</MenuItem>
                  <MenuItem value="normal">Normal - Alguns dias</MenuItem>
                  <MenuItem value="high">Alta - Preciso urgente</MenuItem>
                </Select>
              </FormControl>
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

      case 3:
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
                  primary="Serviço"
                  secondary={`${selectedService?.name} - ${selectedService?.price}`}
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