import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { paymentService } from '../../services/paymentService';

const PaymentForm = ({ appointment, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Calcular valores
  const totalAmount = appointment.totalCost || 0;
  const platformFee = appointment.platformFee || 0;
  const workshopAmount = totalAmount - platformFee;

  const handleCreatePayment = async () => {
    try {
      setLoading(true);
      setError('');

      const paymentPreference = await paymentService.createPaymentPreference({
        appointmentId: appointment._id,
        amount: totalAmount,
        description: `Serviço de manutenção - ${appointment.workshop?.workshopData?.businessName || 'Oficina'}`,
        payer: {
          name: appointment.cyclist?.name,
          email: appointment.cyclist?.email,
          phone: appointment.cyclist?.phone
        }
      });

      setPaymentData(paymentPreference);

      // Redirecionar para o Mercado Pago
      if (paymentPreference.init_point) {
        window.open(paymentPreference.init_point, '_blank');
      }

    } catch (err) {
      console.error('Erro ao criar pagamento:', err);
      setError(err.response?.data?.message || 'Erro ao processar pagamento');
      onPaymentError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.id) return;

    try {
      const status = await paymentService.getPaymentStatus(paymentData.id);
      
      if (status.status === 'approved') {
        setSuccess(true);
        onPaymentSuccess?.(status);
      } else if (status.status === 'rejected' || status.status === 'cancelled') {
        setError('Pagamento não foi aprovado. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
  };

  // Verificar status do pagamento periodicamente
  useEffect(() => {
    if (paymentData?.id && !success) {
      const interval = setInterval(checkPaymentStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [paymentData?.id, success]);

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Pagamento Aprovado!
            </h3>
            <p className="text-gray-600">
              Seu pagamento foi processado com sucesso.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagamento Seguro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo do Pagamento */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Serviço:</span>
            <span>R$ {workshopAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Taxa da plataforma:</span>
            <span>R$ {platformFee.toFixed(2)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>R$ {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Informações de Segurança */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4" />
          <span>Pagamento processado pelo Mercado Pago</span>
        </div>

        {/* Botão de Pagamento */}
        <Button 
          onClick={handleCreatePayment}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Pagar com Mercado Pago'
          )}
        </Button>

        {/* Status do Pagamento */}
        {paymentData && (
          <Alert>
            <AlertDescription>
              Aguardando confirmação do pagamento...
            </AlertDescription>
          </Alert>
        )}

        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Informações Adicionais */}
        <div className="text-xs text-gray-500 text-center">
          <p>Você será redirecionado para o Mercado Pago para completar o pagamento.</p>
          <p className="mt-1">Após o pagamento, retorne a esta página para confirmar.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;