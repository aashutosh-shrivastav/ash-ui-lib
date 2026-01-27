# AshTable Component - Design Document

**Version:** 1.0  
**Created:** January 18, 2026  
**Component:** AshTable  
**Library:** ash-ui-lib  
**Framework:** Angular 20+

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [Class Diagram](#class-diagram)
4. [Sequence Diagrams](#sequence-diagrams)
5. [Interface Definitions](#interface-definitions)
6. [Component API](#component-api)
7. [Usage Guide](#usage-guide)
8. [Best Practices Alignment](#best-practices-alignment)
9. [Performance Considerations](#performance-considerations)
10. [Accessibility Implementation](#accessibility-implementation)

---

## Architecture Overview

### Design Philosophy

AshTable is a **standalone, signal-based** enterprise table component built on Angular Material CDK. It adopts OnPush change detection and modern Angular patterns (signals, computed values, built-in control flow) for optimal performance.

### Core Layers

```
┌─────────────────────────────────────────────────┐
│           AshTable Component                     │
│  (Presentation + State Management via Signals)  │
└─────────────────┬───────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼─────┐    ┌─────▼──────┐
    │ Material │    │ CDK Virtual│
    │  Table   │    │  Scrolling │
    └──────────┘    └────────────┘
```

### Key Dependencies

- `@angular/material/table` - Base table functionality
- `@angular/cdk/scrolling` - Virtual scrolling
- `@angular/material/paginator` - Pagination UI
- `@angular/material/sort` - Sorting functionality
- `@angular/material/checkbox` - Row selection

---

## Component Structure

### File Organization

```
projects/ash-ui-lib/src/lib/ash-table/
├── ash-table.ts                    # Main component
├── ash-table.html                  # Template (built-in @if/@for)
├── ash-table.scss                   # Component styles
├── ash-table.spec.ts               # Unit tests
├── models/
│   ├── column-def.model.ts         # Column configuration interface
│   ├── table-config.model.ts       # Table configuration
│   └── table-event.model.ts        # Event payload types
├── services/
│   ├── table-data.service.ts       # Data management (injectable)
│   └── table-export.service.ts     # Export functionality
└── directives/
    ├── cell-template.directive.ts  # Custom cell templates
    └── resizable-column.directive.ts # Column resizing
```

---

## Class Diagram

```mermaid
classDiagram
    class AshTable {
        +InputSignal~ColumnDef[]~ columns
        +InputSignal~T[]~ dataSource
        +InputSignal~boolean~ pagination
        +InputSignal~boolean~ serverSide
        +InputSignal~boolean~ loading
        +InputSignal~SelectionMode~ selectionMode
        +OutputEmitterRef~TableEvent~ rowSelect
        +OutputEmitterRef~ActionEvent~ action
        +OutputEmitterRef~PageEvent~ pageChange
        +OutputEmitterRef~SortEvent~ sortChange
        
        +Signal~T[]~ displayedData
        +Signal~number~ totalRecords
        +WritableSignal~Set~T~~ selectedRows
        +WritableSignal~boolean~ isLoading
        
        -dataService: TableDataService
        -exportService: TableExportService
        
        +handleSort(column: string): void
        +handlePageChange(event: PageEvent): void
        +toggleRowSelection(row: T): void
        +exportToCSV(): void
    }

    class ColumnDef {
        <<interface>>
        +key: string
        +label: string
        +type?: ColumnType
        +sortable?: boolean
        +filterable?: boolean
        +width?: string
        +pinned?: 'left' | 'right'
        +visible?: boolean
        +cellTemplate?: TemplateRef
    }

    class TableConfig {
        <<interface>>
        +virtualScroll?: boolean
        +itemSize?: number
        +pageSize?: number
        +pageSizeOptions?: number[]
        +showFirstLastButtons?: boolean
        +stickyHeader?: boolean
        +multiSort?: boolean
    }

    class TableDataService {
        <<injectable>>
        +filterData(data: T[], filters: FilterMap): T[]
        +sortData(data: T[], sort: SortDescriptor): T[]
        +paginateData(data: T[], page: number, size: number): T[]
        +applyFilters(filters: Signal~FilterMap~): void
    }

    class TableExportService {
        <<injectable>>
        +exportToCSV(data: T[], columns: ColumnDef[]): void
        +exportToExcel(data: T[], columns: ColumnDef[]): void
        +exportToPDF(data: T[], columns: ColumnDef[]): void
    }

    class CellTemplateDirective {
        +columnKey: string
        +templateRef: TemplateRef
    }

    class ResizableColumnDirective {
        +minWidth: number
        +maxWidth: number
        +onResize: EventEmitter~number~
    }

    AshTable --> ColumnDef : uses
    AshTable --> TableConfig : uses
    AshTable --> TableDataService : inject()
    AshTable --> TableExportService : inject()
    AshTable ..> CellTemplateDirective : content projection
    AshTable ..> ResizableColumnDirective : optional
```

---

## Sequence Diagrams

### 1. Client-Side Pagination Flow

```mermaid
sequenceDiagram
    participant User
    participant AshTable
    participant DataService
    participant MatPaginator

    User->>AshTable: Interact with paginator
    AshTable->>AshTable: pageChange.emit(event)
    AshTable->>DataService: paginateData(allData, page, size)
    DataService-->>AshTable: paginatedData[]
    AshTable->>AshTable: displayedData.set(paginatedData)
    AshTable->>MatPaginator: Update view
    MatPaginator-->>User: Display page 2 data
```

### 2. Server-Side Sorting/Filtering Flow

```mermaid
sequenceDiagram
    participant User
    participant AshTable
    participant Parent
    participant Backend

    User->>AshTable: Click sort header
    AshTable->>AshTable: sortChange.emit({column, direction})
    AshTable->>Parent: Event bubbles up
    Parent->>Backend: HTTP GET /api/data?sort=name&dir=asc
    Backend-->>Parent: {data: [...], total: 10000}
    Parent->>AshTable: Update dataSource input signal
    AshTable->>AshTable: displayedData computed updates
    AshTable-->>User: Show sorted data
```

### 3. Row Selection Flow

```mermaid
sequenceDiagram
    participant User
    participant AshTable
    participant SelectionService
    participant Parent

    User->>AshTable: Click row checkbox
    AshTable->>AshTable: toggleRowSelection(row)
    AshTable->>AshTable: selectedRows.update(...)
    AshTable->>AshTable: rowSelect.emit(selectedRows)
    AshTable->>Parent: Notify selection change
    Parent-->>User: Enable bulk actions
```

### 4. Virtual Scrolling with 10K+ Rows

```mermaid
sequenceDiagram
    participant User
    participant AshTable
    participant CdkVirtualScroll
    participant ViewportBuffer

    User->>AshTable: Load 10,000 rows
    AshTable->>CdkVirtualScroll: Initialize with itemSize
    CdkVirtualScroll->>ViewportBuffer: Render initial 20 rows
    ViewportBuffer-->>User: Display visible rows only
    
    User->>AshTable: Scroll down
    CdkVirtualScroll->>ViewportBuffer: Recycle DOM (destroy top, create bottom)
    ViewportBuffer-->>User: Smooth scrolling maintained
```

---

## Interface Definitions

### Core Interfaces

```typescript
/**
 * Column configuration for table display
 */
export interface ColumnDef<T = any> {
  /** Unique identifier matching data property key */
  key: keyof T & string;
  
  /** Human-readable column header */
  label: string;
  
  /** Data type for formatting (default: 'string') */
  type?: 'string' | 'number' | 'date' | 'currency' | 'boolean';
  
  /** Enable column sorting (default: false) */
  sortable?: boolean;
  
  /** Enable column filtering (default: false) */
  filterable?: boolean;
  
  /** Fixed column width (CSS value) */
  width?: string;
  
  /** Pin column to left or right */
  pinned?: 'left' | 'right';
  
  /** Column visibility toggle (default: true) */
  visible?: boolean;
  
  /** Custom cell template reference */
  cellTemplate?: TemplateRef<CellContext<T>>;
  
  /** Format function for cell value */
  format?: (value: any) => string;
  
  /** CSS class for column cells */
  cssClass?: string;
}

/**
 * Table configuration options
 */
export interface TableConfig {
  /** Enable CDK virtual scrolling for large datasets */
  virtualScroll?: boolean;
  
  /** Row height in pixels (required for virtual scroll) */
  itemSize?: number;
  
  /** Default page size for initial load */
  defaultPageSize?: number;
  
  /** Available page size options */
  pageSizeOptions?: number[];
  
  /** Show first/last page buttons in paginator */
  showFirstLastButtons?: boolean;
  
  /** Sticky table header on scroll */
  stickyHeader?: boolean;
  
  /** Enable multi-column sorting (Shift+Click) */
  multiSort?: boolean;
  
  /** Enable column resizing */
  resizableColumns?: boolean;
  
  /** Enable column reordering via drag-drop */
  reorderableColumns?: boolean;
  
  /** Track by function for row identity */
  trackBy?: (index: number, item: any) => any;
}

/**
 * Row selection modes
 */
export type SelectionMode = 'none' | 'single' | 'multi';

/**
 * Filter descriptor for column filtering
 */
export interface FilterDescriptor {
  field: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'gt' | 'lt';
  value: any;
}

/**
 * Sort descriptor
 */
export interface SortDescriptor {
  column: string;
  direction: 'asc' | 'desc' | '';
}

/**
 * Page event payload
 */
export interface PageEvent {
  pageIndex: number;
  pageSize: number;
  previousPageIndex?: number;
  length: number;
}

/**
 * Table action event
 */
export interface ActionEvent<T = any> {
  action: string;
  row: T;
  rowIndex: number;
}

/**
 * Row selection event
 */
export interface SelectionEvent<T = any> {
  selected: T[];
  added: T[];
  removed: T[];
}

/**
 * Cell template context
 */
export interface CellContext<T = any> {
  $implicit: T;
  row: T;
  column: ColumnDef<T>;
  rowIndex: number;
  value: any;
}
```

---

## Component API

### Inputs (Signal-based)

```typescript
/** Column definitions array */
columns = input.required<ColumnDef[]>();

/** Table data source (array or Observable) */
dataSource = input<any[]>([]);

/** Enable pagination UI */
pagination = input<boolean>(true);

/** Server-side mode (disables client-side processing) */
serverSide = input<boolean>(false);

/** Loading state indicator */
loading = input<boolean>(false);

/** Row selection mode */
selectionMode = input<SelectionMode>('none');

/** Total records (for server-side pagination) */
totalRecords = input<number>(0);

/** Table configuration */
config = input<TableConfig>({
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
  virtualScroll: false,
  stickyHeader: true
});

/** Current page index (for server-side) */
currentPage = input<number>(0);

/** Current sort state (for server-side) */
currentSort = input<SortDescriptor | null>(null);

/** Applied filters (for server-side) */
appliedFilters = input<FilterDescriptor[]>([]);

/** Error state */
error = input<boolean>(false);

/** Error message to display */
errorMessage = input<string>('An error occurred while loading data');
```

### Outputs (Signal-based)

```typescript
/** Row selection change event */
rowSelect = output<SelectionEvent>();

/** Row action triggered (edit, delete, view, etc.) */
action = output<ActionEvent>();

/** Page change event */
pageChange = output<PageEvent>();

/** Sort change event */
sortChange = output<SortDescriptor>();

/** Filter change event */
filterChange = output<FilterDescriptor[]>();

/** Column visibility change */
columnsChange = output<ColumnDef[]>();

/** Column resize event */
columnResize = output<{column: string; width: number}>();

/** Export initiated */
exportData = output<{format: 'csv' | 'excel' | 'pdf'}>();
```

### Public Methods

```typescript
/** Clear all selections */
clearSelection(): void;

/** Select all visible rows */
selectAll(): void;

/** Deselect specific row(s) */
deselectRows(rows: T[]): void;

/** Get currently selected rows */
getSelectedRows(): T[];

/** Refresh data (re-emit requests for server-side) */
refresh(): void;

/** Reset table state (filters, sort, pagination) */
reset(): void;

/** Export visible data */
exportToCSV(): void;
exportToExcel(): void;
exportToPDF(): void;

/** Get current table state */
getState(): TableState;

/** Restore table state */
setState(state: TableState): void;
```

---

## Usage Guide

### Basic Usage (Client-Side)

```typescript
import { Component, signal } from '@angular/core';
import { AshTable } from '@yourscope/ash-ui-lib';

@Component({
  selector: 'app-customers',
  imports: [AshTable],
  template: `
    <lib-ash-table
      [columns]="columns()"
      [dataSource]="customers()"
      [pagination]="true"
      [selectionMode]="'multi'"
      (rowSelect)="onSelectionChange($event)"
      (action)="onAction($event)"
    />
  `
})
export class CustomersComponent {
  protected readonly columns = signal([
    { key: 'id', label: 'ID', type: 'number', sortable: true },
    { key: 'name', label: 'Customer Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', filterable: true },
    { key: 'revenue', label: 'Revenue', type: 'currency', sortable: true }
  ]);

  protected readonly customers = signal([
    { id: 1, name: 'Acme Corp', email: 'contact@acme.com', revenue: 125000 },
    { id: 2, name: 'TechStart Inc', email: 'info@techstart.com', revenue: 89000 }
  ]);

  protected onSelectionChange(event: SelectionEvent) {
    console.log('Selected:', event.selected);
  }

  protected onAction(event: ActionEvent) {
    if (event.action === 'edit') {
      this.editCustomer(event.row);
    }
  }
}
```

### Server-Side Pagination

```typescript
import { Component, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-customers-server',
  imports: [AshTable],
  template: `
    <lib-ash-table
      [columns]="columns()"
      [dataSource]="data()"
      [serverSide]="true"
      [loading]="loading()"
      [totalRecords]="totalRecords()"
      [currentPage]="currentPage()"
      [currentSort]="currentSort()"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (filterChange)="onFilterChange($event)"
    />
  `
})
export class CustomersServerComponent {
  private readonly http = inject(HttpClient);
  
  protected readonly columns = signal([...]);
  protected readonly data = signal([]);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly currentPage = signal(0);
  protected readonly currentSort = signal<SortDescriptor | null>(null);
  protected readonly filters = signal<FilterDescriptor[]>([]);

  constructor() {
    // Auto-fetch when any parameter changes
    effect(() => {
      this.fetchData();
    });
  }

  protected onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
  }

  protected onSortChange(sort: SortDescriptor) {
    this.currentSort.set(sort);
  }

  protected onFilterChange(filters: FilterDescriptor[]) {
    this.filters.set(filters);
  }

  private fetchData() {
    const page = this.currentPage();
    const sort = this.currentSort();
    const filters = this.filters();
    
    this.loading.set(true);
    this.http.get('/api/customers', {
      params: {
        page: page.toString(),
        sort: sort?.column || '',
        direction: sort?.direction || '',
        filters: JSON.stringify(filters)
      }
    }).subscribe(response => {
      this.data.set(response.data);
      this.totalRecords.set(response.total);
      this.loading.set(false);
    });
  }
}
```

### Custom Cell Templates

```typescript
@Component({
  template: `
    <lib-ash-table
      [columns]="columns()"
      [dataSource]="data()"
    >
      <!-- Custom cell template -->
      <ng-template libCellTemplate columnKey="status" let-row>
        <span [class]="'status-badge status-' + row.status">
          {{ row.status }}
        </span>
      </ng-template>

      <!-- Action buttons template -->
      <ng-template libCellTemplate columnKey="actions" let-row let-index="rowIndex">
        <button mat-icon-button (click)="editRow(row)">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button (click)="deleteRow(row, index)">
          <mat-icon>delete</mat-icon>
        </button>
      </ng-template>
    </lib-ash-table>
  `
})
```

### Virtual Scrolling (10K+ Rows)

```typescript
@Component({
  template: `
    <lib-ash-table
      [columns]="columns()"
      [dataSource]="largeDataset()"
      [config]="{
        virtualScroll: true,
        itemSize: 48,
        pagination: false
      }"
    />
  `
})
export class LargeDataComponent {
  protected readonly largeDataset = signal(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      name: `Customer ${i + 1}`,
      value: Math.random() * 100000
    }))
  );
}
```

### With Inline Actions

```typescript
protected readonly columns = signal([
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  {
    key: 'actions',
    label: 'Actions',
    type: 'actions',
    actions: [
      { icon: 'edit', label: 'Edit', action: 'edit' },
      { icon: 'delete', label: 'Delete', action: 'delete', color: 'warn' },
      { icon: 'visibility', label: 'View', action: 'view' }
    ]
  }
]);
```

---

## Best Practices Alignment

### ✅ Angular 20+ Modern Patterns

| Practice | Implementation |
|----------|----------------|
| **Standalone Component** | No `NgModule`, `imports` array in `@Component` |
| **Signal Inputs** | `input()`, `input.required()` instead of `@Input()` |
| **Signal Outputs** | `output()` instead of `@Output()` + `EventEmitter` |
| **OnPush Change Detection** | `changeDetection: ChangeDetectionStrategy.OnPush` |
| **Built-in Control Flow** | `@if`, `@for`, `@switch` in templates (no `*ngIf`/`*ngFor`) |
| **Computed Values** | `computed()` for derived state like filtered data |
| **Dependency Injection** | `inject()` function instead of constructor injection |
| **No Host Decorators** | Use `host: {}` in `@Component` metadata |

### Template Example

```html
<!-- ✅ Modern: Built-in control flow -->
@if (loading()) {
  <div class="loading-skeleton">
    @for (i of [1,2,3,4,5]; track i) {
      <div class="skeleton-row"></div>
    }
  </div>
} @else if (error()) {
  <div class="error-state">
    <mat-icon>error</mat-icon>
    <p>{{ errorMessage() }}</p>
  </div>
} @else if (displayedData().length === 0) {
  <div class="empty-state">
    <mat-icon>inbox</mat-icon>
    <p>No data available</p>
  </div>
} @else {
  <cdk-virtual-scroll-viewport [itemSize]="config().itemSize">
    <table mat-table [dataSource]="displayedData()">
      @for (column of visibleColumns(); track column.key) {
        <ng-container [matColumnDef]="column.key">
          <th mat-header-cell *matHeaderCellDef>
            {{ column.label }}
          </th>
          <td mat-cell *matCellDef="let row">
            {{ row[column.key] }}
          </td>
        </ng-container>
      }
    </table>
  </cdk-virtual-scroll-viewport>
}
```

### Component Structure

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CdkVirtualScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'lib-ash-table',
  imports: [
    MatTableModule,
    CdkVirtualScrollingModule,
    // Other standalone imports
  ],
  templateUrl: './ash-table.html',
  styleUrl: './ash-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ash-table-loading]': 'loading()',
    '[class.ash-table-empty]': 'displayedData().length === 0',
    'role': 'region',
    'aria-label': 'Data table'
  }
})
export class AshTable<T = any> {
  // Input signals
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly dataSource = input<T[]>([]);
  readonly loading = input<boolean>(false);
  
  // Output signals
  readonly rowSelect = output<SelectionEvent<T>>();
  readonly action = output<ActionEvent<T>>();
  
  // Internal state
  protected readonly selectedRows = signal<Set<T>>(new Set());
  protected readonly currentPage = signal<number>(0);
  protected readonly currentSort = signal<SortDescriptor | null>(null);
  
  // Computed values
  protected readonly visibleColumns = computed(() => 
    this.columns().filter(col => col.visible !== false)
  );
  
  protected readonly displayedData = computed(() => {
    let data = this.dataSource();
    
    // Apply sorting
    if (this.currentSort()) {
      data = this.sortData(data, this.currentSort()!);
    }
    
    // Apply pagination
    if (this.pagination()) {
      data = this.paginateData(data);
    }
    
    return data;
  });
  
  // Services
  private readonly dataService = inject(TableDataService);
  private readonly exportService = inject(TableExportService);
}
```

---

## Performance Considerations

### 1. Virtual Scrolling Setup

- Enable for datasets > 100 rows
- Set `itemSize` to exact row height (e.g., 48px)
- Use `trackBy` function for row identity:

```typescript
protected readonly trackByFn = (index: number, item: T) => item.id ?? index;
```

### 2. Computed Signals for Derived Data

```typescript
// ✅ Efficient: Memoized computation
protected readonly filteredData = computed(() => {
  const filters = this.appliedFilters();
  return filters.length 
    ? this.dataService.filterData(this.dataSource(), filters)
    : this.dataSource();
});

// ❌ Avoid: Function calls in template
<!-- Don't do this -->
<tr *ngFor="let row of filterData(dataSource())">
```

### 3. OnPush Change Detection

- All input signals automatically trigger change detection
- Manual change detection only if using imperative APIs

### 4. Lazy Loading for Large Datasets

```typescript
protected readonly virtualScrollConfig = computed(() => ({
  itemSize: 48,
  minBufferPx: 480,  // 10 rows buffer
  maxBufferPx: 960   // 20 rows buffer
}));
```

---

## Accessibility Implementation

### WCAG 2.1 AA Compliance

```typescript
@Component({
  host: {
    'role': 'region',
    'aria-label': 'Data table',
    '[attr.aria-busy]': 'loading()',
    '[attr.aria-rowcount]': 'totalRecords()',
    '[attr.aria-colcount]': 'columns().length'
  }
})
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Navigate between cells |
| `Arrow Keys` | Move focus within table |
| `Space` | Toggle row selection (multi mode) |
| `Enter` | Trigger primary action |
| `Home` / `End` | First/last row |
| `Page Up/Down` | Scroll by viewport |

### Screen Reader Support

```html
<table mat-table [attr.aria-describedby]="'table-description'">
  <caption id="table-description">
    {{ config().tableCaption || 'Data table with ' + totalRecords() + ' records' }}
  </caption>
  
  <!-- Column headers with sort state -->
  <th mat-header-cell 
      [attr.aria-sort]="getSortState(column)">
    {{ column.label }}
  </th>
</table>
```

### Focus Management

```typescript
protected readonly focusedRowIndex = signal<number>(-1);

protected handleKeyboardNavigation(event: KeyboardEvent, rowIndex: number) {
  switch(event.key) {
    case 'ArrowDown':
      this.focusedRowIndex.set(Math.min(rowIndex + 1, this.displayedData().length - 1));
      break;
    case 'ArrowUp':
      this.focusedRowIndex.set(Math.max(rowIndex - 1, 0));
      break;
  }
}
```

---

## Testing Strategy

### Unit Tests (Jest/Jasmine)

```typescript
describe('AshTable', () => {
  it('should display empty state when no data', () => {
    const fixture = TestBed.createComponent(AshTable);
    fixture.componentRef.setInput('dataSource', []);
    fixture.detectChanges();
    
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should emit selection event when row selected', () => {
    const fixture = TestBed.createComponent(AshTable);
    let emittedEvent: SelectionEvent | undefined;
    
    fixture.componentInstance.rowSelect.subscribe(event => {
      emittedEvent = event;
    });
    
    fixture.componentInstance.toggleRowSelection(mockRow);
    
    expect(emittedEvent?.selected).toContain(mockRow);
  });
});
```

### Storybook Stories

```typescript
export const Empty: Story = {
  args: { dataSource: [], columns: mockColumns }
};

export const Loading: Story = {
  args: { dataSource: [], loading: true }
};

export const Performance10K: Story = {
  args: { 
    dataSource: generate10KRows(),
    config: { virtualScroll: true, itemSize: 48 }
  }
};
```

---

## Implementation Checklist

### Phase 1: Core Functionality (Week 1)
- [x] Component scaffold with signal inputs/outputs
- [x] Material Table integration
- [x] Column definition rendering
- [x] Basic data display
- [x] Empty state template (default)

### Phase 2: Pagination & Sorting (Week 1)
- [x] Client-side pagination
- [x] Material Paginator integration
- [x] Column sort headers
- [x] Multi-column sort support
- [x] Server-side mode flag

### Phase 3: Selection & Actions (Week 2)
- [x] Row selection (single/multi)
- [x] Checkbox column
- [x] Action column with buttons
- [x] Selection event emissions
- [x] Bulk action support

### Phase 4: Advanced Features (Week 2)
- [x] Virtual scrolling setup *(completed: CDK virtual scroll with configurable buffer)*
- [x] Column filtering UI *(completed: per-column filter with contains operator)*
- [x] Resizable columns directive *(completed: signal-based directive with min/max width constraints)*
- [x] Cell template projection *(done: via CellTemplateDirective and contentChildren)*
- [x] Loading/error states *(done: default states in template)*
- [x] Customizable loading, error, and empty state templates via @ContentChild('loadingTemplate'), @ContentChild('errorTemplate'), and @ContentChild('emptyStateTemplate') *(completed)*

### Phase 5: Performance & Accessibility (Week 3)
- [x] Virtual scroll optimization *(completed: buffer configuration for optimal performance)*
- [x] OnPush verification *(completed and verified)*
- [x] ARIA attributes *(completed and verified)*
- [x] Keyboard navigation *(completed: Arrow keys, Space, Enter, Home, End support)*

### Phase 6: Export & Polish (Week 3)
- [ ] CSV export service
- [ ] Excel export (optional)
- [ ] PDF export (optional)
- [ ] Theming support *(see docs/guides/theming-guide.md)*
- [ ] RTL compatibility *(see docs/guides/rtl-guide.md)*

### Phase 7: Documentation & Testing (Week 4)
- [ ] Storybook stories (8 canonical)
- [ ] Unit tests (80%+ coverage)
- [ ] Screen reader testing *(post unit testing - requires manual validation with NVDA/JAWS)*
- [ ] API documentation
- [ ] Usage examples
- [ ] Performance benchmarks

---

## Dependencies

### Required

```json
{
  "@angular/core": "^21.0.0",
  "@angular/common": "^21.0.0",
  "@angular/material": "^21.0.0",
  "@angular/cdk": "^21.0.0"
}
```

### Optional (for exports)

```json
{
  "xlsx": "^0.18.5",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.0"
}
```

---

## Migration Path (for existing table components)

1. **Wrap existing Material Table** with AshTable component
2. **Map existing inputs** to new signal-based inputs
3. **Convert @Output** to signal outputs
4. **Add virtual scrolling** for performance datasets
5. **Enable server-side mode** if using backend pagination
6. **Test accessibility** with screen reader
7. **Benchmark performance** with 10K+ rows

---

## Related Components

- **AshDataGrid** - Advanced enterprise grid (if extending beyond basic table)
- **AshDynamicForm** - Form integration for inline editing
- **AshMultiChart** - Data visualization companion

---

## Conclusion

This design document provides the complete blueprint for implementing the AshTable component following Angular 20+ best practices. The component leverages signals, standalone architecture, and modern control flow for optimal performance and developer experience.

**Key Differentiators:**
- 🚀 Signal-based reactivity
- ⚡ Virtual scrolling for 10K+ rows
- ♿ WCAG 2.1 AA compliant
- 🎨 Full Material Design theming
- 📦 Standalone, tree-shakable
- 🔧 Server/client-side modes

**Next Steps:** Begin Phase 1 implementation following the checklist above.

---

*Document Version: 1.0*  
*Last Updated: January 18, 2026*  
*Author: Ash UI Lib Team*
