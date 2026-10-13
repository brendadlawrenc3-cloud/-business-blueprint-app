import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { AIOpportunity, AlignState, StrategicPriority } from '../types/align';
import { sampleAlignState } from '../data/alignSampleData';

const STORAGE_KEY = 'align-framework-state-v1';

type AlignAction =
  | { type: 'ADD_PRIORITY'; payload: StrategicPriority }
  | { type: 'UPDATE_PRIORITY'; payload: StrategicPriority }
  | { type: 'REMOVE_PRIORITY'; payload: string }
  | { type: 'ADD_OPPORTUNITY'; payload: AIOpportunity }
  | { type: 'UPDATE_OPPORTUNITY'; payload: AIOpportunity }
  | { type: 'REMOVE_OPPORTUNITY'; payload: string }
  | { type: 'MARK_REVIEWED' }
  | { type: 'RESET' };

function alignReducer(state: AlignState, action: AlignAction): AlignState {
  switch (action.type) {
    case 'ADD_PRIORITY':
      return { ...state, priorities: [...state.priorities, action.payload] };

    case 'UPDATE_PRIORITY':
      return {
        ...state,
        priorities: state.priorities.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };

    case 'REMOVE_PRIORITY':
      return { ...state, priorities: state.priorities.filter((p) => p.id !== action.payload) };

    case 'ADD_OPPORTUNITY':
      return { ...state, opportunities: [...state.opportunities, action.payload] };

    case 'UPDATE_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.map((o) => (o.id === action.payload.id ? action.payload : o)),
      };

    case 'REMOVE_OPPORTUNITY':
      return { ...state, opportunities: state.opportunities.filter((o) => o.id !== action.payload) };

    case 'MARK_REVIEWED':
      return { ...state, lastReviewed: new Date().toISOString().split('T')[0] };

    case 'RESET':
      return sampleAlignState;

    default:
      return state;
  }
}

function loadState(): AlignState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AlignState;
  } catch {
    // Storage unavailable or corrupt — fall back to the worked example.
  }
  return sampleAlignState;
}

interface AlignContextValue extends AlignState {
  dispatch: React.Dispatch<AlignAction>;
  updateOpportunity: (o: AIOpportunity) => void;
  updatePriority: (p: StrategicPriority) => void;
}

const AlignContext = createContext<AlignContextValue | undefined>(undefined);

export function AlignProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(alignReducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Persistence is a convenience; the app works without it.
    }
  }, [state]);

  const value: AlignContextValue = {
    ...state,
    dispatch,
    updateOpportunity: (o) => dispatch({ type: 'UPDATE_OPPORTUNITY', payload: o }),
    updatePriority: (p) => dispatch({ type: 'UPDATE_PRIORITY', payload: p }),
  };

  return <AlignContext.Provider value={value}>{children}</AlignContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAlign() {
  const context = useContext(AlignContext);
  if (context === undefined) {
    throw new Error('useAlign must be used within an AlignProvider');
  }
  return context;
}
