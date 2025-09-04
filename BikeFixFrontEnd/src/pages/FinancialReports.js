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
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Assessment,
  DateRange,
  Download,
  FilterList,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentService from '../services/paymentService';
import appointmentService from '../services/appointmentService';

const FinancialReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState({
    summary: {
      totalRevenue: 0,
      grossRevenue: 0,
      netRevenue: 0,
      platformFees: 0,
      totalTransactions: 0,
      averageTicket: 0,
      growth: 0
    },
    transactions: [],
    monthlyData: [],
    serviceBreakdown: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.userType !== 'workshop' && user.userType !== 'admin') {
      toast.error('Acesso negado. Área restrita.');
      navigate('/');
      return;
    }

    loadFinancialData();
  }, [user, navigate, dateRange, startDate, endDate]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Definir datas baseado no range selecionado
      const dates = getDateRange();
      
      // Buscar dados de pagamento
      let paymentsResponse;
      if (user.userType === 'workshop') {
        paymentsResponse = await paymentService.getUserPayments(user.id);
      } else {
        paymentsResponse = await paymentService.getPaymentStats();
      }
      
      // Buscar agendamentos para análise detalhada
      let appointmentsResponse;
      if (user.userType === 'workshop') {
        appointmentsResponse = await appointmentService.getWorkshopAppointments(user.id);
      } else {
        appointmentsResponse = await appointmentService.getAllAppointments();
      }
      
      // Processar dados
      processFinancialData(paymentsResponse.data || [], appointmentsResponse.data || [], dates);
      
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast.error('Erro ao carregar relatórios financeiros');
      
      // Dados vazios em caso de erro
      setReportData({
        summary: {
          totalRevenue: 0,
          grossRevenue: 0,
          netRevenue: 0,
          platformFees: 0,
          totalTransactions: 0,
          averageTicket: 0,
          growth: 0
        },
        transactions: [],
        monthlyData: [],
        serviceBreakdown: []
      });
    } finally {
      setLoading(false);
    }
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

  const processFinancialData = (payments, appointments, dateRange) => {
    // Filtrar dados pelo período
    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= dateRange.start && aptDate <= dateRange.end && apt.status === 'completed';
    });
    
    // Calcular resumo
    const grossRevenue = filteredAppointments.reduce((sum, apt) => sum + (apt.totalPrice || 0), 0);
    const platformFees = filteredAppointments.reduce((sum, apt) => sum + (apt.platformFee || 0), 0);
    const netRevenue = grossRevenue - platformFees;
    const totalTransactions = filteredAppointments.length;
    const averageTicket = totalTransactions > 0 ? grossRevenue / totalTransactions : 0;
    
    // Processar dados mensais
    const monthlyData = processMonthlyData(filteredAppointments);
    
    // Processar breakdown por serviço
    const serviceBreakdown = processServiceBreakdown(filteredAppointments);
    
    setReportData({
      summary: {
        totalRevenue: grossRevenue,
        grossRevenue,
        netRevenue,
        platformFees,
        totalTransactions,
        averageTicket,
        growth: 0 // Seria calculado comparando com período anterior
      },
      transactions: filteredAppointments,
      monthlyData,
      serviceBreakdown
    });
  };

  const processMonthlyData = (appointments) => {
    const monthlyMap = new Map();
    
    appointments.forEach(apt => {
      const month = new Date(apt.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          revenue: 0,
          transactions: 0,
          platformFees: 0
        });
      }
      
      const data = monthlyMap.get(month);
      data.revenue += apt.totalPrice || 0;
      data.transactions += 1;
      data.platformFees += apt.platformFee || 0;
    });
    
    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  };

  const processServiceBreakdown = (appointments) => {
    const serviceMap = new Map();
    
    appointments.forEach(apt => {
      const service = apt.serviceType || apt.service || 'Outros';
      if (!serviceMap.has(service)) {
        serviceMap.set(service, {
          service,
          revenue: 0,
          transactions: 0,
          percentage: 0
        });
      }
      
      const data = serviceMap.get(service);
      data.revenue += apt.totalPrice || 0;
      data.transactions += 1;
    });
    
    const totalRevenue = Array.from(serviceMap.values()).reduce((sum, item) => sum + item.revenue, 0);
    
    return Array.from(serviceMap.values()).map(item => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  };



  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExportReport = () => {
    // Implementar exportação para CSV/PDF
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  const renderSummary = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Receita Bruta
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  R$ {reportData.summary.grossRevenue.toLocaleString()}
                </Typography>
              </Box>
              <AttachMoney sx={{ fontSize: 40, color: 'primary.main' }} />
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
                  Taxa da Plataforma
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  R$ {reportData.summary.platformFees.toLocaleString()}
                </Typography>
              </Box>
              <TrendingDown sx={{ fontSize: 40, color: 'warning.main' }} />
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
                  Receita Líquida
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  R$ {reportData.summary.netRevenue.toLocaleString()}
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
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
                  Ticket Médio
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  R$ {reportData.summary.averageTicket.toLocaleString()}
                </Typography>
              </Box>
              <Assessment sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTransactions = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Transações Detalhadas
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Serviço</TableCell>
                <TableCell>Valor Bruto</TableCell>
                <TableCell>Taxa Plataforma</TableCell>
                <TableCell>Valor Líquido</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.transactions.slice(0, 10).map((transaction, index) => (
                <TableRow key={transaction.id || index}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {transaction.cyclist?.name || transaction.customerName || transaction.customer}
                  </TableCell>
                  <TableCell>
                    {transaction.serviceType || transaction.service}
                  </TableCell>
                  <TableCell>
                    R$ {(transaction.totalPrice || transaction.gross || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    R$ {(transaction.platformFee || transaction.fee || 0).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                    R$ {((transaction.totalPrice || transaction.gross || 0) - (transaction.platformFee || transaction.fee || 0)).toLocaleString()}
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
              Evolução Mensal
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mês</TableCell>
                    <TableCell>Receita</TableCell>
                    <TableCell>Transações</TableCell>
                    <TableCell>Taxa Plataforma</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.monthlyData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(data.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </TableCell>
                      <TableCell>R$ {data.revenue.toLocaleString()}</TableCell>
                      <TableCell>{data.transactions}</TableCell>
                      <TableCell>R$ {data.platformFees.toLocaleString()}</TableCell>
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
              Breakdown por Serviço
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Receita</TableCell>
                    <TableCell>Qtd</TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.serviceBreakdown.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell>{service.service}</TableCell>
                      <TableCell>R$ {service.revenue.toLocaleString()}</TableCell>
                      <TableCell>{service.transactions}</TableCell>
                      <TableCell>{service.percentage.toFixed(1)}%</TableCell>
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
          Relatórios Financeiros
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Análise detalhada da performance financeira
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
          <Tab label="Transações" />
          <Tab label="Análises" />
        </Tabs>
      </Box>

      {/* Conteúdo das abas */}
      {tabValue === 0 && renderSummary()}
      {tabValue === 1 && renderTransactions()}
      {tabValue === 2 && renderAnalytics()}
    </Container>
  );
};

export default FinancialReports;