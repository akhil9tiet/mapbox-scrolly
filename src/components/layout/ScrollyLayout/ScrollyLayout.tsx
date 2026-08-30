import React from 'react';
import './ScrollyLayout.css';

interface ScrollyLayoutProps {
  mapComponent: React.ReactNode;
  storyComponent: React.ReactNode;
  controlsComponent?: React.ReactNode;
  mapPosition?: 'left' | 'right';
}

export const ScrollyLayout: React.FC<ScrollyLayoutProps> = ({
  mapComponent,
  storyComponent,
  controlsComponent,
  mapPosition = 'left',
}) => {
  return (
    <div className={`scrolly-layout scrolly-layout--${mapPosition}`}>
      <div className="scrolly-layout__map">{mapComponent}</div>
      <div className="scrolly-layout__content">
        {controlsComponent && (
          <div className="scrolly-layout__controls">{controlsComponent}</div>
        )}
        <div className="scrolly-layout__story">{storyComponent}</div>
      </div>
    </div>
  );
};
