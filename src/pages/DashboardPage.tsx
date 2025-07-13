
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import { ICON_NAMES } from '../utils/constants';


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
    <div className="space-y-12">
      <h1 className="text-5xl font-righteous text-center text-deep-space">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Tasks" value={tasks.length} color="bg-hot-pink" icon="list-outline" />
        <StatCard title="Completed" value={completedSessionsToday.length} color="bg-electric-blue" icon="checkmark-done-outline" />
        <StatCard title="Pending" value={pendingTasks} color="bg-coral" icon="hourglass-outline" />
        <StatCard
          title="Today's Focus"
          value={`${Math.round(focusMinutesToday + currentTimerProgress)}m`}
          color="bg-lime-green"
          icon="timer-outline"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Focus Goal */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border-4 border-deep-space shadow-[8px_8px_0_#2E294E]">
          <h2 className="font-fredoka text-2xl mb-4">Today's Focus Goal</h2>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, goalMinutes]} />
                    <Tooltip
                        contentStyle={{
                            background: '#fff',
                            border: '3px solid #2E294E',
                            borderRadius: '12px',
                            fontFamily: 'Fredoka One',
                            boxShadow: '4px 4px 0 #2E294E'
                        }}
                    />
                    <Bar
                        dataKey="focused"
                        stackId="progress"
                        fill={currentTimerProgress > 0 ? "#4ECDC4" : "#00D4FF"}
                        name="Minutes Completed"
                        radius={[0, 0, 0, 0]}
                        className={currentTimerProgress > 0 ? "animate-pulse" : ""}
                    />
                    <Bar dataKey="remaining" stackId="progress" fill="#FFE66D" name="Minutes Remaining" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </div>
           <div className="text-center mt-4 space-y-2">
            <div className="flex justify-center items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-electric-blue">
                  {Math.round(focusMinutesToday)}
                  {currentTimerProgress > 0 && (
                    <span className="text-lime-green">+{Math.round(currentTimerProgress)}</span>
                  )}
                </p>
                <p className="text-xs text-deep-space/70">Focused{currentTimerProgress > 0 && ' + Active'}</p>
              </div>
              <div className="text-deep-space text-2xl">/</div>
              <div className="text-center">
                <p className="text-2xl font-bold text-deep-space">{goalMinutes}</p>
                <p className="text-xs text-deep-space/70">Goal</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-sunny-yellow">{Math.round((focusedMinutes / goalMinutes) * 100)}%</p>
                <p className="text-xs text-deep-space/70">Progress</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-deep-space/70">
                Total focus time today: <span className="font-bold text-lime-green">{Math.round(focusMinutesToday + currentTimerProgress)} minutes</span>
                {sessionsToday.length > 0 && ` (${sessionsToday.length} sessions${currentTimerProgress > 0 ? ' + 1 active' : ''})`}
              </p>
              {currentTimerProgress > 0 && (
                <p className="text-xs text-purple-600 font-semibold animate-pulse">
                  Timer running: +{Math.round(currentTimerProgress)} minutes and counting!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border-4 border-deep-space shadow-[8px_8px_0_#2E294E]">
          <h2 className="font-fredoka text-2xl mb-4">Recent Sessions</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {sessions.slice(0, 5).map(session => (
              <div key={session.id} className="flex justify-between items-center bg-lime-green p-3 rounded-lg border-2 border-deep-space">
                <span className="font-semibold">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="font-semibold">{Math.round(session.duration / 60)} min</span>
<Icon
                  name={session.completed ? ICON_NAMES.CHECKMARK_CIRCLE : ICON_NAMES.CLOSE_CIRCLE}
                  className={`text-2xl ${session.completed ? 'text-electric-blue' : 'text-hot-pink'}`}
                />
              </div>
            ))}
            {sessions.length === 0 && <p className="text-center text-gray-500">No sessions yet. <Link to="/focus" className="text-electric-blue font-bold">Start one!</Link></p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
