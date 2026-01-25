import { Target, TrendingUp, DollarSign, Users } from 'lucide-react';
import type { Metric } from '../../types';
import { Card, CardHeader } from '../ui';
import { MetricCard } from './MetricCard';

interface ScoreboardProps {
  metrics: Metric[];
}

const categoryIcons = {
  revenue: DollarSign,
  growth: TrendingUp,
  operations: Target,
  team: Users,
};

const categoryLabels = {
  revenue: 'Revenue',
  growth: 'Growth',
  operations: 'Operations',
  team: 'Team',
};

export function Scoreboard({ metrics }: ScoreboardProps) {
  const categories = ['revenue', 'growth', 'operations', 'team'] as const;

  const getMetricsByCategory = (category: Metric['category']) =>
    metrics.filter((m) => m.category === category);

  const overallProgress = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + (m.value / m.target) * 100, 0) / metrics.length
    : 0;

  return (
    <Card padding="lg">
      <CardHeader
        title="Weekly Scoreboard"
        subtitle="Track your key performance indicators"
        action={
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Target className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">
              {Math.round(overallProgress)}% to target
            </span>
          </div>
        }
      />

      <div className="space-y-6">
        {categories.map((category) => {
          const categoryMetrics = getMetricsByCategory(category);
          if (categoryMetrics.length === 0) return null;

          const Icon = categoryIcons[category];

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-slate-400" />
                <h4 className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                  {categoryLabels[category]}
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryMetrics.map((metric) => (
                  <MetricCard key={metric.id} metric={metric} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
