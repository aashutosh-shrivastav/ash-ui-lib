import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormFieldSchema } from '../ash-form.types';
import { FieldUtils } from './base-field.component';

/**
 * Checkbox field component
 * Handles: single checkbox, checkbox-group
 */
@Component({
  selector: 'lib-ash-checkbox-field',
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule
  ],
  template: `
    <div class="ash-checkbox-field" [class]="config().cssClass || ''">
      @if (isSingleCheckbox()) {
        <!-- Single checkbox -->
        <mat-checkbox
          [formControl]="control()"
          [disabled]="readonly()"
          [id]="fieldId()"
          [attr.aria-label]="config().ariaLabel || config().label"
          [attr.aria-describedby]="ariaDescribedBy()"
          [attr.aria-required]="config().required || false"
          [attr.aria-invalid]="showError() && control().invalid"
          class="ash-checkbox-single"
        >
          {{ config().label }}
          @if (config().required && showRequiredMarker()) {
            <span class="required-marker" aria-hidden="true">*</span>
          }
        </mat-checkbox>
      } @else {
        <!-- Checkbox group -->
        <label class="ash-checkbox-label" [id]="fieldId() + '-label'">
          {{ config().label }}
          @if (config().required && showRequiredMarker()) {
            <span class="required-marker" aria-hidden="true">*</span>
          }
        </label>

        @if (config().hint) {
          <div class="ash-checkbox-hint" [id]="fieldId() + '-hint'">{{ config().hint }}</div>
        }

        <div 
          class="ash-checkbox-group"
          role="group"
          [attr.aria-labelledby]="fieldId() + '-label'"
          [attr.aria-describedby]="ariaDescribedBy()"
        >
          @for (option of config().options; track option.value) {
            <mat-checkbox
              [value]="option.value"
              [checked]="isChecked(option.value)"
              [disabled]="option.disabled || readonly()"
              (change)="onCheckboxChange(option.value, $event.checked)"
              class="ash-checkbox-item"
            >
              {{ option.label }}
            </mat-checkbox>
          }
        </div>
      }

      @if (config().hint && isSingleCheckbox()) {
        <div class="ash-checkbox-hint" [id]="fieldId() + '-hint'">{{ config().hint }}</div>
      }

      @if (showError()) {
        <div class="ash-checkbox-error" [id]="fieldId() + '-error'" role="alert">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .ash-checkbox-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .ash-checkbox-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--mat-sys-on-surface, #1d1b20);
    }

    .required-marker {
      color: var(--mat-sys-error, #ba1a1a);
      margin-left: 4px;
    }

    .ash-checkbox-hint {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant, #49454f);
      margin-top: 4px;
    }

    .ash-checkbox-single {
      margin: 0;
    }

    .ash-checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ash-checkbox-item {
      margin: 0;
    }

    .ash-checkbox-error {
      font-size: 12px;
      color: var(--mat-sys-error, #ba1a1a);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxFieldComponent {
  // Inputs
  readonly control = input.required<FormControl<any>>();
  readonly config = input.required<FormFieldSchema>();
  readonly readonly = input<boolean>(false);
  readonly showError = input<boolean>(false);
  readonly showRequiredMarker = input<boolean>(true);

  // Computed properties
  readonly fieldId = computed(() => FieldUtils.getFieldId(this.config().name));

  readonly isSingleCheckbox = computed(() => this.config().type === 'checkbox');

  readonly errorMessage = computed(() => {
    const ctrl = this.control();
    if (!ctrl.errors) return '';

    const config = this.config();
    const errors = ctrl.errors;
    const customMessages = config.customErrorMessages || {};
    const errorKey = Object.keys(errors)[0];

    if (customMessages[errorKey]) {
      return FieldUtils.interpolateMessage(customMessages[errorKey], errors[errorKey]);
    }

    return FieldUtils.getDefaultMessage(errorKey, errors[errorKey]);
  });

  readonly ariaDescribedBy = computed(() => {
    return FieldUtils.getAriaDescribedBy(
      this.config().name,
      !!this.config().hint,
      this.showError() && !!this.errorMessage(),
      this.config().ariaDescribedBy
    );
  });

  // Checkbox group methods
  isChecked(value: any): boolean {
    const controlValue = this.control().value;
    if (!Array.isArray(controlValue)) return false;
    return controlValue.includes(value);
  }

  onCheckboxChange(value: any, checked: boolean): void {
    const currentValue = this.control().value || [];
    let newValue: any[];

    if (checked) {
      newValue = [...currentValue, value];
    } else {
      newValue = currentValue.filter((v: any) => v !== value);
    }

    this.control().setValue(newValue);
    this.control().markAsTouched();
  }
}
