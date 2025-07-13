
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import TodoPage from './pages/TodoPage';
import FocusPage from './pages/FocusPage';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <DataProvider>
        <BrowserRouter basename={process.env.NODE_ENV === 'production' ? '/Focus-Hub' : '/'}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="todo" element={<TodoPage />} />
              <Route path="focus" element={<FocusPage />} />
            </Route>
          </Routes>
          <PWAInstallPrompt />
          <OfflineIndicator />
        </BrowserRouter>
      </DataProvider>
    </ErrorBoundary>
  );
};

export default App;
