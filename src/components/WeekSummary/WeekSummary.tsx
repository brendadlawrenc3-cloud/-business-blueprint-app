import { Target, TrendingUp, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui';
import { getCurrentWeekInfo } from '../../utils/dateUtils';
import type { Metric, Decision } from '../../types';

interface WeekSummaryProps {
  metrics: Metric[];
  decisions: Decision[];
  meetingCount: number;
}

export function WeekSummary({ metrics, decisions, meetingCount }: WeekSummaryProps) {
  const weekInfo = getCurrentWeekInfo();

  const overallProgress = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.value / m.target) * 100, 0) / metrics.length)
    : 0;

  const pendingDecisions = decisions.filter(
    (d) => d.status === 'pending' || d.status === 'in-review'
  ).length;

  const criticalDecisions = decisions.filter(
    (d) => d.priority === 'critical' && d.status === 'pending'
  ).length;

  const metricsOnTrack = metrics.filter((m) => (m.value / m.target) >= 0.8).length;

  const stats = [
    {
      label: 'Overall Progress',
      value: `${overallProgress}%`,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'KPIs On Track',
      value: `${metricsOnTrack}/${metrics.length}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Pending Decisions',
      value: pendingDecisions.toString(),
      icon: AlertCircle,
      color: criticalDecisions > 0 ? 'text-red-600' : 'text-amber-600',
      bgColor: criticalDecisions > 0 ? 'bg-red-50' : 'bg-amber-50',
      subtext: criticalDecisions > 0 ? `${criticalDecisions} critical` : undefined,
    },
    {
      label: 'Meetings This Week',
      value: meetingCount.toString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white" padding="lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Week {weekInfo.weekNumber} Dashboard</h2>
          <p className="text-slate-300">
            {weekInfo.startDate} - {weekInfo.endDate}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">On Track</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bgColor} mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-300">{stat.label}</p>
            {stat.subtext && (
              <p className="text-xs text-red-400 mt-1">{stat.subtext}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
