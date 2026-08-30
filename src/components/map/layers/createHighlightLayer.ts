import { GeoJsonLayer } from '@deck.gl/layers';

/**
 * Creates a layer for highlighting specific features
 */
export const createHighlightLayer = (data: any, highlightIds: string[] = []) => {
  return new GeoJsonLayer({
    id: 'highlight-layer',
    data,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: true,
    lineWidthScale: 2,
    lineWidthMinPixels: 2,
    getFillColor: (f: any) => {
      const isHighlighted = highlightIds.includes(f.properties?.id);
      return isHighlighted ? [255, 200, 0, 200] : [200, 200, 200, 100];
    },
    getLineColor: (f: any) => {
      const isHighlighted = highlightIds.includes(f.properties?.id);
      return isHighlighted ? [255, 200, 0, 255] : [100, 100, 100, 100];
    },
    getLineWidth: (f: any) => {
      const isHighlighted = highlightIds.includes(f.properties?.id);
      return isHighlighted ? 3 : 1;
    },
  });
};
