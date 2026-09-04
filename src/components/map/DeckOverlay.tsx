import React, { useEffect } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { Layer } from '@deck.gl/core';
import { useControl } from 'react-map-gl/maplibre';
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
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay({
    interleaved: false,
    onViewStateChange,
    onClick,
    onHover,
  }));

  useEffect(() => {
    overlay.setProps({ layers, onViewStateChange, onClick, onHover });
  }, [layers, onViewStateChange, onClick, onHover, overlay]);

  return null;
};
