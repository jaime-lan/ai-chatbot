'use client';

import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// You'll need to replace this with your actual Geoapify API key
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

// Fix for default marker icons in react-leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapProps {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const Map = ({ address, coordinates }: MapProps) => {
  const [position, setPosition] = useState<[number, number] | null>(
    coordinates ? [coordinates.lat, coordinates.lng] : null
  );
  const [boundary, setBoundary] = useState<[number, number][]>([]);

  useEffect(() => {
    // If we have coordinates, no need to geocode
    if (coordinates) {
      setPosition([coordinates.lat, coordinates.lng]);
      return;
    }

    const getAdministrativeDivisions = async () => {
      try {
        // First, get the place_id using Geoapify's geocoding
        const placeResponse = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&limit=1&apiKey=${GEOAPIFY_API_KEY}`
        );
        const placeData = await placeResponse.json();
        console.log('Geocoding response:', placeData);

        if (placeData && placeData.features.length) {
          const feature = placeData.features[0];
          setPosition([feature.properties.lat, feature.properties.lon]);

          // Get the place details with boundary
          const placeId = feature.properties.place_id;
          const boundaryData = await getBoundaries(placeId);
          console.log('Boundary data:', boundaryData);

          if (boundaryData && 
              boundaryData.features && 
              boundaryData.features[0] && 
              boundaryData.features[0].geometry) {
            const geometry = boundaryData.features[0].geometry;
            let coords;

            if (geometry.type === 'Polygon') {
              coords = geometry.coordinates[0];
            } else if (geometry.type === 'MultiPolygon') {
              coords = geometry.coordinates[0][0];
            }

            if (Array.isArray(coords)) {
              // Convert coordinates to Leaflet format [lat, lng]
              setBoundary(coords.map(([lng, lat]) => [lat, lng] as [number, number]));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching boundary:', error);
      }
    };

    getAdministrativeDivisions();
  }, [address, coordinates]);

  if (!position) return <div>Loading map...</div>;

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
        attribution='Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>'
      />
      {boundary.length > 0 && (
        <Polygon
          positions={boundary}
          pathOptions={{
            color: '#3b82f6',
            weight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            dashArray: '5, 5',
          }}
        >
          <Popup>
            <div style={{ fontSize: '14px', maxWidth: '200px' }}>
              <strong>{address}</strong>
            </div>
          </Popup>
        </Polygon>
      )}
      <Marker position={position}>
        <Popup>
          <div style={{ fontSize: '14px', maxWidth: '200px' }}>
            <strong>{address}</strong>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

async function getBoundaries(placeId: string) {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/boundaries/consists-of?id=${placeId}&geometry=geometry_1000&apiKey=${GEOAPIFY_API_KEY}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch boundaries:', error);
    throw error;
  }
}

async function getPlaceId(location: string) {
  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&apiKey=${GEOAPIFY_API_KEY}`
  );
  const data = await response.json();
  return data.features[0]?.properties.place_id;
}

async function getParentBoundaries(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/boundaries/part-of?lon=${lon}&lat=${lat}&geometry=geometry_10000&apiKey=${GEOAPIFY_API_KEY}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch parent boundaries:', error);
    throw error;
  }
}

async function geocode(address: string) {
  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}`
  );
  const data = await response.json();
  return data.features[0]?.geometry.coordinates; // [lon, lat]
}

export default Map; 