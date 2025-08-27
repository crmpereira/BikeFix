import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Schedule,
  Build,
  History,
  Notifications,
  Search,
  Add,
  CheckCircle,
  Pending,
  Cancel,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  // Dados mockados para demonstração
  const recentAppointments = [
    {
      id: 1,
      workshop: 'Bike Center',
      service: 'Manutenção Preventiva',
      date: '2024-01-15',
      time: '14:00',
      status: 'confirmed',
    },
    {
      id: 2,
      workshop: 'Speed Bikes',
      service: 'Troca de Pneus',
      date: '2024-01-20',
      time: '10:30',
      status: 'pending',
    },
  ];

  const notifications = [
    {
      id: 1,
      title: 'Agendamento Confirmado',
      message: 'Seu agendamento na Bike Center foi confirmado',
      time: '2 horas atrás',
    },
    {
      id: 2,
      title: 'Orçamento Disponível',
      message: 'Speed Bikes enviou um orçamento para seu serviço',
      time: '1 dia atrás',
    },
  ];

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
                  >
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
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
                  >
                    Gerenciar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Próximos Agendamentos */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Próximos Agendamentos
            </Typography>
            {recentAppointments.length > 0 ? (
              <List>
                {recentAppointments.map((appointment) => (
                  <ListItem key={appointment.id} divider>
                    <ListItemIcon>
                      {getStatusIcon(appointment.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {appointment.workshop}
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
                            {appointment.service}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                          </Typography>
                        </>
                      }
                    />
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
                    12
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Serviços Realizados
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                    3
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Oficinas Favoritas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                    R$ 450
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gasto Total
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                    4.8
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
    </Container>
  );
};

export default Dashboard;