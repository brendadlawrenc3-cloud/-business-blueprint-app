import { useState } from 'react';
import { GitBranch, Plus, Filter, AlertCircle } from 'lucide-react';
import type { Decision } from '../../types';
import { Card, CardHeader, Button } from '../ui';
import { DecisionCard } from './DecisionCard';
import { DecisionDetails } from './DecisionDetails';
import { getDaysUntil } from '../../utils/dateUtils';

interface DecisionFlowProps {
  decisions: Decision[];
  onAddDecision?: () => void;
  onUpdateStatus?: (id: string, status: Decision['status']) => void;
}

type FilterOption = 'all' | 'pending' | 'in-review' | 'critical' | 'overdue';

export function DecisionFlow({ decisions, onAddDecision, onUpdateStatus }: DecisionFlowProps) {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const pendingCount = decisions.filter((d) => d.status === 'pending' || d.status === 'in-review').length;
  const criticalCount = decisions.filter((d) => d.priority === 'critical' && d.status === 'pending').length;
  const overdueCount = decisions.filter((d) => getDaysUntil(d.deadline) < 0 && d.status === 'pending').length;

  const filteredDecisions = decisions.filter((decision) => {
    switch (activeFilter) {
      case 'pending':
        return decision.status === 'pending';
      case 'in-review':
        return decision.status === 'in-review';
      case 'critical':
        return decision.priority === 'critical';
      case 'overdue':
        return getDaysUntil(decision.deadline) < 0 && decision.status === 'pending';
      default:
        return decision.status === 'pending' || decision.status === 'in-review';
    }
  }).sort((a, b) => {
    // Sort by priority first, then by deadline
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const filters: { key: FilterOption; label: string; count?: number }[] = [
    { key: 'all', label: 'Active', count: pendingCount },
    { key: 'pending', label: 'Pending' },
    { key: 'in-review', label: 'In Review' },
    { key: 'critical', label: 'Critical', count: criticalCount },
    { key: 'overdue', label: 'Overdue', count: overdueCount },
  ];

  return (
    <>
      <Card padding="lg">
        <CardHeader
          title="Decision Flow"
          subtitle="Manage pending decisions and approvals"
          action={
            <div className="flex items-center gap-3">
              {criticalCount > 0 && (
                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{criticalCount} critical</span>
                </div>
              )}
              {onAddDecision && (
                <Button size="sm" onClick={onAddDecision} icon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              )}
            </div>
          }
        />

        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-colors whitespace-nowrap
                ${activeFilter === filter.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {filter.label}
              {filter.count !== undefined && filter.count > 0 && (
                <span className={`
                  px-1.5 py-0.5 rounded-full text-xs
                  ${activeFilter === filter.key ? 'bg-white/20' : 'bg-slate-200'}
                `}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredDecisions.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No decisions found</h3>
            <p className="text-slate-500">
              {activeFilter === 'all'
                ? 'All decisions have been resolved'
                : `No ${activeFilter} decisions at the moment`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDecisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onViewDetails={setSelectedDecision}
              />
            ))}
          </div>
        )}

        {decisions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>
              Showing {filteredDecisions.length} of {decisions.length} decisions
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{decisions.filter((d) => d.status === 'pending').length} pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{decisions.filter((d) => d.status === 'in-review').length} in review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{decisions.filter((d) => d.status === 'approved').length} approved</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {selectedDecision && (
        <DecisionDetails
          decision={selectedDecision}
          onClose={() => setSelectedDecision(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </>
  );
}
