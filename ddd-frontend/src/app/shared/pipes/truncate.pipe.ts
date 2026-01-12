import { Pipe, PipeTransform } from '@angular/core';

/**
 * Truncate Pipe
 * 
 * Truncates text to a specified length with optional ellipsis.
 */
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    maxLength: number = 100,
    ellipsis: string = '...',
    wordBoundary: boolean = true
  ): string {
    if (!value) {
      return '';
    }

    if (value.length <= maxLength) {
      return value;
    }

    let truncated = value.substring(0, maxLength);

    if (wordBoundary) {
      // Find the last space within the truncated string
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 0) {
        truncated = truncated.substring(0, lastSpace);
      }
    }

    return truncated.trim() + ellipsis;
  }
}
