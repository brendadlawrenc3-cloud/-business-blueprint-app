import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { AppView } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  title?: string;
  subtitle?: string;
}

export function MainLayout({ children, activeView, onNavigate, title, subtitle }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar activeView={activeView} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
