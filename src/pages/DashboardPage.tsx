import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  CheckCircle,
  Clock,
  Timer,
  TrendingUp,
  Calendar,
  ListChecks,
  BrainCircuit,
  Clock3,
  Star,
  Plus,
} from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer';
import { animateStagger } from '@/utils/motion';
import { Separator } from '@/components/ui/separator';

const DashboardPage: React.FC = () => {
  const { tasks, sessions, getTodayGoal } = useData();
  const [currentTimerProgress, setCurrentTimerProgress] = useState(0);

  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  const today = new Date().toISOString().split('T')[0];
  const sessionsToday = sessions.filter(s => s.startTime.startsWith(today));
  const totalMinutesToday = sessionsToday.reduce(
    (acc, s) => acc + s.duration / 60,
    0
  );
  const completedSessionsToday = sessionsToday.filter(s => s.completed);
  const focusMinutesToday = totalMinutesToday;

  const todayGoal = getTodayGoal();
  const goalMinutes = todayGoal?.targetMinutes || 60;

  const focusedMinutes = Math.round(focusMinutesToday + currentTimerProgress);

  useEffect(() => {
    animateStagger('#dashboard-cards > *');

    const updateTimerProgress = () => {
      try {
        const savedState = localStorage.getItem('memphis_timer_state');
        if (savedState) {
          const state = JSON.parse(savedState);
          if (state.isActive && !state.isPaused && state.sessionStartTime) {
            const timeSpent = Math.floor(
              (Date.now() - state.sessionStartTime) / 1000
            );
            setCurrentTimerProgress(timeSpent / 60);
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

    updateTimerProgress();
    const interval = setInterval(updateTimerProgress, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkForNewSessions = () => {
      const savedState = localStorage.getItem('memphis_timer_state');
      if (!savedState) {
        setCurrentTimerProgress(0);
      } else {
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

  const goalProgress = Math.min(
    100,
    Math.round((focusedMinutes / goalMinutes) * 100)
  );

  const radialChartData = [
    {
      name: 'Focus Goal',
      value: goalProgress,
    },
  ];

  return (
    <AnimatedContainer className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your productivity overview.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1.5 backdrop-blur-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
          </span>
        </div>
      </div>

      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        id="dashboard-cards"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sessions Today
            </CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedSessionsToday.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Focus sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{focusedMinutes}m</div>
            <p className="text-xs text-muted-foreground">
              {goalProgress}% of {goalMinutes}m goal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Today's Focus Goal
            </CardTitle>
            <CardDescription>
              Your daily focus progress. Keep it up!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="relative h-64 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="80%"
                  outerRadius="100%"
                  data={radialChartData}
                  startAngle={90}
                  endAngle={-270}
                  barSize={15}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background={{ fill: 'hsl(var(--muted))' }}
                    dataKey="value"
                    angleAxisId={0}
                    cornerRadius={10}
                    className="fill-primary"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: number) => [`${value.toFixed(0)}%`, 'Progress']}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-primary">
                  {goalProgress}%
                </span>
                <p className="text-muted-foreground text-sm">completed</p>
              </div>
            </div>
            <div className="w-full mt-6 space-y-4 text-center">
              <div className="text-2xl font-light">
                You've focused for{' '}
                <strong className="font-semibold text-primary">
                  {focusedMinutes}
                </strong>{' '}
                out of{' '}
                <strong className="font-semibold">{goalMinutes}</strong>{' '}
                minutes today.
              </div>
              {currentTimerProgress > 0 && (
                <Badge variant="secondary" className="animate-pulse">
                  +{Math.round(currentTimerProgress)}m in active session
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest focus sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session, index) => (
                <React.Fragment key={session.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {session.completed ? (
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(session.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.startTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={session.completed ? 'default' : 'secondary'}
                      className="font-mono"
                    >
                      {Math.round(session.duration / 60)}m
                    </Badge>
                  </div>
                  {index < sessions.slice(0, 5).length - 1 && <Separator />}
                </React.Fragment>
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-1">
                    No Sessions Yet
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Start a focus session to see your progress.
                  </p>
                  <Button asChild>
                    <Link to="/focus">
                      <Plus className="mr-2 h-4 w-4" />
                      Start First Session
                    </Link>
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