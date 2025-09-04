import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
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
  Build as MaintenanceIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import bikeService from '../services/bikeService';

const BikeModal = ({ open, onClose, onBikeAdded }) => {
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
    if (open) {
      loadBikes();
    }
  }, [open]);

  const loadBikes = async () => {
    try {
      setLoading(true);
      const response = await bikeService.getUserBikes();
      setBikes(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar bikes:', error);
      showAlert('Erro ao carregar suas bicicletas', 'error');
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

  const handleSubmit = async () => {
    console.log('🔍 FormData antes da validação:', formData);
    
    if (!validateForm()) {
      console.log('❌ Validação falhou');
      return;
    }

    try {
      const bikeData = {
        ...formData,
        purchaseDate: formData.purchaseDate ? formData.purchaseDate.toISOString() : null,
        lastMaintenance: formData.lastMaintenance ? formData.lastMaintenance.toISOString() : null
      };
      
      console.log('📤 Dados que serão enviados:', bikeData);

      let response;
      if (editingBike) {
        response = await bikeService.updateBike(editingBike._id, bikeData);
        showAlert('Bicicleta atualizada com sucesso!');
      } else {
        response = await bikeService.addBike(bikeData);
        showAlert('Bicicleta cadastrada com sucesso!');
        if (onBikeAdded) {
          onBikeAdded(response.data);
        }
      }

      handleCloseDialog();
      loadBikes();
    } catch (error) {
      console.error('Erro ao salvar bike:', error);
      showAlert('Erro ao salvar bicicleta', 'error');
    }
  };

  const handleDeleteClick = (bike) => {
    setBikeToDelete(bike);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await bikeService.deleteBike(bikeToDelete._id);
      showAlert('Bicicleta removida com sucesso!');
      loadBikes();
    } catch (error) {
      console.error('Erro ao deletar bike:', error);
      showAlert('Erro ao remover bicicleta', 'error');
    } finally {
      setOpenDeleteDialog(false);
      setBikeToDelete(null);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const getBikeTypeLabel = (type) => {
    const bikeType = bikeTypes.find(t => t.value === type);
    return bikeType ? bikeType.label : type;
  };

  const getBikeTypeColor = (type) => {
    const colors = {
      road: 'primary',
      mountain: 'success',
      hybrid: 'warning',
      electric: 'info',
      bmx: 'secondary',
      other: 'default'
    };
    return colors[type] || 'default';
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BikeIcon color="primary" />
              <Typography variant="h6">Minhas Bicicletas</Typography>
            </Box>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {alert.show && (
            <Alert severity={alert.severity} sx={{ mb: 2 }}>
              {alert.message}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {bikes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BikeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Nenhuma bicicleta cadastrada
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Cadastre sua primeira bicicleta para começar a agendar serviços
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Cadastrar Primeira Bike
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {bikes.map((bike) => (
                    <Grid item xs={12} md={6} key={bike._id}>
                      <Card sx={{ height: '100%', position: 'relative' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <BikeIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" component="h3">
                              {bike.brand} {bike.model}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              label={getBikeTypeLabel(bike.type)}
                              color={getBikeTypeColor(bike.type)}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={bike.year}
                              variant="outlined"
                              size="small"
                            />
                          </Box>

                          {bike.serialNumber && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Série: {bike.serialNumber}
                            </Typography>
                          )}

                          {bike.totalKm > 0 && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Quilometragem: {bike.totalKm.toLocaleString()} km
                            </Typography>
                          )}

                          {bike.purchaseDate && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Comprada em: {format(new Date(bike.purchaseDate), 'dd/MM/yyyy', { locale: ptBR })}
                              </Typography>
                            </Box>
                          )}

                          {bike.lastMaintenance && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <MaintenanceIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Última manutenção: {format(new Date(bike.lastMaintenance), 'dd/MM/yyyy', { locale: ptBR })}
                              </Typography>
                            </Box>
                          )}

                          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(bike)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(bike)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fechar</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nova Bicicleta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para adicionar/editar bike */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBike ? 'Editar Bicicleta' : 'Nova Bicicleta'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Marca"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  error={!!errors.brand}
                  helperText={errors.brand}
                  required
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
                  required
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
                  <InputLabel>Tipo *</InputLabel>
                  <Select
                    value={formData.type}
                    label="Tipo *"
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    {bikeTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.type && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Número de Série"
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
                  onChange={(e) => handleInputChange('totalKm', parseFloat(e.target.value) || 0)}
                  error={!!errors.totalKm}
                  helperText={errors.totalKm}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBike ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a bicicleta {bikeToDelete?.brand} {bikeToDelete?.model}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BikeModal;