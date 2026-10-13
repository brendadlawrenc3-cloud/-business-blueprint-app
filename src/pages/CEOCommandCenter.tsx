import { useCEO } from '../context/CEOContext';
import { MainLayout } from '../components/Layout';
import { WeekSummary } from '../components/WeekSummary';
import { Scoreboard } from '../components/Scoreboard';
import { MeetingCadence } from '../components/MeetingCadence';
import { DecisionFlow } from '../components/DecisionFlow';
import type { AppView } from '../types';

interface CEOCommandCenterProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

export function CEOCommandCenter({ activeView, onNavigate }: CEOCommandCenterProps) {
  const { metrics, meetings, decisions, updateDecisionStatus } = useCEO();

  return (
    <MainLayout activeView={activeView} onNavigate={onNavigate}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Week Summary Hero */}
        <WeekSummary
          metrics={metrics}
          decisions={decisions}
          meetingCount={meetings.length}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scoreboard - Full width on mobile, left column on desktop */}
          <div className="lg:col-span-2">
            <Scoreboard metrics={metrics} />
          </div>

          {/* Meeting Cadence */}
          <div className="lg:col-span-1">
            <MeetingCadence meetings={meetings} />
          </div>

          {/* Decision Flow */}
          <div className="lg:col-span-1">
            <DecisionFlow
              decisions={decisions}
              onUpdateStatus={updateDecisionStatus}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
