import { X, Clock, User, Calendar, Tag, ThumbsUp, ThumbsDown, Check, XCircle, Pause } from 'lucide-react';
import type { Decision } from '../../types';
import { Badge, Button } from '../ui';
import { formatDeadline } from '../../utils/dateUtils';
import { format } from 'date-fns';

interface DecisionDetailsProps {
  decision: Decision;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: Decision['status']) => void;
}

const priorityColors: Record<Decision['priority'], 'danger' | 'warning' | 'info' | 'default'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'default',
};

const categoryLabels: Record<Decision['category'], string> = {
  strategic: 'Strategic',
  financial: 'Financial',
  operational: 'Operational',
  hiring: 'Hiring',
  product: 'Product',
};

export function DecisionDetails({ decision, onClose, onUpdateStatus }: DecisionDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={priorityColors[decision.priority]} size="md">
                {decision.priority.charAt(0).toUpperCase() + decision.priority.slice(1)} Priority
              </Badge>
              <Badge variant="default" size="md">
                {categoryLabels[decision.category]}
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{decision.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Owner</p>
                <p className="font-medium text-slate-900">{decision.owner}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Deadline</p>
                <p className="font-medium text-slate-900">{formatDeadline(decision.deadline)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Created</p>
                <p className="font-medium text-slate-900">
                  {format(new Date(decision.createdAt), 'MMM d')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-2">Description</h3>
            <p className="text-slate-700">{decision.description}</p>
          </div>

          {decision.context && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-blue-500" />
                <h3 className="font-medium text-blue-900">Context</h3>
              </div>
              <p className="text-sm text-blue-800">{decision.context}</p>
            </div>
          )}

          {decision.options && decision.options.length > 0 && (
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Options to Consider</h3>
              <div className="space-y-3">
                {decision.options.map((option) => (
                  <div key={option.id} className="p-4 bg-white border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-3">{option.title}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-emerald-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm font-medium">Pros</span>
                        </div>
                        <ul className="space-y-1">
                          {option.pros.map((pro, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5">+</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-red-600">
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm font-medium">Cons</span>
                        </div>
                        <ul className="space-y-1">
                          {option.cons.map((con, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">-</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-4">
          <p className="text-sm text-slate-500 mb-3">Update Decision Status</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Check className="w-4 h-4" />}
              onClick={() => onUpdateStatus?.(decision.id, 'approved')}
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<XCircle className="w-4 h-4" />}
              onClick={() => onUpdateStatus?.(decision.id, 'rejected')}
            >
              Reject
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Pause className="w-4 h-4" />}
              onClick={() => onUpdateStatus?.(decision.id, 'deferred')}
            >
              Defer
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
