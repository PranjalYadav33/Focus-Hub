
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { APP_CONFIG } from '@/utils/constants';
import { cas, updateList, subscribe } from '@/utils/store';
import { uid } from '@/utils/id';
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
  const [tasks, setTasks] = useLocalStorage<Task[]>(APP_CONFIG.STORAGE_KEYS.TASKS, []);
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>(APP_CONFIG.STORAGE_KEYS.SESSIONS, []);
  const [goals, setGoals] = useLocalStorage<DailyGoal[]>(APP_CONFIG.STORAGE_KEYS.GOALS, []);

  const addTask = (task: TaskInput) => {
    if (!task.title.trim()) throw new Error('Task title is required');
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: uid(),
      completed: false,
      createdAt: now,
      title: task.title.trim(),
      description: task.description.trim(),
    };
    setTasks(prev => [newTask, ...prev]);
    // Persist via centralized store to broadcast across tabs
    updateList<Task>(APP_CONFIG.STORAGE_KEYS.TASKS, (prev) => [newTask, ...prev], 1000);
    queueOfflineAction('tasks', { action: 'add', data: newTask });
  };

  const updateTask = (id: string, updates: TaskUpdate) => {
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: now } : t));
    cas<Task[]>(APP_CONFIG.STORAGE_KEYS.TASKS, (prev) => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: now } : t), []);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    cas<Task[]>(APP_CONFIG.STORAGE_KEYS.TASKS, (prev) => prev.filter(t => t.id !== id), []);
  };

  const toggleTaskCompletion = (id: string) => {
    const now = new Date().toISOString();
    setTasks(prev => prev.map(task => task.id === id ? { ...task, completed: !task.completed, updatedAt: now } : task));
    cas<Task[]>(APP_CONFIG.STORAGE_KEYS.TASKS, (prev) => prev.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: now } : t), []);
  };

  const addSession = (session: SessionInput) => {
    const newSession: FocusSession = { ...session, id: uid() };
    setSessions(prev => [newSession, ...prev]);
    updateList<FocusSession>(APP_CONFIG.STORAGE_KEYS.SESSIONS, (prev) => [newSession, ...prev], 2000);
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
    if (goal.targetMinutes <= 0) throw new Error('Target minutes must be greater than 0');

    setGoals(prev => {
      const idx = prev.findIndex(g => g.date === goal.date);
      if (idx > -1) { const arr = [...prev]; arr[idx] = goal; return arr; }
      return [...prev, goal];
    });
    cas<DailyGoal[]>(APP_CONFIG.STORAGE_KEYS.GOALS, (prev) => {
      const idx = prev.findIndex(g => g.date === goal.date);
      if (idx > -1) { const arr = [...prev]; arr[idx] = goal; return arr; }
      return [goal, ...prev];
    }, []);
  };

  // Cross-tab sync: listen for store changes and update local state when relevant
  useEffect(() => {
    const unsub = subscribe(({ key, value }) => {
      if (key === APP_CONFIG.STORAGE_KEYS.TASKS) setTasks(value as Task[]);
      if (key === APP_CONFIG.STORAGE_KEYS.SESSIONS) setSessions(value as FocusSession[]);
      if (key === APP_CONFIG.STORAGE_KEYS.GOALS) setGoals(value as DailyGoal[]);
    });
    return () => unsub();
  }, []);


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
