import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  CalendarToday,
  Build,
  AttachMoney,
  TrendingUp,
  Notifications,
  Edit,
  Visibility,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  Phone,
  DirectionsBike,
  Star,
  Assignment,
  PriorityHigh,
  Check,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import appointmentService from '../services/appointmentService';
import paymentService from '../services/paymentService';

const WorkshopDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekRevenue: 0,
    weekGrossRevenue: 0,
    weekNetRevenue: 0,
    monthlyGrossRevenue: 0,
    monthlyNetRevenue: 0,
    platformFeeTotal: 0,
    monthlyGrowth: 0,
    pendingQuotes: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  const [notifications, setNotifications] = useState([]);

  // Função para carregar agendamentos da oficina
  const loadWorkshopAppointments = async () => {
    try {
      setLoadingData(true);
      const response = await appointmentService.getWorkshopAppointments(user.id);
      setAppointments(response.data || []);
      
      // Calcular estatísticas baseadas nos agendamentos
      await calculateStats(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoadingData(false);
    }
  };

  // Função para calcular estatísticas
  const calculateStats = async (appointmentsData) => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointmentsData.filter(apt => apt.date === today).length;
    
    // Calcular receita da semana (últimos 7 dias)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCompletedAppointments = appointmentsData
      .filter(apt => new Date(apt.date) >= weekAgo && apt.status === 'completed');
    
    const weekRevenue = weekCompletedAppointments
      .reduce((sum, apt) => sum + (apt.totalPrice || 0), 0);
    
    // Calcular receita bruta e líquida da semana
    const weekGrossRevenue = weekCompletedAppointments
      .reduce((sum, apt) => sum + (apt.totalPrice || 0), 0);
    const weekPlatformFees = weekCompletedAppointments
      .reduce((sum, apt) => sum + (apt.platformFee || 0), 0);
    const weekNetRevenue = weekGrossRevenue - weekPlatformFees;
    
    // Calcular receita mensal (últimos 30 dias)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthCompletedAppointments = appointmentsData
      .filter(apt => new Date(apt.date) >= monthAgo && apt.status === 'completed');
    
    const monthlyGrossRevenue = monthCompletedAppointments
      .reduce((sum, apt) => sum + (apt.totalPrice || 0), 0);
    const monthlyPlatformFees = monthCompletedAppointments
      .reduce((sum, apt) => sum + (apt.platformFee || 0), 0);
    const monthlyNetRevenue = monthlyGrossRevenue - monthlyPlatformFees;
    
    const pendingQuotes = appointmentsData.filter(apt => apt.status === 'pending').length;
    
    setStats({
      todayAppointments,
      weekRevenue,
      weekGrossRevenue,
      weekNetRevenue,
      monthlyGrossRevenue,
      monthlyNetRevenue,
      platformFeeTotal: monthlyPlatformFees,
      monthlyGrowth: 0, // Seria calculado com dados históricos
      pendingQuotes,
      averageRating: user.workshopData?.rating?.average || 0,
      totalReviews: user.workshopData?.rating?.count || 0,
    });
  };

  useEffect(() => {
    if (!user || user.userType !== 'workshop') {
      toast.error('Acesso negado. Área restrita para oficinas.');
      navigate('/login');
      return;
    }
    
    // Carregar dados da oficina
    loadWorkshopAppointments();
  }, [user, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewAppointment = (appointment) => {
    navigate(`/appointment/${appointment.id || appointment._id}`);
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    setLoading(true);
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      toast.success('Status atualizado com sucesso!');
      setDialogOpen(false);
      setActionModalOpen(false);
      // Recarregar agendamentos
      loadWorkshopAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAppointment = async (appointment) => {
    try {
      setLoading(true);
      const result = await appointmentService.updateAppointmentStatus(
        appointment.id || appointment._id, 
        'confirmed', 
        'Agendamento aceito pela oficina'
      );
      
      if (result.success) {
        toast.success('Agendamento aceito com sucesso!');
        setActionModalOpen(false);
        loadWorkshopAppointments();
      } else {
        toast.error(result.message || 'Erro ao aceitar agendamento');
      }
    } catch (error) {
      console.error('Erro ao aceitar agendamento:', error);
      toast.error('Erro ao aceitar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAppointment = async (appointment) => {
    try {
      setLoading(true);
      const result = await appointmentService.updateAppointmentStatus(
        appointment.id || appointment._id, 
        'cancelled', 
        'Agendamento rejeitado pela oficina'
      );
      
      if (result.success) {
        toast.success('Agendamento rejeitado!');
        setActionModalOpen(false);
        loadWorkshopAppointments();
      } else {
        toast.error(result.message || 'Erro ao rejeitar agendamento');
      }
    } catch (error) {
      console.error('Erro ao rejeitar agendamento:', error);
      toast.error('Erro ao rejeitar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (appointment) => {
    setSelectedAppointment(appointment);
    setActionModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'error';
      case 'normal': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const filteredAppointments = statusFilter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === statusFilter);

  const renderOverview = () => {
    if (loadingData) {
      return (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={40} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }
    
    return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Agendamentos Hoje
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.todayAppointments}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <CalendarToday />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Receita Bruta Semanal
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  R$ {stats.weekGrossRevenue.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Líquida: R$ {stats.weekNetRevenue.toLocaleString()}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AttachMoney />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Crescimento Mensal
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  +{stats.monthlyGrowth}%
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <TrendingUp />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Avaliação Média
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.averageRating}
                  </Typography>
                  <Star sx={{ color: 'warning.main' }} />
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Star />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Novo card para informações de comissão */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Resumo Financeiro Mensal
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Receita Bruta
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                R$ {stats.monthlyGrossRevenue.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Taxa da Plataforma
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                - R$ {stats.platformFeeTotal.toLocaleString()}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Receita Líquida
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                R$ {stats.monthlyNetRevenue.toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Agendamentos de Hoje
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ciclista</TableCell>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.filter(apt => {
                    const today = new Date().toISOString().split('T')[0];
                    const aptDate = new Date(apt.appointmentDate || apt.date).toISOString().split('T')[0];
                    return aptDate === today;
                  }).slice(0, 3).map((appointment) => (
                    <TableRow key={appointment._id || appointment.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {appointment.cyclist?.name || appointment.customerName || 'Nome não informado'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.cyclist?.phone || appointment.customerPhone || 'Telefone não informado'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {appointment.serviceType || appointment.service || appointment.requestedServices?.map(s => s.name).join(', ') || 'Serviço não especificado'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(appointment.status)}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenActionModal(appointment)}
                        >
                          <Visibility />
                        </IconButton>
                        {appointment.status === 'pending' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleAcceptAppointment(appointment)}
                              disabled={loading}
                            >
                              <Check />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRejectAppointment(appointment)}
                              disabled={loading}
                            >
                              <Close />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notificações
              </Typography>
              <Badge badgeContent={2} color="error">
                <Notifications />
              </Badge>
            </Box>
            <List>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <React.Fragment key={notification.id || index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={notification.message}
                        secondary={notification.time}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: notification.read ? 400 : 600
                        }}
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Nenhuma notificação"
                    secondary="Você está em dia!"
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary'
                    }}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    );
  };

  const renderAppointments = () => {
    if (loadingData) {
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </Box>
      );
    }
    
    if (appointments.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CalendarToday sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum agendamento encontrado
          </Typography>
        </Box>
      );
    }
    
    return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Gerenciar Agendamentos
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
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
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Serviço</TableCell>
              <TableCell>Data/Hora</TableCell>
              <TableCell>Bike</TableCell>
              <TableCell>Urgência</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAppointments.map((appointment) => (
              <TableRow 
                key={appointment.id}
                sx={{
                  backgroundColor: appointment.urgency === 'high' ? 'error.light' : 'inherit',
                  '&:hover': {
                    backgroundColor: appointment.urgency === 'high' ? 'error.main' : 'action.hover',
                  },
                  borderLeft: appointment.urgency === 'high' ? '4px solid' : 'none',
                  borderLeftColor: appointment.urgency === 'high' ? 'error.main' : 'transparent',
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {appointment.urgency === 'high' && (
                      <PriorityHigh color="error" sx={{ fontSize: 20 }} />
                    )}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {appointment.cyclist?.name || appointment.customerName || 'Cliente não identificado'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.cyclist?.phone || appointment.customerPhone || 'Telefone não informado'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {appointment.service || appointment.serviceType || appointment.requestedServices?.map(s => s.name).join(', ') || 'Serviço não especificado'}
                    </Typography>
                    {appointment.urgency === 'high' && (
                      <Chip label="URGENTE" color="error" size="small" sx={{ fontWeight: 600 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {appointment.appointmentDate || appointment.date ? 
                        new Date(appointment.appointmentDate || appointment.date).toLocaleDateString('pt-BR') : 
                        'Data não informada'
                      }
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {appointment.appointmentTime || appointment.time || 'Horário não informado'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {appointment.bikeInfo?.model || appointment.bikeModel || appointment.bike?.model || 'Bike não especificada'}
                  </Typography>
                  {(appointment.bikeInfo?.brand || appointment.bike?.brand) && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {appointment.bikeInfo?.brand || appointment.bike?.brand}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {appointment.urgency === 'high' && (
                      <PriorityHigh color="error" sx={{ fontSize: 16 }} />
                    )}
                    <Chip
                      label={appointment.urgency === 'high' ? 'Alta' : appointment.urgency === 'normal' ? 'Normal' : 'Baixa'}
                      color={getUrgencyColor(appointment.urgency)}
                      size="small"
                      sx={{
                        fontWeight: appointment.urgency === 'high' ? 600 : 400,
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(appointment.status)}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    R$ {(appointment.totalPrice || appointment.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenActionModal(appointment)}
                  >
                    <Visibility />
                  </IconButton>
                  {appointment.status === 'pending' && (
                    <>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleAcceptAppointment(appointment)}
                        disabled={loading}
                        title="Aceitar agendamento"
                      >
                        <Check />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRejectAppointment(appointment)}
                        disabled={loading}
                        title="Rejeitar agendamento"
                      >
                        <Close />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
    );
  };

  if (!user || user.userType !== 'workshop') {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Painel da Oficina
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Bem-vindo, {user.name}!
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Visão Geral" />
          <Tab label="Agendamentos" />
          <Tab label="Relatórios" />
        </Tabs>
      </Box>

      {tabValue === 0 && renderOverview()}
      {tabValue === 1 && renderAppointments()}
      {tabValue === 2 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Relatórios em desenvolvimento
          </Typography>
        </Box>
      )}

      {/* Modal de Ações para Agendamentos */}
      <Dialog open={actionModalOpen} onClose={() => setActionModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Ações do Agendamento
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedAppointment.cyclist?.name || selectedAppointment.customerName || 'Cliente não identificado'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Serviço: {selectedAppointment.service || selectedAppointment.serviceType || 'Não especificado'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Data: {selectedAppointment.appointmentDate || selectedAppointment.date ? 
                  new Date(selectedAppointment.appointmentDate || selectedAppointment.date).toLocaleDateString('pt-BR') : 
                  'Não informada'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Horário: {selectedAppointment.appointmentTime || selectedAppointment.time || 'Não informado'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: <Chip 
                  label={getStatusLabel(selectedAppointment.status)} 
                  color={getStatusColor(selectedAppointment.status)} 
                  size="small" 
                />
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionModalOpen(false)}>
            Fechar
          </Button>
          <Button 
            onClick={() => handleViewAppointment(selectedAppointment)}
            variant="outlined"
          >
            Ver Detalhes
          </Button>
          {selectedAppointment?.status === 'pending' && (
            <>
              <Button 
                onClick={() => handleAcceptAppointment(selectedAppointment)}
                variant="contained"
                color="success"
                disabled={loading}
                startIcon={<Check />}
              >
                Aceitar
              </Button>
              <Button 
                onClick={() => handleRejectAppointment(selectedAppointment)}
                variant="contained"
                color="error"
                disabled={loading}
                startIcon={<Close />}
              >
                Rejeitar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog para visualizar agendamento */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalhes do Agendamento #{selectedAppointment?.id}
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Cliente
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedAppointment.cyclist?.name || selectedAppointment.customerName || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedAppointment.cyclist?.phone || selectedAppointment.customerPhone || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Serviço
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedAppointment.serviceType || selectedAppointment.service}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  R$ {selectedAppointment.totalPrice || selectedAppointment.price || 0}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Data e Horário
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedAppointment.date).toLocaleDateString('pt-BR')} às {selectedAppointment.time}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Bike
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.bikeInfo?.model || selectedAppointment.bikeModel || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Descrição
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.description}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Status Atual
                </Typography>
                <Chip
                  label={getStatusLabel(selectedAppointment.status)}
                  color={getStatusColor(selectedAppointment.status)}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
          {selectedAppointment?.status === 'pending' && (
            <Button
              variant="contained"
              onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
              disabled={loading}
            >
              Confirmar
            </Button>
          )}
          {selectedAppointment?.status === 'confirmed' && (
            <Button
              variant="contained"
              onClick={() => handleUpdateStatus(selectedAppointment.id, 'in_progress')}
              disabled={loading}
            >
              Iniciar Serviço
            </Button>
          )}
          {selectedAppointment?.status === 'in_progress' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
              disabled={loading}
            >
              Concluir
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkshopDashboard;