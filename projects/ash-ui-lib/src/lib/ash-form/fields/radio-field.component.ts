import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { FormFieldSchema } from '../ash-form.types';
import { FieldUtils } from './base-field.component';

/**
 * Radio field component
 * Handles: radio button groups
 */
@Component({
  selector: 'lib-ash-radio-field',
  imports: [
    ReactiveFormsModule,
    MatRadioModule
  ],
  template: `
    <div class="ash-radio-field" [class]="config().cssClass || ''">
      <label class="ash-radio-label" [id]="fieldId() + '-label'">
        {{ config().label }}
        @if (config().required && showRequiredMarker()) {
          <span class="required-marker" aria-hidden="true">*</span>
        }
      </label>

      @if (config().hint) {
        <div class="ash-radio-hint" [id]="fieldId() + '-hint'">{{ config().hint }}</div>
      }

      <mat-radio-group
        [formControl]="control()"
        [disabled]="readonly()"
        [id]="fieldId()"
        [attr.aria-labelledby]="fieldId() + '-label'"
        [attr.aria-describedby]="ariaDescribedBy()"
        [attr.aria-required]="config().required || false"
        [attr.aria-invalid]="showError() && control().invalid"
        class="ash-radio-group"
      >
        @for (option of config().options; track option.value) {
          <mat-radio-button 
            [value]="option.value" 
            [disabled]="option.disabled || false"
            class="ash-radio-button"
          >
            {{ option.label }}
          </mat-radio-button>
        }
      </mat-radio-group>

      @if (showError()) {
        <div class="ash-radio-error" [id]="fieldId() + '-error'" role="alert">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .ash-radio-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .ash-radio-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--mat-sys-on-surface, #1d1b20);
    }

    .required-marker {
      color: var(--mat-sys-error, #ba1a1a);
      margin-left: 4px;
    }

    .ash-radio-hint {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant, #49454f);
    }

    .ash-radio-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ash-radio-button {
      margin: 0;
    }

    .ash-radio-error {
      font-size: 12px;
      color: var(--mat-sys-error, #ba1a1a);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioFieldComponent {
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
