import { useState, useEffect, useCallback } from 'react';
// FIX: Corrected import path for types to resolve module loading error.
import { FeedingUnit, SingleFeed, FeedingSide } from '../types/index';

const PENDING_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const completeFeedingUnit = (unitToComplete: FeedingUnit): FeedingUnit | null => {
    if (unitToComplete && unitToComplete.sessions.length === 1) {
        const firstSession = unitToComplete.sessions[0];
        const missingSide = firstSession.side === FeedingSide.Left ? FeedingSide.Right : FeedingSide.Left;
        const dummySession: SingleFeed = {
            side: missingSide,
            duration: 0,
            endTime: firstSession.endTime,
        };
        const sessions = [firstSession, dummySession];
        return { ...unitToComplete, sessions };
    }
    return null;
}

export const useFeedingHistory = () => {
    const [history, setHistory] = useState<FeedingUnit[]>([]);

    // Load history from localStorage on initial render
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('feedingHistory');
            if (savedHistory) {
                let parsedData = JSON.parse(savedHistory);
                // Simple migration for old data structure
                if (parsedData.length > 0 && parsedData[0].hasOwnProperty('side')) {
                    const migratedHistory: FeedingUnit[] = parsedData.map((session: any) => ({
                        id: session.id,
                        sessions: [{ side: session.side, duration: session.duration, endTime: session.endTime }],
                        endTime: session.endTime,
                    })).reverse();
                    parsedData = migratedHistory;
                }

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

    // Save history to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('feedingHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
        }
    }, [history]);

    // Handle auto-completion of the most recent pending feed
    useEffect(() => {
        const lastUnit = history[0];
        if (lastUnit && lastUnit.sessions.length === 1) {
            const timeSinceFirstFeed = Date.now() - lastUnit.endTime;
            const remainingTime = PENDING_TIMEOUT_MS - timeSinceFirstFeed;

            if (remainingTime <= 0) {
                 setHistory(currentHistory => {
                    const latestUnit = currentHistory[0];
                    if (latestUnit && latestUnit.id === lastUnit.id && latestUnit.sessions.length === 1) {
                        const completedUnit = completeFeedingUnit(latestUnit);
                        return completedUnit ? [completedUnit, ...currentHistory.slice(1)] : currentHistory;
                    }
                    return currentHistory;
                });
            } else {
                const timerId = setTimeout(() => {
                    setHistory(currentHistory => {
                        const latestUnit = currentHistory[0];
                        if (latestUnit && latestUnit.id === lastUnit.id && latestUnit.sessions.length === 1) {
                            const completedUnit = completeFeedingUnit(latestUnit);
                            return completedUnit ? [completedUnit, ...currentHistory.slice(1)] : currentHistory;
                        }
                        return currentHistory;
                    });
                }, remainingTime);
                return () => clearTimeout(timerId);
            }
        }
    }, [history]);

    const addFeed = useCallback((newSingleFeed: SingleFeed) => {
        setHistory(currentHistory => {
            const lastFeedingUnit = currentHistory[0];
            const timeSinceLastFeed = newSingleFeed.endTime - (lastFeedingUnit?.endTime ?? 0);
            
            const shouldGroup = 
                lastFeedingUnit &&
                lastFeedingUnit.sessions.length === 1 &&
                lastFeedingUnit.sessions[0].side !== newSingleFeed.side &&
                timeSinceLastFeed < PENDING_TIMEOUT_MS;

            if (shouldGroup) {
                const finalSessions = [...lastFeedingUnit.sessions, newSingleFeed].sort((a, b) => a.endTime - b.endTime);
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
    }, []);

    const clearHistory = useCallback(() => {
        if (window.confirm("Are you sure you want to clear all feeding history? This cannot be undone.")) {
            setHistory([]);
        }
    }, []);

    const lastFeedTime = history[0]?.endTime ?? null;
    const chronologicalHistory = [...history].reverse();
    
    return { history, addFeed, clearHistory, lastFeedTime, chronologicalHistory };
};