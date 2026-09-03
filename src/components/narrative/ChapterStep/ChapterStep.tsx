import React from 'react';
import './ChapterStep.css';

interface ChapterStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  content?: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
}

export const ChapterStep: React.FC<ChapterStepProps> = ({
  stepNumber,
  title,
  description,
  content,
  isActive = false,
  isCompleted = false,
  onClick,
}) => {
  return (
    <div
      className={`chapter-step ${isActive ? 'chapter-step--active' : ''} ${
        isCompleted ? 'chapter-step--completed' : ''
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="chapter-step__header">
        <div className="chapter-step__number">
          {isCompleted ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          ) : (
            stepNumber
          )}
        </div>
        <div className="chapter-step__title-section">
          <h3 className="chapter-step__title">{title}</h3>
          {description && (
            <p className="chapter-step__description">{description}</p>
          )}
        </div>
      </div>
      {content && isActive && (
        <div className="chapter-step__content">{content}</div>
      )}
    </div>
  );
};
