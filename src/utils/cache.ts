// Cache management utilities for better performance and reliability

const CACHE_SIZES = {
  MAX_IMAGES: 50, // Maximum number of images to cache
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB per image
  MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB total cache size
};

// Clean up old cache entries when approaching limits
export async function cleanupImageCache() {
  try {
    const cache = await caches.open('focus-hub-images');
    const requests = await cache.keys();
    
    if (requests.length <= CACHE_SIZES.MAX_IMAGES) return;
    
    // Sort by last access time (if available) or creation time
    const entries = await Promise.all(
      requests.map(async (request) => {
        const response = await cache.match(request);
        return {
          request,
          timestamp: response?.headers.get('date') ? new Date(response.headers.get('date')!).getTime() : 0
        };
      })
    );
    
    // Remove oldest entries
    entries
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, requests.length - CACHE_SIZES.MAX_IMAGES)
      .forEach(({ request }) => cache.delete(request));
      
  } catch (error) {
    console.debug('Cache cleanup failed:', error);
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalResources = [
    '/app-icon.svg',
    // Add other critical assets here
  ];
  
  criticalResources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = url.endsWith('.svg') ? 'image' : 'fetch';
    document.head.appendChild(link);
  });
}

// Estimate cache storage usage
export async function getCacheSize(): Promise<number> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
  } catch (error) {
    console.debug('Storage estimate failed:', error);
  }
  return 0;
}

// Clear all app caches if needed
export async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => name.includes('focus-hub'))
        .map(name => caches.delete(name))
    );
  } catch (error) {
    console.debug('Cache clear failed:', error);
  }
}
