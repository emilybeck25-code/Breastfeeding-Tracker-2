import React, { useState, useEffect } from 'react';
import { FeedingSide, FeedingUnit, SingleFeed, Page } from './types';
import TimerDisplay from './components/TimerDisplay';
import HistoryLog from './components/HistoryLog';
import DailySummary from './components/DailySummary';
import MonthlySummary from './components/MonthlySummary';
import NotificationsPage from './components/NotificationsPage';
import NavBar from './components/NavBar';

// If a new feed starts within this window after the last one ended,
// it will be grouped. If the window passes, the session is auto-completed.
const PENDING_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const App: React.FC = () => {
  const [history, setHistory] = useState<FeedingUnit[]>([]);
  const [activeSide, setActiveSide] = useState<FeedingSide | null>(null);
  const [feedDuration, setFeedDuration] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Tracker);

  const completeFeedingUnit = (unitToComplete: FeedingUnit): FeedingUnit | null => {
    if (unitToComplete && unitToComplete.sessions.length === 1) {
        const firstSession = unitToComplete.sessions[0];
        const missingSide = firstSession.side === FeedingSide.Left ? FeedingSide.Right : FeedingSide.Left;
        const dummySession: SingleFeed = {
            side: missingSide,
            duration: 0,
            endTime: firstSession.endTime, // End time is the same as the first feed
        };

        const sortedSessions = [...unitToComplete.sessions, dummySession].sort((a,b) => {
            if (a.side === FeedingSide.Left) return -1;
            if (b.side === FeedingSide.Left) return 1;
            return 0;
        });

        return {
            ...unitToComplete,
            sessions: sortedSessions,
            // endTime of the unit remains the same as the first session's end time.
        };
    }
    return null;
  }

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('feedingHistory');
      if (savedHistory) {
        let parsedData = JSON.parse(savedHistory);
        if (parsedData.length > 0 && parsedData[0].hasOwnProperty('side')) {
            const migratedHistory: FeedingUnit[] = parsedData.map((session: any) => ({
                id: session.id,
                sessions: [{ side: session.side, duration: session.duration, endTime: session.endTime }],
                endTime: session.endTime,
            })).reverse();
            parsedData = migratedHistory;
        }

        // Auto-complete any pending sessions that timed out while app was closed
        const updatedData = parsedData.map((unit: FeedingUnit) => {
            if (unit.sessions.length === 1 && (Date.now() - unit.endTime > PENDING_TIMEOUT_MS)) {
                return completeFeedingUnit(unit) ?? unit;
            }
            return unit;
        });

        setHistory(updatedData);
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('feedingHistory', JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  useEffect(() => {
    if (activeSide) {
      const timer = setInterval(() => {
        setFeedDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeSide]);

  // Effect to handle auto-completion of pending feeds
  useEffect(() => {
    const lastUnit = history[0];
    if (lastUnit && lastUnit.sessions.length === 1) {
        const timeSinceFirstFeed = Date.now() - lastUnit.endTime;
        const remainingTime = PENDING_TIMEOUT_MS - timeSinceFirstFeed;

        if (remainingTime > 0) {
            const timerId = setTimeout(() => {
                setHistory(currentHistory => {
                    const latestUnit = currentHistory[0];
                    if (latestUnit && latestUnit.id === lastUnit.id && latestUnit.sessions.length === 1) {
                        const completedUnit = completeFeedingUnit(latestUnit);
                        if (completedUnit) {
                            return [completedUnit, ...currentHistory.slice(1)];
                        }
                    }
                    return currentHistory;
                });
            }, remainingTime);

            return () => clearTimeout(timerId);
        } else {
             // If time is already up when component mounts, complete it immediately.
             setHistory(currentHistory => {
                const latestUnit = currentHistory[0];
                if (latestUnit && latestUnit.id === lastUnit.id && latestUnit.sessions.length === 1) {
                    const completedUnit = completeFeedingUnit(latestUnit);
                    if (completedUnit) {
                        return [completedUnit, ...currentHistory.slice(1)];
                    }
                }
                return currentHistory;
            });
        }
    }
  }, [history]);

  const handleSideButtonClick = (side: FeedingSide) => {
    if (activeSide === side) {
      // Stopping the current feed
      const newSingleFeed: SingleFeed = {
        side: activeSide,
        duration: feedDuration,
        endTime: Date.now(),
      };
      
      setHistory(currentHistory => {
        const lastFeedingUnit = currentHistory[0];
        const timeSinceLastFeed = newSingleFeed.endTime - (lastFeedingUnit?.endTime ?? 0);
        
        const shouldGroup = 
            lastFeedingUnit &&
            lastFeedingUnit.sessions.length === 1 &&
            lastFeedingUnit.sessions[0].side !== newSingleFeed.side &&
            timeSinceLastFeed < PENDING_TIMEOUT_MS;

        if (shouldGroup) {
            const finalSessions = [...lastFeedingUnit.sessions, newSingleFeed].sort((a,b) => {
              // This sort ensures the display order is chronological based on which side was clicked first in the UI
              return lastFeedingUnit.sessions[0].endTime - a.endTime;
            });

            const updatedUnit = {
                ...lastFeedingUnit,
                sessions: finalSessions,
                endTime: newSingleFeed.endTime,
            };
            return [updatedUnit, ...currentHistory.slice(1)];
        } else {
            const newUnit: FeedingUnit = {
                id: new Date().toISOString(),
                sessions: [newSingleFeed],
                endTime: newSingleFeed.endTime,
            };
            return [newUnit, ...currentHistory];
        }
      });

      setFeedDuration(0);
      setActiveSide(null);

    } else if (!activeSide) {
      // Starting a new feed
      setActiveSide(side);
      setFeedDuration(0);
    }
    // If a feed is active on the other side, do nothing.
  };
  
  const handleClearHistory = () => {
      if (window.confirm("Are you sure you want to clear all feeding history? This cannot be undone.")) {
        setHistory([]);
        setActiveSide(null);
        setFeedDuration(0);
      }
  };
  
  const chronologicalHistory = [...history].reverse();
  const lastFeedTime = history[0]?.endTime ?? null;

  const renderPage = () => {
    switch(currentPage) {
        case Page.Tracker:
            return (
                <div className="flex flex-col h-full">
                    {/* Section 1: Static Top Area (Timer + History Header) */}
                    <div className="flex-shrink-0 px-4">
                        {/* Timer part */}
                        <div className="flex flex-col items-center justify-center h-32">
                            {activeSide ? (
                                <div className="text-center">
                                    <p className="text-slate-500 mb-2">Feeding on {activeSide} side</p>
                                    <TimerDisplay seconds={feedDuration} className="text-7xl font-sans text-slate-800 tracking-tighter" />
                                </div>
                            ) : (
                                <div className="text-center text-slate-500">
                                    <p>Tap L or R to start a feed.</p>
                                </div>
                            )}
                        </div>
                        {/* History Header part (only shown if there's history) */}
                        {history.length > 0 && (
                            <div className="flex justify-between items-center pb-2">
                              <h2 className="text-xl font-bold text-slate-600">Feeding History</h2>
                              <button
                                onClick={handleClearHistory}
                                className="text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full transition-colors"
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
        case Page.DailySummary:
            return <DailySummary history={history} />;
        case Page.MonthlySummary:
            return <MonthlySummary history={history} />;
        case Page.Notifications:
            return <NotificationsPage lastFeedTime={lastFeedTime} />;
        default:
            return null;
    }
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col pt-6 pb-20 font-sans">
      <header className="text-center mb-6 px-4 flex-shrink-0">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-rose-400">
          Baby Feed Tracker
        </h1>
      </header>

      <main className="flex-grow flex flex-col overflow-hidden">
        {renderPage()}
      </main>
      
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;
