import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormFieldSchema } from '../ash-form.types';
import { FieldUtils } from './base-field.component';

/**
 * Date field component  
 * Handles: date, date-range
 * 
 * Note: Date range functionality requires proper FormControl binding.
 * For now, implementing single date picker. Date range will be enhanced
 * in future iteration with proper start/end control synchronization.
 */
@Component({
  selector: 'lib-ash-date-field',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
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
        [matDatepicker]="picker"
        [formControl]="control()"
        [placeholder]="config().placeholder || ''"
        [min]="config().minDate"
        [max]="config().maxDate"
        [readonly]="readonly()"
        [id]="fieldId()"
        [attr.aria-label]="config().ariaLabel || config().label"
        [attr.aria-describedby]="ariaDescribedBy()"
        [attr.aria-required]="config().required || false"
        [attr.aria-invalid]="showError() && control().invalid"
      />
      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>

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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateFieldComponent {
  // Inputs
  readonly control = input.required<FormControl<any>>();
  readonly config = input.required<FormFieldSchema>();
  readonly readonly = input<boolean>(false);
  readonly showError = input<boolean>(false);
  readonly showRequiredMarker = input<boolean>(true);

  // Computed properties
  readonly fieldId = computed(() => FieldUtils.getFieldId(this.config().name));

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
