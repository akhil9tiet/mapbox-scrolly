import React from 'react';
import { useStore } from '../../context/store';
import './MapViewer.css';

interface MapViewerProps {
  className?: string;
}

export const MapViewer: React.FC<MapViewerProps> = ({ className = '' }) => {
  const { state } = useStore();

  return (
    <div className={`map-viewer ${className}`}>
      <div className="map-viewer__container">
        {/* Map canvas will be rendered here */}
        <div className="map-viewer__placeholder">
          <p>Map Viewer</p>
          <p className="map-viewer__info">
            Viewport: {state.viewport.zoom}x, Lat: {state.viewport.latitude.toFixed(2)}, Lon: {state.viewport.longitude.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};
