import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AttachMoney,
  CheckCircle,
  Cancel,
  Edit,
  Visibility,
  Add,
  Delete,
  Info,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import appointmentService from '../../services/appointmentService';
import { paymentService } from '../../services/paymentService';

const BudgetApproval = ({ appointment, onApproval, onRejection, userType }) => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [budgetItems, setBudgetItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', quantity: 1, unitPrice: 0 });
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  useEffect(() => {
    if (appointment?.id) {
      loadBudget();
    }
  }, [appointment]);

  const loadBudget = async () => {
    try {
      setLoading(true);
      const result = await appointmentService.getBudget(appointment.id);
      if (result.success && result.data) {
        setBudget(result.data);
        setBudgetItems(result.data.items || []);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePlatformFee = (subtotal) => {
    const feeRate = 0.05; // 5% de taxa da plataforma
    return subtotal * feeRate;
  };

  const calculateTotal = () => {
    const subtotal = budgetItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const platformFee = calculatePlatformFee(subtotal);
    return {
      subtotal,
      platformFee,
      total: subtotal + platformFee
    };
  };

  const handleAddItem = () => {
    if (newItem.description && newItem.quantity > 0 && newItem.unitPrice >= 0) {
      setBudgetItems([...budgetItems, { ...newItem, id: Date.now() }]);
      setNewItem({ description: '', quantity: 1, unitPrice: 0 });
    }
  };

  const handleRemoveItem = (itemId) => {
    setBudgetItems(budgetItems.filter(item => item.id !== itemId));
  };

  const handleSaveBudget = async () => {
    try {
      setLoading(true);
      const totals = calculateTotal();
      
      const budgetData = {
        appointmentId: appointment.id,
        items: budgetItems,
        subtotal: totals.subtotal,
        platformFee: totals.platformFee,
        total: totals.total,
        status: 'pending'
      };

      const result = await appointmentService.createOrUpdateBudget(budgetData);
      if (result.success) {
        setBudget(result.data);
        setEditing(false);
        toast.success('Orçamento salvo com sucesso!');
      } else {
        toast.error(result.message || 'Erro ao salvar orçamento');
      }
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast.error('Erro ao salvar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBudget = async () => {
    try {
      setLoading(true);
      const result = await appointmentService.approveBudget(appointment.id);
      if (result.success) {
        setBudget({ ...budget, status: 'approved' });
        toast.success('Orçamento aprovado!');
        if (onApproval) onApproval(result.data);
        setShowPaymentDialog(true);
      } else {
        toast.error(result.message || 'Erro ao aprovar orçamento');
      }
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error);
      toast.error('Erro ao aprovar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBudget = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Por favor, informe o motivo da rejeição');
      return;
    }

    try {
      setLoading(true);
      const result = await appointmentService.rejectBudget(appointment.id, rejectionReason);
      if (result.success) {
        setBudget({ ...budget, status: 'rejected', rejectionReason });
        toast.success('Orçamento rejeitado');
        if (onRejection) onRejection(result.data);
        setShowRejectionDialog(false);
        setRejectionReason('');
      } else {
        toast.error(result.message || 'Erro ao rejeitar orçamento');
      }
    } catch (error) {
      console.error('Erro ao rejeitar orçamento:', error);
      toast.error('Erro ao rejeitar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    try {
      setLoading(true);
      const paymentData = {
        appointmentId: appointment.id,
        amount: budget.total,
        description: `Pagamento do agendamento #${appointment.id}`
      };

      const result = await paymentService.createPaymentPreference(paymentData);
      if (result.success && result.data.init_point) {
        window.open(result.data.init_point, '_blank');
        setShowPaymentDialog(false);
      } else {
        toast.error('Erro ao iniciar pagamento');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: 'warning' },
      approved: { label: 'Aprovado', color: 'success' },
      rejected: { label: 'Rejeitado', color: 'error' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading && !budget) {
    return (
      <Card>
        <CardContent>
          <Typography>Carregando orçamento...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney />
              Orçamento do Serviço
            </Typography>
            {budget && getStatusChip(budget.status)}
          </Box>

          {!budget && userType === 'workshop' ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Nenhum orçamento foi criado ainda. Clique em "Criar Orçamento" para começar.
            </Alert>
          ) : null}

          {!budget && userType === 'cyclist' ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              A oficina ainda não enviou o orçamento para este serviço.
            </Alert>
          ) : null}

          {userType === 'workshop' && (!budget || editing) ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {editing ? 'Editar Orçamento' : 'Criar Orçamento'}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Quantidade"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    size="small"
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Preço Unitário"
                    type="number"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    size="small"
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: 'R$ '
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleAddItem}
                    startIcon={<Add />}
                    size="small"
                  >
                    Adicionar
                  </Button>
                </Grid>
              </Grid>

              {budgetItems.length > 0 && (
                <>
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Descrição</TableCell>
                          <TableCell align="right">Quantidade</TableCell>
                          <TableCell align="right">Preço Unit.</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="center">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {budgetItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">R$ {item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell align="right">R$ {(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveItem(item.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Resumo do Orçamento
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>R$ {calculateTotal().subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Taxa da Plataforma (5%):</Typography>
                      <Typography>R$ {calculateTotal().platformFee.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        R$ {calculateTotal().total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditing(false);
                        setBudgetItems(budget?.items || []);
                      }}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveBudget}
                      disabled={budgetItems.length === 0 || loading}
                    >
                      Salvar Orçamento
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          ) : budget ? (
            <>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Descrição</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Preço Unit.</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budget.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">R$ {item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">R$ {(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Resumo do Orçamento
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>R$ {budget.subtotal?.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Taxa da Plataforma (5%):</Typography>
                  <Typography>R$ {budget.platformFee?.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    R$ {budget.total?.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {budget.rejectionReason && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Motivo da rejeição:</Typography>
                  <Typography>{budget.rejectionReason}</Typography>
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                {userType === 'workshop' && budget.status === 'pending' && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                    disabled={loading}
                  >
                    Editar Orçamento
                  </Button>
                )}

                {userType === 'cyclist' && budget.status === 'pending' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={handleApproveBudget}
                      disabled={loading}
                      fullWidth
                    >
                      Aprovar Orçamento
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => setShowRejectionDialog(true)}
                      disabled={loading}
                      fullWidth
                    >
                      Rejeitar
                    </Button>
                  </Box>
                )}

                {userType === 'cyclist' && budget.status === 'approved' && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AttachMoney />}
                    onClick={() => setShowPaymentDialog(true)}
                    disabled={loading}
                    fullWidth
                  >
                    Prosseguir para Pagamento
                  </Button>
                )}
              </Box>
            </>
          ) : userType === 'workshop' ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setEditing(true)}
              disabled={loading}
            >
              Criar Orçamento
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {/* Dialog de Rejeição */}
      <Dialog open={showRejectionDialog} onClose={() => setShowRejectionDialog(false)}>
        <DialogTitle>Rejeitar Orçamento</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motivo da rejeição"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectionDialog(false)}>Cancelar</Button>
          <Button onClick={handleRejectBudget} color="error" disabled={loading}>
            Rejeitar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Pagamento */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)}>
        <DialogTitle>Prosseguir para Pagamento</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Você será redirecionado para o Mercado Pago para realizar o pagamento.
          </Typography>
          <Typography variant="h6" color="primary">
            Total: R$ {budget?.total?.toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleProceedToPayment} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            Prosseguir para Pagamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetApproval;