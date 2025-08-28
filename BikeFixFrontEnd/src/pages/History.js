import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  GetApp,
  FilterList,
  Search,
  CalendarToday,
  Build,
  Star,
  Receipt,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import appointmentService from '../services/appointmentService';
import { toast } from 'react-toastify';

const History = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    workshop: '',
    search: ''
  });

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    totalSpent: 0
  });

  useEffect(() => {
    loadAppointments();
    loadStats();
  }, [page, rowsPerPage, filters]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getUserAppointments({
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      });
      
      if (response.success) {
        setAppointments(response.data || []);
        setTotalCount(response.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await appointmentService.getUserAppointments();
      if (response.success) {
        const allAppointments = response.data || [];
        const completed = allAppointments.filter(a => a.status === 'completed');
        const cancelled = allAppointments.filter(a => a.status === 'cancelled');
        const totalSpent = completed.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
        
        setStats({
          total: allAppointments.length,
          completed: completed.length,
          cancelled: cancelled.length,
          totalSpent
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateFrom: '',
      dateTo: '',
      workshop: '',
      search: ''
    });
    setPage(0);
  };

  const openDetailDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedAppointment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'confirmed': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'in_progress': return 'primary';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'in_progress': return 'Em Andamento';
      default: return status;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Histórico de Agendamentos
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Acompanhe todos os seus agendamentos e serviços realizados
        </Typography>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CalendarToday sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Agendamentos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Build sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Serviços Concluídos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {formatCurrency(stats.totalSpent)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Investido
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {stats.cancelled}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cancelamentos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filtros</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="confirmed">Confirmado</MenuItem>
                <MenuItem value="in_progress">Em Andamento</MenuItem>
                <MenuItem value="completed">Concluído</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Data Inicial"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Data Final"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Buscar"
              placeholder="Oficina, serviço..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        </Box>
      </Paper>

      {/* Tabela */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Oficina</TableCell>
                <TableCell>Serviço</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Alert severity="info">
                      Nenhum agendamento encontrado
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatDate(appointment.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {appointment.time}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {appointment.workshop?.name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {appointment.serviceType || 'Personalizado'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(appointment.status)}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(appointment.totalPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver Detalhes">
                        <IconButton
                          size="small"
                          onClick={() => openDetailDialog(appointment)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Dialog de Detalhes */}
      <Dialog
        open={detailDialogOpen}
        onClose={closeDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalhes do Agendamento
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Oficina
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedAppointment.workshop?.name || 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Data e Horário
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formatDate(selectedAppointment.date)} às {selectedAppointment.time}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={getStatusText(selectedAppointment.status)}
                  color={getStatusColor(selectedAppointment.status)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Tipo de Serviço
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedAppointment.serviceType || 'Personalizado'}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Valor Total
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                  {formatCurrency(selectedAppointment.totalPrice)}
                </Typography>
                
                {selectedAppointment.bikeInfo?.model && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Bike
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedAppointment.bikeInfo.model}
                    </Typography>
                  </>
                )}
              </Grid>
              
              {selectedAppointment.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Descrição
                  </Typography>
                  <Typography variant="body1">
                    {selectedAppointment.description}
                  </Typography>
                </Grid>
              )}
              
              {selectedAppointment.services && selectedAppointment.services.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Serviços Solicitados
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedAppointment.services.map((service, index) => (
                      <Chip
                        key={index}
                        label={service.name}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default History;