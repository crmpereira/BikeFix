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
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const WorkshopDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Dados mockados
  const mockStats = {
    todayAppointments: 8,
    weekRevenue: 2450,
    monthlyGrowth: 12.5,
    pendingQuotes: 5,
    averageRating: 4.7,
    totalReviews: 156,
  };

  const mockAppointments = [
    {
      id: 1,
      customerName: 'João Silva',
      customerPhone: '(11) 99999-1111',
      service: 'Manutenção Preventiva',
      bikeModel: 'Trek FX 3',
      date: '2024-01-15',
      time: '09:00',
      status: 'confirmed',
      price: 80,
      description: 'Revisão geral da bike, ajuste de freios e câmbio',
      urgency: 'normal',
    },
    {
      id: 2,
      customerName: 'Maria Santos',
      customerPhone: '(11) 88888-2222',
      service: 'Troca de Pneus',
      bikeModel: 'Specialized Sirrus',
      date: '2024-01-15',
      time: '10:30',
      status: 'pending',
      price: 45,
      description: 'Pneu furado, precisa trocar os dois pneus',
      urgency: 'high',
    },
    {
      id: 3,
      customerName: 'Carlos Oliveira',
      customerPhone: '(11) 77777-3333',
      service: 'Ajuste de Freios',
      bikeModel: 'Caloi Elite',
      date: '2024-01-15',
      time: '14:00',
      status: 'in_progress',
      price: 35,
      description: 'Freios fazendo barulho',
      urgency: 'normal',
    },
    {
      id: 4,
      customerName: 'Ana Costa',
      customerPhone: '(11) 66666-4444',
      service: 'Upgrade de Componentes',
      bikeModel: 'Giant Escape',
      date: '2024-01-16',
      time: '08:00',
      status: 'completed',
      price: 200,
      description: 'Upgrade do grupo de transmissão',
      urgency: 'low',
    },
  ];

  const mockNotifications = [
    {
      id: 1,
      type: 'new_appointment',
      message: 'Novo agendamento de João Silva para amanhã às 09:00',
      time: '5 min atrás',
      read: false,
    },
    {
      id: 2,
      type: 'review',
      message: 'Nova avaliação 5 estrelas de Maria Santos',
      time: '1 hora atrás',
      read: false,
    },
    {
      id: 3,
      type: 'payment',
      message: 'Pagamento de R$ 80,00 confirmado',
      time: '2 horas atrás',
      read: true,
    },
  ];

  useEffect(() => {
    if (!user || user.userType !== 'workshop') {
      toast.error('Acesso negado. Área restrita para oficinas.');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    setLoading(true);
    try {
      // Simular atualização do status
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Status atualizado com sucesso!');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
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
    ? mockAppointments 
    : mockAppointments.filter(apt => apt.status === statusFilter);

  const renderOverview = () => (
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
                  {mockStats.todayAppointments}
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
                  Receita Semanal
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  R$ {mockStats.weekRevenue.toLocaleString()}
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
                  +{mockStats.monthlyGrowth}%
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
                    {mockStats.averageRating}
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
                    <TableCell>Cliente</TableCell>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Horário</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockAppointments.slice(0, 3).map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.customerName}</TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
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
                          onClick={() => handleViewAppointment(appointment)}
                        >
                          <Visibility />
                        </IconButton>
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
              {mockNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
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
                  {index < mockNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAppointments = () => (
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
              <TableRow key={appointment.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {appointment.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {appointment.customerPhone}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{appointment.service}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {new Date(appointment.date).toLocaleDateString('pt-BR')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {appointment.time}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{appointment.bikeModel}</TableCell>
                <TableCell>
                  <Chip
                    label={appointment.urgency === 'high' ? 'Alta' : appointment.urgency === 'normal' ? 'Normal' : 'Baixa'}
                    color={getUrgencyColor(appointment.urgency)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(appointment.status)}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>R$ {appointment.price}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewAppointment(appointment)}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

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
                  {selectedAppointment.customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedAppointment.customerPhone}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Serviço
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedAppointment.service}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  R$ {selectedAppointment.price}
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
                  {selectedAppointment.bikeModel}
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