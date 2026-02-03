import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormFieldSchema } from '../ash-form.types';
import { FieldUtils } from './base-field.component';

/**
 * Number field component
 * Handles numeric inputs with min/max/step validation
 */
@Component({
  selector: 'lib-ash-number-field',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <mat-form-field class="ash-field-container" [class]="config().cssClass || ''">
      <mat-label>
        {{ config().label }}
        @if (config().required && showRequiredMarker()) {
          <span class="required-marker" aria-hidden="true">*</span>
        }
      </mat-label>

      <input
        matInput
        type="number"
        [formControl]="control()"
        [placeholder]="config().placeholder || ''"
        [min]="minValue()"
        [max]="maxValue()"
        [step]="config().step || 1"
        [readonly]="readonly()"
        [id]="fieldId()"
        [attr.aria-label]="config().ariaLabel || config().label"
        [attr.aria-describedby]="ariaDescribedBy()"
        [attr.aria-required]="config().required || false"
        [attr.aria-invalid]="showError() && control().invalid"
        [attr.aria-valuemin]="config().min"
        [attr.aria-valuemax]="config().max"
        [attr.aria-valuenow]="control().value"
      />

      @if (config().hint) {
        <mat-hint [id]="fieldId() + '-hint'">{{ config().hint }}</mat-hint>
      }

      @if (showError()) {
        <mat-error [id]="fieldId() + '-error'" role="alert">
          {{ errorMessage() }}
        </mat-error>
      }
    </mat-form-field>
  `,
  styles: [`
    .ash-field-container {
      width: 100%;
    }

    .required-marker {
      color: var(--mat-sys-error, #ba1a1a);
      margin-left: 4px;
    }

    input[type="number"] {
      /* Remove spinner arrows for cleaner look (optional) */
      -moz-appearance: textfield;
    }

    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberFieldComponent {
  // Inputs
  readonly control = input.required<FormControl<number | null>>();
  readonly config = input.required<FormFieldSchema>();
  readonly readonly = input<boolean>(false);
  readonly showError = input<boolean>(false);
  readonly showRequiredMarker = input<boolean>(true);

  // Computed properties
  readonly fieldId = computed(() => FieldUtils.getFieldId(this.config().name));

  readonly minValue = computed(() => this.config().min ?? null);
  readonly maxValue = computed(() => this.config().max ?? null);

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
}
