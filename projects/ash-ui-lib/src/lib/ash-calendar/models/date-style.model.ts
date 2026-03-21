/**
 * DateStyle model for AshCalendar
 * Defines custom CSS class styling for specific dates
 */
export interface DateStyle {
  /** The date to apply the CSS class to */
  date: Date;

  /** Custom CSS class name(s) for styling the date cell */
  cssClass: string;

  /** Optional tooltip for the date */
  tooltip?: string;

  /** Optional label/display text for the date */
  label?: string;
}
