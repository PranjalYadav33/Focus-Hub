
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const Header: React.FC = () => {
  const [timerInfo, setTimerInfo] = useState<{ timeLeft: number; isActive: boolean } | null>(null);
  const navLinkClass = ({ isActive }: { isActive: boolean }): string => {
    const baseClasses = 'text-lg md:text-xl font-fredoka px-4 py-2 rounded-lg transition-all duration-300 border-2 border-deep-space';
    return isActive
      ? `${baseClasses} bg-hot-pink text-white shadow-[4px_4px_0_#2E294E]`
      : `${baseClasses} bg-white text-deep-space hover:bg-lime-green hover:shadow-[4px_4px_0_#2E294E] hover:-translate-y-1`;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Check for active timer
  useEffect(() => {
    const checkTimer = () => {
      try {
        const savedState = localStorage.getItem('memphis_timer_state');
        if (savedState) {
          const state = JSON.parse(savedState);
          if (state.isActive && !state.isPaused) {
            const timePassed = Math.floor((Date.now() - state.lastUpdateTime) / 1000);
            const currentTimeLeft = Math.max(0, state.timeLeft - timePassed);
            setTimerInfo({ timeLeft: currentTimeLeft, isActive: true });
          } else {
            setTimerInfo(null);
          }
        } else {
          setTimerInfo(null);
        }
      } catch (error) {
        setTimerInfo(null);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-electric-blue p-4 border-b-4 border-deep-space relative" role="banner">
       <div className="absolute top-2 right-20 w-12 h-12 bg-sunny-yellow rounded-full" aria-hidden="true"></div>
       <div className="container mx-auto flex justify-between items-center relative z-10">
        <NavLink to="/" className="text-2xl md:text-4xl font-righteous text-white tracking-wider" style={{ textShadow: '2px 2px 0 #2E294E' }} aria-label="Focus Hub - Go to Dashboard">
          Focus Hub
        </NavLink>
        <nav className="flex items-center gap-2 md:gap-4" role="navigation" aria-label="Main navigation">
          {timerInfo && (
            <div className="bg-hot-pink text-white px-3 py-1 rounded-lg border-2 border-deep-space font-fredoka text-sm animate-pulse" role="status" aria-live="polite" aria-label={`Timer running: ${formatTime(timerInfo.timeLeft)} remaining`}>
              <Icon name="timer-outline" className="mr-1" />
              {formatTime(timerInfo.timeLeft)}
            </div>
          )}
          <NavLink to="/" className={navLinkClass} aria-label="Go to Dashboard">Dashboard</NavLink>
          <NavLink to="/todo" className={navLinkClass} aria-label="Go to To-Do List">To-Do</NavLink>
          <NavLink to="/focus" className={navLinkClass} aria-label="Go to Focus Timer">Focus</NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
