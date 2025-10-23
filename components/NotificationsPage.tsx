import React, { useState, useEffect, useRef } from 'react';

interface NotificationsPageProps {
    lastFeedTime: number | null;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ lastFeedTime }) => {
    const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
    const [hours, setHours] = useState<string>('3');
    const [minutes, setMinutes] = useState<string>('0');
    const [reminder, setReminder] = useState<{ time: number, timeoutId: number } | null>(null);
    const timeoutIdRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
        };
    }, []);

    const requestPermission = () => {
        Notification.requestPermission().then(setPermission);
    };

    const handleSetReminder = () => {
        if (!lastFeedTime) {
            alert('No feed has been logged yet.');
            return;
        }

        if (permission !== 'granted') {
            alert('Please enable notifications first.');
            return;
        }

        const h = parseInt(hours, 10) || 0;
        const m = parseInt(minutes, 10) || 0;
        const totalMilliseconds = (h * 3600 + m * 60) * 1000;
        
        if (totalMilliseconds <= 0) {
            alert('Please enter a valid duration.');
            return;
        }

        const reminderTime = lastFeedTime + totalMilliseconds;
        const delay = reminderTime - Date.now();

        if (delay <= 0) {
            alert('The calculated reminder time is in the past.');
            return;
        }

        // Clear previous reminder if it exists
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }

        const newTimeoutId = window.setTimeout(() => {
            new Notification('Time for the next feed!', {
                body: 'Your reminder is going off.',
                icon: '/favicon.ico', // You can add an icon here
            });
            setReminder(null);
            timeoutIdRef.current = null;
        }, delay);
        
        timeoutIdRef.current = newTimeoutId;
        setReminder({ time: reminderTime, timeoutId: newTimeoutId });
    };
    
    const handleClearReminder = () => {
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }
        setReminder(null);
        timeoutIdRef.current = null;
    }

    return (
        <div className="w-full max-w-md mx-auto px-4 pb-4 flex flex-col items-center">
            <h2 className="text-xl font-bold text-slate-600 mb-4 text-center">Set a Reminder</h2>
            
            {permission !== 'granted' && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 w-full" role="alert">
                    <p className="font-bold">Notifications Disabled</p>
                    <p>To use this feature, you need to allow notifications from this site.</p>
                    <button onClick={requestPermission} className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded">
                        Enable Notifications
                    </button>
                </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-lg w-full">
                <p className="text-center text-slate-600 mb-2">Remind me in:</p>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div>
                        <input 
                            type="number" 
                            value={hours}
                            onChange={e => setHours(e.target.value)}
                            className="w-20 p-2 text-center border border-slate-300 rounded-md"
                            min="0"
                        />
                        <label className="block text-center text-xs text-slate-500 mt-1">hours</label>
                    </div>
                    <div>
                        <input 
                            type="number" 
                            value={minutes}
                            onChange={e => setMinutes(e.target.value)}
                            className="w-20 p-2 text-center border border-slate-300 rounded-md"
                            min="0"
                            max="59"
                        />
                        <label className="block text-center text-xs text-slate-500 mt-1">minutes</label>
                    </div>
                </div>
                <p className="text-center text-xs text-slate-500 mb-6">...from the end of the last feed.</p>
                
                <button 
                    onClick={handleSetReminder} 
                    disabled={permission !== 'granted' || !lastFeedTime}
                    className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    Set Reminder
                </button>
                 {reminder && (
                    <div className="mt-6 text-center">
                        <p className="text-green-700 font-semibold">Reminder is set for:</p>
                        <p className="text-green-700">{new Date(reminder.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <button onClick={handleClearReminder} className="mt-2 text-sm text-red-600 hover:underline">
                            Clear Reminder
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
