
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import AnimatedContainer from '@/components/AnimatedContainer';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <AnimatedContainer>
          <Outlet />
        </AnimatedContainer>
      </main>
    </div>
  );
};

export default Layout;
