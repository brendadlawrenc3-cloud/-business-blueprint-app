import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { AIOpportunity, AlignState, StrategicPriority } from '../types/align';
import { blankWorkspaceSections, sampleAlignState, withOpportunityDefaults } from '../data/alignSampleData';

const STORAGE_KEY = 'align-framework-state-v1';

type WorkspacePatch = Partial<Omit<AlignState, 'priorities' | 'opportunities'>>;

type AlignAction =
  | { type: 'ADD_PRIORITY'; payload: StrategicPriority }
  | { type: 'UPDATE_PRIORITY'; payload: StrategicPriority }
  | { type: 'REMOVE_PRIORITY'; payload: string }
  | { type: 'ADD_OPPORTUNITY'; payload: AIOpportunity }
  | { type: 'UPDATE_OPPORTUNITY'; payload: AIOpportunity }
  | { type: 'REMOVE_OPPORTUNITY'; payload: string }
  | { type: 'PATCH'; payload: WorkspacePatch }
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

    case 'PATCH':
      return { ...state, ...action.payload };

    case 'MARK_REVIEWED':
      return { ...state, lastReviewed: new Date().toISOString().split('T')[0] };

    case 'RESET':
      return sampleAlignState;

    default:
      return state;
  }
}

// Saved workspaces from earlier versions lack newer sections; fill them from
// the defaults rather than discarding the user's work.
function normalize(saved: Partial<AlignState>): AlignState {
  const base = { ...sampleAlignState, ...blankWorkspaceSections };
  return {
    ...base,
    ...saved,
    profile: { ...base.profile, ...saved.profile },
    policy: { ...base.policy, ...saved.policy },
    thresholds: { ...base.thresholds, ...saved.thresholds },
    ipChecks: { ...base.ipChecks, ...saved.ipChecks },
    operatingModel: {
      ...base.operatingModel,
      ...saved.operatingModel,
      decisionRights: { ...base.operatingModel.decisionRights, ...saved.operatingModel?.decisionRights },
      comms: { ...base.operatingModel.comms, ...saved.operatingModel?.comms },
    },
    opportunities: (saved.opportunities ?? base.opportunities).map(withOpportunityDefaults),
  };
}

function loadState(): AlignState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw) as Partial<AlignState>);
  } catch {
    // Storage unavailable or corrupt — fall back to the worked example.
  }
  return sampleAlignState;
}

interface AlignContextValue extends AlignState {
  dispatch: React.Dispatch<AlignAction>;
  updateOpportunity: (o: AIOpportunity) => void;
  updatePriority: (p: StrategicPriority) => void;
  patch: (p: WorkspacePatch) => void;
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
    patch: (p) => dispatch({ type: 'PATCH', payload: p }),
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
