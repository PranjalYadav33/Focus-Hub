// App configuration constants
export const APP_CONFIG = {
  DEFAULT_TIMER_DURATION: 25 * 60, // 25 minutes in seconds
  MIN_TIMER_DURATION: 1 * 60, // 1 minute in seconds
  MAX_TIMER_DURATION: 60 * 60, // 60 minutes in seconds
  DEFAULT_DAILY_GOAL: 60, // 60 minutes
  STORAGE_KEYS: {
    TASKS: 'memphis_tasks',
    SESSIONS: 'memphis_sessions',
    GOALS: 'memphis_goals',
    TIMER_STATE: 'memphis_timer_state',
  },
} as const;

// Common icon names used throughout the app
export const ICON_NAMES = {
  // Dashboard icons
  LIST: 'list-outline',
  CHECKMARK_CIRCLE: 'checkmark-circle-outline',
  HOURGLASS: 'hourglass-outline',
  TIMER: 'timer-outline',
  CHECKMARK: 'checkmark-circle',
  CLOSE_CIRCLE: 'close-circle',

  // Action icons
  PENCIL: 'pencil-outline',
  TRASH: 'trash-outline',
  ADD_CIRCLE: 'add-circle-outline',
  REFRESH: 'refresh-outline',
} as const;

// Color theme constants
export const COLORS = {
  'hot-pink': '#FF6B9D',
  'electric-blue': '#4ECDC4',
  'sunny-yellow': '#FFE66D',
  'lime-green': '#95E1D3',
  'coral': '#F38BA8',
  'deep-space': '#2E294E',
} as const;

// Priority colors mapping
export const PRIORITY_COLORS = {
  high: 'bg-hot-pink text-white',
  medium: 'bg-sunny-yellow text-deep-space',
  low: 'bg-lime-green text-deep-space',
} as const;

// Date/time utilities
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'MMM DD, YYYY',
  TIME_12H: 'h:mm A',
} as const;
