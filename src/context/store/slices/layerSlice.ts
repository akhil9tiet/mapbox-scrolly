import { produce } from 'immer';

export interface LayerState {
  visibleLayerIds: string[];
  highlightedFeatureIds: string[];
  selectedFeatureId: string | null;
}

export const initialLayerState: LayerState = {
  visibleLayerIds: [],
  highlightedFeatureIds: [],
  selectedFeatureId: null,
};

export const layerActions = {
  setVisibleLayerIds: (visibleLayerIds: string[]) => ({
    type: 'layer/setVisibleLayerIds' as const,
    payload: visibleLayerIds,
  }),
  setHighlightedFeatureIds: (highlightedFeatureIds: string[]) => ({
    type: 'layer/setHighlightedFeatureIds' as const,
    payload: highlightedFeatureIds,
  }),
  setSelectedFeatureId: (selectedFeatureId: string | null) => ({
    type: 'layer/setSelectedFeatureId' as const,
    payload: selectedFeatureId,
  }),
};

export type LayerAction = ReturnType<
  (typeof layerActions)[keyof typeof layerActions]
>;

export const layerReducer = produce((draft: LayerState, action: LayerAction) => {
  switch (action.type) {
    case 'layer/setVisibleLayerIds':
      draft.visibleLayerIds = action.payload;
      break;
    case 'layer/setHighlightedFeatureIds':
      draft.highlightedFeatureIds = action.payload;
      break;
    case 'layer/setSelectedFeatureId':
      draft.selectedFeatureId = action.payload;
      break;
  }
}, initialLayerState);
