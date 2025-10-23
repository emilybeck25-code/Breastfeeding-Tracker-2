import React from 'react';
// FIX: Corrected import path for types to resolve module loading error.
import { FeedingUnit, FeedingSide, SingleFeed } from '../types/index';
import TimerDisplay from '../components/TimerDisplay';

interface DailySummaryProps {
    history: FeedingUnit[];
}

const StatCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-lg text-center">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-2xl font-sans text-slate-800">{children}</div>
    </div>
);

const DailySummary: React.FC<DailySummaryProps> = ({ history }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysSessions = history.filter(unit => {
        const unitDate = new Date(unit.endTime);
        unitDate.setHours(0, 0, 0, 0);
        return unitDate.getTime() === today.getTime();
    });

    if (todaysSessions.length === 0) {
        return (
            <div className="text-center py-8 px-4 text-slate-500">
                <p>No feedings logged today.</p>
            </div>
        );
    }

    const allFeedsToday: SingleFeed[] = todaysSessions.flatMap(unit => unit.sessions.filter(s => s.duration > 0));
    
    const totalDuration = allFeedsToday.reduce((acc, feed) => acc + feed.duration, 0);
    const leftDuration = allFeedsToday.filter(f => f.side === FeedingSide.Left).reduce((acc, feed) => acc + feed.duration, 0);
    const rightDuration = allFeedsToday.filter(f => f.side === FeedingSide.Right).reduce((acc, feed) => acc + feed.duration, 0);
    const totalSessions = todaysSessions.length;

    return (
        <div className="w-full max-w-md mx-auto px-4 pb-4">
            <h2 className="text-xl font-bold text-slate-600 mb-4 text-center">Today's Summary</h2>
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Total Feeds">
                    {totalSessions}
                </StatCard>
                <StatCard title="Total Time">
                    <TimerDisplay seconds={totalDuration} />
                </StatCard>
                <StatCard title="Left Side">
                    <TimerDisplay seconds={leftDuration} />
                </StatCard>
                <StatCard title="Right Side">
                    <TimerDisplay seconds={rightDuration} />
                </StatCard>
            </div>
        </div>
    );
};

export default DailySummary;