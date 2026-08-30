import React, { useRef, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { Layer } from '@deck.gl/core';
import './DeckOverlay.css';

interface DeckOverlayProps {
  layers: Layer[];
  initialViewState?: any;
  onViewStateChange?: (viewState: any) => void;
  mapRef?: any;
  onClick?: (info: any) => void;
  onHover?: (info: any) => void;
}

export const DeckOverlay: React.FC<DeckOverlayProps> = ({
  layers,
  initialViewState,
  onViewStateChange,
  mapRef,
  onClick,
  onHover,
}) => {
  const deckRef = useRef<any>(null);

  useEffect(() => {
    const mapInstance = mapRef?.current;
    if (mapInstance && deckRef.current) {
      const overlay = new MapboxOverlay({
        layers,
        onViewStateChange,
        onClick,
        onHover,
      });
      mapInstance.addControl(overlay);

      return () => {
        mapInstance.removeControl(overlay);
      };
    }
  }, [layers, onViewStateChange, onClick, onHover, mapRef]);

  return (
    <div className="deck-overlay" ref={deckRef}>
      <DeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={layers}
        onViewStateChange={onViewStateChange}
        onClick={onClick}
        onHover={onHover}
      />
    </div>
  );
};
