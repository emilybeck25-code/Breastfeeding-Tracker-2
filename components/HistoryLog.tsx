import React from 'react';
import { FeedingUnit, FeedingSide, SingleFeed } from '../types';
import TimerDisplay from './TimerDisplay';

interface HistoryLogProps {
  sessions: FeedingUnit[];
}

const formatDateHeader = (dateString: string): string => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const sessionDate = new Date(dateString);

  if (sessionDate.toLocaleDateString() === today.toLocaleDateString()) {
    return 'Today';
  }
  if (sessionDate.toLocaleDateString() === yesterday.toLocaleDateString()) {
    return 'Yesterday';
  }
  
  return sessionDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

const groupSessionsByDay = (sessions: FeedingUnit[]): Record<string, FeedingUnit[]> => {
  return sessions.reduce((acc, session) => {
    const day = new Date(session.endTime);
    day.setHours(0, 0, 0, 0);
    const dateKey = day.toISOString();

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, FeedingUnit[]>);
};

const formatTimeSince = (milliseconds: number): string => {
  if (milliseconds < 0) return '';
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  if (totalMinutes < 1) return ''; // Don't show for less than a minute

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  return parts.join(' ');
};


const HistoryLog: React.FC<HistoryLogProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No feedings logged yet.</p>
        <p>Start a session to begin tracking!</p>
      </div>
    );
  }

  const groupedSessions = groupSessionsByDay(sessions);
  const sortedDays = Object.keys(groupedSessions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const renderSessionDisplay = (session: SingleFeed) => {
    const isLeft = session.side === FeedingSide.Left;
    return (
      <div className="flex items-center gap-3 w-24">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
            isLeft ? 'bg-violet-400' : 'bg-rose-400'
          }`}
        >
          {isLeft ? 'L' : 'R'}
        </div>
        <div className="text-lg font-sans text-slate-700">
          <TimerDisplay seconds={session.duration} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        {sortedDays.map((dateKey) => (
          <section key={dateKey} aria-labelledby={`date-${dateKey}`} className="bg-white p-4 rounded-lg shadow-lg">
            <h3 id={`date-${dateKey}`} className="text-lg font-bold text-slate-700 mb-3 pb-3 border-b border-slate-200">
              {formatDateHeader(dateKey)}
            </h3>
            <ul className="space-y-4">
              {groupedSessions[dateKey].map((unit, index) => {
                const isComplete = unit.sessions.length === 2 || (Date.now() - unit.endTime > (10 * 60 * 1000));
                const firstSession: SingleFeed = unit.sessions[0];
                const startTime = firstSession.endTime - (firstSession.duration * 1000);
                const endTime = unit.endTime;

                const formattedStartTime = new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const formattedEndTime = new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const globalChronologicalIndex = sessions.findIndex(s => s.id === unit.id);
                let timeSinceLastFeed = '';
                if (globalChronologicalIndex > 0) {
                    const previousUnit = sessions[globalChronologicalIndex - 1];
                    const diffMs = startTime - previousUnit.endTime;
                    timeSinceLastFeed = formatTimeSince(diffMs);
                }
                
                return (
                  <li
                    key={unit.id}
                    className={`flex items-center gap-4 ${index > 0 ? 'pt-4 border-t border-slate-200' : ''}`}
                  >
                    <div className="flex flex-col items-center w-28 text-center">
                        <span className="font-sans text-slate-700 text-base">{formattedStartTime}</span>
                        {isComplete ? (
                          <>
                            <span className="text-xs text-slate-500 font-sans">to</span>
                            <span className="font-sans text-slate-700 text-base">{formattedEndTime}</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500 font-sans italic mt-1">Pending...</span>
                        )}
                        {timeSinceLastFeed && (
                            <span className="text-xs text-slate-500 mt-1">({timeSinceLastFeed})</span>
                        )}
                    </div>
                    <div className="flex-grow flex justify-around items-center">
                      {unit.sessions[0] ? renderSessionDisplay(unit.sessions[0]) : <div className="w-24" />}
                      {unit.sessions[1] ? renderSessionDisplay(unit.sessions[1]) : <div className="w-24" />}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default HistoryLog;