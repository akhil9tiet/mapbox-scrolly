import { PathLayer } from '@deck.gl/layers';

/**
 * Creates a layer for rendering paths/routes
 */
export const createPathLayer = (data: any, color = [0, 100, 255]) => {
  return new PathLayer({
    id: 'path-layer',
    data,
    pickable: true,
    widthScale: 20,
    widthMinPixels: 2,
    getPath: (d: any) => d.path || d.coordinates,
    getColor: () => color,
    getWidth: () => 1,
  });
};
