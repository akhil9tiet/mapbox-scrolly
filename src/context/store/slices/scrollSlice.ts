import { produce } from 'immer';

export interface ScrollState {
  activeChapterIndex: number;
  progress: number;
  direction: 'forward' | 'backward' | null;
  isLocked: boolean;
}

export const initialScrollState: ScrollState = {
  activeChapterIndex: 0,
  progress: 0,
  direction: null,
  isLocked: false,
};

export const scrollActions = {
  setActiveChapter: (activeChapterIndex: number) => ({
    type: 'scroll/setActiveChapter' as const,
    payload: activeChapterIndex,
  }),
  setProgress: (progress: number) => ({
    type: 'scroll/setProgress' as const,
    payload: progress,
  }),
  setDirection: (direction: ScrollState['direction']) => ({
    type: 'scroll/setDirection' as const,
    payload: direction,
  }),
  setLocked: (isLocked: boolean) => ({
    type: 'scroll/setLocked' as const,
    payload: isLocked,
  }),
};

export type ScrollAction = ReturnType<
  (typeof scrollActions)[keyof typeof scrollActions]
>;

export const scrollReducer = produce((draft: ScrollState, action: ScrollAction) => {
  switch (action.type) {
    case 'scroll/setActiveChapter':
      draft.activeChapterIndex = action.payload;
      break;
    case 'scroll/setProgress':
      draft.progress = action.payload;
      break;
    case 'scroll/setDirection':
      draft.direction = action.payload;
      break;
    case 'scroll/setLocked':
      draft.isLocked = action.payload;
      break;
  }
}, initialScrollState);
