
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-sunny-yellow font-sans text-deep-space relative overflow-hidden">
      {/* Decorative Shapes */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-hot-pink rounded-full -translate-x-1/4 -translate-y-1/4 opacity-80"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-electric-blue -translate-y-1/4 opacity-70" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
       <div className="absolute top-1/2 left-1/4 w-24 h-24 opacity-60 animate-float">
         <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10 L30 40 L10 70 L30 100 M40 10 L60 40 L40 70 L60 100 M70 10 L90 40 L70 70 L90 100" stroke="#F38BA8" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </svg>
       </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
