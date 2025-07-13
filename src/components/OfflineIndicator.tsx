import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { ICON_NAMES } from '../utils/constants';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      
      // Trigger background sync when back online
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          return registration.sync.register('background-sync');
        }).catch(err => console.log('Background sync registration failed:', err));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      
      // Hide the message after 5 seconds
      setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persistent offline indicator (always visible when offline)
  if (!isOnline) {
    return (
      <div className="fixed top-16 left-4 right-4 z-50 bg-hot-pink text-white px-4 py-2 rounded-lg border-2 border-deep-space shadow-lg flex items-center justify-center">
        <Icon name="cloud-offline-outline" className="mr-2" />
        <span className="font-fredoka text-sm">You're offline - App still works!</span>
      </div>
    );
  }

  // Temporary message when going offline
  if (showOfflineMessage) {
    return (
      <div className="fixed top-16 left-4 right-4 z-50 bg-electric-blue text-deep-space px-4 py-2 rounded-lg border-2 border-deep-space shadow-lg flex items-center justify-center animate-pulse">
        <Icon name="checkmark-circle-outline" className="mr-2" />
        <span className="font-fredoka text-sm">Back online - Data synced!</span>
      </div>
    );
  }

  return null;
};

export default OfflineIndicator;
