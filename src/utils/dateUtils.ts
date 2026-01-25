import { format, startOfWeek, endOfWeek, getWeek, addDays, isToday } from 'date-fns';

export function getCurrentWeekInfo() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  return {
    weekNumber: getWeek(now, { weekStartsOn: 1 }),
    year: now.getFullYear(),
    startDate: format(weekStart, 'MMM d'),
    endDate: format(weekEnd, 'MMM d, yyyy'),
  };
}

export function getWeekDays() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  return Array.from({ length: 5 }, (_, i) => {
    const day = addDays(weekStart, i);
    return {
      name: format(day, 'EEEE') as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday',
      shortName: format(day, 'EEE'),
      date: format(day, 'MMM d'),
      isToday: isToday(day),
    };
  });
}

export function getDaysUntil(dateString: string): number {
  const targetDate = new Date(dateString);
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDeadline(dateString: string): string {
  const daysUntil = getDaysUntil(dateString);

  if (daysUntil < 0) return 'Overdue';
  if (daysUntil === 0) return 'Today';
  if (daysUntil === 1) return 'Tomorrow';
  if (daysUntil <= 7) return `${daysUntil} days`;

  return format(new Date(dateString), 'MMM d');
}
