import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  Build,
  Schedule,
  Star,
  LocationOn,
  Phone,
  CheckCircle,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <Search sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Encontre Oficinas',
      description: 'Busque oficinas especializadas próximas a você com base na localização e tipo de serviço.',
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Agende Online',
      description: 'Agende seus serviços de forma rápida e prática, escolhendo data e horário que melhor se adequa.',
    },
    {
      icon: <Build sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Serviços Especializados',
      description: 'Acesse uma ampla gama de serviços especializados para todos os tipos de bike.',
    },
    {
      icon: <Star sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Avaliações Reais',
      description: 'Consulte avaliações e comentários de outros ciclistas para escolher a melhor oficina.',
    },
  ];

  const benefits = [
    'Oficinas verificadas e confiáveis',
    'Agendamento online 24/7',
    'Orçamentos transparentes',
    'Histórico de manutenções',
    'Notificações em tempo real',
    'Suporte especializado',
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, mb: 3 }}
          >
            Conectando Ciclistas e Oficinas
          </Typography>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}
          >
            Encontre a oficina ideal para sua bike. Agende serviços, compare preços e mantenha sua bike sempre em perfeito estado.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isAuthenticated ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/register"
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Começar Agora
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/workshops"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Buscar Oficinas
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to={user?.userType === 'workshop' ? '/workshop-dashboard' : '/dashboard'}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Ir para Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/workshops"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Buscar Oficinas
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 600, mb: 6 }}
        >
          Como Funciona
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 2,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Por que escolher o BikeFix?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                A plataforma mais completa para cuidar da sua bike
              </Typography>
              <Grid container spacing={2}>
                {benefits.map((benefit, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body1">{benefit}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                }}
              >
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  +1000
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Ciclistas Cadastrados
                </Typography>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  +50
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Oficinas Parceiras
                </Typography>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  +5000
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Serviços Realizados
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Pronto para começar?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Junte-se a milhares de ciclistas que já confiam no BikeFix
          </Typography>
          {!isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/register"
                sx={{ px: 4, py: 1.5 }}
              >
                Cadastrar-se Grátis
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/login"
                sx={{ px: 4, py: 1.5 }}
              >
                Já tenho conta
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Home;