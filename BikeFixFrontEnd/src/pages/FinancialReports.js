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
      console.log('📅 Date range:', dates);
      
      // Buscar dados de pagamento
      let paymentsResponse = { data: [] };
      try {
        if (user.userType === 'workshop') {
          console.log('🔍 Buscando pagamentos da oficina...');
          paymentsResponse = await paymentService.getUserPayments();
        } else {
          console.log('🔍 Buscando estatísticas de pagamento...');
          paymentsResponse = await paymentService.getPaymentStats();
        }
        console.log('💰 Payments response:', paymentsResponse);
      } catch (paymentError) {
        console.error('❌ Erro ao buscar pagamentos:', paymentError);
        console.error('❌ Detalhes do erro de pagamento:', paymentError.response?.data || paymentError.message);
      }
      
      // Buscar agendamentos para análise detalhada
      let appointmentsResponse = { data: [] };
      try {
        if (user.userType === 'workshop') {
          console.log('🔍 Buscando agendamentos da oficina...');
          appointmentsResponse = await appointmentService.getWorkshopAppointments();
        } else {
          console.log('🔍 Buscando agendamentos do usuário...');
          appointmentsResponse = await appointmentService.getUserAppointments();
        }
        console.log('📋 Appointments response:', appointmentsResponse);
      } catch (appointmentError) {
        console.error('❌ Erro ao buscar agendamentos:', appointmentError);
        console.error('❌ Detalhes do erro de agendamento:', appointmentError.response?.data || appointmentError.message);
      }
      
      // Processar dados com validação
      const paymentsData = Array.isArray(paymentsResponse?.data) ? paymentsResponse.data : [];
      const appointmentsData = Array.isArray(appointmentsResponse?.data) ? appointmentsResponse.data : [];
      
      console.log('🔍 Dados de pagamentos extraídos:', paymentsData.length, 'itens');
      console.log('🔍 Dados de agendamentos extraídos:', appointmentsData.length, 'itens');
      
      if (paymentsData.length === 0 && appointmentsData.length === 0) {
        console.log('⚠️ Nenhum dado encontrado para o período selecionado');
        toast.info('Nenhum dado financeiro encontrado para o período selecionado');
      }
      
      processFinancialData(paymentsData, appointmentsData, dates);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados financeiros:', error);
      console.error('❌ Detalhes do erro:', error.response?.data || error.message);
      toast.error(`Erro ao carregar relatórios financeiros: ${error.response?.data?.message || error.message}`);
      
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
    let end = new Date();
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
    console.log('🔄 Processando dados financeiros...');
    console.log('📊 Appointments recebidos:', appointments.length);
    console.log('💳 Payments recebidos:', payments.length);
    console.log('📅 Período:', dateRange);
    
    // Validar se dateRange está definido
    if (!dateRange || !dateRange.start || !dateRange.end) {
      console.error('❌ DateRange inválido:', dateRange);
      // Definir dados vazios mas válidos
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
      return;
    }
    
    // Se não há pagamentos, usar dados dos agendamentos completados
    if (payments.length === 0) {
      console.log('⚠️ Nenhum pagamento encontrado, usando dados dos agendamentos completados');
      
      // Filtrar agendamentos completados
      const completedAppointments = appointments.filter(apt => {
        return apt && apt.status === 'completed';
      });
      console.log('✅ Agendamentos completados encontrados:', completedAppointments.length);
      console.log('📋 Agendamentos completados:', completedAppointments);
      
      // Se não há agendamentos completados, definir dados vazios
      if (completedAppointments.length === 0) {
        console.log('⚠️ Nenhum agendamento completado encontrado');
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
        return;
      }
      
      // Usar agendamentos completados como base para os relatórios
      const filteredCompletedAppointments = completedAppointments.filter(apt => {
        if (!apt.date) {
          console.warn('⚠️ Agendamento sem data:', apt);
          return false;
        }
        
        const aptDate = new Date(apt.date);
        if (isNaN(aptDate.getTime())) {
          console.warn('⚠️ Data inválida no agendamento:', apt.date, apt);
          return false;
        }
        
        const isInRange = aptDate >= dateRange.start && aptDate <= dateRange.end;
        console.log('📅 Filtro de data:', {
          appointmentDate: aptDate.toISOString(),
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          isInRange
        });
        
        return isInRange;
      });
      
      // Calcular resumo baseado nos agendamentos
      console.log('💰 Calculando valores financeiros para', filteredCompletedAppointments.length, 'agendamentos');
      
      // Se não há agendamentos no período, definir dados vazios
      if (filteredCompletedAppointments.length === 0) {
        console.log('⚠️ Nenhum agendamento encontrado no período selecionado');
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
        return;
      }
      
      const grossRevenue = filteredCompletedAppointments.reduce((sum, apt) => {
        const price = parseFloat(apt.pricing?.totalPrice || apt.totalPrice || apt.price || 0);
        console.log('💵 Preço do agendamento:', apt.id, price);
        return sum + price;
      }, 0);
      
      const platformFees = filteredCompletedAppointments.reduce((sum, apt) => {
        const fee = parseFloat(apt.pricing?.platformFee || apt.platformFee || apt.fee || 0);
        return sum + fee;
      }, 0);
      
      const netRevenue = grossRevenue - platformFees;
      const totalTransactions = filteredCompletedAppointments.length;
      const averageTicket = totalTransactions > 0 ? grossRevenue / totalTransactions : 0;
      
      console.log('📊 Resumo financeiro calculado:', {
        grossRevenue,
        platformFees,
        netRevenue,
        totalTransactions,
        averageTicket
      });
      
      // Processar dados mensais
      const monthlyData = processMonthlyData(filteredCompletedAppointments);
      
      // Processar breakdown por serviço
      const serviceBreakdown = processServiceBreakdown(filteredCompletedAppointments);
      
      setReportData({
        summary: {
          totalRevenue: grossRevenue,
          grossRevenue,
          netRevenue,
          platformFees,
          totalTransactions,
          averageTicket,
          growth: 0
        },
        transactions: filteredCompletedAppointments,
        monthlyData,
        serviceBreakdown
      });
      return;
    }
    
    // Filtrar dados pelo período (lógica original para quando há pagamentos)
    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= dateRange.start && aptDate <= dateRange.end && apt.status === 'completed';
    });
    
    console.log('✅ Agendamentos filtrados (completed):', filteredAppointments.length);
    console.log('📋 Agendamentos filtrados:', filteredAppointments);
    
    // Calcular resumo
    const grossRevenue = filteredAppointments.reduce((sum, apt) => sum + (apt.pricing?.totalPrice || apt.totalPrice || 0), 0);
    const platformFees = filteredAppointments.reduce((sum, apt) => sum + (apt.pricing?.platformFee || apt.platformFee || 0), 0);
    const netRevenue = grossRevenue - platformFees;
    const totalTransactions = filteredAppointments.length;
    const averageTicket = totalTransactions > 0 ? grossRevenue / totalTransactions : 0;
    
    console.log('💰 Receita bruta:', grossRevenue);
    console.log('🏦 Taxas da plataforma:', platformFees);
    console.log('💵 Receita líquida:', netRevenue);
    
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
    console.log('📊 Processando dados mensais para', appointments.length, 'agendamentos');
    const monthlyMap = new Map();
    
    appointments.forEach(apt => {
      if (!apt.date) {
        console.warn('⚠️ Agendamento sem data no processamento mensal:', apt);
        return;
      }
      
      const aptDate = new Date(apt.date);
      if (isNaN(aptDate.getTime())) {
        console.warn('⚠️ Data inválida no processamento mensal:', apt.date);
        return;
      }
      
      const month = aptDate.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          revenue: 0,
          transactions: 0,
          platformFees: 0
        });
      }
      
      const data = monthlyMap.get(month);
      const revenue = parseFloat(apt.pricing?.totalPrice || apt.totalPrice || apt.price || 0);
      const fee = parseFloat(apt.pricing?.platformFee || apt.platformFee || apt.fee || 0);
      
      data.revenue += revenue;
      data.transactions += 1;
      data.platformFees += fee;
    });
    
    const result = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    console.log('📈 Dados mensais processados:', result);
    return result;
  };

  const processServiceBreakdown = (appointments) => {
    console.log('🔧 Processando breakdown de serviços para', appointments.length, 'agendamentos');
    const serviceMap = new Map();
    
    appointments.forEach(apt => {
      const service = apt.serviceType || apt.service || apt.serviceName || 'Outros';
      if (!serviceMap.has(service)) {
        serviceMap.set(service, {
          service,
          revenue: 0,
          transactions: 0,
          percentage: 0
        });
      }
      
      const data = serviceMap.get(service);
      const revenue = parseFloat(apt.pricing?.totalPrice || apt.totalPrice || apt.price || 0);
      data.revenue += revenue;
      data.transactions += 1;
    });
    
    const totalRevenue = Array.from(serviceMap.values()).reduce((sum, item) => sum + item.revenue, 0);
    
    const result = Array.from(serviceMap.values()).map(item => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
    
    console.log('🔧 Breakdown de serviços processado:', result);
    return result;
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
        {reportData.transactions.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Nenhuma transação encontrada para o período selecionado.
          </Alert>
        ) : (
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
                  <TableRow key={transaction._id || transaction.id || index}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {transaction.cyclist?.name || transaction.customerName || transaction.customer || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {transaction.serviceType || transaction.service || transaction.serviceName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      R$ {(parseFloat(transaction.pricing?.totalPrice || transaction.totalPrice || transaction.price || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      R$ {(parseFloat(transaction.pricing?.platformFee || transaction.platformFee || transaction.fee || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                      R$ {((parseFloat(transaction.pricing?.totalPrice || transaction.totalPrice || transaction.price || 0)) - (parseFloat(transaction.pricing?.platformFee || transaction.platformFee || transaction.fee || 0))).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
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
            {reportData.monthlyData.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Nenhum dado mensal encontrado para o período selecionado.
              </Alert>
            ) : (
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
                        <TableCell>R$ {(data.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{data.transactions || 0}</TableCell>
                        <TableCell>R$ {(data.platformFees || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Breakdown por Serviço
            </Typography>
            {reportData.serviceBreakdown.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Nenhum dado de serviço encontrado para o período selecionado.
              </Alert>
            ) : (
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
                        <TableCell>{service.service || 'N/A'}</TableCell>
                        <TableCell>R$ {(service.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{service.transactions || 0}</TableCell>
                        <TableCell>{(service.percentage || 0).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
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