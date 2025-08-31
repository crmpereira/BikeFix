import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Phone,
  Google,
  DirectionsBike,
  Add,
  Delete,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ServiceSelector from '../components/ServiceSelector';
import { validateCEP } from '../services/cepService';
import { geocodeCEP } from '../services/geocodingService';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: searchParams.get('type') || 'cyclist',
    // Campos específicos para ciclistas
    // Campos para bicicletas do ciclista
    bikes: [],
    // Campos específicos para oficinas
    workshopName: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    services: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const steps = formData.userType === 'cyclist' 
    ? ['Informações Básicas', 'Endereço', 'Cadastro de Bikes', 'Confirmação']
    : ['Informações Básicas', 'Dados Específicos', 'Confirmação'];

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Função para aplicar máscara de telefone brasileiro
  const applyPhoneMask = (value) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara baseada no número de dígitos
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      // Limita a 11 dígitos
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Função para aplicar máscara de CEP
  const applyCEPMask = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
  };

  // Função para buscar endereço por CEP
  const searchByCEP = async (cep) => {
    try {
      if (!validateCEP(cep)) {
        return;
      }

      const coordinates = await geocodeCEP(cep);
      if (coordinates && coordinates.address) {
        setFormData(prev => ({
          ...prev,
          address: coordinates.address.road || coordinates.address.street || '',
          city: coordinates.address.city || coordinates.address.town || coordinates.address.village || '',
          state: coordinates.address.state || ''
        }));
        toast.success('Endereço preenchido automaticamente!');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP. Verifique o código e tente novamente.');
    }
  };

  // Função para aplicar máscara de CNPJ brasileiro
  const applyCnpjMask = (value) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara baseada no número de dígitos
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    } else {
      // Limita a 14 dígitos e aplica máscara completa: XX.XXX.XXX/XXXX-XX
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Aplicar máscara de telefone
    if (name === 'phone') {
      processedValue = applyPhoneMask(value);
    }
    
    // Aplicar máscara de CNPJ
    if (name === 'cnpj') {
      processedValue = applyCnpjMask(value);
    }
    
    // Aplicar máscara de CEP
    if (name === 'zipCode') {
      processedValue = applyCEPMask(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
    
    // Buscar endereço automaticamente quando CEP for preenchido completamente
    if (name === 'zipCode' && processedValue.length === 9) {
      searchByCEP(processedValue);
    }
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      // Validação do primeiro passo
      if (!formData.name) {
        newErrors.name = 'Nome é obrigatório';
      }

      if (!formData.email) {
        newErrors.email = 'Email é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }

      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }

      // Telefone é opcional
      if (formData.phone && formData.phone.length < 10) {
        newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
      }
    } else if (step === 1) {
      // Validação do segundo passo
      if (formData.userType === 'workshop') {
        if (!formData.workshopName) {
          newErrors.workshopName = 'Nome da oficina é obrigatório';
        }
        if (!formData.cnpj) {
          newErrors.cnpj = 'CNPJ é obrigatório';
        } else {
          // Remove caracteres não numéricos para validação
          const cnpjNumbers = formData.cnpj.replace(/\D/g, '');
          if (cnpjNumbers.length !== 14) {
            newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
          }
        }
        if (!formData.address) {
          newErrors.address = 'Endereço é obrigatório';
        }
        if (!formData.city) {
          newErrors.city = 'Cidade é obrigatória';
        }
        if (!formData.state) {
          newErrors.state = 'Estado é obrigatório';
        }
        if (!formData.zipCode) {
          newErrors.zipCode = 'CEP é obrigatório';
        }
        if (!formData.services || formData.services.length === 0) {
          newErrors.services = 'Selecione pelo menos um serviço oferecido';
        }
      }
    } else if (step === 2) {
      // Validação do terceiro passo (cadastro de bikes para ciclistas)
      if (formData.userType === 'cyclist') {
        // Validar bikes se houver alguma cadastrada
        if (formData.bikes && formData.bikes.length > 0) {
          formData.bikes.forEach((bike, index) => {
            if (bike.brand && !bike.model) {
              newErrors[`bike_${index}_model`] = 'Modelo é obrigatório quando marca é preenchida';
            }
            if (bike.model && !bike.brand) {
              newErrors[`bike_${index}_brand`] = 'Marca é obrigatória quando modelo é preenchido';
            }
          });
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register - handleSubmit chamado, activeStep:', activeStep);
    console.log('Register - formData atual:', formData);
    
    const isLastStep = (formData.userType === 'cyclist' && activeStep === 3) || 
                      (formData.userType === 'workshop' && activeStep === 2);
    
    if (!isLastStep) {
      handleNext();
      return;
    }
    
    if (!validateStep(activeStep)) {
      console.log('Register - Validação falhou para step:', activeStep);
      return;
    }
    
    console.log('Register - Validação passou, iniciando registro...');

    setLoading(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        toast.success('Cadastro realizado com sucesso! Verifique seu email.');
        navigate('/login');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    // TODO: Implementar registro com Google
    toast.info('Registro com Google será implementado em breve');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nome Completo"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Senha"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Telefone"
              name="phone"
              placeholder="(47) 99999-9999"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
              <FormLabel component="legend">Tipo de Usuário</FormLabel>
              <RadioGroup
                row
                aria-label="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
              >
                <FormControlLabel value="cyclist" control={<Radio />} label="Ciclista" />
                <FormControlLabel value="workshop" control={<Radio />} label="Oficina" />
              </RadioGroup>
            </FormControl>
          </>
        );
      
      case 1:
        if (formData.userType === 'cyclist') {
          return (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="zipCode"
                label="CEP"
                name="zipCode"
                placeholder="00000-000"
                value={formData.zipCode}
                onChange={handleChange}
                error={!!errors.zipCode}
                helperText={errors.zipCode}
                inputProps={{ maxLength: 9 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="address"
                label="Endereço"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="city"
                  label="Cidade"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={!!errors.city}
                  helperText={errors.city}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="state"
                  label="Estado"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={!!errors.state}
                  helperText={errors.state}
                />
              </Box>
            </>
          );
        } else {
          return (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="workshopName"
                label="Nome da Oficina"
                name="workshopName"
                value={formData.workshopName}
                onChange={handleChange}
                error={!!errors.workshopName}
                helperText={errors.workshopName}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="cnpj"
                label="CNPJ"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                error={!!errors.cnpj}
                helperText={errors.cnpj}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="address"
                label="Endereço"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="city"
                  label="Cidade"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={!!errors.city}
                  helperText={errors.city}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="state"
                  label="Estado"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={!!errors.state}
                  helperText={errors.state}
                />
              </Box>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="zipCode"
                label="CEP"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                error={!!errors.zipCode}
                helperText={errors.zipCode}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="description"
                label="Descrição da Oficina"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                helperText="Descreva os serviços e especialidades da sua oficina"
              />
              
              <Box sx={{ mt: 2 }}>
                <ServiceSelector
                  selectedServices={formData.services}
                  onServicesChange={(services) => setFormData(prev => ({ ...prev, services }))}
                  error={errors.services}
                />
              </Box>
            </>
          );
        }
      
      case 2:
        if (formData.userType === 'cyclist') {
          return (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DirectionsBike color="primary" />
                Cadastre suas Bicicletas
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Adicione pelo menos uma bicicleta para poder fazer agendamentos
              </Typography>
              
              {formData.bikes.map((bike, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Bicicleta {index + 1}
                    </Typography>
                    <IconButton 
                      onClick={() => {
                        const newBikes = formData.bikes.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, bikes: newBikes }));
                      }}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Marca"
                      value={bike.brand || ''}
                      onChange={(e) => {
                        const newBikes = [...formData.bikes];
                        newBikes[index] = { ...newBikes[index], brand: e.target.value };
                        setFormData(prev => ({ ...prev, bikes: newBikes }));
                      }}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Modelo"
                      value={bike.model || ''}
                      onChange={(e) => {
                        const newBikes = [...formData.bikes];
                        newBikes[index] = { ...newBikes[index], model: e.target.value };
                        setFormData(prev => ({ ...prev, bikes: newBikes }));
                      }}
                      required
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Ano"
                      type="number"
                      value={bike.year || ''}
                      onChange={(e) => {
                        const newBikes = [...formData.bikes];
                        newBikes[index] = { ...newBikes[index], year: parseInt(e.target.value) || '' };
                        setFormData(prev => ({ ...prev, bikes: newBikes }));
                      }}
                    />
                    <TextField
                      select
                      fullWidth
                      label="Tipo"
                      value={bike.type || ''}
                      onChange={(e) => {
                        const newBikes = [...formData.bikes];
                        newBikes[index] = { ...newBikes[index], type: e.target.value };
                        setFormData(prev => ({ ...prev, bikes: newBikes }));
                      }}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="mountain">Mountain Bike</option>
                      <option value="road">Speed/Road</option>
                      <option value="urban">Urbana</option>
                      <option value="hybrid">Híbrida</option>
                      <option value="bmx">BMX</option>
                      <option value="electric">Elétrica</option>
                      <option value="other">Outro</option>
                    </TextField>
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Número de Série (opcional)"
                    value={bike.serialNumber || ''}
                    onChange={(e) => {
                      const newBikes = [...formData.bikes];
                      newBikes[index] = { ...newBikes[index], serialNumber: e.target.value };
                      setFormData(prev => ({ ...prev, bikes: newBikes }));
                    }}
                  />
                </Paper>
              ))}
              
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    bikes: [...prev.bikes, { brand: '', model: '', year: '', type: '', serialNumber: '' }]
                  }));
                }}
                sx={{ mb: 2 }}
              >
                Adicionar Bicicleta
              </Button>
              
              {formData.bikes.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Você pode pular esta etapa e cadastrar suas bicicletas depois no seu perfil.
                </Typography>
              )}
            </Box>
          );
        } else {
          // Para oficinas, pular direto para confirmação
          return renderConfirmationStep();
        }
      
      case 3:
          return renderConfirmationStep();
          
        default:
          return null;
      }
    };
    
    const renderConfirmationStep = () => {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Confirme seus dados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Revise as informações antes de finalizar o cadastro
          </Typography>
          
          <Box sx={{ textAlign: 'left', mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              <strong>Nome:</strong> {formData.name}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              <strong>Email:</strong> {formData.email}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              <strong>Telefone:</strong> {formData.phone}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              <strong>Tipo:</strong> {formData.userType === 'cyclist' ? 'Ciclista' : 'Oficina'}
            </Typography>
            
            {formData.userType === 'cyclist' && formData.bikes.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  <strong>Bicicletas cadastradas:</strong>
                </Typography>
                {formData.bikes.map((bike, index) => (
                  <Typography key={index} variant="body2" sx={{ ml: 2, mb: 1 }}>
                    • {bike.brand} {bike.model} {bike.year && `(${bike.year})`}
                  </Typography>
                ))}
              </>
            )}
            
            {formData.userType === 'workshop' && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Nome da Oficina:</strong> {formData.workshopName}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>CNPJ:</strong> {formData.cnpj}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endereço:</strong> {formData.address}, {formData.city} - {formData.state}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      );
    };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Criar Conta
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {renderStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{ mr: 1 }}
              >
                Voltar
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ py: 1.5, px: 4 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Finalizar Cadastro'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ py: 1.5, px: 4 }}
                >
                  Próximo
                </Button>
              )}
            </Box>
          </Box>
          
          {activeStep === 0 && (
            <>
              <Divider sx={{ my: 3, width: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  ou
                </Typography>
              </Divider>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Google />}
                onClick={handleGoogleRegister}
                sx={{ mb: 2, py: 1.5 }}
              >
                Continuar com Google
              </Button>
            </>
          )}
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Já tem uma conta?{' '}
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                underline="hover"
                sx={{ fontWeight: 600 }}
              >
                Faça login
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;