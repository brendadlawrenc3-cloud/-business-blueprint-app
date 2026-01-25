import { AlertCircle, Clock, User, ChevronRight, AlertTriangle, Flag } from 'lucide-react';
import type { Decision } from '../../types';
import { Badge } from '../ui';
import { formatDeadline, getDaysUntil } from '../../utils/dateUtils';

interface DecisionCardProps {
  decision: Decision;
  onViewDetails?: (decision: Decision) => void;
}

const priorityConfig: Record<Decision['priority'], { color: 'danger' | 'warning' | 'info' | 'default'; icon: typeof AlertCircle }> = {
  critical: { color: 'danger', icon: AlertCircle },
  high: { color: 'warning', icon: AlertTriangle },
  medium: { color: 'info', icon: Flag },
  low: { color: 'default', icon: Flag },
};

const statusColors: Record<Decision['status'], 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
  pending: 'warning',
  'in-review': 'info',
  approved: 'success',
  rejected: 'danger',
  deferred: 'default',
};

const categoryLabels: Record<Decision['category'], string> = {
  strategic: 'Strategic',
  financial: 'Financial',
  operational: 'Operational',
  hiring: 'Hiring',
  product: 'Product',
};

export function DecisionCard({ decision, onViewDetails }: DecisionCardProps) {
  const priority = priorityConfig[decision.priority];
  const PriorityIcon = priority.icon;
  const daysUntil = getDaysUntil(decision.deadline);
  const isOverdue = daysUntil < 0;
  const isUrgent = daysUntil <= 2 && !isOverdue;

  return (
    <div
      className={`
        p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md
        ${isOverdue ? 'bg-red-50 border-red-200' : isUrgent ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}
      `}
      onClick={() => onViewDetails?.(decision)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <PriorityIcon className={`w-4 h-4 ${
              decision.priority === 'critical' ? 'text-red-500' :
              decision.priority === 'high' ? 'text-amber-500' : 'text-slate-400'
            }`} />
            <h4 className="font-semibold text-slate-900">{decision.title}</h4>
          </div>

          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{decision.description}</p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={priority.color} size="sm">
              {decision.priority.charAt(0).toUpperCase() + decision.priority.slice(1)}
            </Badge>
            <Badge variant={statusColors[decision.status]} size="sm">
              {decision.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge variant="default" size="sm">
              {categoryLabels[decision.category]}
            </Badge>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 ml-2" />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{decision.owner}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : ''}`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{formatDeadline(decision.deadline)}</span>
          </div>
        </div>

        {decision.options && decision.options.length > 0 && (
          <span className="text-xs text-slate-400">
            {decision.options.length} option{decision.options.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
