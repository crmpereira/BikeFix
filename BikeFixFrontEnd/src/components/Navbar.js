import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  Search,
  Build,
  ExitToApp,
  Person,
  AdminPanelSettings,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
    handleMenuClose();
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    { text: 'Início', path: '/', icon: <Dashboard /> },
    { text: 'Buscar Oficinas', path: '/workshops', icon: <Search /> },
  ];

  if (isAuthenticated) {
    if (user?.userType === 'cyclist') {
      menuItems.push(
        { text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
        { text: 'Perfil', path: '/profile', icon: <Person /> }
      );
    } else if (user?.userType === 'workshop') {
      menuItems.push(
        { text: 'Painel Oficina', path: '/workshop-dashboard', icon: <Build /> },
        { text: 'Perfil', path: '/profile', icon: <Person /> }
      );
    } else if (user?.userType === 'admin') {
      menuItems.push(
        { text: 'Admin', path: '/admin', icon: <AdminPanelSettings /> },
        { text: 'Perfil', path: '/profile', icon: <Person /> }
      );
    }
  }

  const renderDesktopMenu = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {menuItems.map((item) => (
        <Button
          key={item.path}
          color="inherit"
          component={Link}
          to={item.path}
          sx={{
            fontWeight: location.pathname === item.path ? 600 : 400,
            textDecoration: location.pathname === item.path ? 'underline' : 'none',
          }}
        >
          {item.text}
        </Button>
      ))}
      
      {isAuthenticated ? (
        <>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {user?.profileImage ? (
              <Avatar src={user.profileImage} sx={{ width: 32, height: 32 }} />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              <Person sx={{ mr: 1 }} /> Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} /> Sair
            </MenuItem>
          </Menu>
        </>
      ) : (
        <>
          <Button color="inherit" component={Link} to="/login">
            Entrar
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            component={Link}
            to="/register"
            sx={{ ml: 1 }}
          >
            Cadastrar
          </Button>
        </>
      )}
    </Box>
  );

  const renderMobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
    >
      <Box sx={{ width: 250 }} role="presentation">
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.path}
              component={Link}
              to={item.path}
              onClick={handleMobileMenuToggle}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          
          {isAuthenticated ? (
            <>
              <ListItem button onClick={() => { navigate('/profile'); handleMobileMenuToggle(); }}>
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Perfil" />
              </ListItem>
              <ListItem button onClick={() => { handleLogout(); handleMobileMenuToggle(); }}>
                <ListItemIcon><ExitToApp /></ListItemIcon>
                <ListItemText primary="Sair" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button component={Link} to="/login" onClick={handleMobileMenuToggle}>
                <ListItemIcon><AccountCircle /></ListItemIcon>
                <ListItemText primary="Entrar" />
              </ListItem>
              <ListItem button component={Link} to="/register" onClick={handleMobileMenuToggle}>
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary="Cadastrar" />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="fixed" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              mr: 4,
            }}
          >
            BikeFix
          </Typography>
          
          {!isMobile && (
            <Box sx={{ flexGrow: 1 }} />
          )}
          
          {!isMobile && renderDesktopMenu()}
        </Toolbar>
      </AppBar>
      
      {isMobile && renderMobileMenu()}
    </>
  );
};

export default Navbar;