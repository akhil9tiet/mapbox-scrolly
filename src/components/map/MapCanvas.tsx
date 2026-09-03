import React, { useRef } from 'react';
import MapLibreMap from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { DEFAULT_STYLE_URL, DEFAULT_VIEW_STATE, ViewState } from '../../types';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapCanvas.css';

const OPEN_STREET_MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
};

interface MapCanvasProps {
  initialViewport?: ViewState;
  viewport?: ViewState;
  onViewportChange?: (viewport: ViewState) => void;
  children?: React.ReactNode;
  mapboxAccessToken?: string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  initialViewport = DEFAULT_VIEW_STATE,
  viewport: controlledViewport,
  onViewportChange,
  children,
}) => {
  const mapRef = useRef<any>(null);
  const [viewport, setViewport] = React.useState(initialViewport);
  const [useFallbackStyle, setUseFallbackStyle] = React.useState(false);
  const currentViewport = controlledViewport ?? viewport;
  const cartoApiKey = process.env.REACT_APP_CARTO_API_KEY;
  const mapStyle = !useFallbackStyle && cartoApiKey
    ? `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json?apiKey=${cartoApiKey}`
    : useFallbackStyle ? OPEN_STREET_MAP_STYLE : DEFAULT_STYLE_URL;

  const handleViewportChange = (newViewport: ViewState) => {
    setViewport(newViewport);
    onViewportChange?.(newViewport);
  };

  return (
    <div className="map-canvas">
      <MapLibreMap
        ref={mapRef}
        mapLib={maplibregl}
        {...currentViewport}
        onMove={(evt: any) => handleViewportChange(evt.viewState)}
        onError={() => setUseFallbackStyle(true)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
      >
        {children}
      </MapLibreMap>
    </div>
  );
};
