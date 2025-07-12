
import React from 'react';

interface ProgressBarProps {
  value: number; // percentage value from 0 to 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const cappedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full bg-warm-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className="bg-brand-gold h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${cappedValue}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;