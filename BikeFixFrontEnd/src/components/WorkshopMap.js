import React, { useState, useEffect, useRef } from 'react';
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

const WorkshopMap = ({ workshops, userLocation, onWorkshopSelect }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar o mapa
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        // Verificar se já está carregado
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        // Verificar se já existe um script sendo carregado
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
          // Aguardar o carregamento
          const checkLoaded = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkLoaded);
              resolve();
            }
          }, 100);
          return;
        }

        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
          reject(new Error('Chave do Google Maps não configurada'));
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          if (window.google && window.google.maps) {
            resolve();
          } else {
            reject(new Error('Google Maps não carregou corretamente'));
          }
        };
        
        script.onerror = () => {
          reject(new Error('Erro ao carregar Google Maps API'));
        };
        
        document.head.appendChild(script);
      });
    };

    // Verificar se a API do Google Maps foi carregada
    const checkGoogleMapsAPI = () => {
      if (!window.google || !window.google.maps) {
        setError(
          'Google Maps não está disponível no momento. Exibindo lista de oficinas abaixo.'
        );
        setLoading(false);
        return false;
      }
      return true;
    };

    const initializeMapAsync = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Tentar carregar o Google Maps API
        await loadGoogleMapsScript();
        
        // Se chegou até aqui, o Google Maps está disponível
        if (checkGoogleMapsAPI()) {
          initializeMap();
        }
      } catch (error) {
        console.warn('Google Maps não disponível:', error.message);
        setError('Google Maps não está disponível no momento. Exibindo lista de oficinas abaixo.');
        setLoading(false);
      }
    };

    initializeMapAsync();
  }, [userLocation]);

  const initializeMap = () => {

    try {
      // Definir centro do mapa (São Paulo como padrão)
      const defaultCenter = { lat: -23.5505, lng: -46.6333 };
      const center = userLocation || defaultCenter;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: userLocation ? 12 : 10,
        center: center,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
      setLoading(false);
    } catch (err) {
      setError('Erro ao inicializar o mapa: ' + err.message);
      setLoading(false);
    }
  };

  // Adicionar marcadores das oficinas
  useEffect(() => {
    if (!map || !workshops.length) return;

    // Limpar marcadores existentes
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = [];
    const bounds = new window.google.maps.LatLngBounds();

    workshops.forEach(workshop => {
      if (!workshop.coordinates || !workshop.coordinates.lat || !workshop.coordinates.lng) {
        return;
      }

      const position = {
        lat: workshop.coordinates.lat,
        lng: workshop.coordinates.lng
      };

      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: workshop.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#1976d2" stroke="white" stroke-width="2"/>
              <path d="M16 8l-2 2h4l-2-2zm-4 6h8v8h-8v-8z" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      marker.addListener('click', () => {
        setSelectedWorkshop(workshop);
        if (onWorkshopSelect) {
          onWorkshopSelect(workshop);
        }
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    // Adicionar marcador do usuário se disponível
    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Sua localização',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#f44336" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        }
      });
      newMarkers.push(userMarker);
      bounds.extend(userLocation);
    }

    setMarkers(newMarkers);

    // Ajustar zoom para mostrar todos os marcadores
    if (workshops.length > 0) {
      map.fitBounds(bounds);
      // Limitar zoom máximo
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, workshops, userLocation]);

  if (loading) {
    return (
      <Box sx={{ 
        height: '600px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Oficinas Disponíveis
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {workshops.map((workshop) => (
              <Card 
                key={workshop.id}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 3 },
                  border: selectedWorkshop?.id === workshop.id ? '2px solid #1976d2' : '1px solid #ddd'
                }}
                onClick={() => setSelectedWorkshop(workshop)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <Build />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {workshop.name}
                        </Typography>
                        {workshop.verified && (
                          <Verified color="primary" fontSize="small" />
                        )}
                      </Box>
                      {workshop.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={workshop.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {workshop.rating} ({workshop.ratingCount || 0} avaliações)
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {workshop.address}, {workshop.city}, {workshop.state} - CEP: {workshop.zipCode}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {workshop.phone}
                    </Typography>
                  </Box>
                  
                  {workshop.serviceNames && workshop.serviceNames.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Serviços:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {workshop.serviceNames.slice(0, 3).map((serviceName, index) => (
                          <Chip
                            key={index}
                            label={serviceName}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {workshop.serviceNames.length > 3 && (
                          <Chip
                            label={`+${workshop.serviceNames.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    {workshop.priceRange && (
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                        {workshop.priceRange}
                      </Typography>
                    )}
                    {workshop.distance && (
                      <Typography variant="body2" color="text.secondary">
                        {workshop.distance}
                      </Typography>
                    )}
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    component={Link}
                    to={`/workshops/${workshop.id}`}
                    sx={{ mt: 2 }}
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '600px', width: '100%' }}>
      <div
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
      />
      
      {selectedWorkshop && (
        <Card sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 320,
          maxHeight: '80%',
          overflow: 'auto',
          zIndex: 1000,
          boxShadow: 3
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Build />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedWorkshop.name}
                  </Typography>
                  {selectedWorkshop.verified && (
                    <Verified color="primary" fontSize="small" />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={selectedWorkshop.rating} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {selectedWorkshop.rating} ({selectedWorkshop.ratingCount} avaliações)
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedWorkshop.address}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {selectedWorkshop.city}, {selectedWorkshop.state} - CEP: {selectedWorkshop.zipCode}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {selectedWorkshop.phone}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              Serviços:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {selectedWorkshop.serviceNames.slice(0, 3).map((serviceName, index) => (
                <Chip
                  key={index}
                  label={serviceName}
                  size="small"
                  variant="outlined"
                />
              ))}
              {selectedWorkshop.serviceNames.length > 3 && (
                <Chip
                  label={`+${selectedWorkshop.serviceNames.length - 3}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                {selectedWorkshop.priceRange}
              </Typography>
              {selectedWorkshop.distance && (
                <Typography variant="body2" color="text.secondary">
                  {selectedWorkshop.distance}
                </Typography>
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              component={Link}
              to={`/workshops/${selectedWorkshop.id}`}
            >
              Ver Detalhes
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => setSelectedWorkshop(null)}
              sx={{ mt: 1 }}
            >
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WorkshopMap;