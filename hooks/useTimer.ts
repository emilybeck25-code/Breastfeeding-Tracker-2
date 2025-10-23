import { useState, useEffect, useCallback } from 'react';
import { FeedingSide } from '../types/index';

export const useTimer = () => {
    const [activeSide, setActiveSide] = useState<FeedingSide | null>(null);
    const [feedDuration, setFeedDuration] = useState<number>(0);

    useEffect(() => {
        if (activeSide) {
            const timer = setInterval(() => {
                setFeedDuration((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [activeSide]);

    const startTimer = useCallback((side: FeedingSide) => {
        if (!activeSide) {
            setActiveSide(side);
            setFeedDuration(0);
        }
    }, [activeSide]);

    const stopTimer = useCallback(() => {
        const duration = feedDuration;
        const side = activeSide;
        
        setFeedDuration(0);
        setActiveSide(null);

        if (side && duration > 0) {
            return { side, duration, endTime: Date.now() };
        }
        return null;

    }, [activeSide, feedDuration]);

    return {
        duration: feedDuration,
        activeSide,
        startTimer,
        stopTimer,
    };
};