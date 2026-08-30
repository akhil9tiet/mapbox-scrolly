import React from 'react';
import './PointTooltip.css';

interface PointTooltipProps {
  x: number;
  y: number;
  data: any;
  isVisible?: boolean;
}

export const PointTooltip: React.FC<PointTooltipProps> = ({
  x,
  y,
  data,
  isVisible = true,
}) => {
  if (!isVisible || !data) return null;

  return (
    <div
      className="point-tooltip"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="point-tooltip__content">
        {data.title && <h4 className="point-tooltip__title">{data.title}</h4>}
        {data.description && (
          <p className="point-tooltip__description">{data.description}</p>
        )}
        {data.properties && (
          <div className="point-tooltip__properties">
            {Object.entries(data.properties).map(([key, value]) => (
              <div key={key} className="point-tooltip__property">
                <span className="point-tooltip__property-key">{key}:</span>
                <span className="point-tooltip__property-value">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
