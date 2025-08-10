// Enums
export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum TimerStatus {
  Idle = 'idle',
  Running = 'running',
  Paused = 'paused',
  Completed = 'completed',
}

// Core interfaces
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  completed: boolean;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
}

export interface FocusSession {
  id: string;
  duration: number; // in seconds
  startTime: string; // ISO string
  endTime?: string; // ISO string
  completed: boolean;
  taskId?: string; // Optional link to a task
}

export interface DailyGoal {
  date: string; // YYYY-MM-DD format
  targetMinutes: number;
  achievedMinutes?: number;
}

// Timer state interface
export interface TimerState {
  duration: number; // in seconds
  timeLeft: number; // in seconds
  status: TimerStatus;
  startTime?: string; // ISO string
  pausedTime?: number; // accumulated paused time in seconds
}

// Utility types
export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'completed'>;
export type SessionInput = Omit<FocusSession, 'id'>;
export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt'>>;

// Component prop types
export interface StatCardProps {
  title: string;
  value: string | number;
  color: string;
  icon: string;
}

export interface IconProps {
  name: string;
  className?: string;
  size?: string;
}


