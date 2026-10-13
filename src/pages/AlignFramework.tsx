import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { MainLayout } from '../components/Layout';
import {
  AdvisorTab,
  AlignOverview,
  AssessPhase,
  DecisionMatrix,
  GovernPhase,
  IdentifyPhase,
  LocatePhase,
  NavigatePhase,
  OperatingModel,
} from '../components/Align';
import { useAlign } from '../context/AlignContext';
import type { AlignView } from '../types/align';
import type { AppView } from '../types';

const TABS: { view: AlignView; letter?: string; label: string }[] = [
  { view: 'overview', label: 'Overview' },
  { view: 'assess', letter: 'A', label: 'Assess · Why' },
  { view: 'locate', letter: 'L', label: 'Locate · Where' },
  { view: 'identify', letter: 'I', label: 'Identify · When' },
  { view: 'govern', letter: 'G', label: 'Govern · How' },
  { view: 'navigate', letter: 'N', label: 'Navigate · What' },
  { view: 'decide', label: 'Decision Matrix' },
  { view: 'operating-model', label: 'Operating Model' },
  { view: 'advisor', label: 'Advisor' },
];

interface AlignFrameworkProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

export function AlignFramework({ activeView, onNavigate }: AlignFrameworkProps) {
  const [view, setView] = useState<AlignView>('overview');
  const [confirmReset, setConfirmReset] = useState(false);
  const { dispatch } = useAlign();

  return (
    <MainLayout
      activeView={activeView}
      onNavigate={onNavigate}
      title="AI Business Integration"
      subtitle="The ALIGN Framework™ — strategy determines where AI creates value"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <nav className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-xl p-1" aria-label="ALIGN phases">
            {TABS.map((tab) => (
              <button
                key={tab.view}
                type="button"
                onClick={() => setView(tab.view)}
                aria-current={view === tab.view ? 'page' : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  view === tab.view ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.letter && (
                  <span
                    className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center ${
                      view === tab.view ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.letter}
                  </span>
                )}
                {tab.label}
              </button>
            ))}
          </nav>
          {confirmReset ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Replace your ALIGN work with the worked example?</span>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'RESET' });
                  setConfirmReset(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
              >
                Replace
              </button>
              <button type="button" onClick={() => setConfirmReset(false)} className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
                Keep my work
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              Load worked example
            </button>
          )}
        </div>

        {view === 'overview' && <AlignOverview onNavigate={setView} />}
        {view === 'assess' && <AssessPhase />}
        {view === 'locate' && <LocatePhase />}
        {view === 'identify' && <IdentifyPhase />}
        {view === 'govern' && <GovernPhase />}
        {view === 'navigate' && <NavigatePhase />}
        {view === 'decide' && <DecisionMatrix />}
        {view === 'operating-model' && <OperatingModel />}
        {view === 'advisor' && <AdvisorTab />}
      </div>
    </MainLayout>
  );
}
