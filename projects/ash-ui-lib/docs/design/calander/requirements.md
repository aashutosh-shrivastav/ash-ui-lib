
# AshCalendar Requirements

## Component Overview

The reusable enterprise-grade calendar component, named `AshCalendar`, extends Angular Material's datepicker for visualizing events through customizable date highlighting and color coding. It displays a monthly view with specific dates highlighted in user-defined colors (e.g., green for successes, blue for meetings, red for alerts) to indicate event types or statuses. Designed for `ash-new-lib`, it supports 1000+ events, accessibility (WCAG 2.1 AA), internationalization, and seamless theming integration for enterprise dashboards.

## Key Requirements

- **Event Marking**: Accept `EventMark[]` array where each mark defines `{date: Date, color: string (hex/CSS), label?: string, count?: number, tooltip?: string}`. Render background colors, badges with counts, and hover tooltips.
- **View Modes**: Month view primary; optional week/agenda views. Navigate via prev/next buttons or keyboard arrows.
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
| `eventMarks` | `EventMark[]` | Array of `{date: Date, color: string, label?: string, count?: number}` | `[]` |
| `selectedDates` | `Date[]` | Pre-selected dates | `[]` |
| `viewDate` | `Date` | Currently visible month | `new Date()` |
| `minDate` | `Date` | Earliest selectable date | `null` |
| `maxDate` | `Date` | Latest selectable date | `null` |
| `showLegend` | `boolean` | Display color legend | `false` |

**Inputs/Outputs**: `@Input() locale: string = 'en-US'`, `@Output() dateSelect: EventEmitter<Date[]>`, `@Output() viewChange: EventEmitter<Date>`.

**EventMark Interface**:

```typescript
interface EventMark {
  date: Date;
  color: string; // '#00ff00', 'green', 'var(--mat-success)'
  label?: string;
  count?: number;
  tooltip?: string;
}
```

