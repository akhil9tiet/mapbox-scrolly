import type { ViewState as ReactMapViewState } from 'react-map-gl';

export interface ViewState extends ReactMapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export const DEFAULT_VIEW_STATE: ViewState = {
  latitude: 0,
  longitude: 0,
  zoom: 2,
  bearing: 0,
  pitch: 0,
};

export const DEFAULT_STYLE_URL = 'https://demotiles.maplibre.org/style.json';
