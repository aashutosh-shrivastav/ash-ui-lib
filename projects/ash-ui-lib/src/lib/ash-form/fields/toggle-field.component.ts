import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormFieldSchema } from '../ash-form.types';
import { FieldUtils } from './base-field.component';

/**
 * Toggle field component
 * Handles: slide toggle (boolean switch)
 */
@Component({
  selector: 'lib-ash-toggle-field',
  imports: [
    ReactiveFormsModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="ash-toggle-field" [class]="config().cssClass || ''">
      <mat-slide-toggle
        [formControl]="control()"
        [disabled]="readonly()"
        [id]="fieldId()"
        [attr.aria-label]="config().ariaLabel || config().label"
        [attr.aria-describedby]="ariaDescribedBy()"
        [attr.aria-required]="config().required || false"
        [attr.aria-invalid]="showError() && control().invalid"
        class="ash-toggle"
      >
        {{ config().label }}
        @if (config().required && showRequiredMarker()) {
          <span class="required-marker" aria-hidden="true">*</span>
        }
      </mat-slide-toggle>

      @if (config().hint) {
        <div class="ash-toggle-hint" [id]="fieldId() + '-hint'">{{ config().hint }}</div>
      }

      @if (showError()) {
        <div class="ash-toggle-error" [id]="fieldId() + '-error'" role="alert">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .ash-toggle-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .ash-toggle {
      margin: 0;
    }

    .required-marker {
      color: var(--mat-sys-error, #ba1a1a);
      margin-left: 4px;
    }

    .ash-toggle-hint {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant, #49454f);
      margin-left: 4px;
    }

    .ash-toggle-error {
      font-size: 12px;
      color: var(--mat-sys-error, #ba1a1a);
      margin-left: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleFieldComponent {
  // Inputs
  readonly control = input.required<FormControl<boolean>>();
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
