import React from 'react';
import './StoryPicker.css';

interface Story {
  id: string;
  title: string;
  description?: string;
}

interface StoryPickerProps {
  stories: Story[];
  selectedStoryId?: string;
  onStorySelect: (storyId: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const StoryPicker: React.FC<StoryPickerProps> = ({
  stories,
  selectedStoryId,
  onStorySelect,
  isOpen = true,
  onToggle,
}) => {
  return (
    <div className={`story-picker ${isOpen ? 'story-picker--open' : 'story-picker--closed'}`}>
      {onToggle && (
        <button
          className="story-picker__toggle"
          onClick={onToggle}
          title={isOpen ? 'Close' : 'Open'}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      )}

      {isOpen && (
        <div className="story-picker__content">
          <h3 className="story-picker__title">Stories</h3>
          <div className="story-picker__list">
            {stories.map((story) => (
              <button
                key={story.id}
                className={`story-picker__item ${
                  selectedStoryId === story.id ? 'story-picker__item--active' : ''
                }`}
                onClick={() => onStorySelect(story.id)}
              >
                <div className="story-picker__item-title">{story.title}</div>
                {story.description && (
                  <div className="story-picker__item-description">{story.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
