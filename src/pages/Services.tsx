import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../components/Layout';

// TypeScript Interfaces
interface Service {
  id: number;
  name: string;
  type: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  hours: string;
  requirements: string[];
  capacity?: number;
  availability?: number;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  external: boolean;
  provider: string;
  urgency: string;
}

interface Location {
  id: string;
  name: string;
  icon: string;
  country: string;
  coordinates: number[];
  color: string;
  cities?: string[];
  isCustom?: boolean;
  lat?: number;
  lng?: number;
}

interface MapLocation {
  lat: number;
  lng: number;
  isCustom?: boolean;
  id?: string;
  name?: string;
  icon?: string;
  country?: string;
  coordinates?: number[];
  color?: string;
}

interface ServiceHotspot {
  lat: number;
  lng: number;
  name: string;
  country: string;
  services: number;
  color: string;
}

interface ApplicationForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  serviceId: number;
  serviceName: string;
  message: string;
}

// Dark Mode Toggle Component
const DarkModeToggle: React.FC<{
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}> = ({ isDarkMode, toggleDarkMode }) => (
  <button
    onClick={toggleDarkMode}
    style={{
      position: 'fixed',
      top: '12px',
      right: '130px',
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

// Mock Services Data
const mockServices: Service[] = [
  // CYPRUS SERVICES
  {
    id: 1,
    name: "Cyprus Red Cross Emergency Shelter",
    type: "shelter",
    description: "24/7 emergency accommodation and support services for displaced individuals and families. Provides safe, temporary housing with meals and basic necessities.",
    address: "123 Ledra Street, Nicosia, Cyprus",
    phone: "+357 22 670 300",
    email: "info@redcross.cy",
    hours: "24 hours",
    requirements: ["Valid ID or passport", "Emergency situation documentation"],
    capacity: 50,
    availability: 15,
    latitude: 35.1856,
    longitude: 33.3823,
    country: "cyprus",
    city: "Nicosia",
    external: false,
    provider: "Cyprus Red Cross",
    urgency: "high"
  },
  {
    id: 2,
    name: "Caritas Cyprus Food Bank",
    type: "food",
    description: "Free food distribution and nutritious meal services for families in need. Weekly food packages and hot meals available.",
    address: "456 Makarios Avenue, Limassol, Cyprus",
    phone: "+357 25 362 722",
    email: "help@caritas.cy",
    hours: "Monday-Friday: 9:00-17:00, Saturday: 9:00-13:00",
    requirements: ["Income verification", "Family size documentation", "Residency proof"],
    capacity: 200,
    availability: 45,
    latitude: 34.6851,
    longitude: 33.0439,
    country: "cyprus",
    city: "Limassol",
    external: false,
    provider: "Caritas Cyprus",
    urgency: "medium"
  },
  {
    id: 3,
    name: "Nicosia General Hospital Emergency Services",
    type: "healthcare",
    description: "24/7 emergency medical care, basic healthcare services, and mental health support. Free emergency treatment for all individuals.",
    address: "789 Hospital Road, Nicosia, Cyprus",
    phone: "+357 22 603 000",
    email: "emergency@ngh.cy",
    hours: "24 hours",
    requirements: ["Valid ID or passport", "Emergency medical situation"],
    latitude: 35.1675,
    longitude: 33.3823,
    country: "cyprus",
    city: "Nicosia",
    external: false,
    provider: "Cyprus Ministry of Health",
    urgency: "high"
  },
  {
    id: 4,
    name: "Kyrenia Social Services Center",
    type: "social",
    description: "Comprehensive social support services including housing assistance, job placement help, and family counseling.",
    address: "321 Kyrenia Harbor Road, Kyrenia, Cyprus",
    phone: "+357 24 815 200",
    email: "services@kyrenia.gov.cy",
    hours: "Monday-Friday: 8:00-16:00",
    requirements: ["Proof of need", "Valid identification", "Local residence"],
    capacity: 100,
    availability: 30,
    latitude: 35.3367,
    longitude: 33.3234,
    country: "cyprus",
    city: "Kyrenia",
    external: false,
    provider: "Kyrenia Municipality",
    urgency: "medium"
  },
  // TURKEY SERVICES
  {
    id: 5,
    name: "Turkish Red Crescent - Istanbul Branch",
    type: "shelter",
    description: "Emergency shelter and humanitarian aid services for displaced persons. Provides temporary accommodation, meals, and basic necessities.",
    address: "Kemankeş Karamustafa Paşa Mah., Beyoğlu, Istanbul, Turkey",
    phone: "+90 212 292 1111",
    email: "istanbul@kizilay.org.tr",
    hours: "24 hours",
    requirements: ["Emergency situation", "Valid documentation", "Registration"],
    capacity: 150,
    availability: 35,
    latitude: 41.0082,
    longitude: 28.9784,
    country: "turkey",
    city: "Istanbul",
    external: false,
    provider: "Turkish Red Crescent",
    urgency: "high"
  },
  {
    id: 6,
    name: "Ankara Food Aid Foundation",
    type: "food",
    description: "Free food distribution center providing daily meals and weekly food packages for families in need.",
    address: "Çankaya District, Ankara, Turkey",
    phone: "+90 312 468 7890",
    email: "yardim@ankarafood.org.tr",
    hours: "Daily: 8:00-20:00",
    requirements: ["Income assessment", "Family documentation", "Local registration"],
    capacity: 300,
    availability: 80,
    latitude: 39.9334,
    longitude: 32.8597,
    country: "turkey",
    city: "Ankara",
    external: false,
    provider: "Ankara Food Aid Foundation",
    urgency: "medium"
  },
  {
    id: 7,
    name: "Istanbul University Medical Center",
    type: "healthcare",
    description: "Free medical services including emergency care, general consultations, and specialized treatments for vulnerable populations.",
    address: "Fatih, Istanbul, Turkey",
    phone: "+90 212 414 2000",
    email: "hasta@istanbul.edu.tr",
    hours: "24 hours emergency, 8:00-17:00 general",
    requirements: ["Medical emergency or appointment", "Valid ID"],
    latitude: 41.0082,
    longitude: 28.9784,
    country: "turkey",
    city: "Istanbul",
    external: false,
    provider: "Istanbul University",
    urgency: "high"
  },
  {
    id: 8,
    name: "ASAM - Ankara Integration Center",
    type: "social",
    description: "Comprehensive integration services including language courses, job training, legal aid, and social support programs.",
    address: "Kızılay, Ankara, Turkey",
    phone: "+90 312 430 5050",
    email: "ankara@asam.org.tr",
    hours: "Monday-Friday: 9:00-17:00",
    requirements: ["Registration", "Proof of status", "Language assessment"],
    capacity: 200,
    availability: 50,
    latitude: 39.9334,
    longitude: 32.8597,
    country: "turkey",
    city: "Ankara",
    external: false,
    provider: "ASAM Turkey",
    urgency: "medium"
  },
  // GREECE SERVICES
  {
    id: 9,
    name: "Greek Red Cross - Athens Emergency Center",
    type: "shelter",
    description: "Emergency accommodation and humanitarian assistance for refugees and homeless individuals. Provides safe housing and basic necessities.",
    address: "Patision Street, Athens, Greece",
    phone: "+30 210 362 1681",
    email: "info@redcross.gr",
    hours: "24 hours",
    requirements: ["Emergency situation", "Valid documentation", "Health screening"],
    capacity: 120,
    availability: 25,
    latitude: 37.9755,
    longitude: 23.7348,
    country: "greece",
    city: "Athens",
    external: false,
    provider: "Greek Red Cross",
    urgency: "high"
  },
  {
    id: 10,
    name: "Athens Food Bank",
    type: "food",
    description: "Daily food distribution and hot meal services for vulnerable populations. Provides nutritious meals and food packages.",
    address: "Omonoia Square, Athens, Greece",
    phone: "+30 210 523 4567",
    email: "help@athensfoodbank.gr",
    hours: "Daily: 7:00-19:00",
    requirements: ["Need assessment", "Valid ID", "Registration"],
    capacity: 250,
    availability: 60,
    latitude: 37.9755,
    longitude: 23.7348,
    country: "greece",
    city: "Athens",
    external: false,
    provider: "Athens Food Bank",
    urgency: "medium"
  },
  {
    id: 11,
    name: "Thessaloniki Public Health Center",
    type: "healthcare",
    description: "Free healthcare services including medical consultations, mental health support, and emergency treatment.",
    address: "Aristotelous Square, Thessaloniki, Greece",
    phone: "+30 2310 999 000",
    email: "health@thess.gr",
    hours: "24 hours emergency, 8:00-16:00 general",
    requirements: ["Medical need", "Valid identification"],
    latitude: 40.6401,
    longitude: 22.9444,
    country: "greece",
    city: "Thessaloniki",
    external: false,
    provider: "Greek Ministry of Health",
    urgency: "high"
  },
  // GERMANY SERVICES
  {
    id: 12,
    name: "Berlin Emergency Shelter Network",
    type: "shelter",
    description: "Comprehensive emergency housing network providing temporary accommodation, meals, and support services for homeless individuals.",
    address: "Alexanderplatz, Berlin, Germany",
    phone: "+49 30 902 770",
    email: "notunterkunft@berlin.de",
    hours: "24 hours",
    requirements: ["Emergency housing need", "Registration", "ID document"],
    capacity: 200,
    availability: 45,
    latitude: 52.5200,
    longitude: 13.4050,
    country: "germany",
    city: "Berlin",
    external: false,
    provider: "Berlin Senate",
    urgency: "high"
  },
  {
    id: 13,
    name: "Munich Food Distribution Center",
    type: "food",
    description: "Free food distribution and community kitchen services. Provides daily meals and weekly food packages for families in need.",
    address: "Marienplatz, Munich, Germany",
    phone: "+49 89 233 96000",
    email: "hilfe@muenchen.de",
    hours: "Daily: 8:00-20:00",
    requirements: ["Income verification", "Munich residence", "Registration"],
    capacity: 350,
    availability: 100,
    latitude: 48.1351,
    longitude: 11.5820,
    country: "germany",
    city: "Munich",
    external: false,
    provider: "Munich Social Services",
    urgency: "medium"
  },
  {
    id: 14,
    name: "Hamburg Medical Aid Station",
    type: "healthcare",
    description: "Free medical care for vulnerable populations including homeless individuals and refugees. Provides basic healthcare and emergency treatment.",
    address: "St. Pauli, Hamburg, Germany",
    phone: "+49 40 428 37 0",
    email: "medizin@hamburg.de",
    hours: "Monday-Friday: 8:00-18:00, Emergency: 24 hours",
    requirements: ["Medical need", "Valid ID or temporary document"],
    latitude: 53.5511,
    longitude: 9.9937,
    country: "germany",
    city: "Hamburg",
    external: false,
    provider: "Hamburg Health Authority",
    urgency: "high"
  },
  // UNITED KINGDOM SERVICES
  {
    id: 15,
    name: "London Crisis Emergency Shelter",
    type: "shelter",
    description: "Emergency accommodation and support services for homeless individuals in London. Provides immediate housing and pathway to permanent solutions.",
    address: "Westminster, London, UK",
    phone: "+44 20 7426 3800",
    email: "help@crisis.org.uk",
    hours: "24 hours",
    requirements: ["Homelessness assessment", "UK residence status", "Registration"],
    capacity: 180,
    availability: 30,
    latitude: 51.5074,
    longitude: -0.1278,
    country: "uk",
    city: "London",
    external: false,
    provider: "Crisis UK",
    urgency: "high"
  },
  {
    id: 16,
    name: "Manchester Food Bank Network",
    type: "food",
    description: "Network of food banks providing emergency food supplies and hot meals for individuals and families in crisis.",
    address: "Manchester City Centre, Manchester, UK",
    phone: "+44 161 834 2563",
    email: "info@manchesterfoodbank.org.uk",
    hours: "Tuesday, Wednesday, Friday: 10:00-14:00",
    requirements: ["Foodbank voucher", "Proof of need", "Local referral"],
    capacity: 200,
    availability: 55,
    latitude: 53.4808,
    longitude: -2.2426,
    country: "uk",
    city: "Manchester",
    external: false,
    provider: "Manchester Food Bank",
    urgency: "medium"
  },
  {
    id: 17,
    name: "Birmingham NHS Walk-in Centre",
    type: "healthcare",
    description: "Free NHS healthcare services including emergency treatment, general consultations, and mental health support.",
    address: "Birmingham City Centre, Birmingham, UK",
    phone: "+44 121 465 0000",
    email: "info@birminghamnhs.uk",
    hours: "24 hours emergency, 8:00-20:00 walk-in",
    requirements: ["Medical need", "NHS eligibility or emergency treatment"],
    latitude: 52.4862,
    longitude: -1.8904,
    country: "uk",
    city: "Birmingham",
    external: false,
    provider: "NHS Birmingham",
    urgency: "high"
  },
  // UNITED STATES SERVICES
  {
    id: 18,
    name: "New York City Emergency Shelter System",
    type: "shelter",
    description: "Comprehensive emergency shelter network providing temporary housing, meals, and support services for homeless individuals and families.",
    address: "Manhattan, New York, NY, USA",
    phone: "+1 212 639 9675",
    email: "info@nycgov.org",
    hours: "24 hours",
    requirements: ["Homelessness verification", "Valid ID", "Intake assessment"],
    capacity: 300,
    availability: 60,
    latitude: 40.7128,
    longitude: -74.0060,
    country: "usa",
    city: "New York",
    external: false,
    provider: "NYC Department of Homeless Services",
    urgency: "high"
  },
  {
    id: 19,
    name: "Los Angeles Food Bank",
    type: "food",
    description: "Largest food bank in the US providing food assistance to individuals and families in need throughout Los Angeles County.",
    address: "Downtown Los Angeles, CA, USA",
    phone: "+1 323 234 3030",
    email: "info@lafoodbank.org",
    hours: "Monday-Friday: 8:00-16:00",
    requirements: ["Income verification", "LA County residence", "Registration"],
    capacity: 500,
    availability: 150,
    latitude: 34.0522,
    longitude: -118.2437,
    country: "usa",
    city: "Los Angeles",
    external: false,
    provider: "Los Angeles Regional Food Bank",
    urgency: "medium"
  },
  {
    id: 20,
    name: "Chicago Community Health Center",
    type: "healthcare",
    description: "Free community health services including medical care, dental services, and mental health support for underserved populations.",
    address: "Chicago Loop, Chicago, IL, USA",
    phone: "+1 312 746 4835",
    email: "health@chicago.gov",
    hours: "Monday-Friday: 8:00-17:00, Emergency: 24 hours",
    requirements: ["Medical need", "Income verification", "Chicago residence"],
    latitude: 41.8781,
    longitude: -87.6298,
    country: "usa",
    city: "Chicago",
    external: false,
    provider: "Chicago Department of Public Health",
    urgency: "high"
  }
];

// Location Picker Component
const LocationPicker: React.FC<{
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
  isDarkMode: boolean;
}> = ({ onLocationSelect, selectedLocation, isDarkMode }) => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    country: string;
    city: string;
  } | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  
  const locations: Location[] = [
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
      cities: ['Nicosia', 'Kyrenia', 'Limassol']
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
        const countryMap: { [key: string]: string } = {
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
      console.log('Location detection failed, defaulting to Cyprus:', error);
      setDetectedCountry('cyprus');
    }
  };

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location);
  };

  const handleCurrentLocation = () => {
    if (detectedCountry) {
      const currentLocation = locations.find(loc => loc.country === detectedCountry);
      if (currentLocation) {
        handleLocationSelect(currentLocation);
      }
    }
  };

  return (
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
          🏢 Service Location Select
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
              Showing services for {selectedLocation.name}
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

// Interactive Service Map Component with Leaflet
const ServiceMap: React.FC<{
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
  userLocation: { lat: number; lng: number } | null;
  isDarkMode: boolean;
}> = ({ onLocationSelect, selectedLocation, userLocation, isDarkMode }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLocation, setMapLocation] = useState<MapLocation>({ lat: 35.1856, lng: 33.3823 });
  const [hoveredPoint, setHoveredPoint] = useState<ServiceHotspot | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const serviceHotspots: ServiceHotspot[] = [
    // Cyprus
    { lat: 35.1856, lng: 33.3823, name: "Nicosia", country: "Cyprus", services: 8, color: "#dc2626" },
    { lat: 35.3367, lng: 33.3234, name: "Kyrenia", country: "Cyprus", services: 5, color: "#dc2626" },
    { lat: 34.6851, lng: 33.0439, name: "Limassol", country: "Cyprus", services: 6, color: "#dc2626" },
    
    // Turkey
    { lat: 41.0082, lng: 28.9784, name: "Istanbul", country: "Turkey", services: 12, color: "#059669" },
    { lat: 39.9334, lng: 32.8597, name: "Ankara", country: "Turkey", services: 8, color: "#059669" },
    
    // Greece
    { lat: 37.9755, lng: 23.7348, name: "Athens", country: "Greece", services: 7, color: "#7c3aed" },
    { lat: 40.6401, lng: 22.9444, name: "Thessaloniki", country: "Greece", services: 4, color: "#7c3aed" },
    
    // Germany
    { lat: 52.5200, lng: 13.4050, name: "Berlin", country: "Germany", services: 15, color: "#f97316" },
    { lat: 48.1351, lng: 11.5820, name: "Munich", country: "Germany", services: 12, color: "#f97316" },
    { lat: 53.5511, lng: 9.9937, name: "Hamburg", country: "Germany", services: 9, color: "#f97316" },
    
    // UK
    { lat: 51.5074, lng: -0.1278, name: "London", country: "UK", services: 18, color: "#8b5cf6" },
    { lat: 53.4808, lng: -2.2426, name: "Manchester", country: "UK", services: 11, color: "#8b5cf6" },
    { lat: 52.4862, lng: -1.8904, name: "Birmingham", country: "UK", services: 8, color: "#8b5cf6" },
    
    // USA
    { lat: 40.7128, lng: -74.0060, name: "New York", country: "USA", services: 25, color: "#f59e0b" },
    { lat: 34.0522, lng: -118.2437, name: "Los Angeles", country: "USA", services: 20, color: "#f59e0b" },
    { lat: 41.8781, lng: -87.6298, name: "Chicago", country: "USA", services: 16, color: "#f59e0b" },
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

        leafletMapRef.current.on('click', (e: any) => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          setMapLocation({ lat, lng });
          onLocationSelect({ 
            id: 'custom',
            name: 'Custom Location',
            icon: '📍',
            country: 'custom',
            coordinates: [lng, lat],
            color: '#dc2626',
            lat, 
            lng, 
            isCustom: true 
          });
        });

        setMapLoaded(true);
        addServiceMarkers();
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
      leafletMapRef.current.eachLayer((layer: any) => {
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

      addServiceMarkers();
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

  const addServiceMarkers = () => {
    if (!leafletMapRef.current || !window.L) return;

    markersRef.current.forEach(marker => {
      leafletMapRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    serviceHotspots.forEach((spot) => {
      const markerSize = Math.max(20, spot.services * 2);
      const customIcon = window.L.divIcon({
        className: 'custom-service-marker',
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
            ${spot.services}
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
          <h4 style="margin: 0 0 8px 0; color: ${spot.color};">🏢 ${spot.name}</h4>
          <p style="margin: 0; color: #374151;"><strong>${spot.services} services</strong></p>
          <button 
            onclick="window.selectServiceLocation && window.selectServiceLocation(${spot.lat}, ${spot.lng}, '${spot.name}', '${spot.country}')"
            style="background: ${spot.color}; color: white; border: none; padding: 6px 12px; border-radius: 6px; margin-top: 8px; cursor: pointer;"
          >
            Search Services Here
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    (window as any).selectServiceLocation = (lat: number, lng: number, name: string, country: string) => {
      onLocationSelect({ 
        id: 'custom',
        name: name,
        icon: '📍',
        country: country.toLowerCase(),
        coordinates: [lng, lat],
        color: '#dc2626',
        lat, 
        lng, 
        isCustom: true 
      });
    };
  };

  useEffect(() => {
    if (mapLoaded) {
      addServiceMarkers();
    }
  }, [mapLoaded]);

  return (
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
        🗺️ Interactive Service Map
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
          height: '400px',
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
            Selected Service Search Location:
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: isDarkMode ? '#f9fafb' : '#1e293b' }}>
            🏢 {mapLocation.lat.toFixed(4)}, {mapLocation.lng.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
};

// Application Modal Component
const ApplicationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  isDarkMode: boolean;
  onSubmit: (application: ApplicationForm) => void;
}> = ({ isOpen, onClose, service, isDarkMode, onSubmit }) => {
  const [formData, setFormData] = useState<ApplicationForm>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    serviceId: service.id,
    serviceName: service.name,
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      serviceId: service.id,
      serviceName: service.name,
      message: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1f2937, #111827)'
          : 'linear-gradient(135deg, #ffffff, #fefefe)',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: isDarkMode 
          ? '0 20px 60px rgba(0,0,0,0.5)'
          : '0 20px 60px rgba(0,0,0,0.15)',
        border: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: isDarkMode ? '#f9fafb' : '#1e293b',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 Apply for Service
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          background: isDarkMode ? '#374151' : '#f8fafc',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: isDarkMode ? '#f9fafb' : '#1e293b',
            marginBottom: '8px'
          }}>
            🏢 {service.name}
          </div>
          <div style={{
            fontSize: '14px',
            color: isDarkMode ? '#9ca3af' : '#6b7280'
          }}>
            {service.provider} • {service.city}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: isDarkMode ? '#f3f4f6' : '#374151',
                marginBottom: '8px'
              }}>
                👤 First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
                  background: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#f9fafb' : '#1e293b',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: isDarkMode ? '#f3f4f6' : '#374151',
                marginBottom: '8px'
              }}>
                👤 Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
                  background: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#f9fafb' : '#1e293b',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#f3f4f6' : '#374151',
              marginBottom: '8px'
            }}>
              📞 Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
                background: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#f9fafb' : '#1e293b',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#f3f4f6' : '#374151',
              marginBottom: '8px'
            }}>
              📧 Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
                background: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#f9fafb' : '#1e293b',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#f3f4f6' : '#374151',
              marginBottom: '8px'
            }}>
              📝 Additional Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
                background: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#f9fafb' : '#1e293b',
                fontSize: '14px',
                resize: 'vertical'
              }}
              placeholder="Tell us about your situation or any specific needs..."
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: isDarkMode ? '#374151' : '#f8fafc',
                color: isDarkMode ? '#d1d5db' : '#475569',
                border: `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
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
              📋 Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Services Component
const Services: React.FC = () => {
  // Layout'tan tema durumunu al
  const { isDark: isDarkMode, toggleTheme } = useTheme();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [appliedServices, setAppliedServices] = useState<Set<string>>(new Set());
  const [applicationModal, setApplicationModal] = useState<{
    isOpen: boolean;
    service: Service | null;
  }>({
    isOpen: false,
    service: null
  });

  // API Configuration
  const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api',
    TIMEOUT: 10000,
    HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  useEffect(() => {
    const defaultLocation: Location = {
      id: 'cyprus',
      name: 'Cyprus',
      icon: '🇨🇾',
      country: 'cyprus',
      coordinates: [33.4, 35.2],
      color: '#dc2626',
      cities: ['Nicosia', 'Kyrenia', 'Limassol']
    };
    setSelectedLocation(defaultLocation);
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchServices();
    }
  }, [selectedLocation, selectedType, mapLocation]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call with better fallback data filtering
      setTimeout(() => {
        let filteredServices = [...mockServices];
        
        // Filter by location first
        if (selectedLocation && selectedLocation.country !== 'global') {
          filteredServices = filteredServices.filter(service => 
            service.country === selectedLocation.country
          );
        }
        
        // Filter by type
        if (selectedType !== 'all') {
          filteredServices = filteredServices.filter(service => 
            service.type === selectedType
          );
        }
        
        // If custom map location, prioritize nearby services
        if (mapLocation && mapLocation.isCustom) {
          filteredServices = filteredServices.sort((a, b) => {
            const distanceA = calculateDistance(mapLocation, a);
            const distanceB = calculateDistance(mapLocation, b);
            return distanceA - distanceB;
          });
        }
        
        setServices(filteredServices);
        setLoading(false);
      }, 800);
      
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Unable to load services. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable');
        }
      );
    }
  };

  const handleLocationSelect = (location: Location) => {
    if (location.isCustom) {
      const mapLoc: MapLocation = {
        lat: location.lat!,
        lng: location.lng!,
        isCustom: true,
        id: location.id,
        name: location.name,
        icon: location.icon,
        country: location.country,
        coordinates: location.coordinates,
        color: location.color
      };
      setMapLocation(mapLoc);
      setSelectedLocation({
        id: 'custom',
        name: 'Custom Location',
        icon: '📍',
        country: 'custom',
        coordinates: [location.lng || 0, location.lat || 0],
        color: '#dc2626',
        isCustom: true,
        lat: location.lat,
        lng: location.lng
      });
    } else {
      setSelectedLocation(location);
      setMapLocation(null);
    }
  };

  const calculateDistance = (point1: MapLocation, point2: Service): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.latitude - point1.lat) * Math.PI / 180;
    const dLon = (point2.longitude - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getDirections = (service: Service) => {
    if (service.latitude && service.longitude) {
      const destination = `${service.latitude},${service.longitude}`;
      const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
      const mapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
      window.open(mapsUrl, '_blank');
    } else {
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(service.address)}`;
      window.open(searchUrl, '_blank');
    }
  };

  const handleApplyToService = (service: Service) => {
    setApplicationModal({
      isOpen: true,
      service: service
    });
  };

  const handleSubmitApplication = async (application: ApplicationForm) => {
    try {
      // Add to applied services
      setAppliedServices(prev => new Set([...prev, application.serviceId.toString()]));
      
      // Here you would normally send to your backend
      const applicationData = {
        ...application,
        timestamp: new Date().toISOString(),
        location: selectedLocation?.name || 'Unknown'
      };
      
      console.log('Service Application Submitted:', applicationData);
      
      // Show success message
      alert(`✅ Application submitted successfully for ${application.serviceName}!\n\nYour application has been sent to the service provider. They will contact you within 24-48 hours using the information you provided.`);
      
      // In a real app, you would send this to your backend:
      // await fetch(`${API_CONFIG.BASE_URL}/applications/services`, {
      //   method: 'POST',
      //   headers: API_CONFIG.HEADERS,
      //   body: JSON.stringify(applicationData)
      // });
      
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('❌ Error submitting application. Please try again.');
    }
  };

  const getServiceTypeInfo = (type: string) => {
    const typeInfo: { [key: string]: { icon: string; label: string; color: string } } = {
      'shelter': { icon: '🏠', label: 'Emergency Shelter', color: '#dc2626' },
      'food': { icon: '🍽️', label: 'Food Assistance', color: '#059669' },
      'healthcare': { icon: '🏥', label: 'Healthcare Services', color: '#7c3aed' },
      'social': { icon: '🤝', label: 'Social Services', color: '#f97316' },
      'employment': { icon: '💼', label: 'Employment Support', color: '#8b5cf6' },
      'legal': { icon: '⚖️', label: 'Legal Aid', color: '#06b6d4' }
    };
    return typeInfo[type] || { icon: '📋', label: type, color: '#6b7280' };
  };

  const serviceTypes = [
    { value: 'all', label: 'All Services', icon: '🏢' },
    { value: 'shelter', label: 'Shelter', icon: '🏠' },
    { value: 'food', label: 'Food', icon: '🍽️' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'social', label: 'Social', icon: '🤝' },
    { value: 'employment', label: 'Employment', icon: '💼' },
    { value: 'legal', label: 'Legal', icon: '⚖️' }
  ];

  if (loading) {
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
            🔄 Loading essential services...
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
            onClick={fetchServices}
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
          🏢 Essential Services Hub
        </h1>
        <p style={{
          fontSize: '18px',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          margin: '0 0 8px 0'
        }}>
          🗺️ Interactive map • 📍 Real-time location • 🌍 Global + Local services
        </p>
        <div style={{
          background: isDarkMode ? '#1e40af' : '#fef3c7',
          border: `1px solid ${isDarkMode ? '#3b82f6' : '#f59e0b'}`,
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          color: isDarkMode ? '#bfdbfe' : '#92400e',
          fontWeight: '500'
        }}>
          📍 Click on the map for location-based search • Apply directly to services
        </div>
      </div>

      {/* Success Banner */}
      {appliedServices.size > 0 && (
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
            Applied to {appliedServices.size} service{appliedServices.size > 1 ? 's' : ''}! Service providers will contact you within 24-48 hours.
          </span>
        </div>
      )}

      {/* Location Picker */}
      <LocationPicker
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        isDarkMode={isDarkMode}
      />

      {/* Interactive Map */}
      <ServiceMap
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        userLocation={userLocation}
        isDarkMode={isDarkMode}
      />

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #1f2937, #111827)'
            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
          padding: '28px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: isDarkMode ? '#10b981' : '#dc2626', marginBottom: '8px' }}>
            {services.length}
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: '500' }}>
            🏢 Total Services Found
          </div>
        </div>
        
        <div style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #064e3b, #022c22)'
            : 'linear-gradient(135deg, #ffffff, #f0fdf4)',
          padding: '28px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#059669' : '#bbf7d0'}`,
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(5, 150, 105, 0.2)'
            : '0 4px 20px rgba(34, 197, 94, 0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>
            {services.filter(s => s.external).length}
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#6ee7b7' : '#047857', fontWeight: '500' }}>
            🌍 External Services
          </div>
        </div>
        
        <div style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #581c87, #3b0764)'
            : 'linear-gradient(135deg, #ffffff, #fef7ff)',
          padding: '28px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#7c3aed' : '#e9d5ff'}`,
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(124, 58, 237, 0.2)'
            : '0 4px 20px rgba(168, 85, 247, 0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '8px' }}>
            {services.filter(s => !s.external).length}
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#c4b5fd' : '#6d28d9', fontWeight: '500' }}>
            💾 Database Services
          </div>
        </div>
        
        <div style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #7f1d1d, #450a0a)'
            : 'linear-gradient(135deg, #ffffff, #fef2f2)',
          padding: '28px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#ef4444' : '#fecaca'}`,
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(239, 68, 68, 0.2)'
            : '0 4px 20px rgba(248, 113, 113, 0.1)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
            {services.filter(s => s.urgency === 'high').length}
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#fca5a5' : '#b91c1c', fontWeight: '500' }}>
            🚨 Urgent Services
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div style={{
        padding: '32px',
        borderRadius: '20px',
        border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
        marginBottom: '40px',
        boxShadow: isDarkMode
          ? '0 8px 30px rgba(0,0,0,0.3)'
          : '0 8px 30px rgba(0,0,0,0.06)',
        background: isDarkMode
          ? 'linear-gradient(135deg, #1f2937, #111827)'
          : 'linear-gradient(135deg, #ffffff, #fefefe)'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: isDarkMode ? '#f9fafb' : '#1e293b',
          marginBottom: '20px',
          margin: '0 0 20px 0'
        }}>
          🎯 Filter by Service Type
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {serviceTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              style={{
                padding: '14px 24px',
                borderRadius: '30px',
                border: 'none',
                background: selectedType === type.value
                  ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                  : isDarkMode
                    ? 'linear-gradient(135deg, #374151, #4b5563)'
                    : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                color: selectedType === type.value
                  ? 'white'
                  : isDarkMode ? '#f9fafb' : '#475569',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: selectedType === type.value
                  ? '0 4px 20px rgba(220, 38, 38, 0.3)'
                  : isDarkMode
                    ? '0 2px 10px rgba(0,0,0,0.3)'
                    : '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              <span style={{ fontSize: '16px' }}>{type.icon}</span>
              {type.label} ({services.filter(s => type.value === 'all' || s.type === type.value).length})
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '28px'
      }}>
        {services.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            background: isDarkMode
              ? 'linear-gradient(135deg, #1f2937, #111827)'
              : 'linear-gradient(135deg, #ffffff, #fefefe)',
            borderRadius: '20px',
            border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
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
              🚫 No Services Found
            </h3>
            <p style={{
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              fontSize: '16px',
              marginBottom: '24px'
            }}>
              No services available for the selected filters in {selectedLocation?.name || 'this location'}. Try different criteria.
            </p>
            <button
              onClick={() => setSelectedType('all')}
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
              🎯 View All Services
            </button>
          </div>
        ) : (
          services.map((service) => {
            const typeInfo = getServiceTypeInfo(service.type);
            const distance = userLocation ? calculateDistance(userLocation, service) : null;
            const isApplied = appliedServices.has(service.id.toString());
            
            return (
              <div
                key={service.id}
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1f2937, #111827)'
                    : 'linear-gradient(135deg, #ffffff, #fefefe)',
                  borderRadius: '20px',
                  border: service.external
                    ? `2px solid ${isDarkMode ? '#059669' : '#10b981'}`
                    : `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                  overflow: 'hidden',
                  boxShadow: service.external
                    ? isDarkMode
                      ? '0 8px 30px rgba(5, 150, 105, 0.3)'
                      : '0 8px 30px rgba(16, 185, 129, 0.15)'
                    : isDarkMode
                      ? '0 8px 30px rgba(0,0,0,0.3)'
                      : '0 8px 30px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Service Header */}
                <div style={{
                  background: service.external
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : `linear-gradient(135deg, ${typeInfo.color}, ${typeInfo.color}dd)`,
                  padding: '28px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {typeInfo.icon} {service.type.toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                      {service.external && (
                        <div style={{
                          background: 'rgba(255,255,255,0.9)',
                          color: '#059669',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          🌍 EXTERNAL
                        </div>
                      )}
                      {distance && (
                        <div style={{
                          background: 'rgba(255,255,255,0.9)',
                          color: typeInfo.color,
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          📍 {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                        </div>
                      )}
                      {service.urgency === 'high' && (
                        <div style={{
                          background: 'rgba(255,255,255,0.9)',
                          color: '#dc2626',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          animation: 'pulse 2s infinite'
                        }}>
                          🚨 URGENT
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    margin: 0,
                    lineHeight: '1.3',
                    color: 'white'
                  }}>
                    {service.name}
                  </h3>
                  {service.provider && (
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.8)',
                      marginTop: '8px'
                    }}>
                      Provider: {service.provider}
                    </div>
                  )}
                </div>

                {/* Service Content */}
                <div style={{ padding: '28px' }}>
                  <p style={{
                    color: isDarkMode ? '#9ca3af' : '#64748b',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    marginBottom: '24px',
                    margin: '0 0 24px 0'
                  }}>
                    {service.description}
                  </p>

                  {/* Contact Information */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '12px',
                      padding: '12px',
                      background: isDarkMode ? '#374151' : '#f8fafc',
                      borderRadius: '12px'
                    }}>
                      <span style={{ fontSize: '18px' }}>📍</span>
                      <div>
                        <div style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#475569', fontWeight: '500' }}>
                          {service.address}
                        </div>
                      </div>
                    </div>
                    
                    {service.phone && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: isDarkMode ? '#1e3a8a' : '#f0f9ff',
                        borderRadius: '12px',
                        marginBottom: '12px'
                      }}>
                        <span style={{ fontSize: '18px' }}>📞</span>
                        <span style={{ fontWeight: '600', color: isDarkMode ? '#93c5fd' : '#0369a1', fontSize: '15px' }}>
                          {service.phone}
                        </span>
                      </div>
                    )}
                    
                    {service.email && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: isDarkMode ? '#065f46' : '#f0fdf4',
                        borderRadius: '12px',
                        marginBottom: '12px'
                      }}>
                        <span style={{ fontSize: '18px' }}>📧</span>
                        <span style={{ fontWeight: '600', color: isDarkMode ? '#6ee7b7' : '#047857', fontSize: '15px' }}>
                          {service.email}
                        </span>
                      </div>
                    )}
                    
                    {service.hours && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: isDarkMode ? '#581c87' : '#fef7ff',
                        borderRadius: '12px'
                      }}>
                        <span style={{ fontSize: '18px' }}>🕒</span>
                        <span style={{ fontSize: '14px', color: isDarkMode ? '#c4b5fd' : '#6d28d9', fontWeight: '500' }}>
                          {service.hours}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Requirements */}
                  {service.requirements && service.requirements.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: isDarkMode ? '#f3f4f6' : '#1f2937',
                        marginBottom: '8px',
                        margin: '0 0 8px 0'
                      }}>
                        📋 Requirements:
                      </h4>
                      <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        color: isDarkMode ? '#9ca3af' : '#4b5563'
                      }}>
                        {service.requirements.map((req, index) => (
                          <li key={index} style={{
                            fontSize: '14px',
                            marginBottom: '4px'
                          }}>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Capacity Info */}
                  {(service.availability !== undefined || service.capacity !== undefined) && (
                    <div style={{
                      background: isDarkMode ? '#064e3b' : '#f0fdf4',
                      border: `1px solid ${isDarkMode ? '#059669' : '#bbf7d0'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ fontSize: '14px', color: isDarkMode ? '#6ee7b7' : '#16a34a', fontWeight: '600' }}>
                        🏠 Capacity: {service.availability || 0} available / {service.capacity || 0} total
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '6px', 
                        background: isDarkMode ? '#065f46' : '#dcfce7', 
                        borderRadius: '3px',
                        marginTop: '8px'
                      }}>
                        <div style={{ 
                          width: `${service.capacity ? ((service.availability || 0) / service.capacity) * 100 : 0}%`, 
                          height: '100%', 
                          background: isDarkMode ? '#34d399' : '#16a34a', 
                          borderRadius: '3px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <button
                      onClick={() => handleApplyToService(service)}
                      disabled={isApplied}
                      style={{
                        background: isApplied
                          ? 'linear-gradient(135deg, #16a34a, #15803d)'
                          : service.external
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : `linear-gradient(135deg, ${typeInfo.color}, ${typeInfo.color}dd)`,
                        color: 'white',
                        border: 'none',
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: isApplied ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                        opacity: isApplied ? 0.8 : 1
                      }}
                    >
                      {isApplied ? '✅ Applied' : '📋 Apply Now'}
                    </button>
                    
                    {service.phone && (
                      <button
                        onClick={() => window.open(`tel:${service.phone}`, '_self')}
                        style={{
                          background: 'linear-gradient(135deg, #059669, #047857)',
                          color: 'white',
                          border: 'none',
                          padding: '16px',
                          borderRadius: '12px',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        📞 Call Now
                      </button>
                    )}
                    
                    <button
                      onClick={() => getDirections(service)}
                      style={{
                        background: 'linear-gradient(135deg, #059669, #047857)',
                        color: 'white',
                        border: 'none',
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🗺️ Directions
                    </button>
                  </div>
                  
                  {service.email && (
                    <button
                      onClick={() => window.open(`mailto:${service.email}`, '_self')}
                      style={{
                        background: isDarkMode ? '#374151' : '#f8fafc',
                        color: isDarkMode ? '#d1d5db' : '#475569',
                        border: `2px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
                        padding: '12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      📧 Send Email
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Application Modal */}
      {applicationModal.service && (
        <ApplicationModal
          isOpen={applicationModal.isOpen}
          onClose={() => setApplicationModal({ isOpen: false, service: null })}
          service={applicationModal.service}
          isDarkMode={isDarkMode}
          onSubmit={handleSubmitApplication}
        />
      )}

      {/* Help Section */}
      <div style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #1f2937, #111827)'
          : 'white',
        border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '24px',
        marginTop: '32px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: isDarkMode ? '#f9fafb' : '#1f2937',
          marginBottom: '16px',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          💡 How to Use the Service Hub
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          fontSize: '14px',
          color: isDarkMode ? '#9ca3af' : '#4b5563'
        }}>
          <div>
            <strong>🗺️ Interactive Map:</strong> Click anywhere on the map to search for services in that exact location.
          </div>
          <div>
            <strong>📋 Apply Now:</strong> Click "Apply Now" to submit your application with contact information.
          </div>
          <div>
            <strong>🎯 Service Types:</strong> Filter by service type to find exactly what you need.
          </div>
          <div>
            <strong>📍 Distance:</strong> Services show distance when location is detected.
          </div>
        </div>
      </div>
      
      {/* Leaflet CSS */}
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      
      {/* Leaflet JS */}
      <script 
        src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
        integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
        crossOrigin=""
      />
      
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
        .custom-service-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: ${isDarkMode ? '#1f2937' : '#f8fafc'} !important;
        }
        .leaflet-popup-content-wrapper {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
          color: ${isDarkMode ? '#f9fafb' : '#1f2937'} !important;
        }
        .leaflet-popup-tip {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
        }
      `}</style>
    </div>
  );
};

export default Services;