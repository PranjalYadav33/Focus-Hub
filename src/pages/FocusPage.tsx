
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '../context/DataContext';
import AnimatedContainer from '@/components/AnimatedContainer';
import * as timer from '@/utils/timer';
import { APP_CONFIG } from '@/utils/constants';

// derive initial view state from centralized timer state
defineInitial();
function defineInitial() { /* kept for history; logic moved to utils/timer */ }

const FocusPage: React.FC = () => {
    const { addSession, getTodayGoal, setGoal } = useData();

    // Initialize from centralized timer state
    const s0 = timer.readState();
    const r0 = timer.computeRemaining(s0);
    const [duration, setDuration] = useState<number>(Math.floor(s0.durationSec / 60));
    const [timeLeft, setTimeLeft] = useState<number>(r0.remainingSec);
    const [isActive, setIsActive] = useState<boolean>(r0.status === 'running');
    const [isPaused, setIsPaused] = useState<boolean>(s0.status === 'paused');
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(s0.sessionStartMs);
    
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

    // If a completion event is present (from background progress), consume it and record a session
    useEffect(() => {
        const ev = timer.consumeCompletion();
        if (ev) {
            addSession({ startTime: ev.startTimeIso, duration: ev.durationSec, completed: ev.completed });
        }
        // Subscribe to store changes (cross-tab) to keep view state live
        const unsub = timer.onStoreChange((s, ev2) => {
            const r = timer.computeRemaining(s);
            setDuration(Math.floor(s.durationSec / 60));
            setTimeLeft(r.remainingSec);
            setIsActive(r.status === 'running');
            setIsPaused(s.status === 'paused');
            setSessionStartTime(s.sessionStartMs);
            if (ev2) addSession({ startTime: ev2.startTimeIso, duration: ev2.durationSec, completed: ev2.completed });
        });
        return () => unsub();
    }, [addSession]);

    useEffect(() => {
        // Only reset timer if it's not currently active
        if (!isActive && !isPaused) {
            setTimeLeft(duration * 60);
            timer.setDurationSec(duration * 60);
        } else {
            timer.setDurationSec(duration * 60);
        }
    }, [duration, isActive, isPaused]);

    useEffect(() => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (isActive && !isPaused) {
            intervalRef.current = setInterval(() => {
                const s = timer.readState();
                const r = timer.computeRemaining(s);
                setTimeLeft(r.remainingSec);
                if (r.remainingSec <= 0) {
                    const ev = timer.consumeCompletion();
                    if (ev) addSession({ startTime: ev.startTimeIso, duration: ev.durationSec, completed: ev.completed });
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                    setIsActive(false);
                    setIsPaused(false);
                }
            }, 1000);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive, isPaused, addSession]);

    // Local view state now derives from centralized timer; no manual save effects required

    const handleStart = () => {
        const s = timer.start(duration * 60);
        const r = timer.computeRemaining(s);
        setSessionStartTime(s.sessionStartMs);
        setIsActive(r.status === 'running');
        setIsPaused(false);
        setTimeLeft(r.remainingSec);
    };

    const handlePauseResume = () => {
        if (isPaused) {
            const s = timer.resume();
            const r = timer.computeRemaining(s);
            setIsPaused(false);
            setIsActive(r.status === 'running');
            setTimeLeft(r.remainingSec);
        } else {
            const s = timer.pause();
            const r = timer.computeRemaining(s);
            setIsPaused(true);
            setIsActive(r.status === 'running');
            setTimeLeft(r.remainingSec);
        }
    };

    const handleReset = () => {
        const s = timer.reset(true);
        const r = timer.computeRemaining(s);
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(r.remainingSec);
        setSessionStartTime(null);
        // Consume any partial-event emitted by reset and record it
        const ev = timer.consumeCompletion();
        if (ev) addSession({ startTime: ev.startTimeIso, duration: ev.durationSec, completed: ev.completed });
        // Stop any local interval
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    
    const handleSetGoal = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newGoal = parseInt(e.target.value, 10);
        if(!isNaN(newGoal) && newGoal > 0){
             setGoal({ date: today, targetMinutes: newGoal });
        }
    };
    
    const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
    
    return (
        <AnimatedContainer className="flex flex-col items-center justify-center h-full space-y-8">
            <h1 className="text-4xl font-bold tracking-tight">Focus</h1>
            <p className="text-sm text-muted-foreground">Stay in the zone</p>

            <div className="relative w-80 h-80 flex items-center justify-center bg-card/60 backdrop-blur rounded-2xl border">
                 <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <circle
                        className="text-primary"
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
                <div className="z-10 text-center select-none">
                    <p className="font-semibold text-6xl tracking-tight text-foreground">{formatTime(timeLeft)}</p>
                    <p className="text-muted-foreground">Time to focus</p>
                </div>
            </div>

            <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex justify-center items-center gap-2 mb-6">
                    <label className="text-sm text-muted-foreground">Duration</label>
                    {[15, 25, 50].map(d => (
                        <button key={d} onClick={() => setDuration(d)} className={`px-3 py-1.5 text-sm font-medium rounded-md border transition ${duration === d ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                            {d} min
                        </button>
                    ))}
                </div>

                <div className="flex justify-center gap-4">
                    {!isActive ? (
                        <>
                            <button onClick={handleStart} className="w-48 rounded-md bg-primary text-primary-foreground px-6 py-3 text-lg font-semibold shadow-sm transition-colors hover:bg-primary/90">Start</button>
                            {timeLeft !== duration * 60 && (
                                <button onClick={handleReset} className="rounded-md bg-destructive text-destructive-foreground px-4 py-3 text-base font-semibold shadow-sm transition-colors hover:bg-destructive/90">
                                    Reset
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button onClick={handlePauseResume} className="w-48 rounded-md bg-secondary text-secondary-foreground px-6 py-3 text-lg font-semibold shadow-sm transition-colors hover:bg-secondary/80">
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                            <button onClick={handleReset} className="rounded-md bg-destructive text-destructive-foreground px-6 py-3 text-lg font-semibold shadow-sm transition-colors hover:bg-destructive/90">
                                Reset
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="w-full max-w-md rounded-2xl border bg-card p-4 shadow-sm">
                <label htmlFor="daily-goal" className="text-sm font-medium">Daily Goal (minutes)</label>
                <input
                    id="daily-goal"
                    type="number"
                    value={dailyGoal}
                    onChange={handleSetGoal}
                    className="w-full mt-2 px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
            </div>

        </AnimatedContainer>
    );
};

export default FocusPage;
