import React, { useCallback, useEffect, useRef, useState } from 'react';
import MapLibreMap from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import { DEFAULT_VIEW_STATE, ViewState } from '../../types';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapCanvas.css';

const CAMERA_RESPONSE_MS = 360;
const angleDelta = (from: number, to: number) => ((to - from + 540) % 360) - 180;

const easeCamera = (from: ViewState, to: ViewState, amount: number): ViewState => ({
  longitude: from.longitude + angleDelta(from.longitude, to.longitude) * amount,
  latitude: from.latitude + (to.latitude - from.latitude) * amount,
  zoom: from.zoom + (to.zoom - from.zoom) * amount,
  bearing: from.bearing + angleDelta(from.bearing, to.bearing) * amount,
  pitch: from.pitch + (to.pitch - from.pitch) * amount,
});

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
  const initialCamera = controlledViewport ?? initialViewport;
  const [viewport, setViewport] = React.useState(initialViewport);
  const [displayViewport, setDisplayViewport] = useState(initialCamera);
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  const displayViewportRef = useRef(initialCamera);
  const targetViewportRef = useRef(initialCamera);
  const animationFrameRef = useRef<number | null>(null);
  const previousFrameTimeRef = useRef(0);
  const [useFallbackStyle, setUseFallbackStyle] = React.useState(false);
  const currentViewport = displayViewport;
  targetViewportRef.current = controlledViewport ?? viewport;
  const defaultMapStyle = !useFallbackStyle && CARTO_DARK_RASTER_STYLE
    ? CARTO_DARK_RASTER_STYLE
    : OPEN_STREET_MAP_STYLE;
  const mapStyle = requestedMapStyle ?? defaultMapStyle;

  const animateCamera = useCallback((time: number) => {
    animationFrameRef.current = null;
    const target = targetViewportRef.current;

    if (reducedMotion) {
      displayViewportRef.current = target;
      setDisplayViewport(target);
      previousFrameTimeRef.current = 0;
      return;
    }

    const elapsed = previousFrameTimeRef.current
      ? Math.min(time - previousFrameTimeRef.current, 64)
      : 16.67;
    previousFrameTimeRef.current = time;
    const amount = 1 - Math.exp(-elapsed / CAMERA_RESPONSE_MS);
    const next = easeCamera(displayViewportRef.current, target, amount);
    const settled = Math.abs(angleDelta(next.longitude, target.longitude)) < 0.00001
      && Math.abs(next.latitude - target.latitude) < 0.00001
      && Math.abs(next.zoom - target.zoom) < 0.001
      && Math.abs(angleDelta(next.bearing, target.bearing)) < 0.01
      && Math.abs(next.pitch - target.pitch) < 0.01;
    const displayed = settled ? target : next;

    displayViewportRef.current = displayed;
    setDisplayViewport(displayed);
    if (!settled) animationFrameRef.current = window.requestAnimationFrame(animateCamera);
    else previousFrameTimeRef.current = 0;
  }, [reducedMotion]);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches);
    if (motionPreference.addEventListener) {
      motionPreference.addEventListener('change', updateMotionPreference);
      return () => motionPreference.removeEventListener('change', updateMotionPreference);
    }
    motionPreference.addListener(updateMotionPreference);
    return () => motionPreference.removeListener(updateMotionPreference);
  }, []);

  useEffect(() => {
    if (!controlledViewport) {
      displayViewportRef.current = viewport;
      setDisplayViewport(viewport);
      return;
    }

    if (reducedMotion) {
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      previousFrameTimeRef.current = 0;
      displayViewportRef.current = controlledViewport;
      setDisplayViewport(controlledViewport);
      return;
    }

    if (animationFrameRef.current === null) {
      animationFrameRef.current = window.requestAnimationFrame(animateCamera);
    }
  }, [animateCamera, controlledViewport, reducedMotion, viewport]);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    previousFrameTimeRef.current = 0;
  }, []);

  const handleViewportChange = (newViewport: ViewState) => {
    if (!controlledViewport) {
      setViewport(newViewport);
      displayViewportRef.current = newViewport;
      setDisplayViewport(newViewport);
    }
    onViewportChange?.(newViewport);
  };

  return (
    <div className="map-canvas">
      <MapLibreMap
        ref={mapRef}
        mapLib={maplibregl}
        projection={{ type: 'mercator' }}
        scrollZoom={false}
        dragPan={false}
        touchZoomRotate={false}
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
