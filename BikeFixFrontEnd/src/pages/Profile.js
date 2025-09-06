import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Lock,
  Email,
  Phone,
  LocationOn,
  Person,
  Verified,
  Security,
  History,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { validateCEP, formatCEP, searchByCEP } from '../services/cepService';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchingCEP, setSearchingCEP] = useState(false);
  
  // Função para obter dados de endereço baseado no tipo de usuário
  const getAddressData = (userData) => {
    if (!userData) return { address: '', city: '', state: '', zipCode: '' };
    
    console.log('getAddressData - userData:', userData);
    
    if (userData.userType === 'cyclist' && userData.cyclistData?.address) {
      console.log('getAddressData - Usando cyclistData.address:', userData.cyclistData.address);
      return {
        address: userData.cyclistData.address.street || '',
        city: userData.cyclistData.address.city || '',
        state: userData.cyclistData.address.state || '',
        zipCode: userData.cyclistData.address.zipCode || '',
      };
    } else if (userData.userType === 'workshop' && userData.workshopData?.address) {
      console.log('getAddressData - Usando workshopData.address:', userData.workshopData.address);
      return {
        address: userData.workshopData.address.street || '',
        city: userData.workshopData.address.city || '',
        state: userData.workshopData.address.state || '',
        zipCode: userData.workshopData.address.zipCode || '',
      };
    } else {
      // Fallback para dados no nível raiz (compatibilidade)
      console.log('getAddressData - Usando fallback, dados raiz');
      return {
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        zipCode: userData.zipCode || '',
      };
    }
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    ...getAddressData(user),
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Sincronizar formData com dados do usuário quando user for atualizado
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        ...getAddressData(user),
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Aplicar máscara de CEP
    if (name === 'zipCode') {
      processedValue = formatCEP(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Buscar endereço automaticamente quando CEP for preenchido completamente
    if (name === 'zipCode' && processedValue.length === 9) {
      handleSearchByCEP(processedValue);
    }
  };
  
  // Função para buscar endereço por CEP
  const handleSearchByCEP = async (cep) => {
    try {
      if (!validateCEP(cep)) {
        return;
      }
      
      setSearchingCEP(true);
      const addressData = await searchByCEP(cep);
      
      // Preencher campos de endereço automaticamente
      setFormData(prev => ({
        ...prev,
        address: addressData.logradouro || '',
        city: addressData.localidade || '',
        state: addressData.uf || ''
      }));
      
      toast.success('Endereço preenchido automaticamente!');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP. Verifique o código e tente novamente.');
    } finally {
      setSearchingCEP(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const result = await updateProfile(formData);
      if (result.success) {
        setEditing(false);
        toast.success('Perfil atualizado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordDialogOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Senha alterada com sucesso!');
    } catch (error) {
      toast.error('Erro ao alterar senha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      ...getAddressData(user),
    });
    setEditing(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Meu Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Informações Básicas */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Informações Pessoais
                </Typography>
                {!editing ? (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                    variant="outlined"
                  >
                    Editar
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      variant="contained"
                      disabled={loading}
                    >
                      Salvar
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      variant="outlined"
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome Completo"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CEP"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="12345-678"
                    inputProps={{ maxLength: 9 }}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                      endAdornment: editing && (
                        <InputAdornment position="end">
                          {searchingCEP ? (
                            <CircularProgress size={20} />
                          ) : (
                            formData.zipCode && formData.zipCode.length === 9 && (
                              <IconButton
                                size="small"
                                onClick={() => handleSearchByCEP(formData.zipCode)}
                                disabled={searchingCEP}
                                title="Buscar endereço"
                              >
                                <Search fontSize="small" />
                              </IconButton>
                            )
                          )}
                        </InputAdornment>
                      ),
                    }}
                    helperText={editing ? "Digite o CEP para preencher o endereço automaticamente" : ""}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Endereço"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cidade"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Estado"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Avatar e Info Básica */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: '2rem',
                    bgcolor: 'primary.main',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    border: 2,
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {user?.name || 'Usuário'}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={user?.userType === 'cyclist' ? 'Ciclista' : 'Oficina'}
                  color="primary"
                  size="small"
                />
                {user?.emailVerified && (
                  <Chip
                    label="Verificado"
                    color="success"
                    size="small"
                    icon={<Verified />}
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Membro desde {new Date(user?.createdAt || Date.now()).toLocaleDateString('pt-BR')}
              </Typography>
            </CardContent>
          </Card>

          {/* Ações de Segurança */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                Segurança
              </Typography>
              
              <List>
                <ListItem
                  button
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{ px: 0 }}
                >
                  <ListItemIcon>
                    <Lock />
                  </ListItemIcon>
                  <ListItemText
                    primary="Alterar Senha"
                    secondary="Mantenha sua conta segura"
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <History />
                  </ListItemIcon>
                  <ListItemText
                    primary="Atividade Recente"
                    secondary="Último login: hoje"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog para Alterar Senha */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
          Alterar Senha
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Sua nova senha deve ter pelo menos 6 caracteres.
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Senha Atual"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nova Senha"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={() => setPasswordDialogOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
          >
            Alterar Senha
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;