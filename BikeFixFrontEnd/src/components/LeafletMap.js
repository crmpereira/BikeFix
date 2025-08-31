import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Build,
  LocationOn,
  Phone,
  Verified
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrigir ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícone customizado para oficinas
const workshopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#1976d2" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      <path fill="#1976d2" d="M12.5 7l-2 2h4l-2-2zm-3 4h6v6h-6v-6z"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Ícone para localização do usuário
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle fill="#4285f4" stroke="#fff" stroke-width="3" cx="10" cy="10" r="8"/>
      <circle fill="#fff" cx="10" cy="10" r="3"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Componente para ajustar o mapa quando as oficinas mudarem
function MapUpdater({ workshops, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!workshops.length && !userLocation) return;

    const bounds = L.latLngBounds();
    let hasValidBounds = false;

    // Adicionar oficinas aos bounds
    workshops.forEach(workshop => {
      if (workshop.coordinates && workshop.coordinates.lat && workshop.coordinates.lng) {
        bounds.extend([workshop.coordinates.lat, workshop.coordinates.lng]);
        hasValidBounds = true;
      }
    });

    // Adicionar localização do usuário aos bounds
    if (userLocation && userLocation.lat && userLocation.lng) {
      bounds.extend([userLocation.lat, userLocation.lng]);
      hasValidBounds = true;
    }

    // Ajustar o mapa para mostrar todos os pontos
    if (hasValidBounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      // Centralizar no Brasil se não houver pontos válidos
      map.setView([-14.235, -51.9253], 4);
    }
  }, [map, workshops, userLocation]);

  return null;
}

const LeafletMap = ({ 
  workshops = [], 
  userLocation = null, 
  onWorkshopSelect = null,
  selectedWorkshop = null,
  height = '400px'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simular carregamento do mapa
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Função para formatar horário de funcionamento
  const formatWorkingHours = (workingHours) => {
    if (!workingHours) return 'Horário não informado';
    
    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
    const todayKey = {
      'domingo': 'sunday',
      'segunda-feira': 'monday', 
      'terça-feira': 'tuesday',
      'quarta-feira': 'wednesday',
      'quinta-feira': 'thursday',
      'sexta-feira': 'friday',
      'sábado': 'saturday'
    }[today] || 'monday';
    
    const todayHours = workingHours[todayKey];
    if (todayHours && todayHours.isOpen) {
      return `Hoje: ${todayHours.open} - ${todayHours.close}`;
    }
    return 'Fechado hoje';
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 1
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height, p: 2 }}>
        <Alert severity="info">
          {error}
        </Alert>
      </Box>
    );
  }

  // Posição padrão (centro do Brasil)
  const defaultCenter = [-14.235, -51.9253];
  const defaultZoom = 4;

  return (
    <Box sx={{ height, position: 'relative' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Atualizar mapa quando dados mudarem */}
        <MapUpdater workshops={workshops} userLocation={userLocation} />
        
        {/* Marcador da localização do usuário */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={userIcon}
          >
            <Popup>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Sua localização
              </Typography>
            </Popup>
          </Marker>
        )}
        
        {/* Marcadores das oficinas */}
        {workshops.map((workshop) => {
          if (!workshop.coordinates || !workshop.coordinates.lat || !workshop.coordinates.lng) {
            return null;
          }
          
          return (
            <Marker
              key={workshop.id}
              position={[workshop.coordinates.lat, workshop.coordinates.lng]}
              icon={workshopIcon}
              eventHandlers={{
                click: () => {
                  if (onWorkshopSelect) {
                    onWorkshopSelect(workshop);
                  }
                }
              }}
            >
              <Popup maxWidth={300}>
                <Card sx={{ minWidth: 250, boxShadow: 'none' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <Build fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                          {workshop.name}
                        </Typography>
                        {workshop.verified && (
                          <Chip
                            icon={<Verified />}
                            label="Verificada"
                            size="small"
                            color="success"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {workshop.city}, {workshop.state}
                      </Typography>
                    </Box>
                    
                    {workshop.rating > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={workshop.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({workshop.ratingCount} avaliações)
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {formatWorkingHours(workshop.workingHours)}
                    </Typography>
                    
                    {workshop.services && workshop.services.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Serviços:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {workshop.services.slice(0, 3).map((service, index) => (
                            <Chip
                              key={index}
                              label={service.name}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                          {workshop.services.length > 3 && (
                            <Chip
                              label={`+${workshop.services.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                    
                    <Button
                      component={Link}
                      to={`/workshop/${workshop.id}`}
                      variant="contained"
                      size="small"
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default LeafletMap;