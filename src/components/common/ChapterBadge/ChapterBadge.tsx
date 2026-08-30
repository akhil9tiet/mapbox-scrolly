import React from 'react';
import './ChapterBadge.css';

interface ChapterBadgeProps {
  chapterNumber: number;
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const ChapterBadge: React.FC<ChapterBadgeProps> = ({
  chapterNumber,
  title,
  isActive = false,
  onClick,
}) => {
  return (
    <div
      className={`chapter-badge ${isActive ? 'chapter-badge--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="chapter-badge__number">{chapterNumber}</div>
      <div className="chapter-badge__title">{title}</div>
    </div>
  );
};
