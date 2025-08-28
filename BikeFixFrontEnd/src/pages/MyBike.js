import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsBike as BikeIcon,
  CalendarToday as CalendarIcon,
  Build as MaintenanceIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import bikeService from '../services/bikeService';

const MyBike = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [bikeToDelete, setBikeToDelete] = useState(null);
  const [editingBike, setEditingBike] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: '',
    serialNumber: '',
    purchaseDate: null,
    lastMaintenance: null,
    totalKm: 0
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  const bikeTypes = bikeService.getBikeTypes();

  useEffect(() => {
    loadBikes();
  }, []);

  const loadBikes = async () => {
    try {
      setLoading(true);
      const bikesData = await bikeService.getUserBikes();
      // Filtrar elementos undefined ou null
      setBikes(bikesData.filter(bike => bike && typeof bike === 'object'));
    } catch (error) {
      console.error('Erro ao carregar bikes:', error);
      showAlert('Erro ao carregar suas bikes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 5000);
  };

  const handleOpenDialog = (bike = null) => {
    if (bike) {
      setEditingBike(bike);
      setFormData({
        brand: bike.brand || '',
        model: bike.model || '',
        year: bike.year || new Date().getFullYear(),
        type: bike.type || '',
        serialNumber: bike.serialNumber || '',
        purchaseDate: bike.purchaseDate ? new Date(bike.purchaseDate) : null,
        lastMaintenance: bike.lastMaintenance ? new Date(bike.lastMaintenance) : null,
        totalKm: bike.totalKm || 0
      });
    } else {
      setEditingBike(null);
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        type: '',
        serialNumber: '',
        purchaseDate: null,
        lastMaintenance: null,
        totalKm: 0
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBike(null);
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      type: '',
      serialNumber: '',
      purchaseDate: null,
      lastMaintenance: null,
      totalKm: 0
    });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand.trim()) {
      newErrors.brand = 'Marca é obrigatória';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    }
    if (!formData.type) {
      newErrors.type = 'Tipo é obrigatório';
    }
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Ano inválido';
    }
    if (formData.totalKm < 0) {
      newErrors.totalKm = 'Quilometragem não pode ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveBike = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Validação
      const errors = bikeService.validateBikeData(formData);
      if (errors.length > 0) {
        showAlert(errors[0], 'error');
        return;
      }

      const bikeData = bikeService.formatBikeData(formData);
      
      if (editingBike) {
        await bikeService.updateBike(editingBike._id, bikeData);
        showAlert('Bike atualizada com sucesso!');
      } else {
        await bikeService.addBike(bikeData);
        showAlert('Bike adicionada com sucesso!');
      }
      // Sempre recarregar a lista completa para garantir sincronização
      await loadBikes();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar bike:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar bike';
      showAlert(errorMessage, 'error');
    }
  };

  const handleDeleteBike = (bikeId) => {
    const bike = bikes.find(b => b._id === bikeId);
    setBikeToDelete(bike);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteBike = async () => {
    if (bikeToDelete) {
      try {
        await bikeService.deleteBike(bikeToDelete._id);
        setBikes(prev => prev.filter(bike => bike._id !== bikeToDelete._id));
        showAlert('Bike removida com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir bike:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao excluir bike';
        showAlert(errorMessage, 'error');
      }
    }
    setOpenDeleteDialog(false);
    setBikeToDelete(null);
  };

  const cancelDeleteBike = () => {
    setOpenDeleteDialog(false);
    setBikeToDelete(null);
  };

  const getBikeTypeLabel = (type) => {
    const bikeType = bikeTypes.find(t => t.value === type);
    return bikeType ? bikeType.label : type;
  };

  const formatDate = (date) => {
    if (!date) return 'Não informado';
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getMaintenanceStatus = (lastMaintenance) => {
    if (!lastMaintenance) return { label: 'Nunca', color: 'error' };
    
    const daysSince = Math.floor((new Date() - new Date(lastMaintenance)) / (1000 * 60 * 60 * 24));
    
    if (daysSince <= 90) return { label: 'Em dia', color: 'success' };
    if (daysSince <= 180) return { label: 'Atenção', color: 'warning' };
    return { label: 'Atrasada', color: 'error' };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {alert.show && (
          <Alert 
            severity={alert.severity} 
            sx={{ mb: 2 }}
            onClose={() => setAlert({ show: false, message: '', severity: 'success' })}
          >
            {alert.message}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Minhas Bikes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Adicionar Bike
          </Button>
        </Box>

        {bikes.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <BikeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhuma bike cadastrada
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Adicione suas bikes para ter um melhor controle de manutenções e histórico.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Adicionar Primeira Bike
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {bikes.map((bike) => {
              if (!bike) return null;
              const maintenanceStatus = getMaintenanceStatus(bike.lastMaintenance);
              return (
                <Grid item xs={12} md={6} lg={4} key={bike._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {bike.brand} {bike.model}
                          </Typography>
                          <Chip 
                            label={getBikeTypeLabel(bike.type)} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(bike)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteBike(bike._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Ano:</strong> {bike.year}
                        </Typography>
                        {bike.serialNumber && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Número de Série:</strong> {bike.serialNumber}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Quilometragem:</strong> {bike.totalKm.toLocaleString()} km
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Compra:</strong> {formatDate(bike.purchaseDate)}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <MaintenanceIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Última manutenção:
                          </Typography>
                          <Chip 
                            label={maintenanceStatus.label}
                            size="small"
                            color={maintenanceStatus.color}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(bike.lastMaintenance)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Dialog para adicionar/editar bike */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingBike ? 'Editar Bike' : 'Adicionar Nova Bike'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Marca"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  error={!!errors.brand}
                  helperText={errors.brand}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Modelo"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  error={!!errors.model}
                  helperText={errors.model}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ano"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  error={!!errors.year}
                  helperText={errors.year}
                  inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={formData.type}
                    label="Tipo"
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    {bikeTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Número de Série (opcional)"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Data de Compra"
                  value={formData.purchaseDate}
                  onChange={(date) => handleInputChange('purchaseDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  maxDate={new Date()}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Última Manutenção"
                  value={formData.lastMaintenance}
                  onChange={(date) => handleInputChange('lastMaintenance', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  maxDate={new Date()}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quilometragem Total (km)"
                  type="number"
                  value={formData.totalKm}
                  onChange={(e) => handleInputChange('totalKm', parseInt(e.target.value) || 0)}
                  error={!!errors.totalKm}
                  helperText={errors.totalKm}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSaveBike} variant="contained">
              {editingBike ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de confirmação de exclusão */}
        <Dialog
          open={openDeleteDialog}
          onClose={cancelDeleteBike}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Tem certeza que deseja excluir esta bicicleta?
            </Typography>
            {bikeToDelete && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>{bikeToDelete.brand} {bikeToDelete.model}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ano: {bikeToDelete.year} • Tipo: {getBikeTypeLabel(bikeToDelete.type)}
                </Typography>
                {bikeToDelete.serialNumber && (
                  <Typography variant="body2" color="text.secondary">
                    Série: {bikeToDelete.serialNumber}
                  </Typography>
                )}
              </Box>
            )}
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              ⚠️ Esta ação não pode ser desfeita.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDeleteBike} color="inherit">
              Cancelar
            </Button>
            <Button 
              onClick={confirmDeleteBike} 
              color="error" 
              variant="contained"
              startIcon={<DeleteIcon />}
            >
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default MyBike;