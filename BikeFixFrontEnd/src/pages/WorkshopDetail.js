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
  Divider,
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

  useEffect(() => {
    loadWorkshopDetails();
  }, [id]);

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAppointmentSubmit = () => {
    if (!user) {
      toast.error('Você precisa estar logado para agendar um serviço');
      navigate('/login');
      return;
    }

    if (!appointmentData.service || !appointmentData.date || !appointmentData.time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Simular agendamento
    toast.success('Agendamento solicitado com sucesso! A oficina entrará em contato para confirmar.');
    setAppointmentDialogOpen(false);
    setAppointmentData({ service: '', date: '', time: '', description: '' });
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
            {workshop.services.map((service) => (
              <Grid item xs={12} md={6} key={service.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {service.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {service.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body1" color="primary" sx={{ fontWeight: 600 }}>
                          {service.price}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
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
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {Object.entries(workshop.openHours).map(([day, hours]) => (
              <ListItem key={day}>
                <ListItemIcon>
                  <Schedule />
                </ListItemIcon>
                <ListItemText
                  primary={day.charAt(0).toUpperCase() + day.slice(1)}
                  secondary={hours}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {workshop.reviews.map((review) => (
            <Box key={review.id} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ mr: 2 }}>
                  <Person />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {review.user}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(review.date).toLocaleDateString('pt-BR')}
                    </Typography>
                    <Chip label={review.service} size="small" variant="outlined" />
                  </Box>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ ml: 7 }}>
                {review.comment}
              </Typography>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
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
                      {service.name} - {service.price}
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