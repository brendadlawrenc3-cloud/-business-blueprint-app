export interface Metric {
  id: string;
  name: string;
  value: number;
  target: number;
  previousValue: number;
  unit: string;
  format: 'number' | 'currency' | 'percentage';
  category: 'revenue' | 'growth' | 'operations' | 'team';
}

export interface Meeting {
  id: string;
  title: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time: string;
  duration: number; // minutes
  attendees: string[];
  type: 'leadership' | 'one-on-one' | 'all-hands' | 'board' | 'strategy';
  recurring: boolean;
  agenda?: string[];
  notes?: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  owner: string;
  deadline: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'deferred';
  category: 'strategic' | 'financial' | 'operational' | 'hiring' | 'product';
  createdAt: string;
  updatedAt: string;
  context?: string;
  options?: DecisionOption[];
}

export interface DecisionOption {
  id: string;
  title: string;
  pros: string[];
  cons: string[];
}

export interface WeekSummary {
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  focusAreas: string[];
  keyObjectives: string[];
}

export type TrendDirection = 'up' | 'down' | 'stable';
