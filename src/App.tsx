import { useState } from 'react';
import { CEOProvider } from './context/CEOContext';
import { AlignProvider } from './context/AlignContext';
import { CEOCommandCenter } from './pages/CEOCommandCenter';
import { AlignFramework } from './pages/AlignFramework';
import type { AppView } from './types';
import './index.css';

function initialView(): AppView {
  return window.location.hash === '#align' ? 'align' : 'command-center';
}

function App() {
  const [view, setView] = useState<AppView>(initialView);

  const navigate = (next: AppView) => {
    setView(next);
    window.history.replaceState(null, '', next === 'align' ? '#align' : '#');
  };

  return (
    <CEOProvider>
      <AlignProvider>
        {view === 'align' ? (
          <AlignFramework activeView={view} onNavigate={navigate} />
        ) : (
          <CEOCommandCenter activeView={view} onNavigate={navigate} />
        )}
      </AlignProvider>
    </CEOProvider>
  );
}

export default App;
