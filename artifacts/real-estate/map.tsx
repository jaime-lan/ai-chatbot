'use client';

import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// You'll need to replace this with your actual Geoapify API key
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

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
  containerId: string;
}

interface BoundaryFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: {
    name: string;
    admin_level?: number;
    place_id?: string;
    feature_type?: string;
  };
}

const Map = ({ address, coordinates, containerId }: MapProps) => {
  const [position, setPosition] = useState<[number, number] | null>(
    coordinates ? [coordinates.lat, coordinates.lng] : null
  );
  const [boundary, setBoundary] = useState<[number, number][]>([]);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [boundaryName, setBoundaryName] = useState<string>('');

  useEffect(() => {
    const fetchBoundaryData = async () => {
      try {
        // First, geocode the address to get coordinates and place_id
        const geocodeResponse = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}`
        );
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.features && geocodeData.features.length > 0) {
          const feature = geocodeData.features[0];
          const [lon, lat] = feature.geometry.coordinates;
          const placeId = feature.properties.place_id;
          setPosition([lat, lon]);

          // Get place details first
          const placeDetailsResponse = await fetch(
            `https://api.geoapify.com/v2/place-details?id=${placeId}&features=details,geometry&apiKey=${GEOAPIFY_API_KEY}`
          );
          const placeDetailsData = await placeDetailsResponse.json();

          // Try to get the most specific boundary possible
          const boundariesResponse = await fetch(
            `https://api.geoapify.com/v1/boundaries/part-of?lon=${lon}&lat=${lat}&type=city,district,suburb,neighbourhood,residential,city_block&geometry=geometry&apiKey=${GEOAPIFY_API_KEY}`
          );
          const boundariesData = await boundariesResponse.json();

          let foundBoundary = false;

          if (boundariesData.features?.length > 0) {
            // Sort boundaries by admin_level to get the most specific one
            const sortedFeatures = boundariesData.features.sort((a: BoundaryFeature, b: BoundaryFeature) => {
              const levelA = a.properties.admin_level || 0;
              const levelB = b.properties.admin_level || 0;
              return levelB - levelA;
            });

            // Try to find the most specific boundary
            for (const feature of sortedFeatures) {
              if (feature.geometry) {
                const geometry = feature.geometry;
                let coords;

                if (geometry.type === 'Polygon') {
                  coords = geometry.coordinates[0];
                } else if (geometry.type === 'MultiPolygon') {
                  // Get the polygon closest to our point
                  const point = [lon, lat];
                  coords = geometry.coordinates.reduce((closest: number[][], poly: number[][][]) => {
                    const polyCoords = poly[0];
                    const currentDist = getDistanceFromPoint(point, polyCoords);
                    const closestDist = closest ? getDistanceFromPoint(point, closest) : Infinity;
                    return currentDist < closestDist ? polyCoords : closest;
                  }, []);
                }

                if (coords) {
                  const convertedCoords = coords.map(([lon, lat]: number[]) => [lat, lon] as [number, number]);
                  setBoundary(convertedCoords);
                  setBoundaryName(feature.properties.name || 'Area');

                  const bounds = L.latLngBounds(convertedCoords);
                  // Add some padding to the bounds
                  const paddedBounds = bounds.pad(0.1);
                  setMapBounds(paddedBounds);
                  foundBoundary = true;
                  break;
                }
              }
            }
          }

          // If no boundary found from part-of, try place details
          if (!foundBoundary && placeDetailsData.features?.length > 0) {
            const detailFeature = placeDetailsData.features.find(
              (f: BoundaryFeature) => f.properties.feature_type === 'details' && f.geometry
            );

            if (detailFeature?.geometry) {
              const geometry = detailFeature.geometry;
              let coords;

              if (geometry.type === 'Polygon') {
                coords = geometry.coordinates[0];
              } else if (geometry.type === 'MultiPolygon') {
                const point = [lon, lat];
                coords = geometry.coordinates[0][0];
              }

              if (coords) {
                const convertedCoords = coords.map(([lon, lat]: number[]) => [lat, lon] as [number, number]);
                setBoundary(convertedCoords);
                setBoundaryName(detailFeature.properties.name || 'Area');

                const bounds = L.latLngBounds(convertedCoords);
                const paddedBounds = bounds.pad(0.1);
                setMapBounds(paddedBounds);
                foundBoundary = true;
              }
            }
          }

          // If still no boundary found, just set the marker position
          if (!foundBoundary) {
            setPosition([lat, lon]);
            setBoundary([]);
            setBoundaryName('');
            
            const bounds = L.latLngBounds([[lat, lon]]);
            bounds.extend([lat + 0.005, lon + 0.005]);
            bounds.extend([lat - 0.005, lon - 0.005]);
            setMapBounds(bounds);
          }
        }
      } catch (error) {
        console.error('Error fetching boundary data:', error);
      }
    };

    if (!coordinates) {
      fetchBoundaryData();
    }
  }, [address, coordinates]);

  if (!position) return <div>Loading map...</div>;

  return (
    <MapContainer
      id={containerId}
      key={containerId}
      center={position}
      zoom={15}
      style={{ height: '100%', width: '100%', borderRadius: '12px', zIndex: 1 }}
      bounds={mapBounds || undefined}
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
              <strong>{boundaryName}</strong>
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

function getDistanceFromPoint(point: number[], polygon: number[][]): number {
  return polygon.reduce((minDist, coord) => {
    const dist = Math.sqrt(
      Math.pow(point[0] - coord[0], 2) + 
      Math.pow(point[1] - coord[1], 2)
    );
    return Math.min(minDist, dist);
  }, Infinity);
}

export default Map; 