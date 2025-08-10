// Route prefetching utilities for better perceived performance
// Preloads likely next routes based on current location and user behavior

const routeMap: Record<string, string[]> = {
  '/': ['/todo', '/focus'], // From dashboard, likely to go to tasks or focus
  '/todo': ['/focus', '/'], // From tasks, likely to start focus or check dashboard
  '/focus': ['/', '/todo'], // From focus, likely to check progress or add tasks
  '/settings': ['/'], // From settings, likely to return to dashboard
};

// Prefetch a route's component
export async function prefetchRoute(path: string) {
  try {
    switch (path) {
      case '/':
        await import('../pages/DashboardPage');
        break;
      case '/todo':
        await import('../pages/TodoPage');
        break;
      case '/focus':
        await import('../pages/FocusPage');
        break;
      case '/settings':
        await import('../pages/SettingsPage');
        break;
    }
  } catch (error) {
    // Prefetch failures are non-critical
    console.debug('Route prefetch failed:', path, error);
  }
}

// Prefetch likely next routes based on current location
export function prefetchLikelyRoutes(currentPath: string) {
  const likelyRoutes = routeMap[currentPath] || [];
  likelyRoutes.forEach(route => {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => prefetchRoute(route));
    } else {
      setTimeout(() => prefetchRoute(route), 100);
    }
  });
}

// Hook to automatically prefetch on route changes
export function usePrefetch() {
  if (typeof window === 'undefined') return;
  
  // Prefetch on page load
  const currentPath = window.location.pathname.replace(/^\/Focus-Hub/, '') || '/';
  prefetchLikelyRoutes(currentPath);
  
  // Listen for navigation events to prefetch next likely routes
  const handleNavigation = () => {
    const newPath = window.location.pathname.replace(/^\/Focus-Hub/, '') || '/';
    prefetchLikelyRoutes(newPath);
  };
  
  window.addEventListener('popstate', handleNavigation);
  return () => window.removeEventListener('popstate', handleNavigation);
}
