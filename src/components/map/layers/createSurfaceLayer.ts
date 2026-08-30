import { GeoJsonLayer } from '@deck.gl/layers';

/**
 * Creates a layer for rendering surface/polygon data
 */
export const createSurfaceLayer = (data: any, fillOpacity = 0.5) => {
  return new GeoJsonLayer({
    id: 'surface-layer',
    data,
    pickable: true,
    stroked: false,
    filled: true,
    extruded: false,
    lineWidthMinPixels: 1,
    getFillColor: (f: any) => {
      const value = f.properties?.value || 0;
      const normalized = Math.min(value / 100, 1);
      return [
        Math.floor(255 * normalized),
        Math.floor(100 * (1 - normalized)),
        Math.floor(255 * (1 - normalized)),
        Math.floor(255 * fillOpacity),
      ];
    },
    getLineColor: () => [100, 100, 100],
    getLineWidth: () => 1,
  });
};
