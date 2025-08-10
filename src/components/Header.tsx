
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Timer, LayoutDashboard, CheckSquare, Focus, Settings } from 'lucide-react';
import { Badge } from './ui/badge';
import { formatTime } from '@/lib/utils';
import * as t from '@/utils/timer';

const Header: React.FC = () => {
  const [timerInfo, setTimerInfo] = useState<{ timeLeft: number; isActive: boolean } | null>(null);

  const navLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return isActive
      ? 'flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium transition-colors shadow-sm'
      : 'flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-colors';
  };



  // Check for active timer
  useEffect(() => {
    const update = () => {
      const s = t.readState();
      const r = t.computeRemaining(s);
      setTimerInfo(r.status === 'running' ? { timeLeft: r.remainingSec, isActive: true } : null);
    };
    update();
    const unsub = t.onStoreChange(() => update());
    const id = setInterval(update, 1000);
    return () => { clearInterval(id); unsub(); };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <NavLink
          to="/"
          className="flex items-center space-x-2 text-2xl font-bold text-foreground hover:text-primary transition-colors"
          aria-label="Focus Hub - Go to Dashboard"
        >
          <Focus className="h-8 w-8" />
          <span>Focus Hub</span>
        </NavLink>

        <div className="flex items-center gap-6">
          {timerInfo && (
            <Badge variant="secondary" className="animate-pulse">
              <Timer className="mr-1 h-3 w-3" />
              {formatTime(timerInfo.timeLeft)}
            </Badge>
          )}

          <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
            <NavLink to="/" className={navLinkClass} aria-label="Go to Dashboard">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
            <NavLink to="/todo" className={navLinkClass} aria-label="Go to To-Do List">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </NavLink>
            <NavLink to="/focus" className={navLinkClass} aria-label="Go to Focus Timer">
              <Timer className="h-4 w-4" />
              <span className="hidden sm:inline">Focus</span>
            </NavLink>
            <NavLink to="/settings" className={navLinkClass} aria-label="Go to Settings">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
