import React from 'react';
import './PlayPauseControl.css';

interface PlayPauseControlProps {
  isPlaying: boolean;
  onPlayPauseClick: (isPlaying: boolean) => void;
  onSpeedChange?: (speed: number) => void;
  currentSpeed?: number;
}

export const PlayPauseControl: React.FC<PlayPauseControlProps> = ({
  isPlaying,
  onPlayPauseClick,
  onSpeedChange,
  currentSpeed = 1,
}) => {
  return (
    <div className="play-pause-control">
      <button
        className={`play-pause-control__button ${
          isPlaying ? 'play-pause-control__button--playing' : ''
        }`}
        onClick={() => onPlayPauseClick(!isPlaying)}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {onSpeedChange && (
        <div className="play-pause-control__speed">
          <label htmlFor="speed">Speed:</label>
          <select
            id="speed"
            value={currentSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      )}
    </div>
  );
};
