# AshTable Requirements

## Component Overview

The reusable enterprise-grade table component, named `AshTable`, builds on Angular Material's `mat-table` for high-performance data display in large-scale applications. It supports server-side pagination, sorting, filtering, and multi-column operations while ensuring accessibility (WCAG 2.1 AA) and theming consistency. Designed for `ash-new-lib` library, it handles 10,000+ rows efficiently with virtual scrolling.

## Key Requirements

- **Data Handling**: Accept dynamic data sources (Observable/Array), with configurable columns (display name, field key, type: string/number/date). Support async loading and empty states.
- **Pagination**: Server/client-side, with page size options (10/25/50/100), total records display, and customizable page navigator.
- **Sorting \& Filtering**: Multi-column sort (asc/desc), global search, per-column filters (text/date/select). Debounced inputs for performance.
- **Actions \& Selection**: Inline actions (edit/delete/view), row selection (single/multi), bulk operations via checkboxes.


## Advanced Features

- **Performance**: CDK virtual scrolling, on-demand loading, trackBy for row changes.
- **Customization**: Template overrides for cells/actions, resizable/reorderable columns, export to CSV/PDF/Excel.
- **Accessibility \& Theming**: ARIA labels, keyboard navigation, full Material theming support, RTL compatibility.
- **Enterprise Extras**: Loading skeletons, error states, role-based column visibility, internationalization (i18n pipes).


## API Specification

| Property | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `dataSource` | `MatTableDataSource<T> \| Observable<T[]>` | Table data | `[]` |
| `columns` | `ColumnDef[]` | Array of `{key: string, label: string, type?: string, sortable?: boolean}` | `[]` |
| `pagination` | `boolean` | Enable pagination | `true` |
| `serverSide` | `boolean` | Server-side paging/sorting/filtering | `false` |
| `loading` | `boolean` | Show loading indicator | `false` |

**Inputs/Outputs**: `@Input() selectionMode: 'none'|'single'|'multi'`, `@Output() rowSelect: EventEmitter`, `@Output() action: EventEmitter`.

***
