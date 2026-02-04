import { FormControl, ValidationErrors } from '@angular/forms';
import { Signal, computed } from '@angular/core';
import { input } from '@angular/core';
import { FormFieldSchema } from '../ash-form.types';

/**
 * Base interface for all field components
 * Provides common properties and methods
 */
export interface BaseFieldComponent<T = any> {
  /**
   * The form control for this field
   */
  readonly control: Signal<FormControl<T>>;

  /**
   * Field configuration from schema
   */
  readonly config: Signal<FormFieldSchema>;

  /**
   * Whether the field is in readonly mode
   */
  readonly readonly: Signal<boolean>;

  /**
   * Computed error message for display
   */
  readonly errorMessage: Signal<string>;

  /**
   * Whether to show error (touched/dirty/submitted)
   */
  readonly showError: Signal<boolean>;
}

/**
 * Utility functions for field components
 */
export class FieldUtils {
  /**
   * Get default error message
   */
  static getDefaultMessage(errorKey: string, errorValue: any): string {
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
   * Interpolate message template with error values
   */
  static interpolateMessage(template: string, errorValue: any): string {
    if (!errorValue || typeof errorValue !== 'object') {
      return template;
    }

    let message = template;
    Object.keys(errorValue).forEach(key => {
      message = message.replace(`{${key}}`, errorValue[key]);
    });

    return message;
  }

  /**
   * Get field ID for accessibility
   */
  static getFieldId(fieldName: string): string {
    return `ash-form-field-${fieldName}`;
  }

  /**
   * Get aria-describedby value
   */
  static getAriaDescribedBy(
    fieldName: string,
    hasHint: boolean,
    hasError: boolean,
    customDescribedBy?: string
  ): string {
    const parts: string[] = [];

    if (hasHint) {
      parts.push(`${FieldUtils.getFieldId(fieldName)}-hint`);
    }

    if (hasError) {
      parts.push(`${FieldUtils.getFieldId(fieldName)}-error`);
    }

    if (customDescribedBy) {
      parts.push(customDescribedBy);
    }

    return parts.join(' ');
  }
}
