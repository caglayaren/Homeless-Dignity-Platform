import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../components/Layout'; // Layout'tan tema hook'unu import et

// Dark Mode Toggle Component
const DarkModeToggle = ({ isDarkMode, toggleDarkMode }) => (
  <button
    onClick={toggleDarkMode}
    style={{
      position: 'fixed',
      top: '12px',
      right: '130px', // Logout butonundan uzaklaştırdık
      zIndex: 1000,
      background: isDarkMode
        ? 'linear-gradient(135deg, #4338ca, #3730a3)'
        : 'linear-gradient(135deg, #1f2937, #111827)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '56px',
      height: '56px',
      fontSize: '20px',
      cursor: 'pointer',
      boxShadow: isDarkMode
        ? '0 10px 25px rgba(67, 56, 202, 0.3)'
        : '0 10px 25px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {isDarkMode ? '☀️' : '🌙'}
  </button>
);

// Enhanced Location Picker Component for Jobs
const LocationPicker = ({ onLocationSelect, selectedLocation, isDarkMode }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [detectedCountry, setDetectedCountry] = useState(null);
  
  const locations = [
    {
      id: 'all',
      name: 'All Locations',
      icon: '🌍',
      country: 'global',
      coordinates: [0, 0],
      color: '#6b7280'
    },
    {
      id: 'cyprus',
      name: 'Cyprus',
      icon: '🇨🇾',
      country: 'cyprus',
      coordinates: [33.4, 35.2],
      color: '#dc2626',
      cities: ['Nicosia', 'Kyrenia', 'Famagusta']
    },
    {
      id: 'turkey',
      name: 'Turkey',
      icon: '🇹🇷',
      country: 'turkey',
      coordinates: [35.0, 39.0],
      color: '#059669',
      cities: ['Istanbul', 'Ankara', 'Izmir']
    },
    {
      id: 'greece',
      name: 'Greece',
      icon: '🇬🇷',
      country: 'greece',
      coordinates: [22.0, 39.0],
      color: '#7c3aed',
      cities: ['Athens', 'Thessaloniki']
    },
    {
      id: 'germany',
      name: 'Germany',
      icon: '🇩🇪',
      country: 'germany',
      coordinates: [10.5, 51.1],
      color: '#f97316',
      cities: ['Berlin', 'Munich', 'Hamburg']
    },
    {
      id: 'uk',
      name: 'United Kingdom',
      icon: '🇬🇧',
      country: 'uk',
      coordinates: [-2.0, 54.0],
      color: '#8b5cf6',
      cities: ['London', 'Manchester', 'Birmingham']
    },
    {
      id: 'usa',
      name: 'United States',
      icon: '🇺🇸',
      country: 'usa',
      coordinates: [-95.7, 37.1],
      color: '#f59e0b',
      cities: ['New York', 'Los Angeles', 'Chicago']
    }
  ];

  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'User-Agent': 'DignityServices/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const countryMap = {
          'CY': 'cyprus',
          'TR': 'turkey',
          'GR': 'greece',
          'US': 'usa',
          'GB': 'uk',
          'DE': 'germany'
        };
        
        const detectedCountry = countryMap[data.country_code] || 'cyprus';
        setDetectedCountry(detectedCountry);
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                country: detectedCountry,
                city: data.city || 'Unknown'
              });
            },
            (error) => {
              console.log('GPS location unavailable:', error.message);
            }
          );
        }
      } else {
        throw new Error('IP geolocation failed');
      }
    } catch (error) {
      console.log('Location detection failed, defaulting to Cyprus:', error.message);
      setDetectedCountry('cyprus');
    }
  };

  const handleLocationSelect = (location) => {
    onLocationSelect(location);
  };

  const handleCurrentLocation = () => {
    if (detectedCountry) {
      const currentLocation = locations.find(loc => loc.country === detectedCountry);
      if (currentLocation) {
        handleLocationSelect(currentLocation);
      }
    }
  };return (
    <div style={{
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1f2937, #111827)'
        : 'linear-gradient(135deg, #ffffff, #fefefe)',
      border: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '32px',
      boxShadow: isDarkMode 
        ? '0 8px 30px rgba(0,0,0,0.3)'
        : '0 8px 30px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: isDarkMode ? '#f9fafb' : '#1e293b',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🌍 Job Location Select
        </h3>
        {detectedCountry && (
          <button
            onClick={handleCurrentLocation}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            📍 Use Current Location
          </button>
        )}
      </div>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {locations.map((location) => {
          const isSelected = selectedLocation?.id === location.id;
          return (
            <button
              key={location.id}
              onClick={() => handleLocationSelect(location)}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${location.color}, ${location.color}dd)`
                  : isDarkMode 
                    ? 'linear-gradient(135deg, #374151, #4b5563)'
                    : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                color: isSelected ? 'white' : isDarkMode ? '#d1d5db' : '#475569',
                border: isSelected ? `2px solid ${location.color}` : `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
                borderRadius: '16px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '140px',
                boxShadow: isSelected
                  ? `0 4px 20px ${location.color}40`
                  : isDarkMode
                    ? '0 2px 10px rgba(0,0,0,0.3)'
                    : '0 2px 10px rgba(0,0,0,0.1)',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              <span style={{ fontSize: '16px' }}>{location.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div>{location.name}</div>
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedLocation && (
        <div style={{
          background: isDarkMode
            ? `linear-gradient(135deg, ${selectedLocation.color}25, ${selectedLocation.color}15)`
            : `linear-gradient(135deg, ${selectedLocation.color}15, ${selectedLocation.color}08)`,
          border: `1px solid ${selectedLocation.color}40`,
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>{selectedLocation.icon}</span>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: selectedLocation.color,
              marginBottom: '4px'
            }}>
              Showing jobs for {selectedLocation.name}
            </div>
            <div style={{
              fontSize: '14px',
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              {selectedLocation.cities && (
                <>Cities: {selectedLocation.cities.join(', ')}</>
              )}
              {selectedLocation.id === 'all' && 'All available locations worldwide'}
              {selectedLocation.isCustom && 'Custom map location'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Interactive Job Map Component - UPDATED WITH LEAFLET
const JobMap = ({ onLocationSelect, selectedLocation, userLocation, isDarkMode }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLocation, setMapLocation] = useState({ lat: 35.1856, lng: 33.3823 });
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const jobHotspots = [
    { lat: 35.1856, lng: 33.3823, name: "Nicosia", country: "Cyprus", jobs: 12, color: "#dc2626" },
    { lat: 35.3367, lng: 33.3234, name: "Kyrenia", country: "Cyprus", jobs: 8, color: "#dc2626" },
    { lat: 41.0082, lng: 28.9784, name: "Istanbul", country: "Turkey", jobs: 45, color: "#059669" },
    { lat: 39.9334, lng: 32.8597, name: "Ankara", country: "Turkey", jobs: 23, color: "#059669" },
    { lat: 37.9755, lng: 23.7348, name: "Athens", country: "Greece", jobs: 18, color: "#7c3aed" },
    { lat: 52.5200, lng: 13.4050, name: "Berlin", country: "Germany", jobs: 89, color: "#f97316" },
    { lat: 48.1351, lng: 11.5820, name: "Munich", country: "Germany", jobs: 67, color: "#f97316" },
    { lat: 51.5074, lng: -0.1278, name: "London", country: "UK", jobs: 156, color: "#8b5cf6" },
    { lat: 53.4808, lng: -2.2426, name: "Manchester", country: "UK", jobs: 78, color: "#8b5cf6" },
    { lat: 52.4862, lng: -1.8904, name: "Birmingham", country: "UK", jobs: 54, color: "#8b5cf6" },
    { lat: 40.7128, lng: -74.0060, name: "New York", country: "USA", jobs: 134, color: "#f59e0b" },
    { lat: 34.0522, lng: -118.2437, name: "Los Angeles", country: "USA", jobs: 98, color: "#f59e0b" },
  ];

  useEffect(() => {
    if (selectedLocation && selectedLocation.coordinates) {
      setMapLocation({
        lat: selectedLocation.coordinates[1],
        lng: selectedLocation.coordinates[0]
      });
    }
  }, [selectedLocation]);

  // Leaflet harita başlatma
  useEffect(() => {
    const initializeLeafletMap = () => {
      if (window.L && mapRef.current && !leafletMapRef.current) {
        const lightStyle = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const darkStyle = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        
        leafletMapRef.current = window.L.map(mapRef.current, {
          center: [mapLocation.lat, mapLocation.lng],
          zoom: 6,
          zoomControl: true,
          scrollWheelZoom: true
        });

        window.L.tileLayer(isDarkMode ? darkStyle : lightStyle, {
          attribution: isDarkMode 
            ? '&copy; <a href="https://carto.com/">CARTO</a>' 
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19
        }).addTo(leafletMapRef.current);

        leafletMapRef.current.on('click', (e) => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          setMapLocation({ lat, lng });
          onLocationSelect({ lat, lng, isCustom: true });
        });

        setMapLoaded(true);
        addJobMarkers();
      }
    };

    if (window.L) {
      initializeLeafletMap();
    } else {
      const checkLeaflet = setInterval(() => {
        if (window.L) {
          clearInterval(checkLeaflet);
          initializeLeafletMap();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkLeaflet);
      }, 10000);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Tema değişikliği
  useEffect(() => {
    if (leafletMapRef.current) {
      leafletMapRef.current.eachLayer((layer) => {
        if (layer._url) {
          leafletMapRef.current.removeLayer(layer);
        }
      });

      const lightStyle = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const darkStyle = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      
      window.L.tileLayer(isDarkMode ? darkStyle : lightStyle, {
        attribution: isDarkMode 
          ? '&copy; <a href="https://carto.com/">CARTO</a>' 
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(leafletMapRef.current);

      addJobMarkers();
    }
  }, [isDarkMode]);

  // Lokasyon değişikliği
  useEffect(() => {
    if (selectedLocation && selectedLocation.coordinates && leafletMapRef.current) {
      const newLocation = [selectedLocation.coordinates[1], selectedLocation.coordinates[0]];
      setMapLocation({ lat: selectedLocation.coordinates[1], lng: selectedLocation.coordinates[0] });
      leafletMapRef.current.setView(newLocation, 8);
    }
  }, [selectedLocation]);

  const addJobMarkers = () => {
    if (!leafletMapRef.current || !window.L) return;

    markersRef.current.forEach(marker => {
      leafletMapRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    jobHotspots.forEach((spot) => {
      const markerSize = Math.max(20, spot.jobs / 3);
      const customIcon = window.L.divIcon({
        className: 'custom-job-marker',
        html: `
          <div style="
            width: ${markerSize}px;
            height: ${markerSize}px;
            background: ${spot.color};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            ${spot.jobs}
          </div>
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2]
      });

      const marker = window.L.marker([spot.lat, spot.lng], { 
        icon: customIcon 
      }).addTo(leafletMapRef.current);

      const popupContent = `
        <div style="padding: 8px; text-align: center;">
          <h4 style="margin: 0 0 8px 0; color: ${spot.color};">💼 ${spot.name}</h4>
          <p style="margin: 0; color: #374151;"><strong>${spot.jobs} jobs</strong></p>
          <button 
            onclick="window.selectJobLocation && window.selectJobLocation(${spot.lat}, ${spot.lng}, '${spot.name}', '${spot.country}')"
            style="background: ${spot.color}; color: white; border: none; padding: 6px 12px; border-radius: 6px; margin-top: 8px; cursor: pointer;"
          >
            Search Jobs Here
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    (window as any).selectJobLocation = (lat, lng, name, country) => {
      onLocationSelect({ lat, lng, name, country });
    };
  };

  useEffect(() => {
    if (mapLoaded) {
      addJobMarkers();
    }
  }, [mapLoaded]);return (
    <div style={{
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1f2937, #111827)'
        : 'linear-gradient(135deg, #ffffff, #fefefe)',
      border: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '32px',
      boxShadow: isDarkMode 
        ? '0 8px 30px rgba(0,0,0,0.3)'
        : '0 8px 30px rgba(0,0,0,0.06)'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: isDarkMode ? '#f9fafb' : '#1e293b',
        margin: '0 0 16px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        💼 Interactive Job Map
        {mapLoaded && (
          <span style={{ 
            fontSize: '12px', 
            color: '#10b981',
            background: isDarkMode ? '#065f46' : '#dcfce7',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            🗺️ Live
          </span>
        )}
      </h3>
      
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '350px',
          borderRadius: '16px',
          border: `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
          overflow: 'hidden',
          background: isDarkMode 
            ? 'linear-gradient(to bottom right, #374151, #4b5563, #6b7280)'
            : 'linear-gradient(to bottom right, #bfdbfe, #ddd6fe, #fed7d7)',
          position: 'relative'
        }}
      />
      
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: isDarkMode ? 'rgba(31,41,55,0.9)' : 'rgba(255,255,255,0.9)',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          color: isDarkMode ? '#f9fafb' : '#374151',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
            borderTop: `2px solid ${isDarkMode ? '#10b981' : '#dc2626'}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Loading Map...
        </div>
      )}
      
      {mapLocation && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: isDarkMode ? '#374151' : '#f8fafc',
          borderRadius: '12px',
          border: `1px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`
        }}>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#64748b', marginBottom: '4px' }}>
            Selected Job Search Location:
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: isDarkMode ? '#f9fafb' : '#1e293b' }}>
            💼 {mapLocation.lat.toFixed(4)}, {mapLocation.lng.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Jobs Component
const Jobs = () => {
  // Layout'tan tema durumunu al
  const { isDark: isDarkMode, toggleTheme } = useTheme();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapLocation, setMapLocation] = useState(null);
  const [showHomelessFriendlyOnly, setShowHomelessFriendlyOnly] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // API Configuration - Backend URL'inizi buraya girin
  const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api', // Backend 3000 port'unda çalışıyor
    TIMEOUT: 10000, // 10 saniye timeout
    HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  // Mock fallback data for when API is not available
  const fallbackJobs = [
    {
      id: 1,
      title: "Restaurant Server",
      company: "Mediterranean Bistro",
      type: "part-time",
      location: "Nicosia, Cyprus",
      salary: "€8-12/hour",
      description: "Friendly restaurant seeking servers for busy Mediterranean restaurant. No experience required - training provided.",
      requirements: ["Good communication skills", "Ability to work in team", "Flexible schedule"],
      benefits: ["Staff meals", "Flexible hours", "Tips"],
      isHomelessFriendly: true,
      contactEmail: "hiring@medbistro.cy",
      contactPhone: "+357 22 123456",
      postedDate: "2024-07-08",
      urgency: "high",
      provider: "Fallback",
      external: false
    },
    {
      id: 2,
      title: "Hotel Housekeeper",
      company: "Kyrenia Palace Hotel",
      type: "full-time",
      location: "Kyrenia, Cyprus",
      salary: "€950-1200/month",
      description: "Join our housekeeping team at a luxury hotel. Immediate start available.",
      requirements: ["Attention to detail", "Physical fitness", "Reliability"],
      benefits: ["Health insurance", "Accommodation assistance", "Training provided"],
      isHomelessFriendly: true,
      contactEmail: "hr@kyreniapalace.com",
      postedDate: "2024-07-09",
      urgency: "high",
      provider: "Fallback",
      external: false
    },
    {
      id: 3,
      title: "Kitchen Assistant",
      company: "Istanbul Grill House",
      type: "part-time",
      location: "Istanbul, Turkey",
      salary: "₺45-60/hour",
      description: "Busy kitchen needs reliable assistant. Food handling experience preferred but not required.",
      requirements: ["Food safety awareness", "Fast-paced environment", "Team work"],
      benefits: ["Free meals", "Flexible schedule", "Tips"],
      isHomelessFriendly: true,
      contactEmail: "jobs@istanbulgrill.tr",
      postedDate: "2024-07-06",
      urgency: "medium",
      provider: "Fallback",
      external: false
    },
    {
      id: 4,
      title: "Delivery Driver",
      company: "New York Express",
      type: "full-time",
      location: "New York, USA",
      salary: "$15-20/hour + tips",
      description: "Delivery driver needed for growing food delivery service. Vehicle provided.",
      requirements: ["Valid driver's license", "Clean driving record", "Customer service"],
      benefits: ["Vehicle provided", "Gas allowance", "Tips", "Health insurance"],
      isHomelessFriendly: true,
      contactEmail: "drivers@nyexpress.com",
      contactPhone: "+1 212 555 0123",
      postedDate: "2024-07-04",
      urgency: "high",
      provider: "Fallback",
      external: false
    }
  ];

  useEffect(() => {
    const defaultLocation = {
      id: 'cyprus',
      name: 'Cyprus',
      icon: '🇨🇾',
      country: 'cyprus',
      coordinates: [33.4, 35.2],
      color: '#dc2626',
      cities: ['Nicosia', 'Kyrenia', 'Famagusta']
    };
    setSelectedLocation(defaultLocation);
    // Initial fetch will happen when selectedLocation changes
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchJobs();
    }
  }, [selectedLocation, selectedType, showHomelessFriendlyOnly, mapLocation]);const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      let endpoint = `${API_CONFIG.BASE_URL}/jobs`;
      const params = new URLSearchParams();

      // Add filters
      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }
      if (showHomelessFriendlyOnly) {
        params.append('homeless_friendly', 'true');
      }

      // Location-based fetching
      if (mapLocation && mapLocation.isCustom) {
        // Use coordinates for location-based search
        params.append('lat', mapLocation.lat.toString());
        params.append('lng', mapLocation.lng.toString());
        params.append('radius', '25'); // 25km radius
        endpoint = `${API_CONFIG.BASE_URL}/jobs/location`;
      } else if (selectedLocation && selectedLocation.country !== 'global') {
        // Use country filter
        params.append('location', selectedLocation.country);
        params.append('lat', selectedLocation.coordinates[1].toString());
        params.append('lng', selectedLocation.coordinates[0].toString());
      }

      // Add external API flag to fetch from Indeed, Adzuna etc.
      params.append('include_external', 'true');
      const finalUrl = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;

      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        const response = await fetch(finalUrl, {
          method: 'GET',
          headers: API_CONFIG.HEADERS,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
          // Transform API data to match our frontend format
          const transformedJobs = data.data.map(job => ({
            id: job.id || job.external_id || Math.random().toString(36).substr(2, 9),
            title: job.title,
            company: job.company,
            type: job.type || 'full-time',
            location: job.location,
            salary: job.salary || 'Competitive',
            description: job.description || 'Job description not available',
            requirements: job.requirements || [],
            benefits: job.benefits || [],
            contactEmail: job.contactEmail || job.contact_email || '',
            contactPhone: job.contactPhone || job.contact_phone || '',
            applicationUrl: job.applicationUrl || job.application_url || '',
            isHomelessFriendly: job.isHomelessFriendly || job.is_homeless_friendly || false,
            postedDate: job.postedDate || job.posted_date || new Date().toISOString(),
            urgency: job.urgency || (job.isHomelessFriendly ? 'high' : 'medium'),
            provider: job.provider || 'API',
            external: job.external || false
          }));
          setJobs(transformedJobs);
          return; // Success, exit function
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (apiError) {
        console.log('API call failed, using fallback data:', apiError.message);
        // Use fallback data and apply filters
        let filteredJobs = [...fallbackJobs];
        // Filter by type
        if (selectedType !== 'all') {
          filteredJobs = filteredJobs.filter(job => job.type === selectedType);
        }
        // Filter by location
        if (selectedLocation && selectedLocation.country !== 'global') {
          if (selectedLocation.country === 'cyprus') {
            filteredJobs = filteredJobs.filter(job => job.location.includes('Cyprus'));
          } else if (selectedLocation.country === 'turkey') {
            filteredJobs = filteredJobs.filter(job => job.location.includes('Turkey'));
          } else if (selectedLocation.country === 'greece') {
            filteredJobs = filteredJobs.filter(job => job.location.includes('Greece'));
          } else if (selectedLocation.country === 'germany') {
            filteredJobs = filteredJobs.filter(job => job.location.includes('Germany'));
          } else if (selectedLocation.country === 'uk') {
            filteredJobs = filteredJobs.filter(job => job.location.includes('UK') || job.location.includes('United Kingdom') || job.location.includes('London') || job.location.includes('Manchester') || job.location.includes('Birmingham'));
          } else if (selectedLocation.country === 'usa') {
            filteredJobs = filteredJobs.filter(job => job.location.includes('USA'));
          }
        }
        // Filter by homeless-friendly
        if (showHomelessFriendlyOnly) {
          filteredJobs = filteredJobs.filter(job => job.isHomelessFriendly);
        }
        setJobs(filteredJobs);
        // Show a subtle warning but don't treat as error
        if (apiError.name === 'AbortError') {
          console.log('Request timeout, using offline data');
        } else {
          console.log('Backend not available, using demo data');
        }
      }
    } catch (err) {
      console.error('Critical error in fetchJobs:', err);
      setError(`Unable to load jobs: ${err.message}. Please check your connection and try again.`);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location) => {
    if (location.isCustom) {
      setMapLocation(location);
      setSelectedLocation({
        id: 'custom',
        name: 'Custom Location',
        icon: '📍',
        color: '#dc2626',
        isCustom: true
      });
    } else {
      setSelectedLocation(location);
      setMapLocation(null);
    }
  };

  const jobTypes = [
    { value: 'all', label: 'All Jobs', icon: '💼' },
    { value: 'full-time', label: 'Full-time', icon: '🕘' },
    { value: 'part-time', label: 'Part-time', icon: '⏰' },
    { value: 'temporary', label: 'Temporary', icon: '📅' },
    { value: 'contract', label: 'Contract', icon: '📝' }
  ];

  const applyToJob = (job) => {
    setAppliedJobs(prev => new Set([...prev, job.id.toString()]));
    const applicationData = {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      applicantInfo: 'Referred from Global Dignity Services Platform',
      timestamp: new Date().toISOString(),
      location: selectedLocation?.name || 'Unknown'
    };

    if (job.applicationUrl) {
      window.open(job.applicationUrl, '_blank');
    } else if (job.contactEmail) {
      const subject = `Application for ${job.title} Position`;
      const body = `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}.

I am currently working with Global Dignity Services and am actively seeking employment in ${selectedLocation?.name || 'your area'}. I believe I would be a good fit for this role.

Please find my contact information below, and I would welcome the opportunity to discuss this position further.

Best regards,
[Your Name]

--
Applied through Global Dignity Services Platform
Application ID: ${applicationData.jobId}-${Date.now()}
Location: ${selectedLocation?.name}`;

      window.location.href = `mailto:${job.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else if (job.contactPhone) {
      const confirmCall = window.confirm(`Call ${job.company} at ${job.contactPhone} to apply for this position?`);
      if (confirmCall) {
        window.location.href = `tel:${job.contactPhone}`;
      }
    } else {
      alert(`Application submitted for ${job.title}!\n\nYour case worker will follow up with next steps within 24 hours.`);
    }
    console.log('Job Application Submitted:', applicationData);
  };

  const getTypeColor = (type) => {
    const baseColors = {
      'full-time': { bg: '#dcfce7', color: '#166534' },
      'part-time': { bg: '#dbeafe', color: '#1e40af' },
      'temporary': { bg: '#fef3c7', color: '#92400e' },
      'contract': { bg: '#f3e8ff', color: '#7c3aed' },
      default: { bg: '#f3f4f6', color: '#374151' }
    };
    
    const darkColors = {
      'full-time': { bg: '#065f46', color: '#34d399' },
      'part-time': { bg: '#1e3a8a', color: '#60a5fa' },
      'temporary': { bg: '#92400e', color: '#fbbf24' },
      'contract': { bg: '#5b21b6', color: '#a78bfa' },
      default: { bg: '#374151', color: '#d1d5db' }
    };
    
    const colors = isDarkMode ? darkColors : baseColors;
    return colors[type] || colors.default;
  };

  const getJobIcon = (type) => {
    switch (type) {
      case 'full-time': return '💼';
      case 'part-time': return '⏰';
      case 'temporary': return '📅';
      case 'contract': return '📝';
      default: return '💼';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB');
  };

  const getLocationFlag = (location) => {
    if (location.includes('Nicosia')) return '🏛️';
    if (location.includes('Kyrenia')) return '🏖️';
    if (location.includes('Famagusta')) return '🏛️';
    if (location.includes('Island-wide')) return '🇨🇾';
    if (location.includes('Istanbul')) return '🏙️';
    if (location.includes('Athens')) return '🏛️';
    if (location.includes('New York')) return '🏙️';
    return '📍';
  };if (loading) {
    return (
      <div style={{ 
        padding: '24px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        background: 'transparent',
        minHeight: 'calc(100vh - 120px)',
        color: isDarkMode ? '#ffffff' : '#1f2937'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${isDarkMode ? '#4b5563' : '#fecaca'}`,
            borderTop: `4px solid ${isDarkMode ? '#10b981' : '#dc2626'}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            marginTop: '20px',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: '18px',
            fontWeight: '500'
          }}>
            🔄 Loading job opportunities...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '24px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        background: 'transparent',
        minHeight: 'calc(100vh - 120px)',
        color: isDarkMode ? '#ffffff' : '#1f2937'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚨</div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: isDarkMode ? '#f9fafb' : '#1f2937',
            margin: '0 0 16px 0',
            textAlign: 'center'
          }}>
            🔌 Connection Error
          </h2>
          <p style={{
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            marginBottom: '32px',
            textAlign: 'center',
            maxWidth: '500px',
            fontSize: '16px',
            lineHeight: '1.6'
          }}>
            {error}
          </p>
          <button
            onClick={fetchJobs}
            style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
            }}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: 'transparent',
      minHeight: 'calc(100vh - 120px)',
      color: isDarkMode ? '#ffffff' : '#1f2937'
    }}>
      {/* Dark Mode Toggle */}
      <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleTheme} />
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 'bold',
          color: isDarkMode ? '#10b981' : '#dc2626',
          marginBottom: '12px',
          margin: '0 0 12px 0'
        }}>
          💼 Global Job Opportunities
        </h1>
        <p style={{
          fontSize: '18px',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          margin: '0 0 8px 0'
        }}>
          Find employment opportunities with homeless-friendly employers worldwide
        </p>
        <div style={{
          background: isDarkMode ? '#374151' : '#fef3c7',
          border: `1px solid ${isDarkMode ? '#4b5563' : '#f59e0b'}`,
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          color: isDarkMode ? '#fbbf24' : '#92400e',
          fontWeight: '500'
        }}>
          📍 Interactive job search • Real-time opportunities • {selectedLocation?.name || 'Select location'} market
        </div>
      </div>

      {/* Location Picker */}
      <LocationPicker
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        isDarkMode={isDarkMode}
      />

      {/* Interactive Job Map */}
      <JobMap
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        userLocation={null}
        isDarkMode={isDarkMode}
      />

      {/* Success Banner */}
      {appliedJobs.size > 0 && (
        <div style={{
          background: isDarkMode ? '#065f46' : '#dcfce7',
          border: `1px solid ${isDarkMode ? '#10b981' : '#16a34a'}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <span style={{ color: isDarkMode ? '#34d399' : '#16a34a', fontWeight: '500' }}>
            Applied to {appliedJobs.size} job{appliedJobs.size > 1 ? 's' : ''}! Your case worker will follow up within 24 hours.
          </span>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1f2937, #111827)'
            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
          padding: '24px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
          boxShadow: isDarkMode 
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: isDarkMode ? '#10b981' : '#dc2626', marginBottom: '8px' }}>
            {jobs.length}
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: '500' }}>
            💼 Total Jobs Available
          </div>
        </div>
        
        <div style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #065f46, #047857)'
            : 'linear-gradient(135deg, #ffffff, #f0fdf4)',
          padding: '24px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#10b981' : '#bbf7d0'}`,
          boxShadow: isDarkMode 
            ? '0 4px 20px rgba(16, 185, 129, 0.2)'
            : '0 4px 20px rgba(34, 197, 94, 0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: isDarkMode ? '#34d399' : '#059669', marginBottom: '8px' }}>
            {jobs.filter(j => j.isHomelessFriendly).length}
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#6ee7b7' : '#047857', fontWeight: '500' }}>
            🤝 Homeless-Friendly
          </div>
        </div>
        
        <div style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)'
            : 'linear-gradient(135deg, #ffffff, #eff6ff)',
          padding: '24px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#3b82f6' : '#bfdbfe'}`,
          boxShadow: isDarkMode 
            ? '0 4px 20px rgba(59, 130, 246, 0.2)'
            : '0 4px 20px rgba(59, 130, 246, 0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: isDarkMode ? '#60a5fa' : '#2563eb', marginBottom: '8px' }}>
            {jobs.filter(j => j.urgency === 'high').length}
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#93c5fd' : '#1e40af', fontWeight: '500' }}>
            🚀 Urgent Hiring
          </div>
        </div>
        
        <div style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #5b21b6, #7c3aed)'
            : 'linear-gradient(135deg, #ffffff, #fef7ff)',
          padding: '24px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#8b5cf6' : '#e9d5ff'}`,
          boxShadow: isDarkMode 
            ? '0 4px 20px rgba(139, 92, 246, 0.2)'
            : '0 4px 20px rgba(168, 85, 247, 0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: isDarkMode ? '#a78bfa' : '#7c3aed', marginBottom: '8px' }}>
            {appliedJobs.size}
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#c4b5fd' : '#6b46c1', fontWeight: '500' }}>
            📝 Applications Sent
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1f2937, #111827)'
          : 'linear-gradient(135deg, #ffffff, #fefefe)',
        border: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: isDarkMode 
          ? '0 8px 30px rgba(0,0,0,0.3)'
          : '0 8px 30px rgba(0,0,0,0.06)'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: isDarkMode ? '#f9fafb' : '#1e293b',
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔍 Filter Jobs
        </h3>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Job Type Filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {jobTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                style={{
                  background: selectedType === type.value
                    ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                    : isDarkMode 
                      ? 'linear-gradient(135deg, #374151, #4b5563)'
                      : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                  color: selectedType === type.value ? 'white' : isDarkMode ? '#d1d5db' : '#475569',
                  border: selectedType === type.value ? '2px solid #dc2626' : `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: selectedType === type.value
                    ? '0 4px 20px rgba(220, 38, 38, 0.3)'
                    : isDarkMode
                      ? '0 2px 10px rgba(0,0,0,0.3)'
                      : '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                <span style={{ fontSize: '14px' }}>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
          
          {/* Homeless-Friendly Filter */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            background: showHomelessFriendlyOnly 
              ? isDarkMode ? '#065f46' : '#dcfce7'
              : isDarkMode ? '#374151' : '#f8fafc',
            padding: '8px 16px',
            borderRadius: '12px',
            border: showHomelessFriendlyOnly 
              ? `2px solid ${isDarkMode ? '#10b981' : '#16a34a'}`
              : `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
            fontSize: '14px',
            fontWeight: '600',
            color: showHomelessFriendlyOnly 
              ? isDarkMode ? '#34d399' : '#16a34a'
              : isDarkMode ? '#d1d5db' : '#475569',
            transition: 'all 0.3s ease'
          }}>
            <input
              type="checkbox"
              checked={showHomelessFriendlyOnly}
              onChange={(e) => setShowHomelessFriendlyOnly(e.target.checked)}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: '16px' }}>🤝</span>
            <span>Homeless-Friendly Only</span>
          </label>
        </div>
      </div>

      {/* Job Listings */}
      <div style={{
        display: 'grid',
        gap: '24px'
      }}>
        {jobs.length === 0 ? (
          <div style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1f2937, #111827)'
              : 'linear-gradient(135deg, #ffffff, #fefefe)',
            border: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
            borderRadius: '20px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: isDarkMode 
              ? '0 8px 30px rgba(0,0,0,0.3)'
              : '0 8px 30px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: isDarkMode ? '#f9fafb' : '#1f2937',
              margin: '0 0 12px 0'
            }}>
              No Jobs Found
            </h3>
            <p style={{
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              fontSize: '16px',
              marginBottom: '24px'
            }}>
              No jobs match your current filters in {selectedLocation?.name || 'the selected location'}.
              Try adjusting your search criteria.
            </p>
            <button
              onClick={() => {
                setSelectedType('all');
                setShowHomelessFriendlyOnly(false);
              }}
              style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
              }}
            >
              🔄 Clear Filters
            </button>
          </div>
        ) : (
          jobs.map((job) => {
            const typeColors = getTypeColor(job.type);
            const isApplied = appliedJobs.has(job.id.toString());
            
            return (
              <div
                key={job.id}
                style={{
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, #1f2937, #111827)'
                    : 'linear-gradient(135deg, #ffffff, #fefefe)',
                  border: job.isHomelessFriendly 
                    ? `2px solid ${isDarkMode ? '#10b981' : '#16a34a'}`
                    : `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: job.isHomelessFriendly
                    ? isDarkMode 
                      ? '0 8px 30px rgba(16, 185, 129, 0.2)'
                      : '0 8px 30px rgba(34, 197, 94, 0.1)'
                    : isDarkMode
                      ? '0 8px 30px rgba(0,0,0,0.3)'
                      : '0 8px 30px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                {/* Job Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: isDarkMode ? '#f9fafb' : '#1e293b',
                      margin: '0 0 8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {getJobIcon(job.type)} {job.title}
                      {job.urgency === 'high' && (
                        <span style={{
                          background: isDarkMode ? '#7f1d1d' : '#fecaca',
                          color: isDarkMode ? '#fca5a5' : '#dc2626',
                          fontSize: '12px',
                          fontWeight: '700',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          animation: 'pulse 2s infinite'
                        }}>
                          🚀 URGENT
                        </span>
                      )}
                    </h3>
                    <div style={{
                      color: isDarkMode ? '#9ca3af' : '#64748b',
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      🏢 {job.company}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: isDarkMode ? '#9ca3af' : '#64748b',
                        fontSize: '14px'
                      }}>
                        {getLocationFlag(job.location)} {job.location}
                      </span>
                      <span style={{
                        background: typeColors.bg,
                        color: typeColors.color,
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {job.type}
                      </span>
                      <span style={{
                        color: isDarkMode ? '#34d399' : '#059669',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        💰 {job.salary}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    alignItems: 'flex-end'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                      fontWeight: '500'
                    }}>
                      📅 Posted {formatDate(job.postedDate)}
                    </span>
                    {job.isHomelessFriendly && (
                      <span style={{
                        background: isDarkMode ? '#065f46' : '#dcfce7',
                        color: isDarkMode ? '#34d399' : '#16a34a',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        🤝 Homeless-Friendly
                      </span>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                <p style={{
                  color: isDarkMode ? '#d1d5db' : '#475569',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: '0 0 20px 0'
                }}>
                  {job.description}
                </p>

                {/* Requirements and Benefits */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  marginBottom: '24px'
                }}>
                  {/* Requirements */}
                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isDarkMode ? '#f3f4f6' : '#374151',
                      margin: '0 0 8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📋 Requirements
                    </h4>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '20px',
                      color: isDarkMode ? '#9ca3af' : '#64748b',
                      fontSize: '14px'
                    }}>
                      {job.requirements.map((req, index) => (
                        <li key={index} style={{ marginBottom: '4px' }}>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Benefits */}
                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isDarkMode ? '#f3f4f6' : '#374151',
                      margin: '0 0 8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      ✨ Benefits
                    </h4>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '20px',
                      color: isDarkMode ? '#9ca3af' : '#64748b',
                      fontSize: '14px'
                    }}>
                      {job.benefits.map((benefit, index) => (
                        <li key={index} style={{ marginBottom: '4px' }}>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={() => applyToJob(job)}
                    disabled={isApplied}
                    style={{
                      background: isApplied
                        ? 'linear-gradient(135deg, #16a34a, #15803d)'
                        : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isApplied ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: isApplied ? 0.8 : 1,
                      boxShadow: isApplied
                        ? '0 4px 14px rgba(34, 197, 94, 0.3)'
                        : '0 4px 14px rgba(220, 38, 38, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isApplied ? (
                      <>
                        ✅ Applied
                      </>
                    ) : (
                      <>
                        📧 Apply Now
                      </>
                    )}
                  </button>
                  
                  {/* Contact Methods */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    {job.contactEmail && (
                      <a
                        href={`mailto:${job.contactEmail}`}
                        style={{
                          background: isDarkMode ? '#374151' : '#f8fafc',
                          color: isDarkMode ? '#d1d5db' : '#475569',
                          border: `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        📧 Email
                      </a>
                    )}
                    {job.contactPhone && (
                      <a
                        href={`tel:${job.contactPhone}`}
                        style={{
                          background: isDarkMode ? '#374151' : '#f8fafc',
                          color: isDarkMode ? '#d1d5db' : '#475569',
                          border: `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        📞 Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #374151, #4b5563)'
          : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
        border: `1px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
        borderRadius: '16px',
        padding: '24px',
        marginTop: '48px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '24px',
          marginBottom: '12px'
        }}>
          💼🤝
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: isDarkMode ? '#f9fafb' : '#1e293b',
          margin: '0 0 8px 0'
        }}>
          Global Dignity Services
        </h3>
        <p style={{
          color: isDarkMode ? '#9ca3af' : '#64748b',
          fontSize: '14px',
          margin: '0 0 16px 0'
        }}>
          Connecting people with dignified employment opportunities worldwide
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          fontSize: '12px',
          color: isDarkMode ? '#6b7280' : '#9ca3af',
          flexWrap: 'wrap'
        }}>
          <span>🌍 Available in 4+ countries</span>
          <span>🤝 Homeless-friendly employers</span>
          <span>📧 24/7 support</span>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translate(-50%, -50%) translateY(0); }
          40% { transform: translate(-50%, -50%) translateY(-5px); }
          60% { transform: translate(-50%, -50%) translateY(-3px); }
        }
        .custom-job-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default Jobs;