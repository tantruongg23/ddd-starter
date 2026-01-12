import { Pipe, PipeTransform } from '@angular/core';

/**
 * Currency Format Pipe
 * 
 * Formats numbers as currency with configurable options.
 * Extends the native currency pipe with additional features.
 */
@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
    currencyCode: string = 'USD',
    display: 'symbol' | 'code' | 'name' = 'symbol',
    locale: string = 'en-US'
  ): string {
    if (value === null || value === undefined) {
      return '-';
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: display
      }).format(value);
    } catch {
      return `${currencyCode} ${value.toFixed(2)}`;
    }
  }
}
