import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Button,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  Schedule,
  Assignment,
  Payment,
  CheckCircle,
  Build,
} from '@mui/icons-material';
import BudgetApproval from './BudgetApproval';
import PaymentStatus from './PaymentStatus';
import appointmentService from '../../services/appointmentService';
import { paymentService } from '../../services/paymentService';
import { toast } from 'react-toastify';

const PaymentFlow = ({ appointment, userType, onStatusChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      label: 'Agendamento Confirmado',
      icon: <Schedule />,
      status: 'confirmed'
    },
    {
      label: 'Orçamento',
      icon: <Assignment />,
      status: 'budget_pending'
    },
    {
      label: 'Pagamento',
      icon: <Payment />,
      status: 'payment_pending'
    },
    {
      label: 'Serviço em Andamento',
      icon: <Build />,
      status: 'in_progress'
    },
    {
      label: 'Concluído',
      icon: <CheckCircle />,
      status: 'completed'
    }
  ];

  useEffect(() => {
    updateCurrentStep();
    loadPaymentStatus();
  }, [appointment]);

  const updateCurrentStep = () => {
    const status = appointment.status;
    switch (status) {
      case 'confirmed':
        setCurrentStep(0);
        break;
      case 'budget_pending':
      case 'budget_sent':
      case 'budget_rejected':
        setCurrentStep(1);
        break;
      case 'budget_approved':
      case 'payment_pending':
        setCurrentStep(2);
        break;
      case 'paid':
      case 'in_progress':
        setCurrentStep(3);
        break;
      case 'completed':
        setCurrentStep(4);
        break;
      default:
        setCurrentStep(0);
    }
  };

  const loadPaymentStatus = async () => {
    if (appointment.paymentId) {
      try {
        const status = await paymentService.getPaymentStatus(appointment.paymentId);
        setPaymentStatus(status);
      } catch (error) {
        console.error('Erro ao carregar status do pagamento:', error);
      }
    }
  };

  const handleBudgetApproval = async (budget) => {
    try {
      setLoading(true);
      // Atualizar status do agendamento para budget_approved
      await appointmentService.updateAppointmentStatus(
        appointment.id, 
        'budget_approved', 
        'Orçamento aprovado pelo cliente'
      );
      
      setCurrentStep(2);
      onStatusChange?.('budget_approved');
      toast.success('Orçamento aprovado! Prossiga para o pagamento.');
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
      toast.error('Erro ao processar aprovação do orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetRejection = async (reason) => {
    try {
      setLoading(true);
      // Atualizar status do agendamento para budget_rejected
      await appointmentService.updateAppointmentStatus(
        appointment.id, 
        'budget_rejected', 
        `Orçamento rejeitado: ${reason}`
      );
      
      onStatusChange?.('budget_rejected');
      toast.info('Orçamento rejeitado. A oficina será notificada.');
    } catch (error) {
      console.error('Erro ao processar rejeição:', error);
      toast.error('Erro ao processar rejeição do orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setLoading(true);
      // Atualizar status do agendamento para paid
      await appointmentService.updateAppointmentStatus(
        appointment.id, 
        'paid', 
        'Pagamento confirmado'
      );
      
      setCurrentStep(3);
      setPaymentStatus(paymentData);
      onStatusChange?.('paid');
      toast.success('Pagamento confirmado! A oficina foi notificada.');
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar confirmação do pagamento');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Alert severity="success">
            <Typography variant="h6">Agendamento Confirmado</Typography>
            <Typography>
              Seu agendamento foi confirmado para {appointmentService.formatDateForDisplay(appointment.date)}.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Aguarde a oficina enviar o orçamento para os serviços solicitados.
            </Typography>
          </Alert>
        );

      case 1:
        return (
          <BudgetApproval
            appointment={appointment}
            userType={userType}
            onApproval={handleBudgetApproval}
            onRejection={handleBudgetRejection}
          />
        );

      case 2:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="h6">Orçamento Aprovado</Typography>
              <Typography>
                O orçamento foi aprovado. Realize o pagamento para que a oficina inicie o serviço.
              </Typography>
            </Alert>
            
            <PaymentStatus
              appointment={appointment}
              paymentStatus={paymentStatus}
              onPaymentSuccess={handlePaymentSuccess}
              userType={userType}
            />
          </Box>
        );

      case 3:
        return (
          <Alert severity="info">
            <Typography variant="h6">Serviço em Andamento</Typography>
            <Typography>
              Pagamento confirmado! A oficina foi notificada e iniciará o serviço em breve.
            </Typography>
            {paymentStatus && (
              <Typography sx={{ mt: 1 }}>
                ID do Pagamento: {paymentStatus.id}
              </Typography>
            )}
          </Alert>
        );

      case 4:
        return (
          <Alert severity="success">
            <Typography variant="h6">Serviço Concluído</Typography>
            <Typography>
              O serviço foi concluído com sucesso! Obrigado por escolher nossa plataforma.
            </Typography>
            {paymentStatus && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Detalhes do Pagamento:</Typography>
                <Typography>ID: {paymentStatus.id}</Typography>
                <Typography>Valor: R$ {paymentStatus.amount?.toFixed(2)}</Typography>
                <Typography>Status: {paymentStatus.status}</Typography>
              </Box>
            )}
          </Alert>
        );

      default:
        return null;
    }
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  const getStatusChip = () => {
    const status = appointment.status;
    const statusConfig = {
      'confirmed': { label: 'Confirmado', color: 'info' },
      'budget_pending': { label: 'Aguardando Orçamento', color: 'warning' },
      'budget_sent': { label: 'Orçamento Enviado', color: 'info' },
      'budget_approved': { label: 'Orçamento Aprovado', color: 'success' },
      'budget_rejected': { label: 'Orçamento Rejeitado', color: 'error' },
      'payment_pending': { label: 'Aguardando Pagamento', color: 'warning' },
      'paid': { label: 'Pago', color: 'success' },
      'in_progress': { label: 'Em Andamento', color: 'info' },
      'completed': { label: 'Concluído', color: 'success' },
      'cancelled': { label: 'Cancelado', color: 'error' }
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Fluxo de Pagamento</Typography>
            {getStatusChip()}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Detalhes do Agendamento</Typography>
                <Typography><strong>Oficina:</strong> {appointment.workshop?.name}</Typography>
                <Typography><strong>Data Agendada:</strong> {appointmentService.formatDateForDisplay(appointment.date)}</Typography>
                <Typography><strong>Serviço:</strong> {appointment.serviceType}</Typography>
                {appointment.urgency && (
                  <Typography><strong>Urgência:</strong> {appointmentService.getUrgencyLabel(appointment.urgency)}</Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Stepper activeStep={currentStep} orientation="horizontal" sx={{ mb: 3 }}>
                {steps.map((step, index) => (
                  <Step key={step.label} completed={getStepStatus(index) === 'completed'}>
                    <StepLabel
                      icon={step.icon}
                      sx={{
                        '& .MuiStepLabel-iconContainer': {
                          color: getStepStatus(index) === 'completed' ? 'success.main' :
                                getStepStatus(index) === 'active' ? 'primary.main' : 'grey.400'
                        }
                      }}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {getStepContent(currentStep)}
        </CardContent>
      </Card>

      {appointment.status === 'cancelled' && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Alert severity="error">
              <Typography variant="h6">Agendamento Cancelado</Typography>
              <Typography>
                Este agendamento foi cancelado.
              </Typography>
              {appointment.cancellationReason && (
                <Typography sx={{ mt: 1 }}>
                  Motivo: {appointment.cancellationReason}
                </Typography>
              )}
            </Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PaymentFlow;