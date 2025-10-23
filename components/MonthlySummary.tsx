import React from 'react';
import { FeedingUnit } from '../types';

interface MonthlySummaryProps {
    history: FeedingUnit[];
}

const StatCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-lg text-center">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-2xl font-sans text-slate-800">{children}</div>
    </div>
);

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ history }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    // FIX: Property 'getYear' does not exist on type 'Date'. Changed to getFullYear().
    const currentYear = today.getFullYear();

    const monthlySessions = history.filter(unit => {
        const unitDate = new Date(unit.endTime);
        // FIX: Property 'getYear' does not exist on type 'Date'. Changed to getFullYear().
        return unitDate.getMonth() === currentMonth && unitDate.getFullYear() === currentYear;
    });

    if (monthlySessions.length === 0) {
        return (
            <div className="text-center py-8 px-4 text-slate-500">
                <p>No feedings logged this month yet.</p>
            </div>
        );
    }
    
    const sessionsByDay = monthlySessions.reduce((acc, session) => {
        const day = new Date(session.endTime).toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const totalSessions = monthlySessions.length;
    const numberOfDaysWithFeeds = Object.keys(sessionsByDay).length;
    const averageFeedsPerDay = (totalSessions / numberOfDaysWithFeeds).toFixed(1);

    const monthName = today.toLocaleString('default', { month: 'long' });

    return (
        <div className="w-full max-w-md mx-auto px-4 pb-4">
            <h2 className="text-xl font-bold text-slate-600 mb-4 text-center">Summary for {monthName}</h2>
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Total Feeds">
                    {totalSessions}
                </StatCard>
                <StatCard title="Avg Feeds/Day">
                    {averageFeedsPerDay}
                </StatCard>
            </div>
        </div>
    );
};

export default MonthlySummary;