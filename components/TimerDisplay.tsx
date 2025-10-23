
import React from 'react';

interface TimerDisplayProps {
  seconds: number;
  className?: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, className }) => {
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(secs).padStart(2, '0');

    if (hours > 0) {
      const paddedHours = String(hours).padStart(2, '0');
      return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${paddedMinutes}:${paddedSeconds}`;
  };

  return <span className={className}>{formatTime(seconds)}</span>;
};

export default TimerDisplay;
