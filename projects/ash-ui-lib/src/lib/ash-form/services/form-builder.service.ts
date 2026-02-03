import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { FormFieldSchema, ValidatorConfig } from '../ash-form.types';

/**
 * Service responsible for building FormGroup from schema
 * Follows Angular's Dynamic Forms pattern with modern signals
 */
@Injectable()
export class FormBuilderService {
  private readonly fb = inject(FormBuilder);

  /**
   * Build a FormGroup from an array of field schemas
   */
  buildFormGroup(schema: FormFieldSchema[], initialModel: any = {}): FormGroup {
    const group: Record<string, FormControl> = {};

    schema.forEach(field => {
      const control = this.createFormControl(field, initialModel);
      group[field.name] = control;
    });

    return this.fb.group(group);
  }

  /**
   * Create a FormControl for a single field
   */
  private createFormControl(field: FormFieldSchema, model: any): FormControl {
    // Determine initial value
    const initialValue = this.getInitialValue(field, model);

    // Build validators array
    const validators = this.buildValidators(field);

    // Create control with validators
    const control = this.fb.control(
      { value: initialValue, disabled: field.disabled || false },
      validators
    );

    // Apply readonly state (different from disabled)
    if (field.readonly) {
      control.disable();
    }

    return control;
  }

  /**
   * Get initial value for a field
   * Priority: model value > defaultValue > type default
   */
  private getInitialValue(field: FormFieldSchema, model: any): any {
    // Check for nested value using dot notation (e.g., 'address.city')
    const modelValue = this.getNestedValue(model, field.name);
    if (modelValue !== undefined) {
      return modelValue;
    }

    // Use default value from schema
    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    // Type-specific defaults
    switch (field.type) {
      case 'checkbox':
        return false;
      case 'checkbox-group':
      case 'select-multiple':
        return [];
      case 'number':
        return null;
      case 'date':
      case 'date-range':
        return null;
      default:
        return '';
    }
  }

  /**
   * Build validators array from validator configs
   */
  private buildValidators(field: FormFieldSchema): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    // Quick required check from field property
    if (field.required) {
      validators.push(Validators.required);
    }

    // Process validator configs
    if (field.validators && field.validators.length > 0) {
      field.validators.forEach(validatorConfig => {
        const validator = this.createValidator(validatorConfig);
        if (validator) {
          validators.push(validator);
        }
      });
    }

    return validators;
  }

  /**
   * Create a ValidatorFn from a validator config
   */
  private createValidator(config: ValidatorConfig): ValidatorFn | null {
    if (typeof config === 'string') {
      // Simple string validators
      switch (config) {
        case 'required':
          return Validators.required;
        case 'email':
          return Validators.email;
        default:
          return null;
      }
    } else {
      // Object-based validators
      switch (config.type) {
        case 'minLength':
          return Validators.minLength(config.value);
        case 'maxLength':
          return Validators.maxLength(config.value);
        case 'min':
          return Validators.min(config.value);
        case 'max':
          return Validators.max(config.value);
        case 'pattern':
          return Validators.pattern(config.value);
        case 'custom':
          return config.validator;
        default:
          return null;
      }
    }
  }

  /**
   * Get nested value from object using dot notation
   * Example: getNestedValue({ address: { city: 'NYC' } }, 'address.city') => 'NYC'
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) {
      return undefined;
    }

    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Update form controls based on schema changes
   * Used for dynamic schema updates
   */
  updateFormGroup(formGroup: FormGroup, schema: FormFieldSchema[], model: any = {}): void {
    const newGroup = this.buildFormGroup(schema, model);

    // Remove controls not in new schema
    Object.keys(formGroup.controls).forEach(key => {
      if (!newGroup.contains(key)) {
        formGroup.removeControl(key);
      }
    });

    // Add or update controls from new schema
    Object.keys(newGroup.controls).forEach(key => {
      if (formGroup.contains(key)) {
        // Update existing control value and validators
        const existingControl = formGroup.get(key);
        const newControl = newGroup.get(key);
        if (existingControl && newControl) {
          existingControl.setValue(newControl.value);
          existingControl.setValidators(newControl.validator);
          existingControl.updateValueAndValidity();
        }
      } else {
        // Add new control
        formGroup.addControl(key, newGroup.get(key)!);
      }
    });
  }
}
