import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={
        {
          backgroundColor: 'primary.dark',
          color: 'white',
          py: 6,
          mt: 'auto',
        }
      }
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Sobre o BikeFix */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              BikeFix
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              Conectando ciclistas e oficinas especializadas para manutenção e reparo de bikes.
              Encontre a oficina ideal para sua bike!
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color="inherit"
                aria-label="Facebook"
                href="#"
                size="small"
              >
                <Facebook />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Twitter"
                href="#"
                size="small"
              >
                <Twitter />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Instagram"
                href="#"
                size="small"
              >
                <Instagram />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="LinkedIn"
                href="#"
                size="small"
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Links Rápidos */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Links Rápidos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/" color="inherit" underline="hover">
                Início
              </Link>
              <Link component={RouterLink} to="/workshops" color="inherit" underline="hover">
                Buscar Oficinas
              </Link>
              <Link component={RouterLink} to="/register" color="inherit" underline="hover">
                Cadastrar-se
              </Link>
              <Link component={RouterLink} to="/login" color="inherit" underline="hover">
                Entrar
              </Link>
            </Box>
          </Grid>

          {/* Para Oficinas */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Para Oficinas
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/register?type=workshop" color="inherit" underline="hover">
                Cadastrar Oficina
              </Link>
              <Link component={RouterLink} to="/workshop-dashboard" color="inherit" underline="hover">
                Painel da Oficina
              </Link>
              <Link href="#" color="inherit" underline="hover">
                Como Funciona
              </Link>
              <Link href="#" color="inherit" underline="hover">
                Suporte
              </Link>
            </Box>
          </Grid>

          {/* Contato */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Contato
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2">
                  contato@bikefix.com.br
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2">
                  (11) 9999-9999
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  São Paulo, SP
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Copyright e Links Legais */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © {currentYear} BikeFix. Todos os direitos reservados.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Política de Privacidade
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Termos de Uso
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Cookies
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;