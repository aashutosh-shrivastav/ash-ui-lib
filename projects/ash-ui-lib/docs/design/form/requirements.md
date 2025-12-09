
# AshForm Requirements

## Component Overview

The reusable enterprise-grade dynamic form component, named `AshForm`, leverages Angular Material for building complex, data-driven forms in large-scale applications. It supports schema-based generation, validation, conditional logic, and multi-step wizards while ensuring WCAG 2.1 AA accessibility and full theming integration. Designed for `ash-new-lib` library, it handles nested objects, async validation, and 100+ field configurations efficiently.

## Key Requirements

- **Schema-Driven**: Accept JSON/YAML form schema defining fields (type: text/select/checkbox/date/radio, label, validators, options).
- **Validation**: Built-in sync/async validators (required, min/max, pattern, custom), reactive forms with error display and submission state.
- **Layout**: Grid-based (rows/columns), fieldsets/groups, conditional visibility (show/hide based on other field values).
- **Submission**: Single/multi-step wizards, draft saving, progress tracking, and customizable submit/cancel actions.


## Advanced Features

- **Field Types**: Core Material inputs + chips, autocomplete, sliders, file uploads, rich text (CKEditor integration), nested sub-forms.
- **Dynamic Behavior**: Reactive conditional logic, cascading dropdowns, computed fields, real-time previews.
- **Performance \& UX**: Debounced validation, loading skeletons, auto-save, keyboard navigation, mobile-responsive breakpoints.
- **Enterprise Extras**: Audit trail, role-based field visibility, internationalization (i18n labels/placeholders), export/import form schemas.


## API Specification

| Property | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `formSchema` | `FormSchema[]` | Array of field definitions: `{name: string, type: string, label: string, validators?: ValidatorFn[], options?: any[]}` | `[]` |
| `model` | `any` | Reactive form model (supports patching) | `{}` |
| `layout` | `string \| LayoutConfig` | 'grid'/'vertical'/'wizard', or custom grid config | `'vertical'` |
| `readonly` | `boolean` | Disable editing | `false` |
| `loading` | `boolean` | Show loading overlay | `false` |

```
**Inputs/Outputs**: `@Input() wizardSteps: number`, `@Output() submit: EventEmitter<FormGroup>`, `@Output() valueChange: EventEmitter<any>`.
```


***
