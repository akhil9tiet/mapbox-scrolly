import { produce } from 'immer';
import { DEFAULT_VIEW_STATE, ViewState } from '../../../types';

export interface MapState {
  viewport: ViewState;
  styleUrl: string;
  isReady: boolean;
}

export const initialMapState: MapState = {
  viewport: DEFAULT_VIEW_STATE,
  styleUrl: '',
  isReady: false,
};

export const mapActions = {
  setViewport: (viewport: ViewState) => ({
    type: 'map/setViewport' as const,
    payload: viewport,
  }),
  setStyleUrl: (styleUrl: string) => ({
    type: 'map/setStyleUrl' as const,
    payload: styleUrl,
  }),
  setReady: (isReady: boolean) => ({
    type: 'map/setReady' as const,
    payload: isReady,
  }),
};

export type MapAction = ReturnType<(typeof mapActions)[keyof typeof mapActions]>;

export const mapReducer = produce((draft: MapState, action: MapAction) => {
  switch (action.type) {
    case 'map/setViewport':
      draft.viewport = action.payload;
      break;
    case 'map/setStyleUrl':
      draft.styleUrl = action.payload;
      break;
    case 'map/setReady':
      draft.isReady = action.payload;
      break;
  }
}, initialMapState);
