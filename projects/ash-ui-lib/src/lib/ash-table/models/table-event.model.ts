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
 * Table state for persistence
 */
export interface TableState {
  currentPage: number;
  pageSize: number;
  sort: SortDescriptor | null;
  filters: FilterDescriptor[];
  selectedRows: any[];
}
