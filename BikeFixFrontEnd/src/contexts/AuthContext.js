import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authService } from '../services/authService';
import { geocodeAddress } from '../services/backendGeocodingService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se há token salvo ao carregar a aplicação
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = Cookies.get('token');
        if (token) {
          const response = await authService.getProfile();
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          // Se não há token, garantir que o estado está limpo
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Remove token inválido e limpa estado
        Cookies.remove('token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Verificar periodicamente se o token ainda existe
  useEffect(() => {
    const checkTokenPeriodically = () => {
      const token = Cookies.get('token');
      if (!token && isAuthenticated) {
        // Token foi removido (provavelmente pelo interceptor), limpar estado
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    // Verificar a cada 30 segundos se o token ainda existe
    const interval = setInterval(checkTokenPeriodically, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { data } = response;
      const { token, user: userData } = data;
      
      // Salvar token no cookie
      Cookies.set('token', token, { expires: 7 }); // 7 dias
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext - Dados recebidos:', userData);
      
      // Formatar dados conforme esperado pelo backend
      const formattedData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        userType: userData.userType,
        phone: userData.phone
      };
      
      console.log('AuthContext - Dados formatados (base):', formattedData);

      // Adicionar dados específicos do tipo de usuário
      if (userData.userType === 'workshop') {
        const addressData = {
          street: userData.address,
          city: userData.city,
          state: userData.state,
          zipCode: userData.zipCode
        };
        
        // Tentar geocodificar o endereço
        let coordinates = null;
        try {
          if (addressData.street || addressData.city || addressData.zipCode) {
            console.log('Geocodificando endereço da oficina:', addressData);
            
            const geocodeResult = await geocodeAddress(addressData);
            if (geocodeResult && geocodeResult.latitude && geocodeResult.longitude) {
              coordinates = {
                lat: geocodeResult.latitude,
                lng: geocodeResult.longitude
              };
              console.log('Coordenadas obtidas:', coordinates);
            } else {
              console.warn('Geocodificação não retornou coordenadas válidas');
            }
          }
        } catch (error) {
          console.warn('Erro na geocodificação, continuando sem coordenadas:', error.message);
        }
        
        formattedData.workshopData = {
          businessName: userData.workshopName,
          cnpj: userData.cnpj,
          address: {
            ...addressData,
            coordinates: coordinates
          },
          description: userData.description,
          services: userData.services
        };
      } else if (userData.userType === 'cyclist') {
        const addressData = {
          street: userData.address,
          city: userData.city,
          state: userData.state,
          zipCode: userData.zipCode
        };
        
        // Tentar geocodificar o endereço
        let coordinates = null;
        try {
          if (addressData.street || addressData.city || addressData.zipCode) {
            console.log('Geocodificando endereço do ciclista:', addressData);
            
            const geocodeResult = await geocodeAddress(addressData);
            if (geocodeResult && geocodeResult.latitude && geocodeResult.longitude) {
              coordinates = {
                lat: geocodeResult.latitude,
                lng: geocodeResult.longitude
              };
              console.log('Coordenadas obtidas:', coordinates);
            } else {
              console.warn('Geocodificação não retornou coordenadas válidas');
            }
          }
        } catch (error) {
          console.warn('Erro na geocodificação, continuando sem coordenadas:', error.message);
        }
        
        formattedData.cyclistData = {
          bikeType: userData.bikeType,
          address: {
            ...addressData,
            coordinates: coordinates
          },
          bikes: userData.bikes || []
        };
      }

      console.log('AuthContext - Dados finais enviados:', formattedData);
      const response = await authService.register(formattedData);
      console.log('AuthContext - Resposta do backend:', response);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao registrar usuário' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar estado local independentemente do resultado da API
      Cookies.remove('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao atualizar perfil' 
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      return { success: true, message: 'Senha alterada com sucesso' };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao alterar senha' 
      };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await authService.requestPasswordReset(email);
      return { success: true, message: 'Email de recuperação enviado' };
    } catch (error) {
      console.error('Erro ao solicitar recuperação:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao solicitar recuperação de senha' 
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await authService.resetPassword(token, newPassword);
      return { success: true, message: 'Senha redefinida com sucesso' };
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao redefinir senha' 
      };
    }
  };

  const verifyEmail = async (token) => {
    try {
      await authService.verifyEmail(token);
      // Atualizar dados do usuário após verificação
      const userData = await authService.getProfile();
      setUser(userData);
      return { success: true, message: 'Email verificado com sucesso' };
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao verificar email' 
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};