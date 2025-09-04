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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Assessment,
  Business,
  People,
  Download,
  Visibility,
  AccountBalance,
  MonetizationOn,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentService from '../services/paymentService';
import appointmentService from '../services/appointmentService';
import userService from '../services/userService';

const AdminFinancialReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState({
    platformSummary: {
      totalPlatformRevenue: 0,
      totalWorkshopRevenue: 0,
      totalTransactions: 0,
      activeWorkshops: 0,
      averageCommissionRate: 0,
      monthlyGrowth: 0
    },
    workshopRanking: [],
    monthlyTrends: [],
    commissionBreakdown: [],
    recentTransactions: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.userType !== 'admin') {
      toast.error('Acesso negado. Área restrita para administradores.');
      navigate('/');
      return;
    }

    loadAdminFinancialData();
  }, [user, navigate, dateRange, startDate, endDate]);

  const loadAdminFinancialData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados de pagamento da plataforma
      const paymentsResponse = await paymentService.getPaymentStats();
      
      // Buscar todos os agendamentos
      const appointmentsResponse = await appointmentService.getAllAppointments();
      
      // Buscar oficinas ativas
      const workshopsResponse = await userService.getWorkshops();
      
      // Processar dados administrativos
      processAdminFinancialData(
        paymentsResponse.data || [],
        appointmentsResponse.data || [],
        workshopsResponse.data || []
      );
      
    } catch (error) {
      console.error('Erro ao carregar dados financeiros administrativos:', error);
      toast.error('Erro ao carregar relatórios administrativos');
      
      // Dados vazios em caso de erro
      setReportData({
        platformSummary: {
          totalPlatformRevenue: 0,
          totalWorkshopRevenue: 0,
          totalTransactions: 0,
          activeWorkshops: 0,
          averageCommissionRate: 0,
          monthlyGrowth: 0
        },
        workshopRanking: [],
        monthlyTrends: [],
        commissionBreakdown: [],
        recentTransactions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const processAdminFinancialData = (payments, appointments, workshops) => {
    const dates = getDateRange();
    
    // Filtrar agendamentos pelo período
    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= dates.start && aptDate <= dates.end && apt.status === 'completed';
    });
    
    // Calcular receita total da plataforma (comissões)
    const totalPlatformRevenue = filteredAppointments.reduce((sum, apt) => sum + (apt.platformFee || 0), 0);
    
    // Calcular receita total das oficinas
    const totalWorkshopRevenue = filteredAppointments.reduce((sum, apt) => {
      return sum + ((apt.totalPrice || 0) - (apt.platformFee || 0));
    }, 0);
    
    // Processar ranking de oficinas
    const workshopRanking = processWorkshopRanking(filteredAppointments, workshops);
    
    // Processar tendências mensais
    const monthlyTrends = processMonthlyTrends(filteredAppointments);
    
    // Processar breakdown de comissões
    const commissionBreakdown = processCommissionBreakdown(filteredAppointments);
    
    setReportData({
      platformSummary: {
        totalPlatformRevenue,
        totalWorkshopRevenue,
        totalTransactions: filteredAppointments.length,
        activeWorkshops: workshops.filter(w => w.isActive).length,
        averageCommissionRate: 10, // Seria calculado baseado nas configurações
        monthlyGrowth: 0 // Seria calculado comparando com período anterior
      },
      workshopRanking,
      monthlyTrends,
      commissionBreakdown,
      recentTransactions: filteredAppointments.slice(0, 10)
    });
  };

  const getDateRange = () => {
    const end = new Date();
    let start = new Date();
    
    switch (dateRange) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      case 'custom':
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start.setMonth(end.getMonth() - 1);
    }
    
    return { start, end };
  };

  const processWorkshopRanking = (appointments, workshops) => {
    const workshopMap = new Map();
    
    appointments.forEach(apt => {
      const workshopId = apt.workshopId || apt.workshop?.id;
      if (!workshopId) return;
      
      if (!workshopMap.has(workshopId)) {
        const workshop = workshops.find(w => w.id === workshopId);
        workshopMap.set(workshopId, {
          id: workshopId,
          name: workshop?.name || 'Oficina Desconhecida',
          totalRevenue: 0,
          platformFees: 0,
          transactions: 0,
          averageTicket: 0
        });
      }
      
      const data = workshopMap.get(workshopId);
      data.totalRevenue += apt.totalPrice || 0;
      data.platformFees += apt.platformFee || 0;
      data.transactions += 1;
    });
    
    return Array.from(workshopMap.values())
      .map(workshop => ({
        ...workshop,
        averageTicket: workshop.transactions > 0 ? workshop.totalRevenue / workshop.transactions : 0
      }))
      .sort((a, b) => b.platformFees - a.platformFees)
      .slice(0, 10);
  };

  const processMonthlyTrends = (appointments) => {
    const monthlyMap = new Map();
    
    appointments.forEach(apt => {
      const month = new Date(apt.date).toISOString().slice(0, 7);
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          platformRevenue: 0,
          workshopRevenue: 0,
          transactions: 0
        });
      }
      
      const data = monthlyMap.get(month);
      data.platformRevenue += apt.platformFee || 0;
      data.workshopRevenue += (apt.totalPrice || 0) - (apt.platformFee || 0);
      data.transactions += 1;
    });
    
    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  };

  const processCommissionBreakdown = (appointments) => {
    const serviceMap = new Map();
    
    appointments.forEach(apt => {
      const service = apt.serviceType || apt.service || 'Outros';
      if (!serviceMap.has(service)) {
        serviceMap.set(service, {
          service,
          platformRevenue: 0,
          transactions: 0,
          percentage: 0
        });
      }
      
      const data = serviceMap.get(service);
      data.platformRevenue += apt.platformFee || 0;
      data.transactions += 1;
    });
    
    const totalPlatformRevenue = Array.from(serviceMap.values()).reduce((sum, item) => sum + item.platformRevenue, 0);
    
    return Array.from(serviceMap.values())
      .map(item => ({
        ...item,
        percentage: totalPlatformRevenue > 0 ? (item.platformRevenue / totalPlatformRevenue) * 100 : 0
      }))
      .sort((a, b) => b.platformRevenue - a.platformRevenue);
  };



  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExportReport = () => {
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  const renderPlatformSummary = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Receita da Plataforma
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  R$ {reportData.platformSummary.totalPlatformRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: 'success.main', mt: 1 }}>
                  +{reportData.platformSummary.monthlyGrowth}% este mês
                </Typography>
              </Box>
              <MonetizationOn sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Receita das Oficinas
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  R$ {reportData.platformSummary.totalWorkshopRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {reportData.platformSummary.totalTransactions} transações
                </Typography>
              </Box>
              <AccountBalance sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Oficinas Ativas
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {reportData.platformSummary.activeWorkshops}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Taxa média: {reportData.platformSummary.averageCommissionRate}%
                </Typography>
              </Box>
              <Business sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderWorkshopRanking = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Ranking de Oficinas por Comissão
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Posição</TableCell>
                <TableCell>Oficina</TableCell>
                <TableCell>Receita Total</TableCell>
                <TableCell>Comissão Plataforma</TableCell>
                <TableCell>Transações</TableCell>
                <TableCell>Ticket Médio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.workshopRanking.map((workshop, index) => (
                <TableRow key={workshop.id}>
                  <TableCell>
                    <Chip 
                      label={index + 1} 
                      color={index < 3 ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {workshop.name}
                  </TableCell>
                  <TableCell>
                    R$ {workshop.totalRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                    R$ {workshop.platformFees.toLocaleString()}
                  </TableCell>
                  <TableCell>{workshop.transactions}</TableCell>
                  <TableCell>
                    R$ {workshop.averageTicket.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Tendências Mensais
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mês</TableCell>
                    <TableCell>Receita Plataforma</TableCell>
                    <TableCell>Receita Oficinas</TableCell>
                    <TableCell>Transações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.monthlyTrends.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(data.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>
                        R$ {data.platformRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        R$ {data.workshopRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell>{data.transactions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Comissão por Tipo de Serviço
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Comissão</TableCell>
                    <TableCell>Qtd</TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.commissionBreakdown.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell>{service.service}</TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>
                        R$ {service.platformRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell>{service.transactions}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={service.percentage} 
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {service.percentage.toFixed(1)}%
                          </Typography>
                        </Box>
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

  const renderRecentTransactions = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Transações Recentes
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Oficina</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Serviço</TableCell>
                <TableCell>Valor Total</TableCell>
                <TableCell>Comissão</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.recentTransactions.slice(0, 10).map((transaction, index) => (
                <TableRow key={transaction.id || index}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {transaction.workshop?.name || transaction.workshop}
                  </TableCell>
                  <TableCell>
                    {transaction.cyclist?.name || transaction.customer}
                  </TableCell>
                  <TableCell>
                    {transaction.serviceType || transaction.service}
                  </TableCell>
                  <TableCell>
                    R$ {(transaction.totalPrice || transaction.total || 0).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                    R$ {(transaction.platformFee || transaction.fee || 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Relatórios Financeiros - Administração
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visão geral da performance financeira da plataforma
        </Typography>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Período</InputLabel>
                <Select
                  value={dateRange}
                  label="Período"
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <MenuItem value="week">Última Semana</MenuItem>
                  <MenuItem value="month">Último Mês</MenuItem>
                  <MenuItem value="quarter">Último Trimestre</MenuItem>
                  <MenuItem value="year">Último Ano</MenuItem>
                  <MenuItem value="custom">Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {dateRange === 'custom' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data Inicial"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data Final"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportReport}
                fullWidth
              >
                Exportar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Abas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Resumo" />
          <Tab label="Ranking Oficinas" />
          <Tab label="Análises" />
          <Tab label="Transações" />
        </Tabs>
      </Box>

      {/* Conteúdo das abas */}
      {tabValue === 0 && renderPlatformSummary()}
      {tabValue === 1 && renderWorkshopRanking()}
      {tabValue === 2 && renderAnalytics()}
      {tabValue === 3 && renderRecentTransactions()}
    </Container>
  );
};

export default AdminFinancialReports;