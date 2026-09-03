import { produce } from 'immer';

export interface AnimationState {
  isPlaying: boolean;
  speed: number;
  progress: number;
}

export const initialAnimationState: AnimationState = {
  isPlaying: false,
  speed: 1,
  progress: 0,
};

export const animationActions = {
  setPlaying: (isPlaying: boolean) => ({
    type: 'animation/setPlaying' as const,
    payload: isPlaying,
  }),
  setSpeed: (speed: number) => ({
    type: 'animation/setSpeed' as const,
    payload: speed,
  }),
  setProgress: (progress: number) => ({
    type: 'animation/setProgress' as const,
    payload: progress,
  }),
};

export type AnimationAction = ReturnType<
  (typeof animationActions)[keyof typeof animationActions]
>;

export const animationReducer = produce(
  (draft: AnimationState, action: AnimationAction) => {
    switch (action.type) {
      case 'animation/setPlaying':
        draft.isPlaying = action.payload;
        break;
      case 'animation/setSpeed':
        draft.speed = action.payload;
        break;
      case 'animation/setProgress':
        draft.progress = action.payload;
        break;
    }
  },
  initialAnimationState
);
