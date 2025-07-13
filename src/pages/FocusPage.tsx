
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '../context/DataContext';

// Helper function to get initial state from localStorage
const getInitialTimerState = () => {
    try {
        const savedState = localStorage.getItem('memphis_timer_state');
        if (savedState) {
            const state = JSON.parse(savedState);
            const timePassed = Math.floor((Date.now() - state.lastUpdateTime) / 1000);

            if (state.isActive && !state.isPaused) {
                const newTimeLeft = Math.max(0, state.timeLeft - timePassed);
                return {
                    duration: state.duration,
                    timeLeft: newTimeLeft,
                    isActive: newTimeLeft > 0 ? state.isActive : false,
                    isPaused: state.isPaused,
                    sessionStartTime: state.sessionStartTime,
                    shouldCompleteSession: newTimeLeft <= 0
                };
            } else {
                return {
                    duration: state.duration,
                    timeLeft: state.timeLeft,
                    isActive: state.isActive,
                    isPaused: state.isPaused,
                    sessionStartTime: state.sessionStartTime,
                    shouldCompleteSession: false
                };
            }
        }
    } catch (error) {
        console.error('Error loading timer state:', error);
    }

    // Default state if no saved state
    return {
        duration: 25,
        timeLeft: 25 * 60,
        isActive: false,
        isPaused: false,
        sessionStartTime: null,
        shouldCompleteSession: false
    };
};

const FocusPage: React.FC = () => {
    const { addSession, getTodayGoal, setGoal } = useData();

    // Initialize state from localStorage or defaults
    const initialState = getInitialTimerState();
    const [duration, setDuration] = useState<number>(initialState.duration);
    const [timeLeft, setTimeLeft] = useState<number>(initialState.timeLeft);
    const [isActive, setIsActive] = useState<boolean>(initialState.isActive);
    const [isPaused, setIsPaused] = useState<boolean>(initialState.isPaused);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(initialState.sessionStartTime);
    
    const today = new Date().toISOString().split('T')[0];
    const dailyGoal = getTodayGoal()?.targetMinutes || 60;

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    // Save timer state to localStorage
    const saveTimerState = useCallback(() => {
        const timerState = {
            duration,
            timeLeft,
            isActive,
            isPaused,
            sessionStartTime,
            lastUpdateTime: Date.now()
        };
        localStorage.setItem('memphis_timer_state', JSON.stringify(timerState));
    }, [duration, timeLeft, isActive, isPaused, sessionStartTime]);



    const resetTimer = useCallback(() => {
        // Clear the interval when resetting
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(duration * 60);
        setSessionStartTime(null);
        // Clear saved state
        localStorage.removeItem('memphis_timer_state');
    }, [duration]);

    // Handle session completion if timer finished while away
    useEffect(() => {
        if (initialState.shouldCompleteSession && initialState.sessionStartTime) {
            addSession({
                startTime: new Date(initialState.sessionStartTime).toISOString(),
                duration: initialState.duration * 60,
                completed: true,
            });
            // Clear the saved state since session is complete
            localStorage.removeItem('memphis_timer_state');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    useEffect(() => {
        // Only reset timer if it's not currently active
        if (!isActive && !isPaused) {
            resetTimer();
        }
    }, [duration, resetTimer, isActive, isPaused]);

    useEffect(() => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (isActive && !isPaused) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    const newTimeLeft = prev - 1;
                    if (newTimeLeft <= 0) {
                        addSession({
                            startTime: new Date(sessionStartTime || Date.now() - duration * 60 * 1000).toISOString(),
                            duration: duration * 60,
                            completed: true,
                        });
                        // Removed notification sound - save silently in background
                        resetTimer();
                        return 0;
                    }
                    return newTimeLeft;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive, isPaused, duration, addSession, resetTimer, sessionStartTime]);

    // Save timer state whenever it changes
    useEffect(() => {
        if (isActive || isPaused) {
            saveTimerState();
        }
    }, [timeLeft, isActive, isPaused, saveTimerState]);

    // Save state when component unmounts (navigating away)
    useEffect(() => {
        return () => {
            if (isActive || isPaused) {
                saveTimerState();
            }
        };
    }, [isActive, isPaused, saveTimerState]);

    // Save state on page refresh/close
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (isActive || isPaused) {
                saveTimerState();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isActive, isPaused, saveTimerState]);

    const handleStart = () => {
        if (timeLeft === 0) setTimeLeft(duration * 60);
        if (!sessionStartTime) {
            setSessionStartTime(Date.now());
        }
        setIsActive(true);
        setIsPaused(false);
    };

    const handlePauseResume = () => {
        setIsPaused(!isPaused);
    };

    const handleReset = () => {
        // Save incomplete session if timer was active
        if(isActive && sessionStartTime) {
            const timeSpent = duration * 60 - timeLeft;
            if (timeSpent > 0) {
                addSession({
                    startTime: new Date(sessionStartTime).toISOString(),
                    duration: timeSpent,
                    completed: false,
                });
            }
        }

        // Clear the interval immediately
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Reset all timer states immediately (works for any state)
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(duration * 60); // Reset to full duration
        setSessionStartTime(null);

        // Clear saved state
        localStorage.removeItem('memphis_timer_state');
    }
    
    const handleSetGoal = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newGoal = parseInt(e.target.value, 10);
        if(!isNaN(newGoal) && newGoal > 0){
             setGoal({ date: today, targetMinutes: newGoal });
        }
    };
    
    const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
    
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
            <h1 className="text-5xl font-righteous text-deep-space">Focus Session</h1>
            
            <div className="relative w-80 h-80 flex items-center justify-center">
                 <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <circle 
                        className="text-electric-blue" 
                        strokeWidth="8" 
                        strokeDasharray={2 * Math.PI * 45} 
                        strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="45" 
                        cx="50" 
                        cy="50"
                        style={{transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear'}}
                    />
                </svg>
                <div className="z-10 text-center">
                    <p className="font-righteous text-7xl text-deep-space">{formatTime(timeLeft)}</p>
                    <p className="font-semibold text-deep-space/70">Time to focus!</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border-4 border-deep-space shadow-[8px_8px_0_#2E294E] w-full max-w-md">
                <div className="flex justify-center items-center gap-2 mb-6">
                    <label className="font-fredoka text-lg">Duration:</label>
                    {[15, 25, 50].map(d => (
                        <button key={d} onClick={() => setDuration(d)} className={`px-4 py-2 text-lg font-bold rounded-lg border-2 border-deep-space transition ${duration === d ? 'bg-hot-pink text-white' : 'bg-lime-green text-deep-space'}`}>
                            {d} min
                        </button>
                    ))}
                </div>
                
                <div className="flex justify-center gap-4">
                    {!isActive ? (
                        <>
                            <button onClick={handleStart} className="px-8 py-4 w-48 rounded-lg bg-electric-blue text-white font-bold border-2 border-deep-space text-2xl hover:bg-opacity-80 transition hover:shadow-[4px_4px_0_#2E294E] hover:-translate-y-1">Start</button>
                            {timeLeft !== duration * 60 && (
                                <button onClick={handleReset} className="px-4 py-4 rounded-lg bg-coral text-white font-bold border-2 border-deep-space text-xl hover:bg-opacity-80 transition">
<ion-icon name="refresh-outline" />
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button onClick={handlePauseResume} className="px-8 py-4 w-48 rounded-lg bg-sunny-yellow text-deep-space font-bold border-2 border-deep-space text-2xl hover:bg-opacity-80 transition">
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                            <button onClick={handleReset} className="px-8 py-4 rounded-lg bg-coral text-white font-bold border-2 border-deep-space text-2xl hover:bg-opacity-80 transition">
                                Reset
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border-4 border-deep-space shadow-[8px_8px_0_#2E294E] w-full max-w-md">
                <label htmlFor="daily-goal" className="font-fredoka text-lg">Daily Goal (minutes):</label>
                <input
                    id="daily-goal"
                    type="number"
                    value={dailyGoal}
                    onChange={handleSetGoal}
                    className="w-full mt-2 p-3 rounded-lg border-2 border-deep-space focus:ring-2 focus:ring-hot-pink focus:border-hot-pink outline-none transition font-bold text-lg"
                />
            </div>

        </div>
    );
};

export default FocusPage;
