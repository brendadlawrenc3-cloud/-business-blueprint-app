import { useEffect, useState } from 'react';
import { CEOProvider } from './context/CEOContext';
import { AlignProvider } from './context/AlignContext';
import { CEOCommandCenter } from './pages/CEOCommandCenter';
import { AlignFramework } from './pages/AlignFramework';
import type { AppView } from './types';
import './index.css';

function initialView(): AppView {
  if (window.location.hash === '#align') return 'align';
  if (window.location.hash === '' && import.meta.env.VITE_DEFAULT_VIEW === 'align') return 'align';
  return 'command-center';
}

function App() {
  const [view, setView] = useState<AppView>(initialView);

  // Keep the view in sync with the URL hash (links, back/forward buttons).
  useEffect(() => {
    const onHashChange = () => setView(initialView());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (next: AppView) => {
    setView(next);
    window.history.replaceState(null, '', next === 'align' ? '#align' : '#dashboard');
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
