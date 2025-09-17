import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        // Verificar se houve erro na autenticação
        if (error) {
          let errorMessage = 'Erro na autenticação com Google';
          
          switch (error) {
            case 'auth_error':
              errorMessage = 'Erro interno na autenticação';
              break;
            case 'auth_failed':
              errorMessage = 'Falha na autenticação com Google';
              break;
            case 'token_error':
              errorMessage = 'Erro ao gerar token de acesso';
              break;
            default:
              errorMessage = 'Erro desconhecido na autenticação';
          }
          
          toast.error(errorMessage);
          navigate('/login');
          return;
        }

        // Verificar se recebeu token e dados do usuário
        if (!token || !userParam) {
          toast.error('Dados de autenticação incompletos');
          navigate('/login');
          return;
        }

        // Decodificar dados do usuário
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        // Salvar token e dados do usuário
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Atualizar contexto de autenticação
        setToken(token);
        setUser(userData);
        
        toast.success(`Bem-vindo(a), ${userData.name}!`);
        
        // Redirecionar baseado no tipo de usuário
        let redirectPath = '/dashboard'; // padrão para ciclistas
        
        if (userData.userType === 'workshop') {
          redirectPath = '/workshop-dashboard';
        } else if (userData.userType === 'admin') {
          redirectPath = '/admin';
        }
        
        navigate(redirectPath);
        
      } catch (error) {
        console.error('Erro ao processar callback do Google:', error);
        toast.error('Erro ao processar autenticação');
        navigate('/login');
      }
    };

    processCallback();
  }, [searchParams, navigate, setUser, setToken]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Processando autenticação...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Aguarde enquanto finalizamos seu login
      </Typography>
    </Box>
  );
};

export default AuthCallback;