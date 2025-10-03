import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Timer, LayoutDashboard, ListTodo, BrainCircuit, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import * as t from '@/utils/timer';
import { ModeToggle } from './ModeToggle';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/todo', label: 'Tasks', icon: ListTodo },
  { to: '/focus', label: 'Focus', icon: BrainCircuit },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const NavLinkContent: React.FC<{
  label: string;
  icon: React.ElementType;
}> = ({ label, icon: Icon }) => (
  <>
    <Icon className="h-5 w-5" />
    <span className="sr-only sm:not-sr-only">{label}</span>
  </>
);

const Header: React.FC = () => {
  const [timerInfo, setTimerInfo] = useState<{
    timeLeft: number;
    isActive: boolean;
  } | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const s = t.readState();
      const r = t.computeRemaining(s);
      setTimerInfo(
        r.status === 'running' ? { timeLeft: r.remainingSec, isActive: true } : null
      );
    };
    update();
    const unsub = t.onStoreChange(update);
    const id = setInterval(update, 1000);
    return () => {
      clearInterval(id);
      unsub();
    };
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center gap-4 p-3 rounded-md text-base font-medium transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`;

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <NavLink
          to="/"
          className="flex items-center gap-2 text-xl font-bold"
          aria-label="Focus Hub - Go to Dashboard"
        >
          <BrainCircuit className="h-7 w-7 text-primary" />
          <span className="hidden sm:inline">Focus Hub</span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-2" aria-label="Main navigation">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <NavLinkContent label={item.label} icon={item.icon} />
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {timerInfo && (
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground p-2 border rounded-md">
              <Timer className="h-4 w-4 animate-pulse text-primary" />
              {formatTime(timerInfo.timeLeft)}
            </div>
          )}
          <ModeToggle />
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="p-4">
                  <NavLink
                    to="/"
                    onClick={closeSheet}
                    className="flex items-center gap-2 text-xl font-bold mb-6"
                  >
                    <BrainCircuit className="h-7 w-7 text-primary" />
                    <span>Focus Hub</span>
                  </NavLink>
                  <nav className="flex flex-col gap-2">
                    {navItems.map(item => (
                      <NavLink key={item.to} to={item.to} className={mobileNavLinkClass} onClick={closeSheet}>
                        <NavLinkContent label={item.label} icon={item.icon} />
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;