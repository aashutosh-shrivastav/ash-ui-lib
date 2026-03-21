
# AshCalendar Requirements

## Component Overview

The reusable enterprise-grade calendar component, named `AshCalendar`, wraps Angular Material's native `MatCalendar` for visualizing events through customizable date styling via CSS classes. It displays a monthly view with specific dates styled using user-defined CSS classes that enable flexible visual customization (e.g., green backgrounds for successes, blue for meetings, red for alerts, custom images, or modified text colors) to indicate event types or statuses. Designed for `ash-new-lib`, it supports 1000+ events, accessibility (WCAG 2.1 AA), internationalization, and seamless theming integration for enterprise dashboards.

## Key Requirements

- **Date Styling via CSS Classes**: Accept `DateStyle[]` array where each style defines `{date: Date, cssClass: string}`. Apply custom CSS classes to date cells, enabling flexible styling for background colors, image backgrounds, text color changes, borders, and other visual customizations.
- **View Modes**: Month view primary (leveraging MatCalendar); optional week/agenda views. Navigate via prev/next buttons or keyboard arrows.
- **Selection**: Single/multi-date selection with `@Output() dateSelect: EventEmitter<Date[]>`. Highlight selected dates distinctly.
- **Today Indicator**: Prominent "today" marker with customizable styling.


## Advanced Features

- **Customization**: Theme-aware colors (override Material primary), event legends, density modes (compact/detailed), resizable via CSS grid.
- **Interactivity**: Click/tap to select, long-press for range selection, drag-to-highlight date ranges. Debounced event emissions for performance.
- **Accessibility \& UX**: ARIA labels (`role="gridcell"`, `aria-label="Event on DATE: LABEL"`), keyboard nav (arrows, Enter/Space), screen reader event summaries, high-contrast mode.
- **Enterprise Extras**: Loading states for async events, role-based event visibility, i18n locale support (date formats, month names), export visible month as ICS/JSON.


## API Specification

| Property | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `dateStyles` | `DateStyle[]` | Array of `{date: Date, cssClass: string}` | `[]` |
| `selectedDates` | `Date[]` | Pre-selected dates | `[]` |
| `viewDate` | `Date` | Currently visible month | `new Date()` |
| `minDate` | `Date` | Earliest selectable date | `null` |
| `maxDate` | `Date` | Latest selectable date | `null` |

**Inputs/Outputs**: `@Input() locale: string = 'en-US'`, `@Output() dateSelect: EventEmitter<Date[]>`, `@Output() viewChange: EventEmitter<Date>`.

**DateStyle Interface**:

```typescript
interface DateStyle {
  date: Date;
  cssClass: string; // Custom CSS class name(s) for styling the date cell
}
```

**CSS Class Customization Options**: Custom CSS classes can be used to:
- Change background colors (`background-color`, `background-image`)
- Modify date numeral text color (`color`)
- Add borders, shadows, or other visual effects
- Apply background images for rich visual indicators

**Example Custom CSS**:

```css
.event-success {
  background-color: #4caf50;
  color: white;
}

.event-alert {
  background-color: #f44336;
  color: white;
}

.event-image {
  background-image: url('event-icon.svg');
  background-size: contain;
  background-position: center;
}
```

