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
        <nav className="md:hidden flex gap-1 bg-slate-900 px-4 py-2" aria-label="Main">
          {([['command-center', 'Dashboard'], ['align', 'AI Integration']] as [AppView, string][]).map(([view, label]) => (
            <button
              key={view}
              type="button"
              onClick={() => onNavigate(view)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                activeView === view ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
