import React, { useRef } from 'react';
import MapboxMap from 'react-map-gl';
import './MapCanvas.css';

interface MapCanvasProps {
  initialViewport?: {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
  };
  onViewportChange?: (viewport: any) => void;
  children?: React.ReactNode;
  mapboxAccessToken?: string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  initialViewport = {
    latitude: 0,
    longitude: 0,
    zoom: 2,
    bearing: 0,
    pitch: 0,
  },
  onViewportChange,
  children,
}) => {
  const mapRef = useRef<any>(null);
  const [viewport, setViewport] = React.useState(initialViewport);

  const handleViewportChange = (newViewport: any) => {
    setViewport(newViewport);
    onViewportChange?.(newViewport);
  };

  return (
    <div className="map-canvas">
      <MapboxMap
        ref={mapRef}
        {...viewport}
        onMove={(evt: any) => handleViewportChange(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://demotiles.maplibre.org/style.json"
      >
        {children}
      </MapboxMap>
    </div>
  );
};
