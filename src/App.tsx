
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import { usePrefetch } from './utils/prefetch';

// Code-split pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TodoPage = lazy(() => import('./pages/TodoPage'));
const FocusPage = lazy(() => import('./pages/FocusPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const App: React.FC = () => {
  useEffect(() => {
    usePrefetch();
  }, []);

  return (
    <ErrorBoundary>
      <DataProvider>
        <BrowserRouter basename={process.env.NODE_ENV === 'production' ? '/Focus-Hub' : '/'}>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="todo" element={<TodoPage />} />
                <Route path="focus" element={<FocusPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Suspense>
          <PWAInstallPrompt />
          <OfflineIndicator />
        </BrowserRouter>
      </DataProvider>
    </ErrorBoundary>
  );
};

export default App;
