import React from 'react';
import { FeedingSide, SingleFeed, FeedingUnit } from '../types/index';
import { useTimer } from '../hooks/useTimer';
import TimerDisplay from '../components/TimerDisplay';
import HistoryLog from '../components/HistoryLog';

interface TrackerPageProps {
    chronologicalHistory: FeedingUnit[];
    addFeed: (feed: SingleFeed) => void;
    clearHistory: () => void;
}

const TrackerPage: React.FC<TrackerPageProps> = ({ chronologicalHistory, addFeed, clearHistory }) => {
    const { duration, activeSide, startTimer, stopTimer } = useTimer();

    const handleSideButtonClick = (side: FeedingSide) => {
        if (activeSide === side) {
            const feedData = stopTimer();
            if (feedData) {
                addFeed(feedData);
            }
        } else if (!activeSide) {
            startTimer(side);
        }
    };

    const handleClearHistory = () => {
        if (!activeSide) {
            clearHistory();
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            {/* Section 1: Static Top Area (Timer + History Header) */}
            <div className="flex-shrink-0 px-4">
                {/* Timer part */}
                <div className="flex flex-col items-center justify-center h-32">
                    {activeSide ? (
                        <div className="text-center">
                            <p className="text-slate-500 mb-2">Feeding on {activeSide} side</p>
                            <TimerDisplay seconds={duration} className="text-7xl font-sans text-slate-800 tracking-tighter" />
                        </div>
                    ) : (
                        <div className="text-center text-slate-500">
                            <p>Tap L or R to start a feed.</p>
                        </div>
                    )}
                </div>
                {/* History Header part (only shown if there's history) */}
                {chronologicalHistory.length > 0 && (
                    <div className="flex justify-between items-center pb-2">
                      <h2 className="text-xl font-bold text-slate-600">Feeding History</h2>
                      <button
                        onClick={handleClearHistory}
                        disabled={!!activeSide}
                        className="text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full transition-colors disabled:bg-slate-400"
                      >
                        Clear
                      </button>
                    </div>
                )}
            </div>
            
            {/* Section 2: History Log (Fills remaining space and scrolls) */}
            <div className="flex-grow overflow-y-auto px-4 pb-4">
                <HistoryLog sessions={chronologicalHistory} />
            </div>

             {/* Section 3: Buttons Area (Fixed Height, static) */}
            <div className="flex-shrink-0 flex justify-around items-center px-4 h-32">
                <button
                    onClick={() => handleSideButtonClick(FeedingSide.Left)}
                    disabled={activeSide === FeedingSide.Right}
                    aria-label={activeSide === FeedingSide.Left ? 'Stop left side feed' : 'Start left side feed'}
                    className={`w-28 h-28 rounded-full text-5xl font-bold text-white shadow-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center
                        ${activeSide === FeedingSide.Left ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-400 hover:bg-violet-500'}
                        disabled:bg-slate-300 disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    L
                </button>
                <button
                    onClick={() => handleSideButtonClick(FeedingSide.Right)}
                    disabled={activeSide === FeedingSide.Left}
                    aria-label={activeSide === FeedingSide.Right ? 'Stop right side feed' : 'Start right side feed'}
                    className={`w-28 h-28 rounded-full text-5xl font-bold text-white shadow-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center
                        ${activeSide === FeedingSide.Right ? 'bg-red-600 hover:bg-red-700' : 'bg-rose-400 hover:bg-rose-500'}
                        disabled:bg-slate-300 disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    R
                </button>
            </div>
        </div>
    );
};

export default TrackerPage;