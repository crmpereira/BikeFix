import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Rating,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Build,
  Schedule,
  Verified,
  Notifications,
  Search,
  Add,
  CheckCircle,
  Pending,
  Cancel,
  History,
  Delete,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import workshopService from '../services/workshopService';
import appointmentService from '../services/appointmentService';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [nearbyWorkshops, setNearbyWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workshopsLoading, setWorkshopsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [notifications, setNotifications] = useState([]);

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Carregar dados quando usuário estiver autenticado
  useEffect(() => {
    // Só carregar dados se o usuário estiver autenticado e não estiver carregando
    if (user && !authLoading && isAuthenticated) {
      loadDashboardData();
      loadUserAppointments();
    }
  }, [user, authLoading, isAuthenticated]);

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Se não estiver autenticado, não renderizar nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar oficinas próximas
      await loadNearbyWorkshops();
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
      setLoading(false);
    }
  };

  const loadUserAppointments = async () => {
    try {
      const response = await appointmentService.getUserAppointments();
      // Pegar apenas os 5 agendamentos mais recentes
      const recent = (response.data || []).slice(0, 5);
      setRecentAppointments(recent);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      // Não mostrar erro para agendamentos, apenas log
    }
  };

  // Filtrar agendamentos por status
  const filteredAppointments = statusFilter === 'all' 
    ? recentAppointments 
    : recentAppointments.filter(appointment => appointment.status === statusFilter);

  const loadNearbyWorkshops = async () => {
    try {
      setWorkshopsLoading(true);
      
      // Tentar obter localização do usuário
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await workshopService.getNearbyWorkshops(latitude, longitude, 10);
              
              if (response.success && response.data) {
                const formattedWorkshops = response.data.map(workshop => 
                  workshopService.formatWorkshopForFrontend(workshop)
                ).slice(0, 3); // Mostrar apenas as 3 primeiras
                setNearbyWorkshops(formattedWorkshops);
              }
            } catch (error) {
              console.error('Erro ao buscar oficinas próximas:', error);
              // Fallback: carregar todas as oficinas
              await loadAllWorkshops();
            } finally {
              setWorkshopsLoading(false);
            }
          },
          async (error) => {
            console.warn('Geolocalização não disponível:', error);
            // Fallback: carregar todas as oficinas
            await loadAllWorkshops();
          }
        );
      } else {
        // Fallback: carregar todas as oficinas
        await loadAllWorkshops();
      }
    } catch (error) {
      console.error('Erro ao carregar oficinas:', error);
      setWorkshopsLoading(false);
    }
  };

  const loadAllWorkshops = async () => {
    try {
      const response = await workshopService.getAllWorkshops();
      
      if (response.success && response.data) {
        const formattedWorkshops = response.data.map(workshop => 
          workshopService.formatWorkshopForFrontend(workshop)
        ).slice(0, 3); // Mostrar apenas as 3 primeiras
        setNearbyWorkshops(formattedWorkshops);
      }
    } catch (error) {
      console.error('Erro ao carregar todas as oficinas:', error);
      toast.error('Erro ao carregar oficinas');
    } finally {
      setWorkshopsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle />;
      case 'pending':
        return <Pending />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Agendado';
    }
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setCancelling(true);
      const response = await appointmentService.cancelAppointment(selectedAppointment.id, cancelReason);
      
      if (response.success) {
        // Atualizar a lista de agendamentos
        setRecentAppointments(prev => 
          prev.map(apt => 
            (apt.id || apt._id) === (selectedAppointment.id || selectedAppointment._id)
              ? { ...apt, status: 'cancelled' }
              : apt
          )
        );
        
        toast.success('Agendamento cancelado com sucesso!');
        setCancelDialogOpen(false);
        setCancelReason('');
        setSelectedAppointment(null);
      } else {
        toast.error(response.message || 'Erro ao cancelar agendamento.');
      }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Erro ao cancelar agendamento. Tente novamente.');
    } finally {
      setCancelling(false);
    }
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setCancelReason('');
    setSelectedAppointment(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Olá, {user?.name?.split(' ')[0] || 'Ciclista'}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Bem-vindo ao seu painel de controle
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Cards de Ações Rápidas */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                textAlign: 'center', 
                p: { xs: 1, sm: 2 },
                minHeight: { xs: 120, sm: 140 }
              }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
                  <Search sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                    Buscar Oficinas
                  </Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/workshops"
                    size="small"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Buscar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                textAlign: 'center', 
                p: { xs: 1, sm: 2 },
                minHeight: { xs: 120, sm: 140 }
              }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
                  <Add sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                    Novo Agendamento
                  </Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/appointment"
                    size="small"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Agendar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <History sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Histórico
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/history')}
                  >
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Seção Minha Bike - apenas para ciclistas */}
            {user?.userType === 'cyclist' && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Build sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Minha Bike
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/my-bike')}
                    >
                      Gerenciar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {/* Próximos Agendamentos */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Próximos Agendamentos
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="pending">Pendente</MenuItem>
                  <MenuItem value="confirmed">Confirmado</MenuItem>
                  <MenuItem value="in_progress">Em Andamento</MenuItem>
                  <MenuItem value="completed">Concluído</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {filteredAppointments.length > 0 ? (
              <List>
                {filteredAppointments.map((appointment) => (
                  <ListItem key={appointment.id} divider>
                    <ListItemIcon>
                      {getStatusIcon(appointment.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {appointment.workshop?.name || appointment.workshopName || 'Oficina'}
                          </Typography>
                          <Chip
                            label={getStatusText(appointment.status)}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.serviceType || appointment.service}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(appointment.appointmentDate || appointment.date).toLocaleDateString('pt-BR')} às {appointment.appointmentTime || appointment.time}
                          </Typography>
                        </>
                      }
                    />
                    {appointmentService.canCancelAppointment(appointment) && (
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleCancelAppointment(appointment)}
                        sx={{ ml: 1 }}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Schedule sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhum agendamento encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Que tal agendar um serviço para sua bike?
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/workshops"
                >
                  Buscar Oficinas
                </Button>
              </Box>
            )}
          </Paper>


        </Grid>

        {/* Sidebar com Notificações */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
              Notificações
            </Typography>
            {notifications.length > 0 ? (
              <List>
                {notifications.map((notification) => (
                  <ListItem key={notification.id} divider>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.time}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma notificação
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Estatísticas Rápidas */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Suas Estatísticas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                    {recentAppointments.filter(a => a.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Serviços Realizados
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                    {nearbyWorkshops.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Oficinas Próximas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                    R$ {recentAppointments.reduce((total, a) => total + (a.totalPrice || a.price || 0), 0).toFixed(0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gasto Total
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                    {nearbyWorkshops.length > 0 ? (nearbyWorkshops.reduce((sum, w) => sum + (w.rating || 0), 0) / nearbyWorkshops.length).toFixed(1) : '0.0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avaliação Média
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
        
        {/* Diálogo de Cancelamento */}
        <Dialog open={cancelDialogOpen} onClose={closeCancelDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Cancelar Agendamento</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Tem certeza que deseja cancelar o agendamento na oficina {selectedAppointment?.workshop?.name || selectedAppointment?.workshopName}?
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motivo do cancelamento (opcional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Informe o motivo do cancelamento..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeCancelDialog} disabled={cancelling}>
              Voltar
            </Button>
            <Button 
              onClick={confirmCancelAppointment} 
              color="error" 
              variant="contained"
              disabled={cancelling}
            >
              {cancelling ? <CircularProgress size={20} /> : 'Cancelar Agendamento'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
};

export default Dashboard;