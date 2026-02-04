import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { input, output } from '@angular/core';
import {
  FormFieldSchema,
  LayoutConfig,
  FormSubmitEvent,
  FormValidationState,
  FieldVisibilityEvent,
  AutoSaveConfig,
  AutoSaveStatusEvent
} from './ash-form.types';
import { FormBuilderService } from './services/form-builder.service';
import { ConditionalLogicService } from './services/conditional-logic.service';
import { FieldRendererComponent } from './fields/field-renderer.component';

/**
 * AshForm - Schema-driven dynamic form component
 * 
 * Transforms JSON schema into production-ready Angular forms with:
 * - 12 field types (text, number, select, date, toggle, etc.)
 * - Field-level validation
 * - Conditional logic (show/hide fields)
 * - Responsive grid layout
 * - Material Design 3 theming
 * - WCAG 2.1 AA accessibility
 * 
 * @example
 * <lib-ash-form
 *   [schema]="formSchema()"
 *   [model]="initialData()"
 *   [layout]="layoutConfig()"
 *   (submit)="onSubmit($event)"
 *   (valueChange)="onValueChange($event)"
 * />
 */
@Component({
  selector: 'lib-ash-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FieldRendererComponent
  ],
  providers: [
    FormBuilderService,
    ConditionalLogicService
  ],
  templateUrl: './ash-form.html',
  styleUrl: './ash-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AshForm<T = any> {
  private readonly formBuilderService = inject(FormBuilderService);
  private readonly conditionalLogicService = inject(ConditionalLogicService);

  // ===== INPUTS =====

  /**
   * Form field definitions (REQUIRED)
   */
  readonly schema = input.required<FormFieldSchema[]>();

  /**
   * Initial form values
   */
  readonly model = input<Partial<T>>({});

  /**
   * Form layout configuration
   */
  readonly layout = input<LayoutConfig>({ type: 'vertical', columns: 1 });

  /**
   * Disable all form controls
   */
  readonly readonly = input<boolean>(false);

  /**
   * Show loading overlay
   */
  readonly loading = input<boolean>(false);

  /**
   * Auto-save configuration (optional)
   */
  readonly autoSave = input<AutoSaveConfig | null>(null);

  /**
   * Custom validation messages
   */
  readonly validationMessages = input<Record<string, string>>({});

  /**
   * Debounce time for value changes (ms)
   */
  readonly debounceTime = input<number>(300);

  /**
   * Show asterisk on required fields
   */
  readonly showRequiredMarker = input<boolean>(true);

  /**
   * Accessibility label for form element
   */
  readonly ariaLabel = input<string>('Dynamic form');

  // ===== OUTPUTS =====

  /**
   * Emitted when form is submitted (valid only)
   */
  readonly formSubmit = output<FormSubmitEvent<T>>();

  /**
   * Emitted on any form value change (debounced)
   */
  readonly valueChange = output<Partial<T>>();

  /**
   * Emitted when form validation state changes
   */
  readonly validationChange = output<FormValidationState>();

  /**
   * Emitted when field visibility changes
   */
  readonly fieldVisibilityChange = output<FieldVisibilityEvent>();

  /**
   * Emitted on auto-save triggers
   */
  readonly autoSaveStatus = output<AutoSaveStatusEvent>();

  // ===== INTERNAL STATE =====

  /**
   * The reactive FormGroup
   */
  protected readonly formGroup = signal<FormGroup>(new FormGroup({}));

  /**
   * Track if submit was attempted (for error display)
   */
  protected readonly submitAttempted = signal<boolean>(false);

  /**
   * Field visibility map (based on conditional logic)
   */
  protected readonly fieldVisibility = computed(() => {
    const visibility: Record<string, boolean> = {};
    const formValue = this.formGroup().value;

    this.schema().forEach(field => {
      if (field.visibleWhen) {
        visibility[field.name] = this.conditionalLogicService.evaluate(
          field.visibleWhen,
          formValue
        );
      } else {
        visibility[field.name] = true;
      }
    });

    return visibility;
  });

  /**
   * Visible fields (filtered by conditional logic)
   */
  protected readonly visibleFields = computed(() => {
    const visibility = this.fieldVisibility();
    return this.schema().filter(field => visibility[field.name] !== false);
  });

  /**
   * Form validation state
   */
  protected readonly formValidationState = computed<FormValidationState>(() => {
    const fg = this.formGroup();
    return {
      valid: fg.valid,
      invalid: fg.invalid,
      errors: this.getFormErrors(),
      touched: fg.touched,
      dirty: fg.dirty
    };
  });

  constructor() {
    // Build initial FormGroup when schema or model changes
    effect(() => {
      const schema = this.schema();
      const model = this.model();
      const fg = this.formBuilderService.buildFormGroup(schema, model);
      this.formGroup.set(fg);
    });

    // Apply readonly state
    effect(() => {
      const readonly = this.readonly();
      const fg = this.formGroup();
      if (readonly) {
        fg.disable();
      } else {
        fg.enable();
      }
    });
  }

  /**
   * Programmatically submit the form
   */
  handleSubmit(): void {
    this.submit();
  }

  /**
   * Submit the form
   */
  submit(): void {
    this.submitAttempted.set(true);
    this.formGroup().markAllAsTouched();

    if (this.formGroup().valid) {
      const event: FormSubmitEvent<T> = {
        value: this.formGroup().value,
        formGroup: this.formGroup(),
        valid: true,
        dirty: this.formGroup().dirty,
        touched: this.formGroup().touched
      };
      this.formSubmit.emit(event);
    }
  }

  /**
   * Reset form to initial values
   */
  reset(value?: Partial<T>): void {
    const resetValue = value || this.model();
    this.formGroup().reset(resetValue);
    this.submitAttempted.set(false);
  }

  /**
   * Patch form values without resetting
   */
  patchValue(value: Partial<T>): void {
    this.formGroup().patchValue(value);
  }

  /**
   * Get current form value
   */
  getValue(): T {
    return this.formGroup().value;
  }

  /**
   * Check if form is valid
   */
  isValid(): boolean {
    return this.formGroup().valid;
  }

  /**
   * Mark all fields as touched (show errors)
   */
  markAllAsTouched(): void {
    this.formGroup().markAllAsTouched();
  }

  /**
   * Get form group for advanced manipulation
   */
  getFormGroup(): FormGroup {
    return this.formGroup();
  }

  // ===== INTERNAL METHODS =====

  /**
   * Get all form errors
   */
  private getFormErrors(): Record<string, any> {
    const errors: Record<string, any> = {};
    Object.keys(this.formGroup().controls).forEach(key => {
      const control = this.formGroup().get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  /**
   * Check if field should show error
   */
  protected shouldShowError(fieldName: string): boolean {
    const control = this.formGroup().get(fieldName);
    if (!control) return false;

    return !!(
      control.invalid &&
      (control.dirty || control.touched || this.submitAttempted())
    );
  }

  /**
   * Get form control for a field
   */
  protected getControl(fieldName: string): FormControl {
    return this.formGroup().get(fieldName) as FormControl;
  }

  /**
   * Get grid columns CSS for layout
   */
  protected getGridColumns(): string {
    const layout = this.layout();
    if (layout.type !== 'grid') return 'auto';

    const columns = layout.columns || 1;
    return `repeat(${columns}, 1fr)`;
  }

  /**
   * Get error message for a field
   */
  protected getErrorMessage(fieldName: string): string {
    const control = this.formGroup().get(fieldName);
    if (!control?.errors) return '';

    const field = this.schema().find(f => f.name === fieldName);
    const errors = control.errors;
    const customMessages = field?.customErrorMessages || {};
    const globalMessages = this.validationMessages();

    // Check for custom field-level message first
    const errorKey = Object.keys(errors)[0];
    if (customMessages[errorKey]) {
      return this.interpolateMessage(customMessages[errorKey], errors[errorKey]);
    }

    // Check for global message override
    if (globalMessages[errorKey]) {
      return this.interpolateMessage(globalMessages[errorKey], errors[errorKey]);
    }

    // Default messages
    return this.getDefaultErrorMessage(errorKey, errors[errorKey]);
  }

  /**
   * Get default error message
   */
  private getDefaultErrorMessage(errorKey: string, errorValue: any): string {
    switch (errorKey) {
      case 'required':
        return 'This field is required';
      case 'email':
        return 'Please enter a valid email address';
      case 'minlength':
        return `Minimum length is ${errorValue.requiredLength} characters`;
      case 'maxlength':
        return `Maximum length is ${errorValue.requiredLength} characters`;
      case 'min':
        return `Minimum value is ${errorValue.min}`;
      case 'max':
        return `Maximum value is ${errorValue.max}`;
      case 'pattern':
        return 'Invalid format';
      default:
        return 'Invalid value';
    }
  }

  /**
   * Interpolate message with error values
   */
  private interpolateMessage(template: string, errorValue: any): string {
    if (!errorValue || typeof errorValue !== 'object') {
      return template;
    }

    let message = template;
    Object.keys(errorValue).forEach(key => {
      message = message.replace(`{${key}}`, errorValue[key]);
    });

    return message;
  }
}
