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
export { ResizableColumnDirective } from './lib/ash-table/directives/resizable-column.directive';

// AshForm exports
export { AshForm } from './lib/ash-form/ash-form';
export type {
  FormFieldSchema,
  FieldType,
  ValidatorConfig,
  ConditionalExpression,
  LayoutConfig,
  FormSubmitEvent,
  FormValidationState,
  FieldVisibilityEvent,
  AutoSaveConfig,
  AutoSaveStatusEvent
} from './lib/ash-form/ash-form.types';

// AshToast exports
export { AshToastComponent } from './lib/ash-toast/ash-toast.component';
export { AshToastService } from './lib/ash-toast/ash-toast.service';
export type { ToastConfig, ToastType } from './lib/ash-toast/ash-toast.service';

// AshChart exports
export { AshChartComponent as AshChart } from './lib/ash-chart/ash-chart.component';
export type {
  ChartSeriesData,
  ChartClickEvent,
  ZoomRange,
  DataPointInfo,
  ChartType,
  EChartsOptions,
  YAxisConfig,
  XAxisConfig
} from './lib/ash-chart/types';

// AshCalendar exports
export { AshCalendar } from './lib/ash-calendar/ash-calendar';
export type { DateStyle } from './lib/ash-calendar/models/date-style.model';
