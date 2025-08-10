
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CheckCircle, Clock, Target, Timer, TrendingUp, Calendar } from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer';
import { animateStagger } from '@/utils/motion';


const DashboardPage: React.FC = () => {
  const { tasks, sessions, getTodayGoal } = useData();
  const [currentTimerProgress, setCurrentTimerProgress] = useState(0);

  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  const today = new Date().toISOString().split('T')[0];
  const sessionsToday = sessions.filter(s => s.startTime.startsWith(today));
  const totalMinutesToday = sessionsToday.reduce((acc, s) => acc + s.duration / 60, 0);
  const completedSessionsToday = sessionsToday.filter(s => s.completed);
  // Count ALL focus time toward daily goal (both completed and incomplete sessions)
  const focusMinutesToday = totalMinutesToday;

  const todayGoal = getTodayGoal();
  const goalMinutes = todayGoal?.targetMinutes || 60;

  // Add current timer progress to focus minutes for real-time display
  const focusedMinutes = Math.round(focusMinutesToday + currentTimerProgress);
  const remainingMinutes = Math.max(0, goalMinutes - focusedMinutes);

  // Monitor active timer for real-time updates
  useEffect(() => {
    // Stagger cards on mount
    animateStagger('#dashboard-cards > *');

    const updateTimerProgress = () => {
      try {
        const savedState = localStorage.getItem('memphis_timer_state');
        if (savedState) {
          const state = JSON.parse(savedState);
          if (state.isActive && !state.isPaused && state.sessionStartTime) {
            // Calculate how much time has been spent in current session
            const timeSpent = Math.floor((Date.now() - state.sessionStartTime) / 1000);
            const minutesSpent = timeSpent / 60;
            setCurrentTimerProgress(minutesSpent);
          } else {
            setCurrentTimerProgress(0);
          }
        } else {
          setCurrentTimerProgress(0);
        }
      } catch (error) {
        setCurrentTimerProgress(0);
      }
    };

    // Update immediately
    updateTimerProgress();

    // Update every second for real-time progress
    const interval = setInterval(updateTimerProgress, 1000);

    return () => clearInterval(interval);
  }, []);

  // Also update when sessions change (new session completed)
  useEffect(() => {
    // Only reset current timer progress if there's no active timer
    const checkForNewSessions = () => {
      const savedState = localStorage.getItem('memphis_timer_state');
      if (!savedState) {
        // No active timer, reset progress
        setCurrentTimerProgress(0);
      } else {
        // There's still an active timer, keep monitoring
        try {
          const state = JSON.parse(savedState);
          if (!state.isActive || state.isPaused) {
            setCurrentTimerProgress(0);
          }
        } catch (error) {
          setCurrentTimerProgress(0);
        }
      }
    };

    checkForNewSessions();
  }, [sessions]);

  const goalData = [
    {
      name: 'Today\'s Goal',
      focused: focusedMinutes,
      remaining: remainingMinutes,
      total: goalMinutes
    }
  ];

  return (
    <AnimatedContainer className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your productivity overview.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 backdrop-blur">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" id="dashboard-cards">
        <Card data-testid="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Today</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessionsToday.length}</div>
            <p className="text-xs text-muted-foreground">
              Focus sessions completed
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tasks remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(focusMinutesToday + currentTimerProgress)}m
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((focusedMinutes / goalMinutes) * 100)}% of goal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Focus Goal */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Today's Focus Goal
            </CardTitle>
            <CardDescription>
              Track your daily focus time progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis
                    domain={[0, goalMinutes]}
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="focused"
                    stackId="progress"
                    fill="hsl(var(--primary))"
                    name="Minutes Completed"
                    radius={[0, 0, 0, 0]}
                    className={currentTimerProgress > 0 ? "animate-pulse" : ""}
                  />
                  <Bar
                    dataKey="remaining"
                    stackId="progress"
                    fill="hsl(var(--muted))"
                    name="Minutes Remaining"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Focused: {Math.round(focusMinutesToday)}m</span>
                  {currentTimerProgress > 0 && (
                    <Badge variant="secondary" className="animate-pulse">
                      +{Math.round(currentTimerProgress)}m active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <span>Remaining: {Math.max(0, goalMinutes - focusedMinutes)}m</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  {sessionsToday.length} sessions today
                  {currentTimerProgress > 0 && ' + 1 active'}
                </div>
                <div className="text-lg font-semibold">
                  {Math.round((focusedMinutes / goalMinutes) * 100)}% complete
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              Your latest focus sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.slice(0, 5).map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    {session.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(session.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={session.completed ? "default" : "secondary"}>
                    {Math.round(session.duration / 60)}m
                  </Badge>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-6">
                  <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-2">No sessions yet</p>
                  <Button asChild>
                    <Link to="/focus">Start Your First Session</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedContainer>
  );
};

export default DashboardPage;
