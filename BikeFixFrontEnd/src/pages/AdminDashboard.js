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
import { paymentService } from '../services/paymentService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [paymentStats, setPaymentStats] = useState(null);
  const [commissionData, setCommissionData] = useState(null);

  // Estados para dados reais
  const [stats, setStats] = useState({
    totalWorkshops: 0,
    activeUsers: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    totalAppointments: 0,
    averageRating: 0,
  });

  // Carregar dados de pagamento e comissão
  const loadPaymentStats = async () => {
    try {
      const stats = await paymentService.getPaymentStats();
      setPaymentStats(stats);
      
      // Calcular dados de comissão
      const commissionInfo = {
        totalCommission: stats.platformFees || 0,
        monthlyCommission: stats.monthlyPlatformFees || 0,
        averageCommissionRate: stats.averageCommissionRate || 0.10,
        totalTransactions: stats.totalTransactions || 0,
        commissionGrowth: stats.commissionGrowth || 0
      };
      setCommissionData(commissionInfo);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de pagamento:', error);
      // Usar dados padrão em caso de erro
      setCommissionData({
        totalCommission: 0,
        monthlyCommission: 0,
        averageCommissionRate: 0.10,
        totalTransactions: 0,
        commissionGrowth: 0
      });
    }
  };

  const [workshops, setWorkshops] = useState([]);

  const [users, setUsers] = useState([]);

  const [reports, setReports] = useState({
    monthlyGrowth: [],
    topWorkshops: [],
  });

  useEffect(() => {
    if (!user || user.userType !== 'admin') {
      toast.error('Acesso negado. Área restrita para administradores.');
      navigate('/login');
    } else {
      loadPaymentStats();
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
    ? workshops
        : workshops.filter(workshop => workshop.status === statusFilter);

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
                  {stats.totalWorkshops}
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
                  {stats.activeUsers.toLocaleString()}
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
                  R$ {(stats.monthlyRevenue / 1000).toFixed(0)}k
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
                  {stats.pendingApprovals}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Warning />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Cards de Comissão da Plataforma */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
          Receita da Plataforma - Comissões
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="inherit" gutterBottom variant="body2" sx={{ opacity: 0.8 }}>
                  Comissão Total
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  R$ {commissionData ? (commissionData.totalCommission / 1000).toFixed(1) : '12.5'}k
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <TrendingUp />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="inherit" gutterBottom variant="body2" sx={{ opacity: 0.8 }}>
                  Comissão Mensal
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  R$ {commissionData ? (commissionData.monthlyCommission / 1000).toFixed(1) : '3.2'}k
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <AttachMoney />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="inherit" gutterBottom variant="body2" sx={{ opacity: 0.8 }}>
                  Taxa Média
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {commissionData ? (commissionData.averageCommissionRate * 100).toFixed(1) : '10.0'}%
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Assessment />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="inherit" gutterBottom variant="body2" sx={{ opacity: 0.8 }}>
                  Transações
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {commissionData ? commissionData.totalTransactions : '342'}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <BarChart />
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
                  {workshops.filter(w => w.status === 'pending').map((workshop) => (
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
              {reports.topWorkshops.map((workshop, index) => (
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
                  {index < reports.topWorkshops.length - 1 && <Divider />}
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
                    {workshop.address && typeof workshop.address === 'object'
                  ? `${workshop.address.street}, ${workshop.address.city} - ${workshop.address.state}`
                  : workshop.address}
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
            {users.map((user) => (
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

  const renderCommissions = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Relatórios de Comissão da Plataforma
        </Typography>
      </Grid>
      
      {/* Resumo de Comissões */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resumo Mensal
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Comissão Total do Mês
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                R$ {commissionData ? commissionData.monthlyCommission.toLocaleString() : '3.200'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Crescimento vs Mês Anterior
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                +{commissionData ? commissionData.commissionGrowth.toFixed(1) : '15.2'}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Taxa Média de Comissão
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {commissionData ? (commissionData.averageCommissionRate * 100).toFixed(1) : '10.0'}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Distribuição por Oficina */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Comissões por Oficina (Top 10)
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Oficina</TableCell>
                    <TableCell>Transações</TableCell>
                    <TableCell>Receita Bruta</TableCell>
                    <TableCell>Comissão</TableCell>
                    <TableCell>Taxa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'Bike Center', transactions: 45, revenue: 8500, commission: 850, rate: 10.0 },
                    { name: 'Cycle Master', transactions: 38, revenue: 7200, commission: 720, rate: 10.0 },
                    { name: 'Speed Repair', transactions: 32, revenue: 6800, commission: 680, rate: 10.0 },
                    { name: 'Pro Bikes', transactions: 28, revenue: 5400, commission: 540, rate: 10.0 },
                    { name: 'Bike Tech', transactions: 25, revenue: 4900, commission: 490, rate: 10.0 }
                  ].map((workshop, index) => (
                    <TableRow key={index}>
                      <TableCell>{workshop.name}</TableCell>
                      <TableCell>{workshop.transactions}</TableCell>
                      <TableCell>R$ {workshop.revenue.toLocaleString()}</TableCell>
                      <TableCell>R$ {workshop.commission.toLocaleString()}</TableCell>
                      <TableCell>{workshop.rate.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Histórico de Comissões */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Histórico de Comissões (Últimos 6 Meses)
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mês</TableCell>
                    <TableCell>Transações</TableCell>
                    <TableCell>Receita Total</TableCell>
                    <TableCell>Comissão Total</TableCell>
                    <TableCell>Taxa Média</TableCell>
                    <TableCell>Crescimento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { month: 'Abril 2024', transactions: 342, revenue: 32500, commission: 3250, rate: 10.0, growth: 15.2 },
                    { month: 'Março 2024', transactions: 298, revenue: 28200, commission: 2820, rate: 10.0, growth: 8.5 },
                    { month: 'Fevereiro 2024', transactions: 275, revenue: 26000, commission: 2600, rate: 10.0, growth: 12.1 },
                    { month: 'Janeiro 2024', transactions: 245, revenue: 23200, commission: 2320, rate: 10.0, growth: 5.8 },
                    { month: 'Dezembro 2023', transactions: 232, revenue: 21900, commission: 2190, rate: 10.0, growth: 3.2 },
                    { month: 'Novembro 2023', transactions: 225, revenue: 21200, commission: 2120, rate: 10.0, growth: 7.1 }
                  ].map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.month}</TableCell>
                      <TableCell>{data.transactions}</TableCell>
                      <TableCell>R$ {data.revenue.toLocaleString()}</TableCell>
                      <TableCell>R$ {data.commission.toLocaleString()}</TableCell>
                      <TableCell>{data.rate.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Chip 
                          label={`+${data.growth.toFixed(1)}%`} 
                          color="success" 
                          size="small" 
                        />
                      </TableCell>
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

  const renderReports = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Relatórios e Análises Gerais
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
                  {reports.monthlyGrowth.map((data, index) => (
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
          <Tab label="Comissões" />
          <Tab label="Relatórios" />
        </Tabs>
      </Box>

      {tabValue === 0 && renderOverview()}
      {tabValue === 1 && renderWorkshops()}
      {tabValue === 2 && renderUsers()}
      {tabValue === 3 && renderCommissions()}
      {tabValue === 4 && renderReports()}

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
                  {selectedWorkshop.address && typeof selectedWorkshop.address === 'object'
                  ? `${selectedWorkshop.address.street}, ${selectedWorkshop.address.city} - ${selectedWorkshop.address.state}`
                  : selectedWorkshop.address}
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