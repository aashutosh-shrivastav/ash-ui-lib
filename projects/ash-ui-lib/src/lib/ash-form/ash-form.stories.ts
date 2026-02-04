import type { Meta, StoryObj } from '@storybook/angular';
import { AshForm } from './ash-form';
import { FormFieldSchema } from './ash-form.types';

const meta: Meta<AshForm> = {
  title: 'Components/AshForm',
  component: AshForm,
  tags: ['autodocs'],
  argTypes: {
    schema: {
      description: 'Form field definitions array',
      control: { type: 'object' }
    },
    model: {
      description: 'Initial form values',
      control: { type: 'object' }
    },
    layout: {
      description: 'Form layout configuration',
      control: { type: 'object' }
    },
    loading: {
      description: 'Show loading overlay',
      control: { type: 'boolean' }
    },
    readonly: {
      description: 'Disable all form controls',
      control: { type: 'boolean' }
    }
  }
};

export default meta;
type Story = StoryObj<AshForm>;

// Simple Login Form
export const LoginForm: Story = {
  args: {
    schema: [
      {
        name: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'you@example.com',
        validators: ['required', 'email'],
        gridColumn: 'span 12'
      },
      {
        name: 'password',
        type: 'password',
        label: 'Password',
        validators: ['required'],
        gridColumn: 'span 12'
      },
      {
        name: 'rememberMe',
        type: 'checkbox',
        label: 'Remember me',
        gridColumn: 'span 12'
      }
    ] as FormFieldSchema[],
    layout: { type: 'vertical', columns: 1 }
  }
};

// Contact Form with All Text Fields
export const ContactForm: Story = {
  args: {
    schema: [
      {
        name: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'John Doe',
        validators: ['required'],
        gridColumn: 'span 12'
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'john@example.com',
        validators: ['required', 'email'],
        gridColumn: 'span 12'
      },
      {
        name: 'subject',
        type: 'text',
        label: 'Subject',
        placeholder: 'How can we help?',
        validators: ['required'],
        gridColumn: 'span 12'
      },
      {
        name: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Type your message here...',
        rows: 5,
        validators: ['required', { type: 'minLength', value: 10 }],
        gridColumn: 'span 12',
        hint: 'At least 10 characters'
      }
    ] as FormFieldSchema[],
    layout: { type: 'vertical', columns: 1 }
  }
};

// Registration Form with Grid Layout
export const RegistrationForm: Story = {
  args: {
    schema: [
      {
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        validators: ['required'],
        gridColumn: 'span 6'
      },
      {
        name: 'lastName',
        type: 'text',
        label: 'Last Name',
        validators: ['required'],
        gridColumn: 'span 6'
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        validators: ['required', 'email'],
        gridColumn: 'span 12'
      },
      {
        name: 'password',
        type: 'password',
        label: 'Password',
        validators: ['required', { type: 'minLength', value: 8 }],
        gridColumn: 'span 6',
        hint: 'At least 8 characters'
      },
      {
        name: 'confirmPassword',
        type: 'password',
        label: 'Confirm Password',
        validators: ['required'],
        gridColumn: 'span 6'
      },
      {
        name: 'age',
        type: 'number',
        label: 'Age',
        min: 18,
        max: 120,
        validators: ['required', { type: 'min', value: 18 }],
        gridColumn: 'span 6'
      },
      {
        name: 'country',
        type: 'select',
        label: 'Country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' }
        ],
        validators: ['required'],
        gridColumn: 'span 6'
      },
      {
        name: 'agreeToTerms',
        type: 'checkbox',
        label: 'I agree to the Terms and Conditions',
        validators: ['required'],
        gridColumn: 'span 12'
      }
    ] as FormFieldSchema[],
    layout: { type: 'grid', columns: 12 }
  }
};

// Survey Form with All Selection Types
export const SurveyForm: Story = {
  args: {
    schema: [
      {
        name: 'satisfaction',
        type: 'radio',
        label: 'How satisfied are you with our service?',
        options: [
          { value: 1, label: 'Very Dissatisfied' },
          { value: 2, label: 'Dissatisfied' },
          { value: 3, label: 'Neutral' },
          { value: 4, label: 'Satisfied' },
          { value: 5, label: 'Very Satisfied' }
        ],
        validators: ['required'],
        gridColumn: 'span 12'
      },
      {
        name: 'features',
        type: 'select-multiple',
        label: 'Which features do you use most?',
        options: [
          { value: 'dashboard', label: 'Dashboard' },
          { value: 'reports', label: 'Reports' },
          { value: 'analytics', label: 'Analytics' },
          { value: 'settings', label: 'Settings' }
        ],
        gridColumn: 'span 12'
      },
      {
        name: 'improvements',
        type: 'checkbox-group',
        label: 'What would you like us to improve?',
        options: [
          { value: 'performance', label: 'Performance' },
          { value: 'ui', label: 'User Interface' },
          { value: 'features', label: 'More Features' },
          { value: 'support', label: 'Customer Support' }
        ],
        gridColumn: 'span 12'
      },
      {
        name: 'recommend',
        type: 'toggle',
        label: 'Would you recommend us to others?',
        gridColumn: 'span 12'
      },
      {
        name: 'comments',
        type: 'textarea',
        label: 'Additional Comments',
        rows: 4,
        gridColumn: 'span 12'
      }
    ] as FormFieldSchema[],
    layout: { type: 'vertical', columns: 1 }
  }
};

// Conditional Logic Demo
export const ConditionalLogic: Story = {
  args: {
    schema: [
      {
        name: 'accountType',
        type: 'radio',
        label: 'Account Type',
        options: [
          { value: 'personal', label: 'Personal' },
          { value: 'business', label: 'Business' }
        ],
        validators: ['required'],
        gridColumn: 'span 12'
      },
      {
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        validators: ['required'],
        gridColumn: 'span 6'
      },
      {
        name: 'lastName',
        type: 'text',
        label: 'Last Name',
        validators: ['required'],
        gridColumn: 'span 6'
      },
      {
        name: 'companyName',
        type: 'text',
        label: 'Company Name',
        validators: ['required'],
        gridColumn: 'span 12',
        visibleWhen: {
          field: 'accountType',
          operator: 'equals',
          value: 'business'
        },
        hint: 'This field only appears for Business accounts'
      },
      {
        name: 'taxId',
        type: 'text',
        label: 'Tax ID',
        validators: ['required'],
        gridColumn: 'span 12',
        visibleWhen: {
          field: 'accountType',
          operator: 'equals',
          value: 'business'
        }
      }
    ] as FormFieldSchema[],
    layout: { type: 'grid', columns: 12 }
  }
};

// Date Fields Demo
export const DateFields: Story = {
  args: {
    schema: [
      {
        name: 'birthDate',
        type: 'date',
        label: 'Date of Birth',
        validators: ['required'],
        gridColumn: 'span 12',
        hint: 'Select your birth date'
      },
      {
        name: 'travelDates',
        type: 'date-range',
        label: 'Travel Dates',
        gridColumn: 'span 12',
        hint: 'Select your departure and return dates'
      }
    ] as FormFieldSchema[],
    layout: { type: 'vertical', columns: 1 }
  }
};

// Loading State Demo
export const LoadingState: Story = {
  args: {
    schema: [
      {
        name: 'username',
        type: 'text',
        label: 'Username',
        validators: ['required'],
        gridColumn: 'span 12'
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        validators: ['required', 'email'],
        gridColumn: 'span 12'
      }
    ] as FormFieldSchema[],
    loading: true,
    layout: { type: 'vertical', columns: 1 }
  }
};

// Readonly Form Demo
export const ReadonlyForm: Story = {
  args: {
    schema: [
      {
        name: 'name',
        type: 'text',
        label: 'Full Name',
        gridColumn: 'span 12'
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        gridColumn: 'span 12'
      },
      {
        name: 'role',
        type: 'select',
        label: 'Role',
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' }
        ],
        gridColumn: 'span 12'
      }
    ] as FormFieldSchema[],
    model: {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    },
    readonly: true,
    layout: { type: 'vertical', columns: 1 }
  }
};
