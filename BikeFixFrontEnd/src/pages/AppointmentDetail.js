import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CalendarToday,
  Build,
  DirectionsBike,
  Person,
  Phone,
  Email,
  LocationOn,
  AttachMoney,
  Schedule,
  Assignment,
  ArrowBack,
  Edit,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import appointmentService from '../services/appointmentService';
import PaymentFlow from '../components/Payment/PaymentFlow';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointmentById(id);
      setAppointment(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamento:', error);
      setError('Erro ao carregar detalhes do agendamento');
      toast.error('Erro ao carregar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'budget_pending': return 'warning';
      case 'budget_sent': return 'info';
      case 'budget_approved': return 'success';
      case 'budget_rejected': return 'error';
      case 'payment_pending': return 'warning';
      case 'paid': return 'success';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Aguardando Confirmação';
      case 'confirmed': return 'Confirmado';
      case 'budget_pending': return 'Orçamento Pendente';
      case 'budget_sent': return 'Orçamento Enviado';
      case 'budget_approved': return 'Orçamento Aprovado';
      case 'budget_rejected': return 'Orçamento Rejeitado';
      case 'payment_pending': return 'Pagamento Pendente';
      case 'paid': return 'Pago';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const handleAppointmentUpdate = () => {
    loadAppointment();
  };

  const canManagePayment = () => {
    if (!user || !appointment) return false;
    
    // Ciclista pode gerenciar pagamento se for o dono do agendamento
    if (user.userType === 'cyclist' && appointment.cyclist?._id === user.id) {
      return true;
    }
    
    // Oficina pode gerenciar orçamento se for a oficina do agendamento
    if (user.userType === 'workshop' && appointment.workshop?._id === user.id) {
      return true;
    }
    
    return false;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Carregando detalhes...</Typography>
      </Container>
    );
  }

  if (error || !appointment) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Agendamento não encontrado'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Agendamento #{appointment._id?.slice(-6)}
          </Typography>
          
          <Chip
            label={getStatusLabel(appointment.status)}
            color={getStatusColor(appointment.status)}
            size="large"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Informações Básicas */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ mr: 1 }} />
                Informações do Agendamento
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Data e Horário</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')} às {appointment.appointmentTime}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Build sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Tipo de Serviço</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {appointment.serviceType}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {appointment.requestedServices && appointment.requestedServices.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Serviços Solicitados</Typography>
                    <List dense>
                      {appointment.requestedServices.map((service, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Build fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={service.name}
                            secondary={`R$ ${service.price}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
                
                {appointment.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Descrição</Typography>
                    <Typography variant="body1">{appointment.description}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Informações da Bike */}
          {appointment.bikeInfo && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <DirectionsBike sx={{ mr: 1 }} />
                  Informações da Bicicleta
                </Typography>
                
                <Grid container spacing={2}>
                  {appointment.bikeInfo.model && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Modelo</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {appointment.bikeInfo.model}
                      </Typography>
                    </Grid>
                  )}
                  
                  {appointment.bikeInfo.brand && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Marca</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {appointment.bikeInfo.brand}
                      </Typography>
                    </Grid>
                  )}
                  
                  {appointment.bikeInfo.type && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Tipo</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {appointment.bikeInfo.type}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar com informações de contato e valores */}
        <Grid item xs={12} md={4}>
          {/* Informações do Cliente */}
          {appointment.cyclist && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} />
                  Cliente
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2 }}>
                    {appointment.cyclist.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {appointment.cyclist.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.cyclist.email}
                    </Typography>
                  </Box>
                </Box>
                
                {appointment.cyclist.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2">{appointment.cyclist.phone}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informações da Oficina */}
          {appointment.workshop && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Build sx={{ mr: 1 }} />
                  Oficina
                </Typography>
                
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  {appointment.workshop.name || appointment.workshop.businessName}
                </Typography>
                
                {appointment.workshop.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2">{appointment.workshop.email}</Typography>
                  </Box>
                )}
                
                {appointment.workshop.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2">{appointment.workshop.phone}</Typography>
                  </Box>
                )}
                
                {appointment.workshop.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2">
                  {appointment.workshop.address && typeof appointment.workshop.address === 'object'
                    ? `${appointment.workshop.address.street}, ${appointment.workshop.address.city} - ${appointment.workshop.address.state}`
                    : appointment.workshop.address}
                </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informações de Valores */}
          {appointment.pricing && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney sx={{ mr: 1 }} />
                  Valores
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Valor Base:</Typography>
                    <Typography variant="body2">R$ {appointment.pricing.basePrice?.toFixed(2) || '0.00'}</Typography>
                  </Box>
                  
                  {appointment.pricing.additionalPrice > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Adicional:</Typography>
                      <Typography variant="body2">R$ {appointment.pricing.additionalPrice.toFixed(2)}</Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Total:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      R$ {appointment.pricing.totalPrice?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  
                  {appointment.pricing.platformFee > 0 && (
                    <>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Detalhamento:</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Taxa da plataforma:</Typography>
                        <Typography variant="caption" color="text.secondary">R$ {appointment.pricing.platformFee.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Valor da oficina:</Typography>
                        <Typography variant="caption" color="text.secondary">R$ {appointment.pricing.workshopAmount?.toFixed(2) || '0.00'}</Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Fluxo de Pagamento */}
        {canManagePayment() && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Gerenciamento de Pagamento
                </Typography>
                <PaymentFlow
                  appointmentId={appointment._id}
                  onUpdate={handleAppointmentUpdate}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default AppointmentDetail;