import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Directionality } from '@angular/cdk/bidi';
import { DateStyle } from './models/date-style.model';

/**
 * AshCalendar Component
 * 
 * An enterprise-grade calendar component that wraps Angular Material's native MatCalendar.
 * Supports custom CSS class-based styling for dates to enable flexible visual customization
 * including background colors, images, text colors, and other visual effects.
 * 
 * @example
 * ```typescript
 * <lib-ash-calendar
 *   [dateStyles]="dateStyles()"
 *   [selectedDates]="selectedDates()"
 *   [viewDate]="viewDate()"
 *   (dateSelect)="onDateSelect($event)"
 *   (viewChange)="onViewChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'lib-ash-calendar',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './ash-calendar.html',
  styleUrl: './ash-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'region',
    'aria-label': 'Calendar'
  }
})
export class AshCalendar {
  private readonly bidi = inject(Directionality);

  // Inputs
  readonly dateStyles = input<DateStyle[]>([]);
  readonly selectedDates = input<Date[]>([]);
  readonly viewDate = input<Date>(new Date());
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly locale = input<string>('en-US');
  readonly disabled = input<boolean>(false);

  // Outputs
  readonly dateSelect = output<Date>();
  readonly viewChange = output<Date>();

  // Internal state
  protected readonly internalSelectedDates = signal<Date[]>([]);
  protected readonly internalViewDate = signal<Date>(new Date());

  // Weekday labels (English and RTL aware)
  protected readonly weekdayLabels = computed(() => {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return this.isRtl() ? labels.reverse() : labels;
  });

  // Calendar grid: 2D array of dates (including previous/next month padding)
  protected readonly calendarGrid = computed(() => {
    return this.buildCalendarGrid(this.internalViewDate());
  });

  // Computed values
  protected readonly isRtl = computed(() => this.bidi.value === 'rtl');
  protected readonly dateStyleMap = computed(() => {
    const map = new Map<string, DateStyle>();
    this.dateStyles().forEach(style => {
      const key = this.getDateKey(style.date);
      map.set(key, style);
    });
    return map;
  });

  // Display month/year
  protected readonly displayMonth = computed(() => {
    const date = this.internalViewDate();
    return new Intl.DateTimeFormat(this.locale(), {
      month: 'long',
      year: 'numeric'
    }).format(date);
  });

  constructor() {
    // Watch for external selectedDates changes
    this.internalSelectedDates.set(this.selectedDates());
    
    // Sync internal view date with input viewDate
    effect(() => {
      this.internalViewDate.set(this.viewDate());
    });
  }

  /**
   * Build a calendar grid for the given month
   * Returns a 2D array where each row is a week (6 rows total)
   */
  private buildCalendarGrid(viewDate: Date): (Date | null)[][] {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const grid: (Date | null)[][] = [];
    let currentDate = new Date(firstDay);
    
    // Adjust to start from the first day of the week
    currentDate.setDate(currentDate.getDate() - startingDayOfWeek);

    // Build 6 weeks
    for (let week = 0; week < 6; week++) {
      const weekRow: (Date | null)[] = [];
      for (let day = 0; day < 7; day++) {
        // Only add dates that are part of the current month or adjacent months
        if (currentDate.getMonth() === month || week === 0 || week === 5) {
          weekRow.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        } else {
          weekRow.push(null);
        }
      }
      grid.push(weekRow);
    }

    // Remove empty rows
    return grid.filter(week => week.some(day => day !== null));
  }

  /**
   * Navigate to previous month
   */
  protected previousMonth(): void {
    const current = new Date(this.internalViewDate());
    current.setMonth(current.getMonth() - 1);
    this.internalViewDate.set(current);
    this.viewChange.emit(current);
  }

  /**
   * Navigate to next month
   */
  protected nextMonth(): void {
    const current = new Date(this.internalViewDate());
    current.setMonth(current.getMonth() + 1);
    this.internalViewDate.set(current);
    this.viewChange.emit(current);
  }

  /**
   * Check if date is from a different month than the view
   */
  protected isOtherMonth(date: Date | null): boolean {
    if (!date) return false;
    return date.getMonth() !== this.internalViewDate().getMonth();
  }

  /**
   * Get CSS classes for a specific date
   */
  protected getDateClasses(date: Date | null): { [className: string]: boolean } {
    if (!date) {
      return { 'ash-calendar-empty': true };
    }

    const key = this.getDateKey(date);
    const style = this.dateStyleMap().get(key);
    const isOther = this.isOtherMonth(date);
    const classes: { [className: string]: boolean } = {
      'ash-calendar-date': true,
      'ash-calendar-other-month': isOther,
      'ash-calendar-today': this.isToday(date) && !isOther,
      'ash-calendar-selected': this.isDateSelected(date),
      'ash-calendar-disabled': this.isDateDisabled(date),
      'ash-calendar-clickable': !this.isDateDisabled(date) && !isOther
    };

    // Apply custom CSS classes from dateStyles
    if (style) {
      const customClasses = style.cssClass.split(' ');
      customClasses.forEach(cls => {
        classes[cls.trim()] = true;
      });
    }

    return classes;
  }

  /**
   * Get tooltip for a specific date
   */
  protected getDateTooltip(date: Date | null): string | null {
    if (!date) return null;
    const key = this.getDateKey(date);
    const style = this.dateStyleMap().get(key);
    return style?.tooltip || null;
  }

  /**
   * Handle date selection
   */
  protected onDateSelected(date: Date | null): void {
    if (!date || this.isDateDisabled(date) || this.isOtherMonth(date)) {
      return;
    }

    // Always emit the selected date
    this.dateSelect.emit(date);
    
    // Update internal selected dates (multi-select support)
    const selected = [...this.internalSelectedDates()];
    const dateKey = this.getDateKey(date);
    const existingIndex = selected.findIndex(d => this.getDateKey(d) === dateKey);

    if (existingIndex > -1) {
      selected.splice(existingIndex, 1);
    } else {
      selected.push(date);
    }

    this.internalSelectedDates.set(selected);
  }

  /**
   * Check if a date is today
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Check if a date is in the selected dates array
   */
  private isDateSelected(date: Date): boolean {
    const key = this.getDateKey(date);
    return this.internalSelectedDates().some(d => this.getDateKey(d) === key);
  }

  /**
   * Check if a date is disabled
   */
  protected isDateDisabled(date: Date | null): boolean {
    if (!date) return false;
    const time = date.getTime();
    if (this.minDate() && time < this.minDate()!.getTime()) {
      return true;
    }
    if (this.maxDate() && time > this.maxDate()!.getTime()) {
      return true;
    }
    return this.disabled();
  }

  /**
   * Get a unique string key for a date (YYYY-MM-DD)
   */
  protected getDateKey(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
