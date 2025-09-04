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

// Ícone customizado para oficinas (com bicicleta)
const workshopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">
      <path fill="#1976d2" stroke="#fff" stroke-width="2" d="M15 0C6.7 0 0 6.7 0 15c0 15 15 30 15 30s15-15 15-30C30 6.7 23.3 0 15 0z"/>
      <circle fill="#fff" cx="15" cy="15" r="8"/>
      <!-- Bicicleta -->
      <g fill="#1976d2" transform="translate(8, 8)">
        <!-- Rodas -->
        <circle cx="3" cy="10" r="2.5" fill="none" stroke="#1976d2" stroke-width="1"/>
        <circle cx="11" cy="10" r="2.5" fill="none" stroke="#1976d2" stroke-width="1"/>
        <!-- Quadro -->
        <path d="M3 10 L7 6 L11 10 M7 6 L7 4 M6 4 L8 4" stroke="#1976d2" stroke-width="1" fill="none"/>
        <path d="M7 6 L9 8" stroke="#1976d2" stroke-width="1"/>
      </g>
      <circle fill="#4caf50" cx="24" cy="6" r="4" stroke="#fff" stroke-width="1"/>
    </svg>
  `),
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -40],
});

// Ícone para oficinas com alta avaliação (com bicicleta dourada)
const premiumWorkshopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ff9800" stroke="#fff" stroke-width="2" d="M15 0C6.7 0 0 6.7 0 15c0 15 15 30 15 30s15-15 15-30C30 6.7 23.3 0 15 0z"/>
      <circle fill="#fff" cx="15" cy="15" r="8"/>
      <!-- Bicicleta Premium -->
      <g fill="#ff9800" transform="translate(8, 8)">
        <!-- Rodas -->
        <circle cx="3" cy="10" r="2.5" fill="none" stroke="#ff9800" stroke-width="1"/>
        <circle cx="11" cy="10" r="2.5" fill="none" stroke="#ff9800" stroke-width="1"/>
        <!-- Quadro -->
        <path d="M3 10 L7 6 L11 10 M7 6 L7 4 M6 4 L8 4" stroke="#ff9800" stroke-width="1" fill="none"/>
        <path d="M7 6 L9 8" stroke="#ff9800" stroke-width="1"/>
      </g>
      <!-- Estrela de qualidade -->
      <path fill="#ffd700" d="M15 5l1 2h2l-1.5 1.5 0.5 2-2-1-2 1 0.5-2L12 7h2l1-2z" transform="scale(0.6) translate(10, 2)"/>
    </svg>
  `),
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -40],
});

// Ícone para localização do usuário (com bicicleta)
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle fill="#4285f4" stroke="#fff" stroke-width="3" cx="12" cy="12" r="10"/>
      <!-- Bicicleta do usuário -->
      <g fill="#fff" transform="translate(6, 6)">
        <!-- Rodas -->
        <circle cx="3" cy="8" r="2" fill="none" stroke="#fff" stroke-width="1"/>
        <circle cx="9" cy="8" r="2" fill="none" stroke="#fff" stroke-width="1"/>
        <!-- Quadro -->
        <path d="M3 8 L6 4 L9 8 M6 4 L6 2 M5 2 L7 2" stroke="#fff" stroke-width="1" fill="none"/>
        <path d="M6 4 L8 6" stroke="#fff" stroke-width="1"/>
      </g>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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
          
          // Escolher ícone baseado na avaliação
          const icon = workshop.rating >= 4.5 ? premiumWorkshopIcon : workshopIcon;
          
          return (
            <Marker
              key={workshop.id}
              position={[workshop.coordinates.lat, workshop.coordinates.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onWorkshopSelect) {
                    onWorkshopSelect(workshop);
                  }
                }
              }}
            >
              <Popup maxWidth={320}>
                <Card sx={{ minWidth: 280, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 2 }}>
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: workshop.rating >= 4.5 ? '#ff9800' : 'primary.main', 
                        width: 36, 
                        height: 36 
                      }}>
                        <Build fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 0.5 }}>
                          {workshop.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {workshop.verified && (
                            <Chip
                              icon={<Verified />}
                              label="Verificada"
                              size="small"
                              color="success"
                              sx={{ height: 22, fontSize: '0.75rem' }}
                            />
                          )}
                          {workshop.rating >= 4.5 && (
                            <Chip
                              label="⭐ Premium"
                              size="small"
                              sx={{ 
                                height: 22, 
                                fontSize: '0.75rem',
                                bgcolor: '#fff3e0',
                                color: '#f57c00'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {workshop.city}, {workshop.state}
                      </Typography>
                      {workshop.distance && (
                        <Chip
                          label={`${workshop.distance.toFixed(1)} km`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            ml: 'auto',
                            borderColor: '#2196f3',
                            color: '#2196f3'
                          }}
                        />
                      )}
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
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8, color: 'text.primary' }}>
                          🔧 Serviços Principais:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {workshop.services.slice(0, 3).map((service, index) => (
                            <Chip
                              key={index}
                              label={service.name}
                              size="small"
                              variant="filled"
                              sx={{ 
                                fontSize: '0.7rem', 
                                height: 22,
                                bgcolor: '#e3f2fd',
                                color: '#1976d2',
                                '&:hover': { bgcolor: '#bbdefb' }
                              }}
                            />
                          ))}
                          {workshop.services.length > 3 && (
                            <Chip
                              label={`+${workshop.services.length - 3} mais`}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.7rem', 
                                height: 22,
                                borderColor: '#1976d2',
                                color: '#1976d2'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                    
                    {workshop.priceRange && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                          💰 Faixa de Preço:
                        </Typography>
                        <Chip
                          label={workshop.priceRange}
                          size="small"
                          sx={{
                            bgcolor: '#e8f5e8',
                            color: '#2e7d32',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                      <Button
                        component={Link}
                        to={`/workshop/${workshop.id}`}
                        variant="contained"
                        size="small"
                        sx={{ 
                          flex: 1,
                          bgcolor: '#1976d2',
                          '&:hover': { bgcolor: '#1565c0' }
                        }}
                      >
                        Ver Detalhes
                      </Button>
                      {workshop.coordinates && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${workshop.coordinates.lat},${workshop.coordinates.lng}`;
                            window.open(url, '_blank');
                          }}
                          sx={{ 
                            minWidth: 'auto',
                            px: 1.5,
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': { 
                              borderColor: '#1565c0',
                              bgcolor: '#e3f2fd'
                            }
                          }}
                        >
                          🗺️
                        </Button>
                      )}
                    </Box>
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