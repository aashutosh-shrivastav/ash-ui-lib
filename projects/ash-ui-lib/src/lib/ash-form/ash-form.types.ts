import { ValidatorFn, ValidationErrors, FormGroup } from '@angular/forms';

/**
 * Priority field types for Phase 1 implementation
 */
export type FieldType =
  // Text Inputs
  | 'text'
  | 'email'
  | 'password'
  | 'textarea'
  // Numbers
  | 'number'
  // Dates
  | 'date'
  | 'date-range'
  // Selection
  | 'select'
  | 'select-multiple'
  | 'radio'
  | 'checkbox'
  | 'checkbox-group'
  // Special
  | 'toggle';

/**
 * Comparison operators for conditional logic
 */
export type ComparisonOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'contains'
  | 'notContains'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'in'
  | 'notIn';

/**
 * Simple conditional expression
 */
export interface SimpleCondition {
  field: string;
  operator: ComparisonOperator;
  value: any;
}

/**
 * Complex conditional expression with AND/OR logic
 */
export interface ComplexCondition {
  operator: 'AND' | 'OR';
  conditions: ConditionalExpression[];
}

/**
 * Conditional expression for field visibility/disabled/required logic
 */
export type ConditionalExpression = SimpleCondition | ComplexCondition;

/**
 * Field-level validator configuration
 */
export type ValidatorConfig =
  | 'required'
  | 'email'
  | { type: 'minLength'; value: number }
  | { type: 'maxLength'; value: number }
  | { type: 'min'; value: number }
  | { type: 'max'; value: number }
  | { type: 'pattern'; value: string | RegExp; message?: string }
  | { type: 'custom'; validator: ValidatorFn; message: string };

/**
 * Option for select, radio, and checkbox-group fields
 */
export interface FieldOption {
  value: any;
  label: string;
  disabled?: boolean;
}

/**
 * Complete field schema definition
 */
export interface FormFieldSchema {
  // Core Properties
  name: string;
  type: FieldType;
  label: string;

  // Optional Core Properties
  placeholder?: string;
  hint?: string;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;

  // Validation
  validators?: ValidatorConfig[];
  customErrorMessages?: Record<string, string>;

  // Field-Type Specific Options
  options?: FieldOption[];
  minDate?: Date;
  maxDate?: Date;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;

  // Layout & Styling
  gridColumn?: string;
  gridRow?: string;
  cssClass?: string;
  width?: string;

  // Conditional Logic
  visibleWhen?: ConditionalExpression;
  disabledWhen?: ConditionalExpression;

  // Advanced Features
  dependsOn?: string[];
  computedValue?: (formValue: any) => any;
  group?: string;
  order?: number;

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

/**
 * Fieldset group configuration
 */
export interface FieldsetGroup {
  id: string;
  label: string;
  description?: string;
  expanded?: boolean;
  fields: string[];
}

/**
 * Layout configuration for the form
 */
export interface LayoutConfig {
  type: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  columnGap?: string;
  rowGap?: string;
  responsive?: {
    mobile?: { columns: number };
    tablet?: { columns: number };
    desktop?: { columns: number };
  };
  groups?: FieldsetGroup[];
}

/**
 * Form submission event payload
 */
export interface FormSubmitEvent<T = any> {
  value: T;
  formGroup: FormGroup;
  valid: boolean;
  dirty: boolean;
  touched: boolean;
}

/**
 * Form validation state
 */
export interface FormValidationState {
  valid: boolean;
  invalid: boolean;
  errors: Record<string, ValidationErrors | null>;
  touched: boolean;
  dirty: boolean;
}

/**
 * Field visibility event
 */
export interface FieldVisibilityEvent {
  fieldName: string;
  visible: boolean;
  reason: 'conditional' | 'manual';
}

/**
 * Auto-save status event
 */
export interface AutoSaveStatusEvent {
  success: boolean;
  timestamp: Date;
  error?: Error;
}

/**
 * Auto-save configuration
 */
export interface AutoSaveConfig {
  enabled: boolean;
  debounceTime: number;
  storageKey: string;
  storage: 'local' | 'session';
  onSave?: (formValue: any) => Promise<void> | void;
  onRestore?: () => Promise<any> | any;
}
