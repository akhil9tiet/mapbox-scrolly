export interface TooltipStet {
  visible: boolean;
  x: number;
  y: number;
  content?: unknown;
}

export type TooltipState = TooltipStet;

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export type ViewportMode = 'map' | 'globe' | '3d';
