import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AshForm, FormFieldSchema, FormSubmitEvent } from 'ash-ui-lib';

/**
 * Demo component showcasing all AshForm features
 * Tests all 12 field types, validation, and conditional logic
 */
@Component({
  selector: 'app-ash-form-demo',
  imports: [AshForm, JsonPipe],
  template: `
    <div class="demo-container">
      <h2>AshForm Component Demo</h2>
      <p>Comprehensive form demonstrating all 12 field types</p>

      <lib-ash-form
        [schema]="formSchema()"
        [model]="initialModel()"
        [loading]="isSubmitting()"
        [layout]="{ type: 'grid', columns: 12 }"
        (formSubmit)="onSubmit($event)"
        (valueChange)="onValueChange($event)"
      />

      @if (submittedData()) {
        <div class="submission-result">
          <h3>Form Submitted Successfully!</h3>
          <pre>{{ submittedData() | json }}</pre>
        </div>
      }
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 24px 0;
    }

    h2 {
      color: var(--mat-sys-on-surface, #1d1b20);
      margin-bottom: 8px;
    }

    p {
      color: var(--mat-sys-on-surface-variant, #49454f);
      margin-bottom: 32px;
    }

    .submission-result {
      margin-top: 32px;
      padding: 24px;
      background: var(--mat-sys-surface-container, #f3edf7);
      border-radius: 12px;

      h3 {
        color: var(--mat-sys-primary, #6750a4);
        margin-bottom: 16px;
        font-size: 18px;
      }

      pre {
        background: var(--mat-sys-surface, #fffbfe);
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 12px;
        line-height: 1.5;
      }
    }
  `]
})
export class AshFormDemoComponent {
  protected readonly isSubmitting = signal(false);
  protected readonly submittedData = signal<any>(null);

  protected readonly initialModel = signal({
    email: 'test@example.com',
    country: 'us',
    notifications: true
  });

  protected readonly formSchema = signal<FormFieldSchema[]>([
    // Section 1: Text Inputs
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      validators: ['required', { type: 'minLength', value: 2 }],
      gridColumn: 'span 6',
      hint: 'At least 2 characters'
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      validators: ['required'],
      gridColumn: 'span 6'
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'you@example.com',
      validators: ['required', 'email'],
      gridColumn: 'span 12',
      hint: 'We will never share your email'
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      placeholder: 'Enter a secure password',
      validators: [
        'required',
        { type: 'minLength', value: 8 },
        {
          type: 'pattern',
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
          message: 'Password must contain uppercase, lowercase, and number'
        }
      ],
      gridColumn: 'span 12',
      hint: 'At least 8 characters with mixed case and numbers'
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biography',
      placeholder: 'Tell us about yourself...',
      rows: 4,
      validators: [{ type: 'maxLength', value: 500 }],
      gridColumn: 'span 12',
      hint: 'Maximum 500 characters'
    },

    // Section 2: Number Input
    {
      name: 'age',
      type: 'number',
      label: 'Age',
      placeholder: 'Enter your age',
      min: 0,
      max: 120,
      validators: ['required', { type: 'min', value: 18 }, { type: 'max', value: 120 }],
      gridColumn: 'span 6',
      hint: 'Must be 18 or older'
    },
    {
      name: 'salary',
      type: 'number',
      label: 'Expected Salary',
      placeholder: 'Annual salary',
      min: 0,
      step: 1000,
      gridColumn: 'span 6',
      hint: 'Optional field'
    },

    // Section 3: Selection Fields
    {
      name: 'country',
      type: 'select',
      label: 'Country',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
        { value: 'au', label: 'Australia' },
        { value: 'other', label: 'Other' }
      ],
      validators: ['required'],
      gridColumn: 'span 6'
    },
    {
      name: 'skills',
      type: 'select-multiple',
      label: 'Skills',
      options: [
        { value: 'angular', label: 'Angular' },
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'nodejs', label: 'Node.js' }
      ],
      gridColumn: 'span 6',
      hint: 'Select all that apply'
    },
    {
      name: 'experience',
      type: 'radio',
      label: 'Experience Level',
      options: [
        { value: 'junior', label: 'Junior (0-2 years)' },
        { value: 'mid', label: 'Mid-level (3-5 years)' },
        { value: 'senior', label: 'Senior (6+ years)' }
      ],
      validators: ['required'],
      gridColumn: 'span 12'
    },

    // Section 4: Checkboxes
    {
      name: 'agreeToTerms',
      type: 'checkbox',
      label: 'I agree to the Terms and Conditions',
      validators: ['required'],
      gridColumn: 'span 12',
      customErrorMessages: {
        required: 'You must accept the terms to continue'
      }
    },
    {
      name: 'interests',
      type: 'checkbox-group',
      label: 'Interests',
      options: [
        { value: 'sports', label: 'Sports' },
        { value: 'music', label: 'Music' },
        { value: 'travel', label: 'Travel' },
        { value: 'technology', label: 'Technology' },
        { value: 'cooking', label: 'Cooking' }
      ],
      gridColumn: 'span 12'
    },

    // Section 5: Dates
    {
      name: 'birthDate',
      type: 'date',
      label: 'Date of Birth',
      validators: ['required'],
      gridColumn: 'span 6',
      hint: 'You must be 18 or older'
    },
    {
      name: 'availability',
      type: 'date-range',
      label: 'Availability Period',
      gridColumn: 'span 6',
      hint: 'Select your available dates'
    },

    // Section 6: Toggle
    {
      name: 'notifications',
      type: 'toggle',
      label: 'Enable Email Notifications',
      defaultValue: true,
      gridColumn: 'span 12',
      hint: 'Receive updates about your application'
    },

    // Section 7: Conditional Fields
    {
      name: 'otherCountry',
      type: 'text',
      label: 'Please specify your country',
      placeholder: 'Enter country name',
      validators: ['required'],
      gridColumn: 'span 12',
      visibleWhen: {
        field: 'country',
        operator: 'equals',
        value: 'other'
      },
      hint: 'This field appears when "Other" is selected above'
    }
  ]);

  protected onSubmit(event: FormSubmitEvent): void {
    console.log('Form submitted:', event);
    this.isSubmitting.set(true);

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submittedData.set(event.value);
    }, 1500);
  }

  protected onValueChange(value: any): void {
    console.log('Form value changed:', value);
  }
}
