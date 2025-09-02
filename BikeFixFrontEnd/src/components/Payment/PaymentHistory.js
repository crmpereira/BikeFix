import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Calendar, 
  CreditCard, 
  Download, 
  Filter, 
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';

const PaymentHistory = ({ userId, userType = 'cyclist' }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await paymentService.getUserPayments(filters);
      setPayments(response.payments || []);
      setTotalPages(response.totalPages || 1);

      // Carregar estatísticas se for oficina ou admin
      if (userType !== 'cyclist') {
        const statsResponse = await paymentService.getPaymentStats({
          startDate: filters.startDate,
          endDate: filters.endDate
        });
        setStats(statsResponse);
      }

    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
      setError('Erro ao carregar histórico de pagamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset para primeira página
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getStatusBadgeVariant = (status) => {
    const color = paymentService.getPaymentStatusColor(status);
    const variantMap = {
      'green': 'default',
      'yellow': 'secondary',
      'blue': 'outline',
      'red': 'destructive',
      'gray': 'secondary'
    };
    return variantMap[color] || 'secondary';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas (para oficinas e admins) */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {paymentService.formatCurrency(stats.totalRevenue || 0)}
              </div>
              <p className="text-sm text-gray-600">Receita Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalTransactions || 0}
              </div>
              <p className="text-sm text-gray-600">Transações</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {paymentService.formatCurrency(stats.platformFees || 0)}
              </div>
              <p className="text-sm text-gray-600">Taxas da Plataforma</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {paymentService.formatCurrency(stats.workshopRevenue || 0)}
              </div>
              <p className="text-sm text-gray-600">Receita Líquida</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
                <option value="cancelled">Cancelado</option>
                <option value="refunded">Reembolsado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data Inicial</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data Final</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={loadPayments}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando pagamentos...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pagamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">
                        {payment.description || 'Pagamento de serviço'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {paymentService.getPaymentStatusText(payment.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <p className="font-medium">
                        {paymentService.formatCurrency(payment.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Taxa Plataforma:</span>
                      <p className="font-medium">
                        {paymentService.formatCurrency(payment.platformFee)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Valor Oficina:</span>
                      <p className="font-medium">
                        {paymentService.formatCurrency(payment.workshopAmount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Método:</span>
                      <p className="font-medium capitalize">
                        {payment.paymentMethod || 'Mercado Pago'}
                      </p>
                    </div>
                  </div>

                  {payment.mercadoPagoData?.transactionId && (
                    <div className="mt-2 text-xs text-gray-500">
                      ID da Transação: {payment.mercadoPagoData.transactionId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {filters.page} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;