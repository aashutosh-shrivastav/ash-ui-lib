import { Component, computed, input, Type } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormFieldSchema } from '../ash-form.types';
import { TextFieldComponent } from './text-field.component';
import { NumberFieldComponent } from './number-field.component';
import { SelectFieldComponent } from './select-field.component';
import { RadioFieldComponent } from './radio-field.component';
import { CheckboxFieldComponent } from './checkbox-field.component';
import { DateFieldComponent } from './date-field.component';
import { ToggleFieldComponent } from './toggle-field.component';

/**
 * Dynamic field renderer component
 * Loads the appropriate field component based on field type
 */
@Component({
  selector: 'lib-ash-field-renderer',
  imports: [
    TextFieldComponent,
    NumberFieldComponent,
    SelectFieldComponent,
    RadioFieldComponent,
    CheckboxFieldComponent,
    DateFieldComponent,
    ToggleFieldComponent
  ],
  template: `
    @switch (config().type) {
      @case ('text') {
        <lib-ash-text-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('email') {
        <lib-ash-text-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('password') {
        <lib-ash-text-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('textarea') {
        <lib-ash-text-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('number') {
        <lib-ash-number-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('select') {
        <lib-ash-select-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('select-multiple') {
        <lib-ash-select-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('radio') {
        <lib-ash-radio-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('checkbox') {
        <lib-ash-checkbox-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('checkbox-group') {
        <lib-ash-checkbox-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('date') {
        <lib-ash-date-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('date-range') {
        <lib-ash-date-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @case ('toggle') {
        <lib-ash-toggle-field
          [control]="control()"
          [config]="config()"
          [readonly]="readonly()"
          [showError]="showError()"
          [showRequiredMarker]="showRequiredMarker()"
        />
      }
      @default {
        <div class="ash-field-error">
          Unsupported field type: {{ config().type }}
        </div>
      }
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .ash-field-error {
      padding: 12px;
      background-color: var(--mat-sys-error-container, #ffdad6);
      color: var(--mat-sys-on-error-container, #410002);
      border-radius: 4px;
      font-size: 14px;
    }
  `]
})
export class FieldRendererComponent {
  readonly control = input.required<FormControl>();
  readonly config = input.required<FormFieldSchema>();
  readonly readonly = input<boolean>(false);
  readonly showError = input<boolean>(false);
  readonly showRequiredMarker = input<boolean>(true);
}
