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
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header com gradiente */}
      <Box sx={{ 
        mb: 4, 
        p: { xs: 3, md: 4 },
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        borderRadius: 3,
        color: 'white',
        textAlign: { xs: 'center', md: 'left' }
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 700,
          fontSize: { xs: '1.8rem', md: '2.125rem' }
        }}>
          Olá, {user?.name?.split(' ')[0] || 'Ciclista'}! 👋
        </Typography>
        <Typography variant="h6" sx={{ 
          opacity: 0.9,
          fontSize: { xs: '1rem', md: '1.25rem' }
        }}>
          Pronto para cuidar da sua bike hoje?
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Cards de Ações Rápidas - Design Moderno */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                textAlign: 'center',
                minHeight: { xs: 140, sm: 160 },
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                border: '1px solid #e3f2fd',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ 
                    width: { xs: 50, sm: 60 }, 
                    height: { xs: 50, sm: 60 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <Search sx={{ fontSize: { xs: 24, sm: 30 }, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    fontWeight: 600,
                    color: '#1976d2'
                  }}>
                    Buscar Oficinas
                  </Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/workshops"
                    size="small"
                    fullWidth
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Buscar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                textAlign: 'center',
                minHeight: { xs: 140, sm: 160 },
                background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                border: '1px solid #e8f5e8',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ 
                    width: { xs: 50, sm: 60 }, 
                    height: { xs: 50, sm: 60 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <Add sx={{ fontSize: { xs: 24, sm: 30 }, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    fontWeight: 600,
                    color: '#4caf50'
                  }}>
                    Novo Agendamento
                  </Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/appointment"
                    size="small"
                    fullWidth
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#4caf50',
                      '&:hover': { bgcolor: '#45a049' }
                    }}
                  >
                    Agendar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                textAlign: 'center',
                minHeight: { xs: 140, sm: 160 },
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
                border: '1px solid #fff3e0',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(255, 152, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ 
                    width: { xs: 50, sm: 60 }, 
                    height: { xs: 50, sm: 60 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <History sx={{ fontSize: { xs: 24, sm: 30 }, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    fontWeight: 600,
                    color: '#f57c00'
                  }}>
                    Histórico
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => navigate('/history')}
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#ff9800',
                      '&:hover': { bgcolor: '#f57c00' }
                    }}
                  >
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Seção Minha Bike - apenas para ciclistas */}
            {user?.userType === 'cyclist' && (
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  textAlign: 'center',
                  minHeight: { xs: 140, sm: 160 },
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  border: '1px solid #f3e5f5',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(156, 39, 176, 0.15)'
                  }
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ 
                      width: { xs: 50, sm: 60 }, 
                      height: { xs: 50, sm: 60 },
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}>
                      <Build sx={{ fontSize: { xs: 24, sm: 30 }, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontSize: { xs: '0.9rem', sm: '1.1rem' },
                      fontWeight: 600,
                      color: '#7b1fa2'
                    }}>
                      Minha Bike
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => navigate('/my-bike')}
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: '#9c27b0',
                        '&:hover': { bgcolor: '#7b1fa2' }
                      }}
                    >
                      Gerenciar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {/* Próximos Agendamentos - Design Moderno */}
          <Paper sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              mb: 3,
              gap: { xs: 2, sm: 0 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  Próximos Agendamentos
                </Typography>
              </Box>
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Filtrar por Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filtrar por Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
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
              <Grid container spacing={2}>
                {filteredAppointments.map((appointment) => (
                  <Grid item xs={12} key={appointment.id}>
                    <Card sx={{ 
                      border: '1px solid #f0f0f0',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          gap: 2
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              {getStatusIcon(appointment.status)}
                              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                {appointment.workshop?.name || appointment.workshopName || 'Oficina'}
                              </Typography>
                              <Chip
                                label={getStatusText(appointment.status)}
                                color={getStatusColor(appointment.status)}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                            
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                              🔧 {appointment.serviceType || appointment.service}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              📅 {new Date(appointment.appointmentDate || appointment.date).toLocaleDateString('pt-BR')} às {appointment.appointmentTime || appointment.time}
                            </Typography>
                          </Box>
                          
                          {appointmentService.canCancelAppointment(appointment) && (
                            <IconButton
                              color="error"
                              onClick={() => handleCancelAppointment(appointment)}
                              sx={{ 
                                bgcolor: '#ffebee',
                                '&:hover': { bgcolor: '#ffcdd2' },
                                borderRadius: 2
                              }}
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: { xs: 4, md: 6 },
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: 3,
                border: '2px dashed #dee2e6'
              }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6c757d, #adb5bd)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <Schedule sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                  Nenhum agendamento encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
                  Que tal agendar um serviço para sua bike? Encontre a oficina perfeita para você!
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/workshops"
                  size="large"
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5
                  }}
                >
                  🔍 Buscar Oficinas
                </Button>
              </Box>
            )}
          </Paper>


        </Grid>

        {/* Sidebar com Notificações e Oficinas Próximas */}
        <Grid item xs={12} md={4}>
          {/* Oficinas Próximas - Design Moderno */}
          <Paper sx={{ 
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Build sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                Oficinas Próximas
              </Typography>
            </Box>
            
            {workshopsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : nearbyWorkshops.length > 0 ? (
              <Grid container spacing={2}>
                {nearbyWorkshops.map((workshop) => (
                  <Grid item xs={12} key={workshop.id}>
                    <Card sx={{ 
                      borderRadius: 3,
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{
                            width: 35,
                            height: 35,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1.5
                          }}>
                            <Build sx={{ color: 'white', fontSize: 18 }} />
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 }}>
                            {workshop.name}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          📍 {workshop.address && typeof workshop.address === 'object'
                  ? `${workshop.address.street}, ${workshop.address.city} - ${workshop.address.state}`
                  : workshop.address}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating value={workshop.rating || 0} readOnly size="small" />
                            <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                              ({workshop.reviewCount || 0})
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            📏 {workshop.distance ? `${workshop.distance.toFixed(1)} km` : 'N/A'}
                          </Typography>
                        </Box>
                        
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          component={Link}
                          to={`/workshop/${workshop.id}`}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1
                          }}
                        >
                          Ver Detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: 3,
                border: '2px dashed #dee2e6'
              }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6c757d, #adb5bd)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <Build sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                  Nenhuma oficina encontrada
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 250, mx: 'auto' }}>
                  Explore todas as opções disponíveis!
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/workshops"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3
                  }}
                >
                  🔍 Buscar Oficinas
                </Button>
              </Box>
            )}
          </Paper>

          {/* Notificações - Design Moderno */}
          <Paper sx={{ 
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Notifications sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                Notificações
              </Typography>
            </Box>
            
            {notifications.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {notifications.map((notification) => (
                  <Card key={notification.id} sx={{ 
                    border: '1px solid #f0f0f0',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transform: 'translateX(4px)'
                    }
                  }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Notifications sx={{ color: 'white', fontSize: 16 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {notification.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.time}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: 3,
                border: '2px dashed #dee2e6'
              }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6c757d, #adb5bd)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <Notifications sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Tudo em dia! 🎉
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma notificação no momento
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