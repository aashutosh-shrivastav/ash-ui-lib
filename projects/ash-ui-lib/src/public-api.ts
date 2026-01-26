/*
 * Public API Surface of ash-ui-lib
 */

export * from './lib/ash-ui-lib';

// AshTable exports
export { AshTable } from './lib/ash-table/ash-table';
export type { ColumnDef } from './lib/ash-table/models/column-def.model';
export type { TableConfig } from './lib/ash-table/models/table-config.model';
export type { 
  SelectionMode,
  FilterDescriptor,
  SortDescriptor,
  PageEvent,
  ActionEvent,
  SelectionEvent,
  TableState
} from './lib/ash-table/models/table-event.model';
export { CellTemplateDirective } from './lib/ash-table/directives/cell-template.directive';
