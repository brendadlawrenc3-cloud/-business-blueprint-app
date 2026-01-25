import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Metric, Meeting, Decision } from '../types';
import { sampleMetrics, sampleMeetings, sampleDecisions } from '../data/sampleData';

interface CEOState {
  metrics: Metric[];
  meetings: Meeting[];
  decisions: Decision[];
  isLoading: boolean;
}

type CEOAction =
  | { type: 'SET_METRICS'; payload: Metric[] }
  | { type: 'SET_MEETINGS'; payload: Meeting[] }
  | { type: 'SET_DECISIONS'; payload: Decision[] }
  | { type: 'ADD_MEETING'; payload: Meeting }
  | { type: 'ADD_DECISION'; payload: Decision }
  | { type: 'UPDATE_DECISION_STATUS'; payload: { id: string; status: Decision['status'] } }
  | { type: 'UPDATE_METRIC'; payload: Metric }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: CEOState = {
  metrics: sampleMetrics,
  meetings: sampleMeetings,
  decisions: sampleDecisions,
  isLoading: false,
};

function ceoReducer(state: CEOState, action: CEOAction): CEOState {
  switch (action.type) {
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };

    case 'SET_MEETINGS':
      return { ...state, meetings: action.payload };

    case 'SET_DECISIONS':
      return { ...state, decisions: action.payload };

    case 'ADD_MEETING':
      return { ...state, meetings: [...state.meetings, action.payload] };

    case 'ADD_DECISION':
      return { ...state, decisions: [...state.decisions, action.payload] };

    case 'UPDATE_DECISION_STATUS':
      return {
        ...state,
        decisions: state.decisions.map((d) =>
          d.id === action.payload.id
            ? { ...d, status: action.payload.status, updatedAt: new Date().toISOString() }
            : d
        ),
      };

    case 'UPDATE_METRIC':
      return {
        ...state,
        metrics: state.metrics.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

interface CEOContextValue extends CEOState {
  dispatch: React.Dispatch<CEOAction>;
  updateDecisionStatus: (id: string, status: Decision['status']) => void;
  addMeeting: (meeting: Meeting) => void;
  addDecision: (decision: Decision) => void;
}

const CEOContext = createContext<CEOContextValue | undefined>(undefined);

export function CEOProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ceoReducer, initialState);

  const updateDecisionStatus = (id: string, status: Decision['status']) => {
    dispatch({ type: 'UPDATE_DECISION_STATUS', payload: { id, status } });
  };

  const addMeeting = (meeting: Meeting) => {
    dispatch({ type: 'ADD_MEETING', payload: meeting });
  };

  const addDecision = (decision: Decision) => {
    dispatch({ type: 'ADD_DECISION', payload: decision });
  };

  const value: CEOContextValue = {
    ...state,
    dispatch,
    updateDecisionStatus,
    addMeeting,
    addDecision,
  };

  return <CEOContext.Provider value={value}>{children}</CEOContext.Provider>;
}

export function useCEO() {
  const context = useContext(CEOContext);
  if (context === undefined) {
    throw new Error('useCEO must be used within a CEOProvider');
  }
  return context;
}
