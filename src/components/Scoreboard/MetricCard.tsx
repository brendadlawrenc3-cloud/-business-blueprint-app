import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Metric, TrendDirection } from '../../types';
import { formatMetricValue, calculateTrend, formatTrend, getProgressPercentage } from '../../utils/formatters';
import { ProgressBar } from '../ui';

interface MetricCardProps {
  metric: Metric;
}

function getTrendDirection(current: number, previous: number): TrendDirection {
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

function TrendIndicator({ direction, value }: { direction: TrendDirection; value: number }) {
  if (direction === 'stable') {
    return (
      <div className="flex items-center gap-1 text-slate-500">
        <Minus className="w-4 h-4" />
        <span className="text-sm font-medium">No change</span>
      </div>
    );
  }

  const isPositive = direction === 'up';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{formatTrend(value)}</span>
    </div>
  );
}

const categoryColors: Record<Metric['category'], string> = {
  revenue: 'blue',
  growth: 'green',
  operations: 'amber',
  team: 'purple',
};

export function MetricCard({ metric }: MetricCardProps) {
  const trend = calculateTrend(metric.value, metric.previousValue);
  const direction = getTrendDirection(metric.value, metric.previousValue);
  const progress = getProgressPercentage(metric.value, metric.target);
  const progressColor = categoryColors[metric.category];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{metric.name}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatMetricValue(metric.value, metric.format)}
          </p>
        </div>
        <TrendIndicator direction={direction} value={trend} />
      </div>

      <div className="space-y-2">
        <ProgressBar
          value={metric.value}
          max={metric.target}
          color={progressColor as 'blue' | 'green' | 'amber' | 'purple'}
          size="sm"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>{Math.round(progress)}% of target</span>
          <span>Target: {formatMetricValue(metric.target, metric.format)}</span>
        </div>
      </div>
    </div>
  );
}
