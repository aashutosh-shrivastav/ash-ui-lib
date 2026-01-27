import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  output,
  signal,
  TemplateRef
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent as MatPageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ColumnDef } from './models/column-def.model';
import { TableConfig } from './models/table-config.model';
import {
  SelectionMode,
  FilterDescriptor,
  SortDescriptor,
  PageEvent,
  ActionEvent,
  SelectionEvent,
  TableState
} from './models/table-event.model';
import { TableDataService } from './services/table-data.service';
import { TableExportService } from './services/table-export.service';
import { CellTemplateDirective } from './directives/cell-template.directive';
import { ResizableColumnDirective } from './directives/resizable-column.directive';

@Component({
  selector: 'lib-ash-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    CellTemplateDirective,
    ResizableColumnDirective,
    ScrollingModule
  ],
  templateUrl: './ash-table.html',
  styleUrl: './ash-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ash-table-loading]': 'loading()',
    '[class.ash-table-empty]': 'displayedData().length === 0',
    '[class.ash-table-error]': 'error()',
    'role': 'region',
    'aria-label': 'Data table'
  }
})
export class AshTable<T = any> {
  // Input signals
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly dataSource = input<T[]>([]);
  readonly pagination = input<boolean>(true);
  readonly serverSide = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly selectionMode = input<SelectionMode>('none');
  readonly totalRecords = input<number>(0);
  readonly config = input<TableConfig>({
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    virtualScroll: false,
    stickyHeader: true
  });
  readonly currentPage = input<number>(0);
  readonly currentSort = input<SortDescriptor | null>(null);
  readonly appliedFilters = input<FilterDescriptor[]>([]);
  readonly error = input<boolean>(false);
  readonly errorMessage = input<string>('An error occurred while loading data');

  // Output signals
  readonly rowSelect = output<SelectionEvent<T>>();
  readonly action = output<ActionEvent<T>>();
  readonly pageChange = output<PageEvent>();
  readonly sortChange = output<SortDescriptor>();
  readonly filterChange = output<FilterDescriptor[]>();
  readonly columnsChange = output<ColumnDef<T>[]>();
  readonly columnResize = output<{ column: string; width: number }>();
  readonly exportData = output<{ format: 'csv' | 'excel' | 'pdf' }>();

  // Content children for custom templates
  readonly cellTemplates = contentChildren(CellTemplateDirective);
  readonly loadingTemplate = contentChild<TemplateRef<any>>('loadingTemplate');
  readonly errorTemplate = contentChild<TemplateRef<any>>('errorTemplate');
  readonly emptyStateTemplate = contentChild<TemplateRef<any>>('emptyStateTemplate');

  // Internal state signals
  protected readonly selectedRows = signal<Set<T>>(new Set());
  protected readonly internalPage = signal<number>(0);
  protected readonly internalSort = signal<SortDescriptor | null>(null);
  protected readonly internalFilters = signal<FilterDescriptor[]>([]);
  protected readonly activeFilterColumn = signal<string>('');
  protected readonly focusedRowIndex = signal<number>(-1);

  // Services
  private readonly dataService = inject(TableDataService);
  private readonly exportService = inject(TableExportService);

  // Computed values
  protected readonly visibleColumns = computed(() =>
    this.columns().filter(col => col.visible !== false)
  );

  protected readonly displayedColumnKeys = computed(() => {
    const cols = this.visibleColumns().map(col => col.key);
    if (this.selectionMode() !== 'none') {
      return ['select', ...cols];
    }
    return cols;
  });

  protected readonly displayedData = computed(() => {
    if (this.serverSide()) {
      return this.dataSource();
    }

    const data = this.dataSource();
    const filters = this.internalFilters();
    const sort = this.internalSort();
    const page = this.internalPage();
    const pageSize = this.config().pageSize || 25;

    const { data: transformedData } = this.dataService.transformData(
      data,
      filters,
      sort,
      page,
      pageSize
    );

    return transformedData;
  });

  protected readonly totalRows = computed(() => {
    if (this.serverSide()) {
      return this.totalRecords();
    }
    return this.dataSource().length;
  });

  protected readonly isAllSelected = computed(() => {
    const displayed = this.displayedData();
    const selected = this.selectedRows();
    return displayed.length > 0 && displayed.every(row => selected.has(row));
  });

  protected readonly trackByFn = (index: number, item: T): any => {
    const trackBy = this.config().trackBy;
    return trackBy ? trackBy(index, item) : (item as any)?.id ?? index;
  };

  protected readonly virtualScrollConfig = computed(() => ({
    itemSize: this.config().itemSize || 48,
    minBufferPx: this.config().minBufferPx || 480,
    maxBufferPx: this.config().maxBufferPx || 960
  }));

  // Selection methods
  protected toggleRowSelection(row: T): void {
    const selected = new Set(this.selectedRows());
    const mode = this.selectionMode();

    if (mode === 'none') {
      return;
    }

    if (mode === 'single') {
      selected.clear();
      selected.add(row);
    } else {
      if (selected.has(row)) {
        selected.delete(row);
      } else {
        selected.add(row);
      }
    }

    this.selectedRows.set(selected);
    this.emitSelectionEvent(selected);
  }

  protected toggleSelectAll(): void {
    const selected = new Set(this.selectedRows());
    const displayed = this.displayedData();

    if (this.isAllSelected()) {
      displayed.forEach(row => selected.delete(row));
    } else {
      displayed.forEach(row => selected.add(row));
    }

    this.selectedRows.set(selected);
    this.emitSelectionEvent(selected);
  }

  protected isRowSelected(row: T): boolean {
    return this.selectedRows().has(row);
  }

  private emitSelectionEvent(selected: Set<T>): void {
    this.rowSelect.emit({
      selected: Array.from(selected),
      added: [],
      removed: []
    });
  }

  // Pagination handler
  protected handlePageChange(event: MatPageEvent): void {
    this.internalPage.set(event.pageIndex);
    
    const pageEvent: PageEvent = {
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      previousPageIndex: event.previousPageIndex,
      length: event.length
    };
    
    this.pageChange.emit(pageEvent);
  }

  // Sort handler
  protected handleSortChange(sort: Sort): void {
    const sortDesc: SortDescriptor = {
      column: sort.active,
      direction: sort.direction as 'asc' | 'desc' | ''
    };
    
    this.internalSort.set(sortDesc);
    this.sortChange.emit(sortDesc);
  }

  // Action handler
  protected handleAction(actionName: string, row: T, rowIndex: number): void {
    this.action.emit({
      action: actionName,
      row,
      rowIndex
    });
  }

  // Column resize handler
  protected handleColumnResize(columnKey: string, newWidth: number): void {
    this.columnResize.emit({
      column: columnKey,
      width: newWidth
    });
  }

  // Filter methods
  protected toggleColumnFilter(columnKey: string): void {
    if (this.activeFilterColumn() === columnKey) {
      this.activeFilterColumn.set('');
    } else {
      this.activeFilterColumn.set(columnKey);
    }
  }

  protected applyColumnFilter(field: string, value: string): void {
    const filters = this.internalFilters();
    const existingIndex = filters.findIndex(f => f.field === field);
    
    if (value.trim() === '') {
      if (existingIndex !== -1) {
        const newFilters = [...filters];
        newFilters.splice(existingIndex, 1);
        this.internalFilters.set(newFilters);
      }
    } else {
      const newFilter: FilterDescriptor = {
        field,
        operator: 'contains',
        value: value.trim()
      };
      
      if (existingIndex !== -1) {
        const newFilters = [...filters];
        newFilters[existingIndex] = newFilter;
        this.internalFilters.set(newFilters);
      } else {
        this.internalFilters.set([...filters, newFilter]);
      }
    }
    
    this.internalPage.set(0); // Reset to first page when filtering
    this.filterChange.emit(this.internalFilters());
  }

  protected clearColumnFilter(field: string): void {
    const filters = this.internalFilters().filter(f => f.field !== field);
    this.internalFilters.set(filters);
    this.activeFilterColumn.set('');
    this.filterChange.emit(filters);
  }

  protected isColumnFiltered(columnKey: string): boolean {
    return this.internalFilters().some(f => f.field === columnKey);
  }

  protected getColumnFilterValue(columnKey: string): string {
    const filter = this.internalFilters().find(f => f.field === columnKey);
    return filter ? String(filter.value) : '';
  }

  // Keyboard navigation
  protected handleKeyDown(event: KeyboardEvent, row: T, rowIndex: number): void {
    const displayedData = this.displayedData();
    const maxIndex = displayedData.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (rowIndex < maxIndex) {
          this.focusedRowIndex.set(rowIndex + 1);
          this.focusRow(rowIndex + 1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (rowIndex > 0) {
          this.focusedRowIndex.set(rowIndex - 1);
          this.focusRow(rowIndex - 1);
        }
        break;
      case ' ':
      case 'Space':
        event.preventDefault();
        if (this.selectionMode() !== 'none') {
          this.toggleRowSelection(row);
        }
        break;
      case 'Enter':
        event.preventDefault();
        this.handleAction('select', row, rowIndex);
        break;
      case 'Home':
        event.preventDefault();
        this.focusedRowIndex.set(0);
        this.focusRow(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusedRowIndex.set(maxIndex);
        this.focusRow(maxIndex);
        break;
    }
  }

  private focusRow(index: number): void {
    setTimeout(() => {
      const rows = document.querySelectorAll('.mat-mdc-row');
      if (rows[index]) {
        (rows[index] as HTMLElement).focus();
      }
    });
  }

  // Public methods
  clearSelection(): void {
    this.selectedRows.set(new Set());
    this.emitSelectionEvent(new Set());
  }

  selectAll(): void {
    const allRows = new Set(this.displayedData());
    this.selectedRows.set(allRows);
    this.emitSelectionEvent(allRows);
  }

  deselectRows(rows: T[]): void {
    const selected = new Set(this.selectedRows());
    rows.forEach(row => selected.delete(row));
    this.selectedRows.set(selected);
    this.emitSelectionEvent(selected);
  }

  getSelectedRows(): T[] {
    return Array.from(this.selectedRows());
  }

  refresh(): void {
    if (this.serverSide()) {
      this.pageChange.emit({
        pageIndex: this.currentPage(),
        pageSize: this.config().pageSize || 25,
        length: this.totalRecords()
      });
    }
  }

  reset(): void {
    this.internalPage.set(0);
    this.internalSort.set(null);
    this.internalFilters.set([]);
    this.clearSelection();
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.displayedData(), this.visibleColumns());
    this.exportData.emit({ format: 'csv' });
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.displayedData(), this.visibleColumns());
    this.exportData.emit({ format: 'excel' });
  }

  exportToPDF(): void {
    this.exportService.exportToPDF(this.displayedData(), this.visibleColumns());
    this.exportData.emit({ format: 'pdf' });
  }

  getState(): TableState {
    return {
      currentPage: this.internalPage(),
      pageSize: this.config().pageSize || 25,
      sort: this.internalSort(),
      filters: this.internalFilters(),
      selectedRows: this.getSelectedRows()
    };
  }

  setState(state: TableState): void {
    this.internalPage.set(state.currentPage);
    this.internalSort.set(state.sort);
    this.internalFilters.set(state.filters);
    if (state.selectedRows) {
      this.selectedRows.set(new Set(state.selectedRows));
    }
  }
}
