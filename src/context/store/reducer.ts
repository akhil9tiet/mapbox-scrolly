import { produce } from 'immer';
import { StoreAction } from './actions';

export interface StoreState {
  viewport: {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing: number;
    pitch: number;
  };
  data: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: StoreState = {
  viewport: {
    latitude: 0,
    longitude: 0,
    zoom: 2,
    bearing: 0,
    pitch: 0,
  },
  data: [],
  isLoading: false,
  error: null,
};

export const storeReducer = produce(
  (draft: StoreState, action: StoreAction) => {
    switch (action.type) {
      case 'SET_MAP_VIEWPORT':
        return Object.assign(draft, action.payload);
      case 'SET_DATA':
        draft.data = action.payload;
        break;
      case 'SET_LOADING':
        draft.isLoading = action.payload;
        break;
      case 'SET_ERROR':
        draft.error = action.payload;
        break;
      default:
        return draft;
    }
  },
  initialState
);
