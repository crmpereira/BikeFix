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
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Dashboard,
  Build,
  People,
  TrendingUp,
  AttachMoney,
  Visibility,
  Edit,
  Delete,
  Add,
  CheckCircle,
  Cancel,
  Warning,
  BarChart,
  PieChart,
  Assessment,
  Store,
  Person,
  AdminPanelSettings,
  Verified,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Dados mockados
  const mockStats = {
    totalWorkshops: 45,
    activeUsers: 1250,
    monthlyRevenue: 125000,
    pendingApprovals: 8,
    totalAppointments: 3420,
    averageRating: 4.6,
  };

  const mockWorkshops = [
    {
      id: 1,
      name: 'Bike Center',
      owner: 'João Silva',
      email: 'joao@bikecenter.com',
      phone: '(11) 1234-5678',
      address: 'Rua das Flores, 123 - Centro',
      status: 'active',
      verified: true,
      rating: 4.8,
      reviewCount: 156,
      joinDate: '2023-01-15',
      monthlyRevenue: 8500,
      totalAppointments: 245,
    },
    {
      id: 2,
      name: 'Speed Bikes',
      owner: 'Maria Santos',
      email: 'maria@speedbikes.com',
      phone: '(11) 9876-5432',
      address: 'Av. Paulista, 456 - Bela Vista',
      status: 'pending',
      verified: false,
      rating: 0,
      reviewCount: 0,
      joinDate: '2024-01-10',
      monthlyRevenue: 0,
      totalAppointments: 0,
    },
    {
      id: 3,
      name: 'Cycle Pro',
      owner: 'Carlos Oliveira',
      email: 'carlos@cyclepro.com',
      phone: '(11) 5555-9999',
      address: 'Rua Augusta, 789 - Consolação',
      status: 'suspended',
      verified: true,
      rating: 3.2,
      reviewCount: 45,
      joinDate: '2023-06-20',
      monthlyRevenue: 2100,
      totalAppointments: 89,
    },
  ];

  const mockUsers = [
    {
      id: 1,
      name: 'Ana Costa',
      email: 'ana@email.com',
      userType: 'cyclist',
      joinDate: '2023-03-10',
      totalAppointments: 12,
      status: 'active',
    },
    {
      id: 2,
      name: 'Pedro Lima',
      email: 'pedro@email.com',
      userType: 'cyclist',
      joinDate: '2023-08-15',
      totalAppointments: 8,
      status: 'active',
    },
    {
      id: 3,
      name: 'Lucia Ferreira',
      email: 'lucia@email.com',
      userType: 'cyclist',
      joinDate: '2024-01-05',
      totalAppointments: 3,
      status: 'active',
    },
  ];

  const mockReports = {
    monthlyGrowth: [
      { month: 'Jan', workshops: 35, users: 980, revenue: 95000 },
      { month: 'Fev', workshops: 38, users: 1050, revenue: 105000 },
      { month: 'Mar', workshops: 42, users: 1180, revenue: 115000 },
      { month: 'Abr', workshops: 45, users: 1250, revenue: 125000 },
    ],
    topWorkshops: [
      { name: 'Bike Center', revenue: 8500, appointments: 245 },
      { name: 'Cycle Master', revenue: 7200, appointments: 198 },
      { name: 'Speed Repair', revenue: 6800, appointments: 176 },
    ],
  };

  useEffect(() => {
    if (!user || user.userType !== 'admin') {
      toast.error('Acesso negado. Área restrita para administradores.');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewWorkshop = (workshop) => {
    setSelectedWorkshop(workshop);
    setDialogOpen(true);
  };

  const handleUpdateWorkshopStatus = async (workshopId, newStatus) => {
    setLoading(true);
    try {
      // Simular atualização do status
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Oficina ${newStatus === 'active' ? 'aprovada' : 'suspensa'} com sucesso!`);
      setDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar status da oficina');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'pending': return 'Pendente';
      case 'suspended': return 'Suspensa';
      default: return status;
    }
  };

  const filteredWorkshops = statusFilter === 'all' 
    ? mockWorkshops 
    : mockWorkshops.filter(workshop => workshop.status === statusFilter);

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total de Oficinas
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {mockStats.totalWorkshops}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Store />
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
                  Usuários Ativos
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {mockStats.activeUsers.toLocaleString()}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <People />
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
                  Receita Mensal
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  R$ {(mockStats.monthlyRevenue / 1000).toFixed(0)}k
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
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
                  Aprovações Pendentes
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  {mockStats.pendingApprovals}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Warning />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Oficinas Pendentes de Aprovação
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Proprietário</TableCell>
                    <TableCell>Data de Cadastro</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockWorkshops.filter(w => w.status === 'pending').map((workshop) => (
                    <TableRow key={workshop.id}>
                      <TableCell>{workshop.name}</TableCell>
                      <TableCell>{workshop.owner}</TableCell>
                      <TableCell>{new Date(workshop.joinDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(workshop.status)}
                          color={getStatusColor(workshop.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewWorkshop(workshop)}
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
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Top Oficinas do Mês
            </Typography>
            <List>
              {mockReports.topWorkshops.map((workshop, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={workshop.name}
                      secondary={`R$ ${workshop.revenue.toLocaleString()} • ${workshop.appointments} agendamentos`}
                    />
                  </ListItem>
                  {index < mockReports.topWorkshops.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderWorkshops = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Gerenciar Oficinas
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="active">Ativas</MenuItem>
              <MenuItem value="pending">Pendentes</MenuItem>
              <MenuItem value="suspended">Suspensas</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Add />}>
            Nova Oficina
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Oficina</TableCell>
              <TableCell>Proprietário</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>Avaliação</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Receita Mensal</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkshops.map((workshop) => (
              <TableRow key={workshop.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {workshop.name}
                    </Typography>
                    {workshop.verified && (
                      <Verified color="primary" fontSize="small" />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {workshop.address}
                  </Typography>
                </TableCell>
                <TableCell>{workshop.owner}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{workshop.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {workshop.phone}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {workshop.rating > 0 ? (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {workshop.rating.toFixed(1)} ⭐
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {workshop.reviewCount} avaliações
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Sem avaliações
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(workshop.status)}
                    color={getStatusColor(workshop.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  R$ {workshop.monthlyRevenue.toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewWorkshop(workshop)}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderUsers = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Gerenciar Usuários
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Novo Usuário
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Data de Cadastro</TableCell>
              <TableCell>Agendamentos</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.userType === 'cyclist' ? 'Ciclista' : 'Oficina'}
                    color={user.userType === 'cyclist' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(user.joinDate).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{user.totalAppointments}</TableCell>
                <TableCell>
                  <Chip
                    label={user.status === 'active' ? 'Ativo' : 'Inativo'}
                    color={user.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <Visibility />
                  </IconButton>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderReports = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Relatórios e Análises
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Crescimento Mensal
            </Typography>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BarChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Gráfico de crescimento em desenvolvimento
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribuição por Região
            </Typography>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PieChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Gráfico de distribuição em desenvolvimento
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dados de Crescimento
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mês</TableCell>
                    <TableCell>Oficinas</TableCell>
                    <TableCell>Usuários</TableCell>
                    <TableCell>Receita</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockReports.monthlyGrowth.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.month}</TableCell>
                      <TableCell>{data.workshops}</TableCell>
                      <TableCell>{data.users.toLocaleString()}</TableCell>
                      <TableCell>R$ {data.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (!user || user.userType !== 'admin') {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Painel Administrativo
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Bem-vindo, {user.name}!
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Visão Geral" />
          <Tab label="Oficinas" />
          <Tab label="Usuários" />
          <Tab label="Relatórios" />
        </Tabs>
      </Box>

      {tabValue === 0 && renderOverview()}
      {tabValue === 1 && renderWorkshops()}
      {tabValue === 2 && renderUsers()}
      {tabValue === 3 && renderReports()}

      {/* Dialog para visualizar oficina */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalhes da Oficina - {selectedWorkshop?.name}
        </DialogTitle>
        <DialogContent>
          {selectedWorkshop && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Proprietário
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedWorkshop.owner}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedWorkshop.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Telefone
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedWorkshop.phone}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Data de Cadastro
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(selectedWorkshop.joinDate).toLocaleDateString('pt-BR')}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Endereço
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedWorkshop.address}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Receita Mensal
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  R$ {selectedWorkshop.monthlyRevenue.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Total de Agendamentos
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedWorkshop.totalAppointments}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Status Atual
                </Typography>
                <Chip
                  label={getStatusLabel(selectedWorkshop.status)}
                  color={getStatusColor(selectedWorkshop.status)}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
          {selectedWorkshop?.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleUpdateWorkshopStatus(selectedWorkshop.id, 'active')}
                disabled={loading}
              >
                Aprovar
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleUpdateWorkshopStatus(selectedWorkshop.id, 'suspended')}
                disabled={loading}
              >
                Rejeitar
              </Button>
            </>
          )}
          {selectedWorkshop?.status === 'active' && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleUpdateWorkshopStatus(selectedWorkshop.id, 'suspended')}
              disabled={loading}
            >
              Suspender
            </Button>
          )}
          {selectedWorkshop?.status === 'suspended' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleUpdateWorkshopStatus(selectedWorkshop.id, 'active')}
              disabled={loading}
            >
              Reativar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;