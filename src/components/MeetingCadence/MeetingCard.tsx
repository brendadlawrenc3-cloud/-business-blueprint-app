import { Clock, Users, ChevronRight } from 'lucide-react';
import type { Meeting } from '../../types';
import { Badge } from '../ui';
import { formatTime, formatDuration } from '../../utils/formatters';

interface MeetingCardProps {
  meeting: Meeting;
  isToday?: boolean;
  onViewDetails?: (meeting: Meeting) => void;
}

const typeColors: Record<Meeting['type'], 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
  leadership: 'purple',
  'one-on-one': 'info',
  'all-hands': 'success',
  board: 'danger',
  strategy: 'warning',
};

const typeLabels: Record<Meeting['type'], string> = {
  leadership: 'Leadership',
  'one-on-one': '1:1',
  'all-hands': 'All Hands',
  board: 'Board',
  strategy: 'Strategy',
};

export function MeetingCard({ meeting, isToday = false, onViewDetails }: MeetingCardProps) {
  return (
    <div
      className={`
        p-4 rounded-lg border transition-all cursor-pointer
        ${isToday
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
          : 'bg-white border-slate-200 hover:bg-slate-50'
        }
      `}
      onClick={() => onViewDetails?.(meeting)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold ${isToday ? 'text-blue-900' : 'text-slate-900'}`}>
              {meeting.title}
            </h4>
            <Badge variant={typeColors[meeting.type]} size="sm">
              {typeLabels[meeting.type]}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(meeting.time)}</span>
              <span className="text-slate-400">({formatDuration(meeting.duration)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{meeting.attendees.length} attendees</span>
            </div>
          </div>

          {meeting.agenda && meeting.agenda.length > 0 && (
            <div className="mt-2 text-xs text-slate-500">
              <span className="font-medium">Next:</span> {meeting.agenda[0]}
            </div>
          )}
        </div>

        <ChevronRight className={`w-5 h-5 ${isToday ? 'text-blue-400' : 'text-slate-400'}`} />
      </div>
    </div>
  );
}
