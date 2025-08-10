// Theme and appearance preferences with system support
// - Theme (light/dark/system)
// - Accent color
// - Motion preference (normal/reduced/system)

export type ThemePreference = 'system' | 'light' | 'dark';
export type MotionPreference = 'system' | 'normal' | 'reduced';
export type AccentKey = 'blue' | 'indigo' | 'purple' | 'green' | 'pink' | 'orange';

export const THEME_KEY = 'theme_preference';
export const MOTION_KEY = 'motion_preference';
export const ACCENT_KEY = 'accent_preference';

const ACCENTS: Record<AccentKey, { primary: string; ring?: string; foreground?: string }> = {
  blue:   { primary: '221.2 83.2% 53.3%', ring: '221.2 83.2% 53.3%', foreground: '210 40% 98%' }, // system blue
  indigo: { primary: '243 75% 58%',       ring: '243 75% 58%',       foreground: '210 40% 98%' },
  purple: { primary: '270 73% 60%',       ring: '270 73% 60%',       foreground: '210 40% 98%' },
  green:  { primary: '142 70% 45%',       ring: '142 70% 45%',       foreground: '0 0% 100%' },
  pink:   { primary: '330 81% 60%',       ring: '330 81% 60%',       foreground: '210 40% 98%' },
  orange: { primary: '24 94% 50%',        ring: '24 94% 50%',        foreground: '210 40% 98%' },
};

export function getThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_KEY) as ThemePreference | null;
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

export function setThemePreference(pref: ThemePreference) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, pref);
}

export function getMotionPreference(): MotionPreference {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(MOTION_KEY) as MotionPreference | null;
  return stored === 'normal' || stored === 'reduced' || stored === 'system' ? stored : 'system';
}

export function setMotionPreference(pref: MotionPreference) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOTION_KEY, pref);
}

export function getAccentPreference(): AccentKey {
  if (typeof window === 'undefined') return 'blue';
  const stored = localStorage.getItem(ACCENT_KEY) as AccentKey | null;
  return stored && ACCENTS[stored] ? stored : 'blue';
}

export function setAccentPreference(accent: AccentKey) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCENT_KEY, accent);
}

export function applyAccent(accent: AccentKey) {
  if (typeof document === 'undefined') return;
  setAccentPreference(accent);
  const cfg = ACCENTS[accent] || ACCENTS.blue;
  const root = document.documentElement;
  root.style.setProperty('--primary', cfg.primary);
  root.style.setProperty('--ring', cfg.ring || cfg.primary);
  if (cfg.foreground) root.style.setProperty('--primary-foreground', cfg.foreground);
}

export function applySystemTheme() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', isDark);
}

export function startSystemThemeSync() {
  if (typeof window === 'undefined') return () => {};
  applySystemTheme();

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    const matches = 'matches' in e ? (e as MediaQueryList).matches : (e as MediaQueryListEvent).matches;
    document.documentElement.classList.toggle('dark', matches);
  };

  if ('addEventListener' in mq) (mq as any).addEventListener('change', handler);
  else (mq as any).addListener(handler);

  return () => {
    if ('removeEventListener' in mq) (mq as any).removeEventListener('change', handler);
    else (mq as any).removeListener(handler);
  };
}

let stopSystemSync: null | (() => void) = null;

export function applyTheme(pref: ThemePreference) {
  if (typeof document === 'undefined') return;
  setThemePreference(pref);

  // Clean up previous system listener if any
  if (stopSystemSync) {
    stopSystemSync();
    stopSystemSync = null;
  }

  if (pref === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (pref === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    applySystemTheme();
    stopSystemSync = startSystemThemeSync();
  }
}

export function applySavedAppearance() {
  // Apply theme
  applyTheme(getThemePreference());
  // Apply accent
  applyAccent(getAccentPreference());
}

