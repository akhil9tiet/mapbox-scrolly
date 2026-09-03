import React, { useState } from 'react';
import { useStore } from '../../../context/store';
import { useActions } from '../../../hooks';
import './ScrollyMapNavigator.css';

interface ScrollyStep {
  id: string;
  title: string;
  description?: string;
  viewport?: {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
  };
  layers?: string[];
  highlight?: string[];
}

interface ScrollyMapNavigatorProps {
  steps: ScrollyStep[];
  currentStepIndex?: number;
  onStepChange?: (stepIndex: number) => void;
  autoPlay?: boolean;
  autoPlaySpeed?: number;
}

export const ScrollyMapNavigator: React.FC<ScrollyMapNavigatorProps> = ({
  steps,
  currentStepIndex = 0,
  onStepChange,
  autoPlay = false,
  autoPlaySpeed = 3000,
}) => {
  const [activeIndex, setActiveIndex] = useState(currentStepIndex);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const { setMapViewport } = useActions();

  const handleStepClick = (index: number) => {
    setActiveIndex(index);
    onStepChange?.(index);

    const step = steps[index];
    if (step.viewport) {
      setMapViewport(step.viewport);
    }
  };

  const handleNext = () => {
    if (activeIndex < steps.length - 1) {
      handleStepClick(activeIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (activeIndex > 0) {
      handleStepClick(activeIndex - 1);
    }
  };

  const currentStep = steps[activeIndex];

  return (
    <div className="scrolly-navigator">
      <div className="scrolly-navigator__header">
        <h2 className="scrolly-navigator__title">{currentStep?.title}</h2>
        {currentStep?.description && (
          <p className="scrolly-navigator__description">
            {currentStep.description}
          </p>
        )}
      </div>

      <div className="scrolly-navigator__progress">
        <div className="scrolly-navigator__progress-bar">
          <div
            className="scrolly-navigator__progress-fill"
            style={{
              width: `${((activeIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
        <span className="scrolly-navigator__progress-text">
          {activeIndex + 1} of {steps.length}
        </span>
      </div>

      <div className="scrolly-navigator__steps">
        {steps.map((step, index) => (
          <button
            key={step.id}
            className={`scrolly-navigator__step-button ${
              index === activeIndex ? 'scrolly-navigator__step-button--active' : ''
            }`}
            onClick={() => handleStepClick(index)}
          >
            <span className="scrolly-navigator__step-number">{index + 1}</span>
            <span className="scrolly-navigator__step-label">{step.title}</span>
          </button>
        ))}
      </div>

      <div className="scrolly-navigator__controls">
        <button
          className="scrolly-navigator__button scrolly-navigator__button--prev"
          onClick={handlePrevious}
          disabled={activeIndex === 0}
          title="Previous step"
        >
          ← Previous
        </button>

        <button
          className={`scrolly-navigator__button scrolly-navigator__button--play ${
            isPlaying ? 'scrolly-navigator__button--playing' : ''
          }`}
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          className="scrolly-navigator__button scrolly-navigator__button--next"
          onClick={handleNext}
          disabled={activeIndex === steps.length - 1}
          title="Next step"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
