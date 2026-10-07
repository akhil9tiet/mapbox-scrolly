import React, { useRef } from 'react';
import MapLibreMap from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import { DEFAULT_VIEW_STATE, ViewState } from '../../types';
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

const cartoApiKey = process.env.REACT_APP_CARTO_API_KEY;
const CARTO_DARK_RASTER_STYLE = cartoApiKey ? {
  version: 8 as const,
  sources: {
    carto: {
      type: 'raster' as const,
      tiles: [`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${encodeURIComponent(cartoApiKey)}`],
      tileSize: 256,
      maxzoom: 20,
      attribution: '© OpenStreetMap contributors © CARTO',
    },
  },
  layers: [{ id: 'carto-dark', type: 'raster' as const, source: 'carto' }],
} : null;

export const GLOBE_SATELLITE_STYLE = {
  version: 8 as const,
  projection: { type: 'globe' as const },
  sources: {
    satellite: {
      type: 'raster' as const,
      tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg'],
      tileSize: 256,
    },
  },
  layers: [{ id: 'satellite', type: 'raster' as const, source: 'satellite' }],
  sky: {
    'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0],
  },
  light: {
    anchor: 'map' as const,
    position: [1.5, 90, 80] as [number, number, number],
  },
};

interface MapCanvasProps {
  initialViewport?: ViewState;
  viewport?: ViewState;
  mapStyle?: string | object;
  onViewportChange?: (viewport: ViewState) => void;
  children?: React.ReactNode;
  mapboxAccessToken?: string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  initialViewport = DEFAULT_VIEW_STATE,
  viewport: controlledViewport,
  mapStyle: requestedMapStyle,
  onViewportChange,
  children,
}) => {
  const mapRef = useRef<any>(null);
  const [viewport, setViewport] = React.useState(initialViewport);
  const [useFallbackStyle, setUseFallbackStyle] = React.useState(false);
  const currentViewport = controlledViewport ?? viewport;
  const defaultMapStyle = !useFallbackStyle && CARTO_DARK_RASTER_STYLE
    ? CARTO_DARK_RASTER_STYLE
    : OPEN_STREET_MAP_STYLE;
  const mapStyle = requestedMapStyle ?? defaultMapStyle;

  const handleViewportChange = (newViewport: ViewState) => {
    setViewport(newViewport);
    onViewportChange?.(newViewport);
  };

  return (
    <div className="map-canvas">
      <MapLibreMap
        ref={mapRef}
        mapLib={maplibregl}
        projection={{ type: 'mercator' }}
        {...currentViewport}
        onMove={(evt: any) => handleViewportChange(evt.viewState)}
        onError={() => {
          if (!requestedMapStyle && !useFallbackStyle) setUseFallbackStyle(true);
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
      >
        {children}
      </MapLibreMap>
    </div>
  );
};
