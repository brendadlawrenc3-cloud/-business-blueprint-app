import { X, Clock, Users, Calendar, FileText, ListChecks } from 'lucide-react';
import type { Meeting } from '../../types';
import { Badge, Button } from '../ui';
import { formatTime, formatDuration } from '../../utils/formatters';

interface MeetingDetailsProps {
  meeting: Meeting;
  onClose: () => void;
}

const typeLabels: Record<Meeting['type'], string> = {
  leadership: 'Leadership',
  'one-on-one': '1:1',
  'all-hands': 'All Hands',
  board: 'Board',
  strategy: 'Strategy',
};

export function MeetingDetails({ meeting, onClose }: MeetingDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{meeting.title}</h2>
            <Badge variant="info" size="md">
              {typeLabels[meeting.type]}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Day</p>
                <p className="font-medium text-slate-900">{meeting.dayOfWeek}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Time</p>
                <p className="font-medium text-slate-900">
                  {formatTime(meeting.time)} ({formatDuration(meeting.duration)})
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-slate-400" />
              <h3 className="font-medium text-slate-900">Attendees ({meeting.attendees.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {meeting.attendees.map((attendee, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700"
                >
                  {attendee}
                </span>
              ))}
            </div>
          </div>

          {meeting.agenda && meeting.agenda.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="w-5 h-5 text-slate-400" />
                <h3 className="font-medium text-slate-900">Agenda</h3>
              </div>
              <ul className="space-y-2">
                {meeting.agenda.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meeting.notes && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-slate-400" />
                <h3 className="font-medium text-slate-900">Notes</h3>
              </div>
              <p className="text-sm text-slate-700">{meeting.notes}</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary">
            Edit Meeting
          </Button>
        </div>
      </div>
    </div>
  );
}
