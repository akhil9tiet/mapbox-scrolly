import { ScatterplotLayer } from '@deck.gl/layers';

/**
 * Creates a layer for rendering point data
 */
export const createPointsLayer = (data: any, color = [255, 0, 0]) => {
  return new ScatterplotLayer({
    id: 'points-layer',
    data,
    pickable: true,
    opacity: 0.8,
    radiusScale: 6,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 0,
    getPosition: (d: any) => d.coordinates || [d.longitude, d.latitude],
    getRadius: (d: any) => d.radius || 10,
    getFillColor: (d: any) => d.color || color,
    getLineColor: () => [0, 0, 0],
    onHover: (info: any) => {
      if (info.object) {
        // Handle hover state
      }
    },
  });
};
