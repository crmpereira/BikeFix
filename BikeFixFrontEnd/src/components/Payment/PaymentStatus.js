import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Payment,
  CheckCircle,
  Error,
  Schedule,
  Refresh,
  CreditCard,
  AccountBalance,
  Pix,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { paymentService } from '../../services/paymentService';
import appointmentService from '../../services/appointmentService';

const PaymentStatus = ({ appointment, paymentStatus, onPaymentSuccess, userType }) => {
  const [loading, setLoading] = useState(false);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState(paymentStatus);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    loadBudget();
    if (appointment.paymentId && !currentPaymentStatus) {
      checkPaymentStatus();
    }
  }, [appointment]);

  const loadBudget = async () => {
    try {
      const response = await appointmentService.getBudget(appointment.id);
      if (response.success && response.data) {
        setBudget(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      const status = await paymentService.getPaymentStatus(appointment.paymentId);
      setCurrentPaymentStatus(status);
      
      if (status.status === 'approved' && appointment.status !== 'paid') {
        onPaymentSuccess?.(status);
      }
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      toast.error('Erro ao verificar status do pagamento');
    } finally {
      setLoading(false);
    }
  };

  const initializePayment = async () => {
    try {
      setLoading(true);
      
      if (!budget) {
        toast.error('Orçamento não encontrado');
        return;
      }

      const paymentData = {
        appointmentId: appointment.id,
        amount: budget.total,
        description: `Serviço de manutenção - ${appointment.workshop?.name || 'Oficina'}`,
        payer: {
          name: appointment.cyclist?.name || appointment.user?.name,
          email: appointment.cyclist?.email || appointment.user?.email,
          phone: appointment.cyclist?.phone || appointment.user?.phone
        },
        workshopId: appointment.workshop?.id,
        platformFee: budget.platformFee,
        workshopAmount: budget.subtotal
      };

      const paymentPreference = await paymentService.createPaymentPreference(paymentData);
      
      if (paymentPreference.init_point) {
        // Abrir o link de pagamento do Mercado Pago
        window.open(paymentPreference.init_point, '_blank');
        
        // Iniciar verificação periódica do status
        startPaymentStatusCheck(paymentPreference.id);
        
        toast.info('Você foi redirecionado para o Mercado Pago. Complete o pagamento na nova aba.');
      } else {
        toast.error('Erro ao gerar link de pagamento');
      }
    } catch (error) {
      console.error('Erro ao inicializar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const startPaymentStatusCheck = (paymentId) => {
    const checkInterval = setInterval(async () => {
      try {
        const status = await paymentService.getPaymentStatus(paymentId);
        setCurrentPaymentStatus(status);
        
        if (status.status === 'approved') {
          clearInterval(checkInterval);
          onPaymentSuccess?.(status);
          toast.success('Pagamento aprovado!');
        } else if (status.status === 'rejected' || status.status === 'cancelled') {
          clearInterval(checkInterval);
          toast.error('Pagamento não foi aprovado');
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 5000); // Verificar a cada 5 segundos

    // Parar verificação após 10 minutos
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 600000);
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'cancelled': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      case 'cancelled': return 'Cancelado';
      case 'refunded': return 'Reembolsado';
      default: return 'Desconhecido';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card': return <CreditCard />;
      case 'debit_card': return <CreditCard />;
      case 'bank_transfer': return <AccountBalance />;
      case 'pix': return <Pix />;
      default: return <Payment />;
    }
  };

  if (!budget) {
    return (
      <Alert severity="warning">
        <Typography>Aguardando orçamento para processar pagamento</Typography>
      </Alert>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Status do Pagamento</Typography>
          
          {currentPaymentStatus ? (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2">Status:</Typography>
                    <Chip 
                      label={getPaymentStatusLabel(currentPaymentStatus.status)}
                      color={getPaymentStatusColor(currentPaymentStatus.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    ID do Pagamento: {currentPaymentStatus.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valor: R$ {currentPaymentStatus.transaction_amount?.toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  {currentPaymentStatus.status === 'pending' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Aguardando confirmação...</Typography>
                    </Box>
                  )}
                  
                  {currentPaymentStatus.status === 'approved' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                      <CheckCircle />
                      <Typography variant="body2">Pagamento confirmado!</Typography>
                    </Box>
                  )}
                  
                  {(currentPaymentStatus.status === 'rejected' || currentPaymentStatus.status === 'cancelled') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                      <Error />
                      <Typography variant="body2">Pagamento não aprovado</Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={checkPaymentStatus}
                  disabled={loading}
                >
                  Atualizar Status
                </Button>
                
                {(currentPaymentStatus.status === 'rejected' || currentPaymentStatus.status === 'cancelled') && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Payment />}
                    onClick={() => setShowPaymentDialog(true)}
                    disabled={loading}
                  >
                    Tentar Novamente
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography>Pronto para processar o pagamento</Typography>
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Resumo do Pagamento</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>R$ {budget.subtotal?.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Taxa da Plataforma:</Typography>
                      <Typography>R$ {budget.platformFee?.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">
                        R$ {budget.total?.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {userType === 'cyclist' && (
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<Payment />}
                        onClick={initializePayment}
                        disabled={loading}
                        fullWidth
                      >
                        {loading ? 'Processando...' : 'Pagar Agora'}
                      </Button>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" align="center">
                      Pagamento seguro via Mercado Pago
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Métodos de Pagamento */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Escolha o Método de Pagamento</DialogTitle>
        <DialogContent>
          <List>
            <ListItem button onClick={() => setSelectedPaymentMethod('credit_card')}>
              <ListItemIcon>
                <CreditCard />
              </ListItemIcon>
              <ListItemText 
                primary="Cartão de Crédito" 
                secondary="Parcelamento disponível"
              />
            </ListItem>
            
            <ListItem button onClick={() => setSelectedPaymentMethod('debit_card')}>
              <ListItemIcon>
                <CreditCard />
              </ListItemIcon>
              <ListItemText 
                primary="Cartão de Débito" 
                secondary="Débito à vista"
              />
            </ListItem>
            
            <ListItem button onClick={() => setSelectedPaymentMethod('pix')}>
              <ListItemIcon>
                <Pix />
              </ListItemIcon>
              <ListItemText 
                primary="PIX" 
                secondary="Pagamento instantâneo"
              />
            </ListItem>
            
            <ListItem button onClick={() => setSelectedPaymentMethod('bank_transfer')}>
              <ListItemIcon>
                <AccountBalance />
              </ListItemIcon>
              <ListItemText 
                primary="Transferência Bancária" 
                secondary="TED/DOC"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
          <Button 
            onClick={() => {
              setShowPaymentDialog(false);
              initializePayment();
            }}
            variant="contained"
            disabled={!selectedPaymentMethod}
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentStatus;