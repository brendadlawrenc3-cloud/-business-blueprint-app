import { useState } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Meeting } from '../../types';
import { Card, CardHeader, Button } from '../ui';
import { MeetingCard } from './MeetingCard';
import { MeetingDetails } from './MeetingDetails';
import { getWeekDays } from '../../utils/dateUtils';

interface MeetingCadenceProps {
  meetings: Meeting[];
  onAddMeeting?: () => void;
}

export function MeetingCadence({ meetings, onAddMeeting }: MeetingCadenceProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const weekDays = getWeekDays();

  const getMeetingsForDay = (dayOfWeek: Meeting['dayOfWeek']) =>
    meetings
      .filter((m) => m.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.time.localeCompare(b.time));

  const totalMeetings = meetings.length;
  const totalHours = meetings.reduce((sum, m) => sum + m.duration, 0) / 60;

  return (
    <>
      <Card padding="lg">
        <CardHeader
          title="Meeting Cadence"
          subtitle="Your weekly meeting schedule"
          action={
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{totalMeetings}</span> meetings
                <span className="mx-2">·</span>
                <span className="font-semibold text-slate-900">{totalHours.toFixed(1)}</span> hours
              </div>
              {onAddMeeting && (
                <Button size="sm" onClick={onAddMeeting} icon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              )}
            </div>
          }
        />

        <div className="flex items-center gap-2 mb-4">
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">This Week</span>
          </div>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="space-y-4">
          {weekDays.map((day) => {
            const dayMeetings = getMeetingsForDay(day.name);

            return (
              <div key={day.name} className="relative">
                <div
                  className={`
                    flex items-center gap-3 mb-2 sticky top-0 bg-white py-1 z-10
                    ${day.isToday ? 'text-blue-600' : 'text-slate-600'}
                  `}
                >
                  <div
                    className={`
                      w-12 h-12 rounded-lg flex flex-col items-center justify-center text-center
                      ${day.isToday ? 'bg-blue-600 text-white' : 'bg-slate-100'}
                    `}
                  >
                    <span className="text-xs font-medium">{day.shortName}</span>
                    <span className="text-sm font-bold">{day.date.split(' ')[1]}</span>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${day.isToday ? 'text-blue-900' : 'text-slate-900'}`}>
                      {day.name}
                      {day.isToday && (
                        <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {dayMeetings.length === 0
                        ? 'No meetings scheduled'
                        : `${dayMeetings.length} meeting${dayMeetings.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>

                {dayMeetings.length > 0 && (
                  <div className="ml-15 pl-4 border-l-2 border-slate-200 space-y-2 ml-[60px]">
                    {dayMeetings.map((meeting) => (
                      <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        isToday={day.isToday}
                        onViewDetails={setSelectedMeeting}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {selectedMeeting && (
        <MeetingDetails
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}
    </>
  );
}
