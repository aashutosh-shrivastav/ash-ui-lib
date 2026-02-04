# AshForm Design Document

**Component:** AshForm (Schema-Driven Dynamic Forms)  
**Library:** ash-ui-lib  
**Version:** 1.0  
**Status:** 🚧 Design Phase  
**Last Updated:** February 3, 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [API Specification](#api-specification)
4. [Schema Structure](#schema-structure)
5. [Field Types](#field-types)
6. [Validation System](#validation-system)
7. [Layout Engine](#layout-engine)
8. [Multi-Step Wizard](#multi-step-wizard)
9. [Advanced Features](#advanced-features)
10. [Theming Integration](#theming-integration)
11. [Accessibility](#accessibility)
12. [Performance](#performance)
13. [Implementation Checklist](#implementation-checklist)
14. [Usage Examples](#usage-examples)
15. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### Design Philosophy

**AshForm is a schema-driven, reactive form builder that transforms JSON configuration into production-ready Angular forms.**

```
┌─────────────────────────────────────────────────────────┐
│                    JSON Schema Input                     │
│   {                                                      │
│     fields: [...],                                       │
│     layout: {...},                                       │
│     validation: {...}                                    │
│   }                                                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                AshForm Component                         │
│  • Schema Parser                                         │
│  • FormGroup Builder (Reactive Forms)                    │
│  • Layout Renderer                                       │
│  • Validation Orchestrator                               │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼────────┐ ┌─▼──────────┐
│ Field         │ │ Conditional│ │ Validation │
│ Components    │ │ Logic      │ │ Messages   │
│ (15+ types)   │ │ Engine     │ │ Display    │
└───────────────┘ └────────────┘ └────────────┘
        │
┌───────▼─────────────────────────────────────────────────┐
│          Angular Material Form Controls                  │
│  MatInput, MatSelect, MatCheckbox, MatDatepicker, etc.   │
└──────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Reactive Forms** | Over template-driven for better testability, type safety, and complex validation |
| **Signal-Based State** | Reactive UI updates, better performance with OnPush |
| **Standalone Components** | Tree-shakable, modern Angular 20+ architecture |
| **Schema-First** | Enables form generation from backend APIs, form builders, or CMS |
| **Material-Based** | Leverage Angular Material's 40+ form components, theming, and accessibility |
| **Conditional Logic Engine** | Declarative show/hide rules without manual template logic |
| **Type-Safe API** | Full TypeScript generics for schema and model types |

### Technology Stack

```typescript
// Core Dependencies
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Modern Angular Features
import { signal, computed, effect } from '@angular/core';
import { input, output } from '@angular/core';
import { inject } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
```

### Inspiration & References

This component is inspired by Angular's official [Dynamic Forms Guide](https://angular.dev/guide/forms/dynamic-forms), adapted with modern signals, Material Design 3, and enterprise features.

---

## Core Concepts

### 1. Schema-Driven Architecture

**Forms are defined by JSON schemas, not templates:**

```typescript
const loginFormSchema: FormFieldSchema[] = [
  {
    name: 'email',
    type: 'text',
    label: 'Email Address',
    placeholder: 'you@example.com',
    validators: ['required', 'email'],
    gridColumn: 'span 12'
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    validators: ['required', { type: 'minLength', value: 8 }],
    gridColumn: 'span 12'
  }
];

// Component usage
<lib-ash-form [schema]="loginFormSchema" (submit)="onLogin($event)" />
```

### 2. Reactive State Management

**All form state managed via signals:**

```typescript
export class AshForm {
  // Input signals
  readonly schema = input.required<FormFieldSchema[]>();
  readonly model = input<any>({});
  readonly loading = input<boolean>(false);
  
  // Internal signals
  protected readonly formGroup = signal<FormGroup>(new FormGroup({}));
  protected readonly visibleFields = computed(() => 
    this.calculateVisibleFields()
  );
  protected readonly validationErrors = signal<Record<string, string[]>>({});
  
  // Output signals
  readonly submit = output<FormSubmitEvent>();
  readonly valueChange = output<any>();
}
```

### 3. Type-Safe Generic API

**Full TypeScript support for form models:**

```typescript
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  preferences: {
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
}

// Type-safe component usage
<lib-ash-form<UserProfile>
  [schema]="profileSchema"
  [model]="currentUser"
  (submit)="onSave($event)"
/>

// Event payload is typed
onSave(event: FormSubmitEvent<UserProfile>) {
  const data: UserProfile = event.value; // Fully typed!
}
```

---

## API Specification

### Component Inputs

```typescript
export class AshForm<T = any> {
  /**
   * Form field definitions (REQUIRED)
   * Array of field schemas defining structure, validation, and behavior
   */
  readonly schema = input.required<FormFieldSchema[]>();
  
  /**
   * Initial form values
   * Supports nested objects and arrays
   * @default {}
   */
  readonly model = input<Partial<T>>({});
  
  /**
   * Form layout configuration
   * @default { type: 'vertical', columns: 1 }
   */
  readonly layout = input<LayoutConfig>({ type: 'vertical', columns: 1 });
  
  /**
   * Disable all form controls
   * @default false
   */
  readonly readonly = input<boolean>(false);
  
  /**
   * Show loading overlay
   * @default false
   */
  readonly loading = input<boolean>(false);
  
  /**
   * Multi-step wizard configuration
   * Transforms form into wizard mode
   */
  readonly wizardConfig = input<WizardConfig | null>(null);
  
  /**
   * Auto-save configuration
   * Debounced value changes
   */
  readonly autoSave = input<AutoSaveConfig | null>(null);
  
  /**
   * Custom validation messages
   * Override default error text
   */
  readonly validationMessages = input<Record<string, string>>({});
  
  /**
   * Debounce time for value changes (ms)
   * @default 300
   */
  readonly debounceTime = input<number>(300);
  
  /**
   * Show asterisk on required fields
   * @default true
   */
  readonly showRequiredMarker = input<boolean>(true);
  
  /**
   * Accessibility label for form element
   */
  readonly ariaLabel = input<string>('Dynamic form');
}
```

### Component Outputs

```typescript
export class AshForm<T = any> {
  /**
   * Emitted when form is submitted (valid only)
   * Payload includes form value, raw form group, and metadata
   */
  readonly submit = output<FormSubmitEvent<T>>();
  
  /**
   * Emitted on any form value change (debounced)
   * Includes partial updates
   */
  readonly valueChange = output<Partial<T>>();
  
  /**
   * Emitted when form validation state changes
   */
  readonly validationChange = output<FormValidationState>();
  
  /**
   * Emitted when user navigates wizard steps
   * Only in wizard mode
   */
  readonly stepChange = output<WizardStepEvent>();
  
  /**
   * Emitted when field visibility changes
   * Due to conditional logic evaluation
   */
  readonly fieldVisibilityChange = output<FieldVisibilityEvent>();
  
  /**
   * Emitted on auto-save triggers
   * Includes success/failure status
   */
  readonly autoSaveStatus = output<AutoSaveStatusEvent>();
}
```

### Public Methods

```typescript
export class AshForm<T = any> {
  /**
   * Programmatically submit the form
   * Triggers validation and submit event if valid
   */
  submit(): void;
  
  /**
   * Reset form to initial values
   * @param value Optional new initial values
   */
  reset(value?: Partial<T>): void;
  
  /**
   * Patch form values without resetting
   * @param value Partial form values to update
   */
  patchValue(value: Partial<T>): void;
  
  /**
   * Get current form value
   * @returns Current form state
   */
  getValue(): T;
  
  /**
   * Check if form is valid
   */
  isValid(): boolean;
  
  /**
   * Mark all fields as touched (show errors)
   */
  markAllAsTouched(): void;
  
  /**
   * Get form group for advanced manipulation
   */
  getFormGroup(): FormGroup;
  
  /**
   * Navigate to specific wizard step (wizard mode only)
   * @param step Step index (0-based)
   */
  goToStep(step: number): void;
  
  /**
   * Manually trigger auto-save (if enabled)
   */
  triggerAutoSave(): void;
}
```

---

## Schema Structure

### FormFieldSchema Interface

```typescript
/**
 * Complete field schema definition
 * Supports all field types and configurations
 */
interface FormFieldSchema {
  // Core Properties
  name: string;                    // Unique field identifier (supports dot notation for nested: 'address.city')
  type: FieldType;                 // Field input type
  label: string;                   // Display label
  
  // Optional Core Properties
  placeholder?: string;            // Placeholder text
  hint?: string;                   // Helper text below field
  defaultValue?: any;              // Default value if not in model
  required?: boolean;              // Shorthand for required validator
  disabled?: boolean;              // Disable field
  readonly?: boolean;              // Make field read-only
  
  // Validation
  validators?: ValidatorConfig[];  // Array of validator configurations
  asyncValidators?: AsyncValidatorConfig[];  // Async validators (e.g., username uniqueness)
  customErrorMessages?: Record<string, string>;  // Override default error messages
  
  // Field-Type Specific Options
  options?: FieldOption[];         // For select, radio, checkbox-group
  multiple?: boolean;              // For select (multi-select)
  minDate?: Date;                  // For date/datetime pickers
  maxDate?: Date;                  // For date/datetime pickers
  accept?: string;                 // For file upload (e.g., 'image/*')
  maxFileSize?: number;            // For file upload (bytes)
  rows?: number;                   // For textarea
  min?: number;                    // For number/slider
  max?: number;                    // For number/slider
  step?: number;                   // For number/slider
  
  // Layout & Styling
  gridColumn?: string;             // CSS grid column span (e.g., 'span 6')
  gridRow?: string;                // CSS grid row span
  cssClass?: string;               // Custom CSS class
  width?: string;                  // Fixed width (e.g., '300px')
  
  // Conditional Logic
  visibleWhen?: ConditionalExpression;  // Show/hide based on other fields
  disabledWhen?: ConditionalExpression; // Enable/disable based on other fields
  requiredWhen?: ConditionalExpression; // Dynamic required validation
  
  // Advanced Features
  dependsOn?: string[];            // Field names that trigger recalculation
  computedValue?: (formValue: any) => any;  // Calculated field formula
  group?: string;                  // Fieldset group identifier
  order?: number;                  // Display order override
  
  // Autocomplete
  autocompleteSource?: AutocompleteSource;  // For autocomplete field type
  
  // Rich Text
  richTextConfig?: RichTextConfig;  // For rich-text field type
  
  // Nested Forms
  nestedSchema?: FormFieldSchema[];  // For nested sub-forms
  
  // Accessibility
  ariaLabel?: string;              // ARIA label override
  ariaDescribedBy?: string;        // ARIA described-by reference
}
```

### Field Types

```typescript
// Phase 1: Priority Field Types (First Iteration)
type FieldType =
  // Text Inputs
  | 'text'
  | 'email'
  | 'password'
  | 'textarea'
  
  // Numbers
  | 'number'
  
  // Dates
  | 'date'
  | 'date-range'
  
  // Selection
  | 'select'           // Single select dropdown
  | 'select-multiple'  // Multi-select dropdown
  | 'radio'            // Radio button group
  | 'checkbox'         // Single checkbox
  | 'checkbox-group'   // Multiple checkboxes
  
  // Special
  | 'toggle';          // Slide toggle (mat-slide-toggle)

// Phase 2: Future Field Types (Next Iteration)
// | 'tel'
// | 'url'
// | 'slider'
// | 'datetime'
// | 'time'
// | 'autocomplete'
// | 'chips'
// | 'file'
// | 'image-upload'
// | 'color'
// | 'nested-form' (1 level deep only)
```

### Validator Configurations

```typescript
// Phase 1: Field-Level Validators (First Iteration)
type ValidatorConfig =
  // Simple string validators
  | 'required'
  | 'email'
  
  // Validators with parameters
  | { type: 'minLength'; value: number }
  | { type: 'maxLength'; value: number }
  | { type: 'min'; value: number }        // For number inputs
  | { type: 'max'; value: number }        // For number inputs
  | { type: 'pattern'; value: string | RegExp; message?: string }
  
  // Custom validators (pass ValidatorFn directly)
  | { type: 'custom'; validator: ValidatorFn; message: string };

// Phase 2: Cross-Field & Complex Validators (Next Iteration)
// Form-level validation (e.g., password confirmation matching)
// Async validators (e.g., username uniqueness check)
// Enterprise validators (credit card, phone, zip code by country)

/**
 * Note: For cross-field validation (e.g., password confirmation),
 * users can add validators at the FormGroup level using the
 * getFormGroup() method and Validators.compose()
 * 
 * Example:
 * const formGroup = ashForm.getFormGroup();
 * formGroup.setValidators(passwordMatchValidator);
 */
```

### Conditional Logic

```typescript
/**
 * Conditional expression for field visibility/disabled/required logic
 */
type ConditionalExpression =
  | SimpleCondition
  | ComplexCondition;

interface SimpleCondition {
  field: string;              // Field name to watch
  operator: ComparisonOperator;
  value: any;                 // Value to compare against
}

interface ComplexCondition {
  operator: 'AND' | 'OR';     // Logical operator
  conditions: ConditionalExpression[];  // Nested conditions
}

type ComparisonOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'contains'
  | 'notContains'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'in'              // Value in array
  | 'notIn';          // Value not in array

// Example: Show 'Other' text field when 'Category' is 'other'
{
  name: 'otherCategory',
  type: 'text',
  label: 'Please specify',
  visibleWhen: {
    field: 'category',
    operator: 'equals',
    value: 'other'
  }
}

// Example: Complex condition (AND/OR logic)
{
  name: 'discountCode',
  type: 'text',
  label: 'Discount Code',
  visibleWhen: {
    operator: 'AND',
    conditions: [
      { field: 'membershipLevel', operator: 'in', value: ['gold', 'platinum'] },
      { field: 'orderTotal', operator: 'greaterThan', value: 100 }
    ]
  }
}
```

### Layout Configuration

```typescript
interface LayoutConfig {
  type: 'vertical' | 'horizontal' | 'grid' | 'wizard';
  
  // Grid Layout Options
  columns?: number;                // Number of columns (1-12)
  columnGap?: string;              // Gap between columns (CSS value)
  rowGap?: string;                 // Gap between rows
  
  // Responsive Breakpoints
  responsive?: {
    mobile?: { columns: number };   // < 768px
    tablet?: { columns: number };   // 768px - 1024px
    desktop?: { columns: number };  // > 1024px
  };
  
  // Fieldset Groups
  groups?: FieldsetGroup[];
  
  // Wizard Specific
  showStepNumbers?: boolean;
  showProgressBar?: boolean;
  allowStepJump?: boolean;          // Allow clicking steps directly
}

interface FieldsetGroup {
  id: string;
  label: string;
  description?: string;
  expanded?: boolean;               // For mat-expansion-panel
  fields: string[];                 // Field names in this group
}
```

---

## Field Types

### Implementation Architecture

Each field type is a standalone component following a consistent API:

```typescript
interface BaseFieldComponent<T = any> {
  // Inputs
  readonly control = input.required<FormControl<T>>();
  readonly config = input.required<FormFieldSchema>();
  readonly readonly = input<boolean>(false);
  
  // Outputs
  readonly valueChange = output<T>();
  readonly blur = output<void>();
  
  // Internal
  protected readonly errorMessage = computed(() => this.getErrorMessage());
}
```

### Field Type Catalog

#### 1. Text Fields

**Text, Email, Password, Tel, URL**

```typescript
// Schema
{
  name: 'email',
  type: 'email',
  label: 'Email Address',
  placeholder: 'you@example.com',
  validators: ['required', 'email'],
  hint: 'We will never share your email'
}

// Renders: <mat-form-field> with <input matInput type="email">
```

**Textarea**

```typescript
{
  name: 'bio',
  type: 'textarea',
  label: 'Biography',
  rows: 5,
  validators: [{ type: 'maxLength', value: 500 }],
  hint: 'Maximum 500 characters'
}

// Renders: <mat-form-field> with <textarea matInput>
```

#### 2. Number Fields

**Number Input**

```typescript
{
  name: 'age',
  type: 'number',
  label: 'Age',
  min: 0,
  max: 120,
  step: 1,
  validators: ['required', { type: 'min', value: 18 }]
}

// Renders: <mat-form-field> with <input matInput type="number">
```

**Slider**

```typescript
{
  name: 'rating',
  type: 'slider',
  label: 'Rate this product',
  min: 1,
  max: 5,
  step: 1,
  defaultValue: 3
}

// Renders: <mat-slider>
```

#### 3. Date/Time Fields

**Date Picker**

```typescript
{
  name: 'birthDate',
  type: 'date',
  label: 'Date of Birth',
  maxDate: new Date(), // Can't be in future
  validators: ['required']
}

// Renders: <mat-datepicker> with <input matInput>
```

**Date Range**

```typescript
{
  name: 'projectDuration',
  type: 'date-range',
  label: 'Project Timeline',
  validators: ['required']
}

// Renders: <mat-date-range-input> with start/end dates
```

#### 4. Selection Fields

**Select (Dropdown)**

```typescript
{
  name: 'country',
  type: 'select',
  label: 'Country',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' }
  ],
  validators: ['required']
}

// Renders: <mat-select>
```

**Multi-Select**

```typescript
{
  name: 'skills',
  type: 'select-multiple',
  label: 'Skills',
  options: [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' }
  ]
}

// Renders: <mat-select multiple>
```

**Radio Buttons**

```typescript
{
  name: 'subscription',
  type: 'radio',
  label: 'Subscription Plan',
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro - $9/month' },
    { value: 'enterprise', label: 'Enterprise - Contact us' }
  ]
}

// Renders: <mat-radio-group> with <mat-radio-button>
```

**Checkbox**

```typescript
{
  name: 'agreeToTerms',
  type: 'checkbox',
  label: 'I agree to the Terms and Conditions',
  validators: ['required'] // Must be checked
}

// Renders: <mat-checkbox>
```

**Checkbox Group**

```typescript
{
  name: 'interests',
  type: 'checkbox-group',
  label: 'Interests',
  options: [
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
    { value: 'travel', label: 'Travel' }
  ]
}

// Renders: Multiple <mat-checkbox> elements
```

#### 5. Special Fields

**Toggle Switch**

```typescript
{
  name: 'notifications',
  type: 'toggle',
  label: 'Enable Notifications',
  defaultValue: true
}

// Renders: <mat-slide-toggle>
```

---

### Phase 2 Field Types (Future)

The following field types are planned for the next iteration:

- **Autocomplete** - Type-ahead search with filtering
- **Slider** - Range slider for numeric inputs
- **Time Picker** - Time-only selection
- **DateTime Picker** - Combined date and time
- **File Upload** - Single file upload with validation
- **Image Upload** - Image-specific upload with preview
- **Chips** - Multi-value input with chip display
- **Color Picker** - Color selection input
- **Nested Form** - Sub-forms (1 level deep only)
- **Tel/URL** - Specialized text inputs with validation

---

## Validation System

### Architecture

```typescript
// Validation flow
User Input → FormControl → Validators → Error State → UI Error Display

// Signal-based validation state
protected readonly validationErrors = computed(() => {
  const errors: Record<string, string[]> = {};
  Object.keys(this.formGroup().controls).forEach(key => {
    const control = this.formGroup().get(key);
    if (control?.invalid && (control.dirty || control.touched)) {
      errors[key] = this.getErrorMessages(key, control.errors);
    }
  });
  return errors;
});
```

### Built-In Validators

```typescript
class AshFormValidators {
  // Standard validators
  static required = Validators.required;
  static email = Validators.email;
  static minLength(length: number) = Validators.minLength(length);
  static maxLength(length: number) = Validators.maxLength(length);
  static min(value: number) = Validators.min(value);
  static max(value: number) = Validators.max(value);
  static pattern(pattern: string | RegExp) = Validators.pattern(pattern);
  
  // Custom enterprise validators
  static creditCard(): ValidatorFn;
  static phone(country?: string): ValidatorFn;
  static zipCode(country?: string): ValidatorFn;
  static url(): ValidatorFn;
  static alphanumeric(): ValidatorFn;
  static strongPassword(): ValidatorFn;
  static dateRange(): ValidatorFn;  // For date-range fields
  static fileSize(maxBytes: number): ValidatorFn;
  static fileType(allowedTypes: string[]): ValidatorFn;
}
```

### Async Validators

```typescript
// Username uniqueness check
{
  name: 'username',
  type: 'text',
  label: 'Username',
  validators: ['required', { type: 'minLength', value: 3 }],
  asyncValidators: [{
    type: 'unique',
    validator: (control: AbstractControl) => {
      return this.userService.checkUsername(control.value).pipe(
        map(exists => exists ? { uniqueUsername: true } : null)
      );
    },
    message: 'Username is already taken',
    debounceTime: 500
  }]
}

// Renders: Shows loading spinner while validating
```

### Custom Validation Messages

```typescript
// Component-level override
<lib-ash-form
  [schema]="schema"
  [validationMessages]="{
    required: 'This field is mandatory',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {requiredLength} characters',
    uniqueUsername: 'Username already exists'
  }"
/>

// Field-level override
{
  name: 'password',
  type: 'password',
  validators: [
    'required',
    { type: 'minLength', value: 8 }
  ],
  customErrorMessages: {
    required: 'Password cannot be empty',
    minLength: 'Password must be at least 8 characters for security'
  }
}
```

### Error Display Behavior

```typescript
// Show errors when:
// 1. Field is touched (user focused and blurred)
// 2. Field is dirty (user modified value)
// 3. Form submission attempted

protected readonly showFieldError = (fieldName: string): boolean => {
  const control = this.formGroup().get(fieldName);
  return !!(control?.invalid && (control.dirty || control.touched || this.submitAttempted()));
};
```

---

## Layout Engine

### Grid Layout (Default)

```typescript
const gridLayout: LayoutConfig = {
  type: 'grid',
  columns: 12,  // 12-column grid (like Bootstrap)
  columnGap: '16px',
  rowGap: '16px',
  responsive: {
    mobile: { columns: 1 },   // Stack on mobile
    tablet: { columns: 6 },   // 2 columns on tablet
    desktop: { columns: 12 }  // Full grid on desktop
  }
};

// Field spans
{
  name: 'firstName',
  label: 'First Name',
  gridColumn: 'span 6'  // Half width
},
{
  name: 'lastName',
  label: 'Last Name',
  gridColumn: 'span 6'  // Half width
},
{
  name: 'email',
  label: 'Email',
  gridColumn: 'span 12'  // Full width
}

// Renders:
// [ First Name    ][ Last Name     ]
// [ Email_________________________ ]
```

### Fieldset Groups

```typescript
const groupedLayout: LayoutConfig = {
  type: 'grid',
  columns: 2,
  groups: [
    {
      id: 'personal',
      label: 'Personal Information',
      description: 'Basic details about you',
      expanded: true,
      fields: ['firstName', 'lastName', 'birthDate']
    },
    {
      id: 'contact',
      label: 'Contact Information',
      fields: ['email', 'phone', 'address']
    }
  ]
};

// Renders: <mat-expansion-panel> for each group
```

### Vertical Layout

```typescript
const verticalLayout: LayoutConfig = {
  type: 'vertical'  // Single column, full width fields
};
```

### Wizard Layout (Multi-Step)

See [Multi-Step Wizard](#multi-step-wizard) section.

---

## Multi-Step Wizard

### Configuration

```typescript
interface WizardConfig {
  steps: WizardStep[];
  showProgressBar?: boolean;      // Show progress indicator
  showStepNumbers?: boolean;      // Show "Step 1 of 3"
  allowStepJump?: boolean;        // Allow clicking on step headers
  validateOnStepChange?: boolean; // Validate before allowing next step
  showStepperLabels?: boolean;    // Show step labels in stepper
}

interface WizardStep {
  id: string;
  label: string;
  icon?: string;                  // Material icon name
  fields: string[];               // Field names in this step
  description?: string;           // Help text for step
  canSkip?: boolean;              // Allow skipping this step
  customValidator?: (formGroup: FormGroup) => ValidationErrors | null;
}
```

### Example: User Registration Wizard

```typescript
const registrationWizard: WizardConfig = {
  steps: [
    {
      id: 'account',
      label: 'Create Account',
      icon: 'person',
      description: 'Basic account information',
      fields: ['username', 'email', 'password', 'confirmPassword']
    },
    {
      id: 'profile',
      label: 'Profile Details',
      icon: 'badge',
      description: 'Tell us about yourself',
      fields: ['firstName', 'lastName', 'birthDate', 'bio'],
      canSkip: true
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: 'settings',
      description: 'Customize your experience',
      fields: ['theme', 'language', 'notifications']
    },
    {
      id: 'review',
      label: 'Review & Submit',
      icon: 'check_circle',
      description: 'Confirm your information',
      fields: [] // Review step shows summary
    }
  ],
  showProgressBar: true,
  showStepNumbers: true,
  allowStepJump: false,
  validateOnStepChange: true
};

// Component usage
<lib-ash-form
  [schema]="registrationSchema"
  [wizardConfig]="registrationWizard"
  (stepChange)="onStepChange($event)"
  (submit)="onRegistrationComplete($event)"
/>
```

### Wizard Navigation

```typescript
// Renders: <mat-stepper> with navigation buttons
// • Previous button (disabled on first step)
// • Next button (validates current step)
// • Submit button (only on last step)

// Step validation
protected canProceedToNextStep(): boolean {
  const currentStep = this.getCurrentStep();
  const fieldsInStep = currentStep.fields;
  
  // Check if all fields in current step are valid
  return fieldsInStep.every(fieldName => {
    const control = this.formGroup().get(fieldName);
    return control?.valid ?? true;
  });
}
```

---

## Advanced Features

### 1. Conditional Logic Engine

**Implementation:**

```typescript
protected readonly conditionalEngine = computed(() => {
  const formValue = this.formGroup().value;
  const visibility: Record<string, boolean> = {};
  
  this.schema().forEach(field => {
    if (field.visibleWhen) {
      visibility[field.name] = this.evaluateCondition(field.visibleWhen, formValue);
    } else {
      visibility[field.name] = true;
    }
  });
  
  return visibility;
});

private evaluateCondition(expr: ConditionalExpression, formValue: any): boolean {
  if ('field' in expr) {
    // Simple condition
    const fieldValue = this.getNestedValue(formValue, expr.field);
    return this.compare(fieldValue, expr.operator, expr.value);
  } else {
    // Complex condition (AND/OR)
    if (expr.operator === 'AND') {
      return expr.conditions.every(c => this.evaluateCondition(c, formValue));
    } else {
      return expr.conditions.some(c => this.evaluateCondition(c, formValue));
    }
  }
}
```

### 2. Computed/Calculated Fields

```typescript
{
  name: 'totalPrice',
  type: 'number',
  label: 'Total Price',
  readonly: true,
  dependsOn: ['quantity', 'unitPrice'],
  computedValue: (formValue) => {
    return (formValue.quantity || 0) * (formValue.unitPrice || 0);
  }
}

// Automatically recalculates when dependencies change
```

### 3. Cascading Dropdowns

```typescript
{
  name: 'country',
  type: 'select',
  label: 'Country',
  options: [...]
},
{
  name: 'state',
  type: 'select',
  label: 'State/Province',
  dependsOn: ['country'],
  autocompleteSource: {
    type: 'async',
    loadOptions: (formValue) => {
      return this.locationService.getStates(formValue.country);
    }
  }
}

// State options update when country changes
```

### 4. Auto-Save / Draft Saving (Optional - Nice to Have)

**Use Cases for Auto-Save:**

1. **Long Forms** - Multi-section forms that take 10+ minutes to complete (e.g., loan applications, surveys)
2. **Browser Crash Recovery** - Preserve user input if browser closes unexpectedly
3. **Multi-Session Forms** - Allow users to start a form on mobile, finish on desktop
4. **High-Stakes Forms** - Applications where data loss would be critical (job applications, grant proposals)
5. **Collaborative Forms** - Draft sharing between team members

**When NOT to Use Auto-Save:**
- Simple login/registration forms (< 5 fields)
- Forms with sensitive data that shouldn't be cached
- One-time submission forms with no edit workflow

**Implementation (Conditional Feature):**

```typescript
// Only configure auto-save when needed
const autoSaveConfig: AutoSaveConfig | null = this.isLongForm ? {
  enabled: true,
  debounceTime: 2000,        // Save 2 seconds after last change
  storageKey: 'form-draft',  // LocalStorage key
  storage: 'local',          // 'local' | 'session'
  onSave: (formValue) => {
    // Optional backend save
    return this.api.saveDraft(formValue);
  },
  onRestore: () => {
    // Optional backend load
    return this.api.loadDraft();
  }
} : null;

<lib-ash-form
  [schema]="schema"
  [autoSave]="autoSaveConfig"  // null disables feature
  (autoSaveStatus)="onAutoSave($event)"
/>

// When enabled, displays: "Draft saved at 2:35 PM" indicator
```

**Note:** Auto-save is an optional feature. If `autoSave` input is null/undefined, the feature is completely disabled with zero overhead.

### 5. Real-Time Preview

```typescript
<lib-ash-form [schema]="schema" (valueChange)="updatePreview($event)">
  <div preview>
    <!-- Custom preview template -->
    <h3>Live Preview</h3>
    <p>{{ previewData().fullName }}</p>
    <p>{{ previewData().email }}</p>
  </div>
</lib-ash-form>
```

---

## Theming Integration

### Component Theme Mixin

```scss
// _ash-form-theme.scss
@use '@angular/material' as mat;

@mixin theme($theme: null) {
  lib-ash-form {
    // Use Material system tokens
    --ash-form-field-bg: var(--mat-sys-surface-container);
    --ash-form-field-border: var(--mat-sys-outline);
    --ash-form-field-border-focus: var(--mat-sys-primary);
    --ash-form-label-color: var(--mat-sys-on-surface);
    --ash-form-hint-color: var(--mat-sys-on-surface-variant);
    --ash-form-error-color: var(--mat-sys-error);
    --ash-form-required-marker: var(--mat-sys-error);
    
    // Spacing
    --ash-form-field-spacing: 16px;
    --ash-form-group-spacing: 24px;
    
    // Wizard
    --ash-form-wizard-step-bg: var(--mat-sys-surface-container-high);
    --ash-form-wizard-step-active: var(--mat-sys-primary-container);
    --ash-form-wizard-progress: var(--mat-sys-primary);
  }
}
```

### Custom Branding Override

```scss
// Implementation project styles.scss
@use '@angular/material' as mat;
@use '@yourscope/ash-ui-lib/theming' as ash;

html.light-theme {
  color-scheme: light;
  @include mat.theme((
    color: (theme-type: light, primary: mat.$violet-palette),
    typography: (plain-family: Roboto, brand-family: Roboto, bold-weight: 600),
    density: 0
  ));
  @include ash.all-component-themes();
  
  // Custom form overrides
  lib-ash-form {
    --ash-form-field-spacing: 20px;  // More spacing
    --ash-form-required-marker: #d32f2f;  // Custom red
  }
}
```

---

## Accessibility

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | All fields accessible via Tab/Shift+Tab, Enter to submit |
| **Screen Reader** | Proper ARIA labels, roles, and descriptions |
| **Focus Management** | Visible focus indicators, logical tab order |
| **Error Identification** | Errors announced by screen readers |
| **Color Contrast** | 4.5:1 minimum for text, 3:1 for UI components |
| **Form Labels** | All inputs have associated labels |
| **Required Fields** | Visual and ARIA indication of required fields |

### Implementation Details

```html
<!-- Generated markup example -->
<mat-form-field class="ash-form-field">
  <mat-label id="email-label">
    Email Address
    @if (field.required) {
      <span class="required-marker" aria-hidden="true">*</span>
    }
  </mat-label>
  
  <input
    matInput
    type="email"
    [formControl]="control"
    [aria-labelledby]="'email-label'"
    [aria-describedby]="'email-hint email-error'"
    [aria-required]="field.required"
    [aria-invalid]="control.invalid && control.touched"
  />
  
  @if (field.hint) {
    <mat-hint id="email-hint">{{ field.hint }}</mat-hint>
  }
  
  @if (showFieldError('email')) {
    <mat-error id="email-error" role="alert">
      {{ getErrorMessage('email') }}
    </mat-error>
  }
</mat-form-field>
```

### Keyboard Shortcuts

```typescript
// Built-in keyboard support
Enter → Submit form (when not in textarea)
Escape → Reset form / Cancel wizard step
Ctrl+S → Trigger auto-save (if enabled)
Alt+N → Next wizard step
Alt+P → Previous wizard step
```

---

## Performance

### Optimization Strategies

| Strategy | Implementation |
|----------|----------------|
| **OnPush Change Detection** | All components use `ChangeDetectionStrategy.OnPush` |
| **Debounced Validation** | Async validators debounced by 500ms |
| **Lazy Field Rendering** | Only render visible fields (conditional logic) |
| **Virtual Scrolling** | For forms with 100+ fields |
| **Memoized Computed Values** | Use `computed()` for derived state |
| **Efficient Event Handling** | Debounce valueChange events |

### Performance Targets

```typescript
// Benchmarks (target performance)
- Render 100 fields: < 200ms
- Field type-ahead validation: < 100ms
- Conditional field show/hide: < 50ms
- Wizard step transition: < 100ms
- Auto-save trigger: < 500ms (debounced)
```

### Code Splitting

```typescript
// Lazy load field components
const FIELD_COMPONENTS = {
  'rich-text': () => import('./fields/rich-text-field'),
  'image-upload': () => import('./fields/image-upload-field'),
  'nested-form': () => import('./fields/nested-form-field')
};

// Only load when field type is used
```

---

## Implementation Checklist

### Phase 1: Core Foundation & Priority Fields (Week 1-3)

#### Week 1: Core Architecture

- [ ] **Project Setup**
  - [ ] Create `ash-form` component directory structure
  - [ ] Set up base component with signals and reactive forms
  - [ ] Create TypeScript interfaces: `FormFieldSchema`, `LayoutConfig`, `FormSubmitEvent`
  - [ ] Study Angular's [Dynamic Forms Guide](https://angular.dev/guide/forms/dynamic-forms)
  
- [ ] **Schema Parser & Form Builder**
  - [ ] Implement `buildFormGroup()` method to create FormGroup from schema
  - [ ] Handle nested fields with dot notation (e.g., 'address.city')
  - [ ] Apply validators from schema configuration
  - [ ] Support defaultValue initialization
  
- [ ] **Base Field Component**
  - [ ] Create `BaseFieldComponent` interface/abstract class
  - [ ] Common field properties: control, config, readonly
  - [ ] Error message computation logic
  - [ ] Shared styles and accessibility attributes

#### Week 2: Priority Field Types (Text & Number)

- [ ] **Text Input Fields**
  - [ ] Text (`<input type="text">`)
  - [ ] Email (`<input type="email">`)
  - [ ] Password (`<input type="password">`)
  - [ ] Textarea (`<textarea>`)
  
- [ ] **Number Input**
  - [ ] Number (`<input type="number">` with min/max/step)
  
- [ ] **Field Rendering Logic**
  - [ ] Dynamic component loader based on field type
  - [ ] Material form field wrapper integration
  - [ ] Label, hint, and error message display

#### Week 3: Selection & Special Fields

- [ ] **Selection Fields**
  - [ ] Select dropdown (`<mat-select>`)
  - [ ] Multi-select (`<mat-select multiple>`)
  - [ ] Radio group (`<mat-radio-group>`)
  - [ ] Single checkbox (`<mat-checkbox>`)
  - [ ] Checkbox group (multiple `<mat-checkbox>` with array value)
  
- [ ] **Date Fields**
  - [ ] Date picker (`<mat-datepicker>`)
  - [ ] Date range (`<mat-date-range-picker>`)
  
- [ ] **Special Fields**
  - [ ] Toggle switch (`<mat-slide-toggle>`)
  
- [ ] **Layout Engine - Grid**
  - [ ] CSS Grid implementation (12-column system)
  - [ ] Responsive breakpoints (mobile/tablet/desktop)
  - [ ] Field spanning with `gridColumn` property
  - [ ] Vertical layout option

### Phase 2: Validation & Conditional Logic (Week 4)

- [ ] **Field-Level Validation System**
  - [ ] Required validator
  - [ ] Email validator
  - [ ] Min/max length validators
  - [ ] Min/max value validators (for numbers)
  - [ ] Pattern (regex) validator
  - [ ] Custom validator function support
  
- [ ] **Error Display**
  - [ ] Show errors when field is touched/dirty
  - [ ] Per-field custom error messages
  - [ ] Component-level error message override
  - [ ] Error message templating (e.g., "Must be at least {requiredLength} characters")
  - [ ] ARIA error announcements for accessibility
  
- [ ] **Conditional Logic Engine (Simple)**
  - [ ] Implement `visibleWhen` for field visibility
  - [ ] Implement `disabledWhen` for field disabled state
  - [ ] Support simple conditions (field equals/not equals value)
  - [ ] Reactive updates based on form value changes

### Phase 3: Form Submission & State Management (Week 5)

- [ ] **Form Submission**
  - [ ] Submit button integration
  - [ ] Form validation on submit
  - [ ] Submit event emission with typed payload
  - [ ] Loading state during submission
  - [ ] Prevent double submission
  
- [ ] **Form State Management**
  - [ ] Value change output (debounced)
  - [ ] Form valid/invalid state signals
  - [ ] Dirty/pristine state tracking
  - [ ] Reset form functionality
  - [ ] Patch values programmatically
  
- [ ] **Public API Methods**
  - [ ] `submit()` - Programmatic submission
  - [ ] `reset()` - Reset to initial values
  - [ ] `patchValue()` - Update partial values
  - [ ] `getValue()` - Get current form value
  - [ ] `isValid()` - Check form validity
  - [ ] `getFormGroup()` - Access underlying FormGroup

### Phase 4: Layout & Grouping (Week 6)

- [ ] **Fieldset Groups**
  - [ ] Organize fields into logical groups
  - [ ] Group labels and descriptions
  - [ ] Optional expansion panels for collapsible groups
  - [ ] Group-based field ordering
  
- [ ] **Responsive Layout**
  - [ ] Mobile breakpoint (stack to single column)
  - [ ] Tablet breakpoint (2-column grid)
  - [ ] Desktop breakpoint (full 12-column grid)
  - [ ] Custom column configuration per breakpoint

### Phase 5: Theming & Accessibility (Week 7)

- [ ] **Theme Integration**
  - [ ] Create _ash-form-theme.scss
  - [ ] Define CSS custom properties
  - [ ] Dark mode support
  - [ ] Density variants
  
- [ ] **RTL Support**
  - [ ] Logical CSS properties
  - [ ] Directionality detection
  - [ ] RTL field layouts
  
- [ ] **Accessibility**
  - [ ] ARIA labels and roles
  - [ ] Keyboard navigation
  - [ ] Focus management
  - [ ] Screen reader testing
  - [ ] Color contrast validation

### Phase 6: Testing (Week 8)

- [ ] **Unit Tests (Jest)**
  - [ ] Schema parser tests
  - [ ] FormGroup builder tests
  - [ ] Validation tests (all validators)
  - [ ] Conditional logic tests
  - [ ] Each field type component (12 field types)
  - [ ] Public API method tests
  
- [ ] **Integration Tests**
  - [ ] Form submission flow
  - [ ] Conditional field visibility
  - [ ] Error display scenarios
  - [ ] Form reset and patch value
  
- [ ] **E2E Tests (Playwright)**
  - [ ] Simple form: fill and submit
  - [ ] Validation errors: trigger and clear
  - [ ] Conditional logic: field show/hide
  - [ ] Accessibility: keyboard navigation, screen reader
  - [ ] Responsive: mobile, tablet, desktop layouts
  
- [ ] **Code Coverage**
  - [ ] Target 80%+ coverage
  - [ ] Focus on critical paths

### Phase 7: Documentation & Examples (Week 9-10)

- [ ] **Storybook Stories**
  - [ ] Basic form example
  - [ ] Complex form with all field types
  - [ ] Conditional logic showcase
  - [ ] Multi-step wizard example
  - [ ] Auto-save demo
  
- [ ] **API Documentation**
  - [ ] Auto-generate from TypeScript
  - [ ] Usage examples for each feature
  
- [ ] **Demo App Integration**
  - [ ] Create form playground page
  - [ ] Live schema editor
  - [ ] Form preview

---

## Usage Examples

### Example 1: Simple Login Form

```typescript
// login.component.ts
import { Component, signal } from '@angular/core';
import { AshForm, FormFieldSchema } from 'ash-ui-lib';

@Component({
  selector: 'app-login',
  imports: [AshForm],
  template: `
    <lib-ash-form
      [schema]="loginSchema()"
      [loading]="isSubmitting()"
      (submit)="onLogin($event)"
    />
  `
})
export class LoginComponent {
  protected readonly isSubmitting = signal(false);
  
  protected readonly loginSchema = signal<FormFieldSchema[]>([
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
  ]);
  
  protected onLogin(event: FormSubmitEvent): void {
    this.isSubmitting.set(true);
    this.authService.login(event.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.isSubmitting.set(false)
    });
  }
}
```

### Example 2: User Registration with Conditional Logic

```typescript
// registration-form.ts
protected readonly registrationSchema = signal<FormFieldSchema[]>([
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
    }
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
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    validators: ['required', 'email'],
    asyncValidators: [{
      type: 'unique',
      validator: (control) => this.checkEmailUnique(control.value),
      message: 'Email already registered',
      debounceTime: 500
    }],
    gridColumn: 'span 12'
  }
]);
```

### Example 3: Multi-Step Survey Wizard

```typescript
// survey.component.ts
protected readonly surveySchema = signal<FormFieldSchema[]>([
  // Step 1 fields
  { name: 'fullName', type: 'text', label: 'Full Name', validators: ['required'] },
  { name: 'age', type: 'number', label: 'Age', validators: ['required'] },
  
  // Step 2 fields
  { name: 'occupation', type: 'text', label: 'Occupation' },
  { name: 'experience', type: 'slider', label: 'Years of Experience', min: 0, max: 50 },
  
  // Step 3 fields
  { name: 'satisfaction', type: 'radio', label: 'Satisfaction Level', options: [...] },
  { name: 'comments', type: 'textarea', label: 'Additional Comments', rows: 5 }
]);

protected readonly wizardConfig = signal<WizardConfig>({
  steps: [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: 'person',
      fields: ['fullName', 'age']
    },
    {
      id: 'professional',
      label: 'Professional Background',
      icon: 'work',
      fields: ['occupation', 'experience'],
      canSkip: true
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: 'rate_review',
      fields: ['satisfaction', 'comments']
    }
  ],
  showProgressBar: true,
  validateOnStepChange: true
});

// Template
<lib-ash-form
  [schema]="surveySchema()"
  [wizardConfig]="wizardConfig()"
  (stepChange)="onStepChange($event)"
  (submit)="onSurveySubmit($event)"
/>
```

### Example 4: Product Order Form with Calculated Fields

```typescript
protected readonly orderSchema = signal<FormFieldSchema[]>([
  {
    name: 'product',
    type: 'select',
    label: 'Product',
    options: [
      { value: 'widget-a', label: 'Widget A - $29.99' },
      { value: 'widget-b', label: 'Widget B - $49.99' },
      { value: 'widget-c', label: 'Widget C - $99.99' }
    ],
    validators: ['required'],
    gridColumn: 'span 6'
  },
  {
    name: 'quantity',
    type: 'number',
    label: 'Quantity',
    min: 1,
    max: 100,
    defaultValue: 1,
    validators: ['required', { type: 'min', value: 1 }],
    gridColumn: 'span 6'
  },
  {
    name: 'subtotal',
    type: 'number',
    label: 'Subtotal',
    readonly: true,
    dependsOn: ['product', 'quantity'],
    computedValue: (formValue) => {
      const prices = { 'widget-a': 29.99, 'widget-b': 49.99, 'widget-c': 99.99 };
      return (prices[formValue.product] || 0) * (formValue.quantity || 0);
    },
    gridColumn: 'span 6'
  },
  {
    name: 'discount',
    type: 'number',
    label: 'Discount (%)',
    min: 0,
    max: 50,
    defaultValue: 0,
    gridColumn: 'span 6'
  },
  {
    name: 'total',
    type: 'number',
    label: 'Total Price',
    readonly: true,
    dependsOn: ['subtotal', 'discount'],
    computedValue: (formValue) => {
      const subtotal = formValue.subtotal || 0;
      const discount = formValue.discount || 0;
      return subtotal - (subtotal * discount / 100);
    },
    gridColumn: 'span 12',
    cssClass: 'total-price-field'
  }
]);
```

### Example 5: Auto-Save Draft Form

```typescript
protected readonly autoSaveConfig = signal<AutoSaveConfig>({
  enabled: true,
  debounceTime: 2000,
  storageKey: 'contact-form-draft',
  storage: 'local',
  onSave: (formValue) => {
    console.log('Draft saved:', formValue);
    // Optional: Save to backend
    return this.api.saveDraft(formValue);
  },
  onRestore: () => {
    // Load draft on component init
    return this.api.loadDraft();
  }
});

<lib-ash-form
  [schema]="contactSchema()"
  [autoSave]="autoSaveConfig()"
  (autoSaveStatus)="onAutoSave($event)"
/>

// Show auto-save indicator
protected onAutoSave(event: AutoSaveStatusEvent): void {
  if (event.success) {
    this.snackBar.open('Draft saved', '', { duration: 2000 });
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// ash-form.spec.ts
describe('AshForm', () => {
  it('should build FormGroup from schema', () => {
    const schema: FormFieldSchema[] = [
      { name: 'email', type: 'email', validators: ['required', 'email'] },
      { name: 'age', type: 'number', validators: [{ type: 'min', value: 18 }] }
    ];
    
    component.schema.set(schema);
    fixture.detectChanges();
    
    const formGroup = component.getFormGroup();
    expect(formGroup.get('email')).toBeTruthy();
    expect(formGroup.get('age')).toBeTruthy();
    expect(formGroup.get('email')?.hasValidator(Validators.required)).toBe(true);
  });
  
  it('should show field when condition is met', () => {
    const schema: FormFieldSchema[] = [
      { name: 'type', type: 'select', options: [...] },
      {
        name: 'other',
        type: 'text',
        visibleWhen: { field: 'type', operator: 'equals', value: 'other' }
      }
    ];
    
    component.schema.set(schema);
    component.patchValue({ type: 'other' });
    fixture.detectChanges();
    
    const otherField = fixture.debugElement.query(By.css('[name="other"]'));
    expect(otherField).toBeTruthy();
  });
  
  it('should emit submit event with valid data', () => {
    const submitSpy = jasmine.createSpy('submit');
    component.submit.subscribe(submitSpy);
    
    component.patchValue({ email: 'test@example.com', age: 25 });
    component.submit();
    
    expect(submitSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        value: { email: 'test@example.com', age: 25 },
        valid: true
      })
    );
  });
});
```

### Integration Tests

```typescript
// wizard.spec.ts
describe('AshForm Wizard Mode', () => {
  it('should navigate through wizard steps', () => {
    const wizardConfig: WizardConfig = {
      steps: [
        { id: 'step1', label: 'Step 1', fields: ['field1'] },
        { id: 'step2', label: 'Step 2', fields: ['field2'] }
      ]
    };
    
    component.wizardConfig.set(wizardConfig);
    fixture.detectChanges();
    
    // Verify first step visible
    expect(component.getCurrentStepIndex()).toBe(0);
    
    // Fill first step and proceed
    component.patchValue({ field1: 'value1' });
    const nextButton = fixture.debugElement.query(By.css('.wizard-next'));
    nextButton.nativeElement.click();
    fixture.detectChanges();
    
    // Verify second step visible
    expect(component.getCurrentStepIndex()).toBe(1);
  });
});
```

### E2E Tests (Playwright)

```typescript
// form.e2e.ts
import { test, expect } from '@playwright/test';

test('should submit contact form successfully', async ({ page }) => {
  await page.goto('/contact');
  
  // Fill form
  await page.fill('input[name="name"]', 'John Doe');
  await page.fill('input[name="email"]', 'john@example.com');
  await page.fill('textarea[name="message"]', 'Test message');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verify success
  await expect(page.locator('.success-message')).toBeVisible();
});

test('should show validation errors', async ({ page }) => {
  await page.goto('/contact');
  
  // Submit without filling
  await page.click('button[type="submit"]');
  
  // Verify errors shown
  await expect(page.locator('mat-error:has-text("required")')).toBeVisible();
});

test('should complete multi-step wizard', async ({ page }) => {
  await page.goto('/registration');
  
  // Step 1
  await page.fill('input[name="username"]', 'testuser');
  await page.click('button:has-text("Next")');
  
  // Step 2
  await page.fill('input[name="firstName"]', 'Test');
  await page.fill('input[name="lastName"]', 'User');
  await page.click('button:has-text("Next")');
  
  // Step 3
  await page.check('input[name="agreeToTerms"]');
  await page.click('button:has-text("Submit")');
  
  // Verify completion
  await expect(page.locator('.registration-success')).toBeVisible();
});
```

---

## Next Steps

### Design Review

Before implementation, please review and provide feedback on:

1. **Schema API** - Is the `FormFieldSchema` interface comprehensive enough? Any missing field types or configuration options?

2. **Validation Approach** - Are the built-in validators sufficient? Any additional validators needed for enterprise use?

3. **Conditional Logic** - Is the `ConditionalExpression` syntax intuitive? Would you prefer a different DSL?

4. **Wizard Configuration** - Does the `WizardConfig` cover all multi-step scenarios? Any missing features?

5. **Auto-Save** - Is the `AutoSaveConfig` flexible enough for different storage backends?

6. **Nested Forms** - How deep should nested form support go? Should we support recursive nesting?

7. **Performance Targets** - Are the performance benchmarks realistic for your use cases?

8. **Field Type Priority** - Should we implement any field types earlier in the schedule?

### Implementation Notes

**Alignment with Angular's Dynamic Forms:**
This design closely follows Angular's official [Dynamic Forms Guide](https://angular.dev/guide/forms/dynamic-forms) with these modern enhancements:

1. **Signals Instead of Observables** - Use signals for reactive state (Angular 16+)
2. **Standalone Components** - No NgModules, tree-shakable architecture
3. **Material Design 3** - Modern theming with CSS custom properties
4. **TypeScript Generics** - Type-safe form models
5. **Enhanced Validation** - More built-in validators and better error messaging
6. **Conditional Logic** - Declarative field visibility/disabled rules
7. **Enterprise Features** - Layout engine, grouping, accessibility

**Phase 1 Scope Summary:**
- ✅ 12 field types (text, number, select, radio, checkbox, date, toggle)
- ✅ Field-level validation (required, email, min/max, pattern, custom)
- ✅ Conditional logic (simple show/hide based on other fields)
- ✅ Grid layout with responsive breakpoints
- ✅ Fieldset grouping
- ✅ Material Design 3 theming
- ✅ WCAG 2.1 AA accessibility
- ⏭️ Wizard mode (Phase 2)
- ⏭️ Auto-save (Optional, when needed)
- ⏭️ Nested forms (1 level, Phase 2)
- ⏭️ Cross-field validation (Phase 2)

**Timeline:** 10 weeks for Phase 1 (core features, testing, documentation)

### Approval Checklist (Phase 1)

- [x] Schema API approved
- [x] Field types list finalized (12 priority fields)
- [x] Validation strategy confirmed (field-level only)
- [x] Layout system approved (grid + fieldset groups)
- [x] Wizard moved to Phase 2 (simple forms first)
- [x] Auto-save marked as optional/conditional
- [x] Nested forms limited to 1 level (Phase 2)
- [x] Rich text editor excluded
- [x] Form builder UI excluded
- [x] Angular Dynamic Forms guide referenced
- [ ] Implementation timeline acceptable (10 weeks)
- [ ] Testing strategy approved (80% coverage target)

---

**Ready to proceed with implementation once design is approved!** 🚀
