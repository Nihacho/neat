import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Sidebar />
      <Header />

      <main className="pl-64 pt-16 flex-1 transition-all duration-300">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <div className="pl-64">
        <Footer />
      </div>
    </div>
  );
}
