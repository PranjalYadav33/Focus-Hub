// Utility functions for the Memphis Focus Hub application

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format duration in seconds to human readable format
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Check if a date string is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayDate();
};

/**
 * Format date for display
 */
export const formatDisplayDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format time for display (12-hour format)
 */
export const formatDisplayTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Validate task input
 */
export const validateTaskInput = (title: string, description: string): string[] => {
  const errors: string[] = [];
  
  if (!title.trim()) {
    errors.push('Task title is required');
  }
  
  if (title.trim().length > 100) {
    errors.push('Task title must be less than 100 characters');
  }
  
  if (description.trim().length > 500) {
    errors.push('Task description must be less than 500 characters');
  }
  
  return errors;
};

/**
 * Validate timer duration
 */
export const validateTimerDuration = (minutes: number): string[] => {
  const errors: string[] = [];
  
  if (minutes < 1) {
    errors.push('Timer duration must be at least 1 minute');
  }
  
  if (minutes > 60) {
    errors.push('Timer duration must be less than 60 minutes');
  }
  
  return errors;
};

/**
 * Generate a random ID (fallback for crypto.randomUUID)
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for environments without crypto.randomUUID
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
