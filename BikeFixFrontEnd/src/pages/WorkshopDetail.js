import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Rating,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  Build,
  LocationOn,
  Phone,
  Schedule,
  Star,
  Verified,
  AccessTime,
  AttachMoney,
  DirectionsBike,
  CalendarToday,
  Person,
  Email,
  WhatsApp,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import workshopService from '../services/workshopService';
import appointmentService from '../services/appointmentService';

const WorkshopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    service: '',
    date: '',
    time: '',
    description: '',
  });
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    loadWorkshopDetails();
  }, [id]);

  useEffect(() => {
    loadOccupiedSlots();
  }, [workshop, scheduleDate]);

  const loadWorkshopDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await workshopService.getWorkshopById(id);
      
      if (response.success && response.data) {
        const formattedWorkshop = workshopService.formatWorkshopForFrontend(response.data);
        setWorkshop(formattedWorkshop);
      } else {
        throw new Error('Oficina não encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da oficina:', error);
      setError(error.message || 'Erro ao carregar oficina');
      toast.error('Erro ao carregar detalhes da oficina');
    } finally {
      setLoading(false);
    }
  };

  const loadOccupiedSlots = async () => {
    if (!workshop || !scheduleDate) return;
    
    setLoadingSchedule(true);
    try {
      const result = await appointmentService.getAvailableSlots(workshop._id, scheduleDate);
      if (result.success) {
        setOccupiedSlots(result.data.occupiedSlots || []);
      }
    } catch (error) {
      console.error('Erro ao carregar horários ocupados:', error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAppointmentSubmit = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para agendar um serviço');
      navigate('/login');
      return;
    }

    if (!appointmentData.service || !appointmentData.date || !appointmentData.time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      
      // Encontrar o serviço selecionado
      const selectedService = workshop.services.find(s => s.name === appointmentData.service);
      
      const appointmentPayload = {
        workshopId: workshop.id,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        serviceType: 'specific',
        requestedServices: [{
          name: selectedService.name,
          description: selectedService.description || '',
          price: parseFloat(selectedService.basePrice || selectedService.price || 0),
          estimatedTime: 60 // tempo padrão em minutos
        }],
        description: appointmentData.description || '',
        urgency: 'medium',
        bikeInfo: [],
        bikeIds: []
      };
      
      console.log('Enviando agendamento:', appointmentPayload);
      
      const result = await appointmentService.createAppointment(appointmentPayload);
      
      if (result.success) {
        toast.success('Agendamento criado com sucesso! A oficina entrará em contato para confirmar.');
        setAppointmentDialogOpen(false);
        setAppointmentData({ service: '', date: '', time: '', description: '' });
      } else {
        toast.error(result.message || 'Erro ao criar agendamento');
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const TabPanel = ({ children, value, index }) => {
    return (
      <div hidden={value !== index}>
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
      </div>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={loadWorkshopDetails} sx={{ ml: 2 }}>
            Tentar Novamente
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!workshop) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Oficina não encontrada
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header da Oficina */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 60, height: 60 }}>
                <Build sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {workshop.name}
                  </Typography>
                  {workshop.verified && (
                    <Verified color="primary" />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Rating value={workshop.rating} readOnly />
                  <Typography variant="body1" color="text.secondary">
                    {workshop.rating} ({workshop.ratingCount} avaliações)
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {workshop.description}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {workshop.address}, {workshop.city} - {workshop.state}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {workshop.phone}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Segunda a Sexta: 08:00 - 17:30
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<CalendarToday />}
                onClick={() => setAppointmentDialogOpen(true)}
                sx={{ mb: 2 }}
              >
                Agendar Serviço
              </Button>
              
              {workshop.whatsapp && (
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<WhatsApp />}
                  href={`https://wa.me/${workshop.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  sx={{ mb: 1 }}
                >
                  WhatsApp
                </Button>
              )}
              
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<Email />}
                href={`mailto:${workshop.email}`}
              >
                Email
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Serviços" />
          <Tab label="Horários" />
          <Tab label="Avaliações" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            {workshop.services && workshop.services.length > 0 ? (
              workshop.services.map((service) => (
                <Grid item xs={12} md={6} key={service.id || service.name}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {service.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {service.description || 'Descrição não disponível'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body1" color="primary" sx={{ fontWeight: 600 }}>
                            {service.price || service.basePrice || 'Consultar'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {service.duration || 'A consultar'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Nenhum serviço disponível
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Horários de Agendamento
            </Typography>
            <TextField
              type="date"
              label="Data"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Box>
          
          {loadingSchedule ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Horário</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
                    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
                    '16:00', '16:30', '17:00', '17:30'
                  ].map((time) => {
                    const isOccupied = occupiedSlots.includes(time);
                    return (
                      <TableRow
                        key={time}
                        sx={{
                          backgroundColor: isOccupied ? '#ffebee' : '#e8f5e8',
                          '&:hover': {
                            backgroundColor: isOccupied ? '#ffcdd2' : '#c8e6c9'
                          }
                        }}
                      >
                        <TableCell>{time}</TableCell>
                        <TableCell>
                          <Chip
                            label={isOccupied ? 'Ocupado' : 'Disponível'}
                            color={isOccupied ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          

        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {workshop.reviews && workshop.reviews.length > 0 ? (
            workshop.reviews.map((review, index) => (
              <Box key={review.id || index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {review.user || 'Usuário anônimo'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={review.rating || 0} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {review.date ? new Date(review.date).toLocaleDateString('pt-BR') : 'Data não informada'}
                      </Typography>
                      {review.service && (
                        <Chip label={review.service} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ ml: 7 }}>
                  {review.comment || 'Sem comentários'}
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Ainda não há avaliações para esta oficina
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Dialog de Agendamento */}
      <Dialog
        open={appointmentDialogOpen}
        onClose={() => setAppointmentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
          Agendar Serviço - {workshop.name}
        </DialogTitle>
        
        <DialogContent>
          {!user && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Você precisa estar logado para agendar um serviço.
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Serviço *</InputLabel>
                <Select
                  value={appointmentData.service}
                  label="Serviço *"
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, service: e.target.value }))}
                >
                  {workshop.services && workshop.services.map((service) => (
                    <MenuItem key={service.id} value={service.name}>
                      {service.name} - {service.basePrice || service.price}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data *"
                type="date"
                value={appointmentData.date}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Horário *"
                type="time"
                value={appointmentData.time}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, time: e.target.value }))}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={appointmentData.description}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, description: e.target.value }))}
                margin="normal"
                placeholder="Descreva o problema ou observações sobre o serviço..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setAppointmentDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAppointmentSubmit}
            variant="contained"
            disabled={!user}
          >
            Solicitar Agendamento
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkshopDetail;