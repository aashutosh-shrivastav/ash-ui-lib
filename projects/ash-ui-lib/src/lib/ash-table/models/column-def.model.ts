import { TemplateRef } from '@angular/core';

/**
 * Context provided to cell templates
 */
export interface CellContext<T = any> {
  $implicit: T;
  row: T;
  column: ColumnDef<T>;
  rowIndex: number;
  value: any;
}

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
  
  /** Enable column resizing (default: false) */
  resizable?: boolean;
  
  /** Minimum width for resizable columns (default: 50px) */
  minWidth?: number;
  
  /** Maximum width for resizable columns (default: 500px) */
  maxWidth?: number;
  
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
