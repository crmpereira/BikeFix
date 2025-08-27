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

const WorkshopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    service: '',
    date: '',
    time: '',
    description: '',
  });

  // Dados mockados para demonstração
  const mockWorkshop = {
    id: 1,
    name: 'Bike Center',
    description: 'Oficina especializada em manutenção e reparo de bikes com mais de 15 anos de experiência. Oferecemos serviços completos para todos os tipos de bikes.',
    address: 'Rua das Flores, 123 - Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    phone: '(11) 1234-5678',
    email: 'contato@bikecenter.com.br',
    whatsapp: '(11) 91234-5678',
    rating: 4.8,
    reviewCount: 156,
    verified: true,
    openHours: {
      monday: '08:00 - 18:00',
      tuesday: '08:00 - 18:00',
      wednesday: '08:00 - 18:00',
      thursday: '08:00 - 18:00',
      friday: '08:00 - 18:00',
      saturday: '08:00 - 14:00',
      sunday: 'Fechado',
    },
    services: [
      {
        id: 1,
        name: 'Manutenção Preventiva',
        description: 'Revisão completa da bike incluindo ajustes e lubrificação',
        price: 'R$ 80,00',
        duration: '2 horas',
      },
      {
        id: 2,
        name: 'Troca de Pneus',
        description: 'Substituição de pneus e câmaras de ar',
        price: 'R$ 45,00',
        duration: '30 min',
      },
      {
        id: 3,
        name: 'Ajuste de Freios',
        description: 'Regulagem e manutenção do sistema de freios',
        price: 'R$ 35,00',
        duration: '45 min',
      },
      {
        id: 4,
        name: 'Ajuste de Câmbio',
        description: 'Regulagem do sistema de transmissão',
        price: 'R$ 40,00',
        duration: '1 hora',
      },
    ],
    reviews: [
      {
        id: 1,
        user: 'João Silva',
        rating: 5,
        comment: 'Excelente atendimento! Minha bike ficou como nova.',
        date: '2024-01-10',
        service: 'Manutenção Preventiva',
      },
      {
        id: 2,
        user: 'Maria Santos',
        rating: 4,
        comment: 'Bom serviço, preço justo. Recomendo!',
        date: '2024-01-08',
        service: 'Troca de Pneus',
      },
      {
        id: 3,
        user: 'Pedro Costa',
        rating: 5,
        comment: 'Profissionais muito competentes. Voltarei sempre.',
        date: '2024-01-05',
        service: 'Ajuste de Freios',
      },
    ],
    photos: [],
  };

  useEffect(() => {
    // Simular carregamento dos dados
    setTimeout(() => {
      setWorkshop(mockWorkshop);
      setLoading(false);
    }, 1000);
  }, [id]);

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
        <Typography>Carregando...</Typography>
      </Container>
    );
  }

  if (!workshop) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Oficina não encontrada</Typography>
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
                    {workshop.rating} ({workshop.reviewCount} avaliações)
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
              <TextField
                select
                fullWidth
                label="Serviço *"
                value={appointmentData.service}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, service: e.target.value }))}
                margin="normal"
                SelectProps={{ native: true }}
              >
                <option value="">Selecione um serviço</option>
                {workshop.services.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name} - {service.price}
                  </option>
                ))}
              </TextField>
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