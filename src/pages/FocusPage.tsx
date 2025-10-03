import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '../context/DataContext';
import AnimatedContainer from '@/components/AnimatedContainer';
import * as timer from '@/utils/timer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pause, Play, RotateCcw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Initialize from centralized timer state
const s0 = timer.readState();
const r0 = timer.computeRemaining(s0);

const FocusPage: React.FC = () => {
  const { addSession, getTodayGoal, setGoal } = useData();

  const [duration, setDuration] = useState<number>(
    Math.floor(s0.durationSec / 60)
  );
  const [timeLeft, setTimeLeft] = useState<number>(r0.remainingSec);
  const [isActive, setIsActive] = useState<boolean>(r0.status === 'running');
  const [isPaused, setIsPaused] = useState<boolean>(s0.status === 'paused');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(
    s0.sessionStartMs
  );

  const today = new Date().toISOString().split('T')[0];
  const dailyGoal = getTodayGoal()?.targetMinutes || 60;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // If a completion event is present, consume it and record a session
  useEffect(() => {
    const ev = timer.consumeCompletion();
    if (ev) {
      addSession({
        startTime: ev.startTimeIso,
        duration: ev.durationSec,
        completed: ev.completed,
      });
    }
    // Subscribe to store changes (cross-tab)
    const unsub = timer.onStoreChange((s, ev2) => {
      const r = timer.computeRemaining(s);
      setDuration(Math.floor(s.durationSec / 60));
      setTimeLeft(r.remainingSec);
      setIsActive(r.status === 'running');
      setIsPaused(s.status === 'paused');
      setSessionStartTime(s.sessionStartMs);
      if (ev2)
        addSession({
          startTime: ev2.startTimeIso,
          duration: ev2.durationSec,
          completed: ev2.completed,
        });
    });
    return () => unsub();
  }, [addSession]);

  useEffect(() => {
    if (!isActive && !isPaused) {
      setTimeLeft(duration * 60);
      timer.setDurationSec(duration * 60);
    }
  }, [duration, isActive, isPaused]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        const s = timer.readState();
        const r = timer.computeRemaining(s);
        setTimeLeft(r.remainingSec);
        if (r.remainingSec <= 0) {
          const ev = timer.consumeCompletion();
          if (ev)
            addSession({
              startTime: ev.startTimeIso,
              duration: ev.durationSec,
              completed: ev.completed,
            });
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsActive(false);
          setIsPaused(false);
        }
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, addSession]);

  const handleStart = () => {
    const s = timer.start(duration * 60);
    const r = timer.computeRemaining(s);
    setSessionStartTime(s.sessionStartMs);
    setIsActive(r.status === 'running');
    setIsPaused(false);
    setTimeLeft(r.remainingSec);
  };

  const handlePauseResume = () => {
    const s = isPaused ? timer.resume() : timer.pause();
    const r = timer.computeRemaining(s);
    setIsPaused(s.status === 'paused');
    setIsActive(r.status === 'running');
    setTimeLeft(r.remainingSec);
  };

  const handleReset = () => {
    const s = timer.reset(true);
    const r = timer.computeRemaining(s);
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(r.remainingSec);
    setSessionStartTime(null);
    const ev = timer.consumeCompletion();
    if (ev)
      addSession({
        startTime: ev.startTimeIso,
        duration: ev.durationSec,
        completed: ev.completed,
      });
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleSetGoal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGoal = parseInt(e.target.value, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      setGoal({ date: today, targetMinutes: newGoal });
    }
  };

  const progress =
    duration > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) * 360 : 0;

  return (
    <AnimatedContainer className="flex flex-col items-center justify-center h-full space-y-8 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Focus Session</h1>
        <p className="text-muted-foreground">
          {isActive
            ? "You're in the zone. Keep it up!"
            : 'Ready to start a new session?'}
        </p>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full bg-muted transition-all duration-500"
          style={{
            transform: `scale(${isActive && !isPaused ? 1.05 : 1})`,
          }}
        ></div>
        <div
          className="absolute inset-0 rounded-full border-[16px] border-primary/10"
        ></div>
        <div
          className="absolute inset-0"
          style={{
            transform: 'rotate(-90deg)',
            background: `conic-gradient(hsl(var(--primary)) ${progress}deg, transparent ${progress}deg)`,
            borderRadius: '50%',
            transition: 'background 1s linear',
          }}
        ></div>
        <div className="absolute inset-8 rounded-full bg-background"></div>

        <div className="z-10 text-center select-none">
          <p className="font-mono text-7xl font-bold tracking-tighter text-foreground">
            {formatTime(timeLeft)}
          </p>
          <p className="text-muted-foreground uppercase tracking-widest text-sm">
            Time to Focus
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-sm justify-center gap-4">
        {!isActive ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="w-full h-16 text-2xl"
          >
            <Play className="h-8 w-8 mr-4" />
            Start
          </Button>
        ) : (
          <>
            <Button
              onClick={handlePauseResume}
              size="lg"
              variant="secondary"
              className="w-full h-16 text-2xl"
            >
              {isPaused ? (
                <Play className="h-8 w-8 mr-4" />
              ) : (
                <Pause className="h-8 w-8 mr-4" />
              )}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              onClick={handleReset}
              size="lg"
              variant="destructive"
              className="h-16"
            >
              <RotateCcw className="h-8 w-8" />
            </Button>
          </>
        )}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="absolute top-6 right-6">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Focus Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Session Duration (minutes)
              </label>
              <div className="flex justify-center items-center gap-2">
                {[15, 25, 50].map(d => (
                  <Button
                    key={d}
                    onClick={() => setDuration(d)}
                    variant={duration === d ? 'default' : 'outline'}
                    disabled={isActive}
                  >
                    {d} min
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="daily-goal" className="text-sm font-medium">
                Daily Goal (minutes)
              </label>
              <Input
                id="daily-goal"
                type="number"
                value={dailyGoal}
                onChange={handleSetGoal}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AnimatedContainer>
  );
};

export default FocusPage;