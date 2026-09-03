import { produce } from 'immer';
import type { TooltipStet, ViewportMode } from '../../../types';

export interface UiState {
  tooltip: TooltipStet;
  viewportMode: ViewportMode;
  isStoryPickerOpen: boolean;
}

export const initialUiState: UiState = {
  tooltip: {
    visible: false,
    x: 0,
    y: 0,
  },
  viewportMode: 'map',
  isStoryPickerOpen: true,
};

export const uiActions = {
  setTooltip: (tooltip: TooltipStet) => ({
    type: 'ui/setTooltip' as const,
    payload: tooltip,
  }),
  setViewportMode: (viewportMode: ViewportMode) => ({
    type: 'ui/setViewportMode' as const,
    payload: viewportMode,
  }),
  setStoryPickerOpen: (isStoryPickerOpen: boolean) => ({
    type: 'ui/setStoryPickerOpen' as const,
    payload: isStoryPickerOpen,
  }),
};

export type UiAction = ReturnType<(typeof uiActions)[keyof typeof uiActions]>;

export const uiReducer = produce((draft: UiState, action: UiAction) => {
  switch (action.type) {
    case 'ui/setTooltip':
      draft.tooltip = action.payload;
      break;
    case 'ui/setViewportMode':
      draft.viewportMode = action.payload;
      break;
    case 'ui/setStoryPickerOpen':
      draft.isStoryPickerOpen = action.payload;
      break;
  }
}, initialUiState);
