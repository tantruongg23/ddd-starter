import { Pipe, PipeTransform } from '@angular/core';

/**
 * Time Ago Pipe
 * 
 * Converts a date to a human-readable "time ago" format.
 * e.g., "2 hours ago", "3 days ago", "just now"
 */
@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false // Allow updates for dynamic time display
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) {
      return 'in the future';
    }

    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 
          ? `${interval} ${unit} ago` 
          : `${interval} ${unit}s ago`;
      }
    }

    return seconds < 30 ? 'just now' : `${seconds} seconds ago`;
  }
}
