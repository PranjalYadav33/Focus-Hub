
import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Task, FocusSession, DailyGoal, TaskInput, SessionInput, TaskUpdate, Priority } from '../types/types';

interface DataContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (task: TaskInput) => void;
  updateTask: (id: string, updates: TaskUpdate) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  sessions: FocusSession[];
  addSession: (session: SessionInput) => void;
  goals: DailyGoal[];
  setGoal: (goal: DailyGoal) => void;
  getTodayGoal: () => DailyGoal | undefined;
  getTasksByPriority: (priority: Priority) => Task[];
  getCompletedTasksCount: () => number;
  getTodaysSessions: () => FocusSession[];
  getTotalFocusTimeToday: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Utility function to queue offline actions for background sync
const queueOfflineAction = (action: string, data: any) => {
  if (!navigator.onLine && 'serviceWorker' in navigator) {
    // Store offline actions in localStorage for later sync
    const offlineActions = JSON.parse(localStorage.getItem('memphis_offline_actions') || '[]');
    offlineActions.push({
      action,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('memphis_offline_actions', JSON.stringify(offlineActions));

    // Register for background sync when back online
    navigator.serviceWorker.ready.then(registration => {
      if ('sync' in registration) {
        registration.sync.register(`sync-${action}`);
      }
    }).catch(err => console.log('Background sync registration failed:', err));
  }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('memphis_tasks', []);
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('memphis_sessions', []);
  const [goals, setGoals] = useLocalStorage<DailyGoal[]>('memphis_goals', []);

  const addTask = (task: TaskInput) => {
    // Validation
    if (!task.title.trim()) {
      throw new Error('Task title is required');
    }

    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
      title: task.title.trim(),
      description: task.description.trim(),
    };
    setTasks(prev => [newTask, ...prev]);

    // Queue for background sync when online
    queueOfflineAction('tasks', { action: 'add', data: newTask });
  };

  const updateTask = (id: string, updates: TaskUpdate) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };
  
  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const addSession = (session: SessionInput) => {
    const newSession: FocusSession = {
      ...session,
      id: crypto.randomUUID(),
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const getTodayGoal = () => {
    const today = new Date().toISOString().split('T')[0];
    return goals.find(g => g.date === today);
  };

  const getTasksByPriority = (priority: Priority) => {
    return tasks.filter(task => task.priority === priority);
  };

  const getCompletedTasksCount = () => {
    return tasks.filter(task => task.completed).length;
  };

  const getTodaysSessions = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(session => session.startTime.startsWith(today));
  };

  const getTotalFocusTimeToday = () => {
    const todaysSessions = getTodaysSessions();
    return todaysSessions.reduce((total, session) => total + session.duration, 0);
  };

  const setGoal = (goal: DailyGoal) => {
    // Validation
    if (goal.targetMinutes <= 0) {
      throw new Error('Target minutes must be greater than 0');
    }

    setGoals(prev => {
      const existingGoalIndex = prev.findIndex(g => g.date === goal.date);
      if (existingGoalIndex > -1) {
        const newGoals = [...prev];
        newGoals[existingGoalIndex] = goal;
        return newGoals;
      }
      return [...prev, goal];
    });
  };

  return (
    <DataContext.Provider value={{
      tasks,
      setTasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      sessions,
      addSession,
      goals,
      setGoal,
      getTodayGoal,
      getTasksByPriority,
      getCompletedTasksCount,
      getTodaysSessions,
      getTotalFocusTimeToday
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
