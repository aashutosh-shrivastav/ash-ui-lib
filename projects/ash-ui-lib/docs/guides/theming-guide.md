# Theming Guide - Ash UI Lib

**Library:** ash-ui-lib  
**Version:** 1.0  
**Framework:** Angular 21 + Material Design 3  
**Last Updated:** January 26, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Strategy](#architecture--strategy)
3. [Development Guidelines](#development-guidelines)
4. [Implementation Guidelines](#implementation-guidelines)
5. [Custom Theme Creation](#custom-theme-creation)
6. [Component-Specific Theming](#component-specific-theming)
7. [Dark Mode Support](#dark-mode-support)
8. [Best Practices](#best-practices)

---

## Overview

### What is Theming?

Theming allows organizations to apply their brand identity (colors, typography, spacing) to UI components while maintaining consistency and accessibility.

### Our Theming Philosophy

**Ash UI Lib follows Material Design 3 theming system:**

```
┌────────────────────────────────────────────┐
│   Material Design 3 Tokens                 │
│   - Color System (Primary, Secondary, etc) │
│   - Typography Scale                       │
│   - Elevation/Shadows                      │
│   - Shape (Border Radius)                  │
└──────────────┬─────────────────────────────┘
               │
┌──────────────▼─────────────────────────────┐
│   Angular Material 21 Theming API          │
│   - @angular/material Sass Mixins          │
│   - CSS Custom Properties                  │
│   - Component Theme Overrides              │
└──────────────┬─────────────────────────────┘
               │
┌──────────────▼─────────────────────────────┐
│   Ash UI Lib Components                    │
│   - Material Component Wrappers            │
│   - Custom Component Theming               │
│   - Expose CSS Variables for Branding      │
└──────────────┬─────────────────────────────┘
               │
┌──────────────▼─────────────────────────────┐
│   Implementation Project                   │
│   - Define Brand Colors                    │
│   - Apply Custom Theme                     │
│   - Override Specific Variables            │
└────────────────────────────────────────────┘
```

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Material-First** | Leverage Angular Material's theming system, don't reinvent |
| **CSS Custom Properties** | Expose key design tokens as CSS variables for easy customization |
| **Zero Config Default** | Works out-of-box with Material's prebuilt themes |
| **Progressive Enhancement** | Basic theme → Custom brand → Fine-tuned overrides |
| **Accessibility Built-In** | All themes meet WCAG 2.1 AA contrast requirements |

---

## Architecture & Strategy

### How Theming Works

#### 1. Material Design 3 Token System

Material Design 3 uses a token-based system with semantic color roles:

```
Primary Color → Used for main actions, key components
Secondary Color → Supporting actions, complementary elements
Tertiary Color → Accents, highlights
Error Color → Destructive actions, validation errors
Neutral Colors → Backgrounds, surfaces, text
```

#### 2. Angular Material 21 Theming API

Angular Material provides Sass mixins to generate themes:

```scss
@use '@angular/material' as mat;

// 1. Define a theme
$my-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$azure-palette,
    tertiary: mat.$blue-palette,
  ),
  typography: (
    brand-family: 'Roboto, sans-serif',
    plain-family: 'Roboto, sans-serif',
  ),
  density: (
    scale: 0,
  )
));

// 2. Apply theme globally
html {
  @include mat.all-component-themes($my-theme);
}
```

#### 3. Ash UI Lib Component Layer

**Our components automatically inherit Material themes AND expose additional customization:**

```scss
// components/ash-table/_ash-table-theme.scss
@use '@angular/material' as mat;

@mixin theme($theme) {
  // 1. Extract Material theme colors
  $primary: map-get($theme, primary);
  $accent: map-get($theme, accent);
  
  // 2. Apply to custom components
  lib-ash-table {
    --ash-table-header-bg: #{mat.get-theme-color($theme, primary, 50)};
    --ash-table-selected-row: #{mat.get-theme-color($theme, primary, 100)};
    --ash-table-hover-bg: #{mat.get-theme-color($theme, surface-variant)};
  }
}
```

### Theming Layers

| Layer | Responsibility | Who Configures |
|-------|----------------|----------------|
| **Material Base** | Core component theming (buttons, inputs) | Implementation project |
| **Ash Component Styles** | Custom component theming (table, dashboard) | Ash UI Lib (auto-inherits Material) |
| **CSS Variables** | Fine-grained overrides (specific colors, spacing) | Implementation project (optional) |

---

## Development Guidelines

### For Ash UI Lib Component Developers

#### 1. Component SCSS Structure

**Each component should have a separate theme file:**

```
projects/ash-ui-lib/src/lib/ash-table/
├── ash-table.ts
├── ash-table.html
├── ash-table.scss          # Component styles (structure)
└── _ash-table-theme.scss   # Theming (colors, exposed variables)
```

#### 2. Base Component Styles (ash-table.scss)

```scss
// ash-table.scss - Structural styles (NOT theme-dependent)
.ash-table-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  
  .table-wrapper {
    flex: 1;
    overflow: auto;
  }
  
  .ash-table-header {
    // Use CSS variables for colors (defined in theme file)
    background-color: var(--ash-table-header-bg);
    color: var(--ash-table-header-color);
    font-weight: 500;
    padding: 12px 16px;
  }
  
  .mat-mdc-row {
    &:hover {
      background-color: var(--ash-table-hover-bg);
    }
    
    &.selected {
      background-color: var(--ash-table-selected-row);
    }
  }
}
```

#### 3. Theme Mixin (_ash-table-theme.scss)

```scss
// _ash-table-theme.scss - Theme-dependent styles
@use 'sass:map';
@use '@angular/material' as mat;

@mixin theme($theme) {
  // Extract colors from Material theme
  $primary: mat.get-theme-color($theme, primary);
  $surface: mat.get-theme-color($theme, surface);
  $on-surface: mat.get-theme-color($theme, on-surface);
  $surface-variant: mat.get-theme-color($theme, surface-variant);
  
  lib-ash-table {
    // Define CSS variables that component uses
    --ash-table-header-bg: #{mat.get-theme-color($theme, surface-container-high)};
    --ash-table-header-color: #{$on-surface};
    --ash-table-hover-bg: #{mat.get-theme-color($theme, surface-container-highest)};
    --ash-table-selected-row: #{mat.get-theme-color($theme, primary-container)};
    --ash-table-border-color: #{mat.get-theme-color($theme, outline-variant)};
    
    // Dark mode overrides
    @if mat.get-theme-type($theme) == dark {
      --ash-table-header-bg: #{mat.get-theme-color($theme, surface-container)};
    }
  }
}

@mixin color($theme) {
  @include theme($theme);
}

@mixin typography($theme) {
  lib-ash-table {
    font-family: mat.get-theme-typography($theme, body-medium, font-family);
    font-size: mat.get-theme-typography($theme, body-medium, font-size);
  }
}

@mixin density($theme) {
  $density: mat.get-theme-density($theme);
  
  lib-ash-table {
    .mat-mdc-row {
      height: #{48px - ($density * 4px)};  // Adjust row height based on density
    }
  }
}
```

#### 4. Expose Theme Mixin in Library

```scss
// projects/ash-ui-lib/src/_theming.scss - Public API
@forward 'lib/ash-table/ash-table-theme' as ash-table-*;
@forward 'lib/ash-form/ash-form-theme' as ash-form-*;
@forward 'lib/ash-calendar/ash-calendar-theme' as ash-calendar-*;
// ... other components

// Convenience mixin to apply all component themes
@use 'lib/ash-table/ash-table-theme';
@use 'lib/ash-form/ash-form-theme';
@use 'lib/ash-calendar/ash-calendar-theme';

@mixin all-component-themes($theme) {
  @include ash-table-theme.theme($theme);
  @include ash-form-theme.theme($theme);
  @include ash-calendar-theme.theme($theme);
  // ... other components
}
```

#### 5. Design Token Naming Convention

**Use BEM-style naming for CSS variables:**

```scss
// Component-level tokens
--ash-[component]-[element]-[property]

// Examples:
--ash-table-header-bg
--ash-table-row-hover-bg
--ash-table-cell-padding
--ash-form-input-border
--ash-form-label-color
--ash-calendar-day-selected-bg
```

---

## Implementation Guidelines

### For Projects Using Ash UI Lib

#### Option 1: Use Prebuilt Material Theme (Quickest)

**Zero configuration - Just import a prebuilt theme:**

```scss
// styles.scss
@use '@angular/material' as mat;

// Import a prebuilt Material theme
@import '@angular/material/prebuilt-themes/indigo-pink.css';

// Ash UI Lib components automatically inherit this theme
// No additional configuration needed!
```

**Available prebuilt themes:**
- `indigo-pink.css` - Default Material theme
- `deeppurple-amber.css` - Deep purple primary, amber accent
- `pink-bluegrey.css` - Pink primary, blue-grey accent
- `purple-green.css` - Purple primary, green accent

#### Option 2: Define Custom Brand Theme (Recommended)

**Create a custom theme matching your brand:**

```scss
// styles.scss
@use '@angular/material' as mat;
@use '@yourscope/ash-ui-lib/theming' as ash;

// 1. Include Material core (required once)
@include mat.core();

// 2. Define your brand colors
$my-primary: mat.define-palette(mat.$indigo-palette, 500, 100, 900);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$my-warn: mat.define-palette(mat.$red-palette);

// 3. Create the theme
$my-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
    warn: $my-warn,
  ),
  typography: mat.define-typography-config(
    $font-family: 'Roboto, "Helvetica Neue", sans-serif',
  ),
  density: 0,
));

// 4. Apply Material theme
@include mat.all-component-themes($my-theme);

// 5. Apply Ash UI Lib component themes
@include ash.all-component-themes($my-theme);
```

#### Option 3: Material Design 3 Theme (Angular 21+)

**Use the new M3 theming API:**

```scss
// styles.scss
@use '@angular/material' as mat;
@use '@yourscope/ash-ui-lib/theming' as ash;

@include mat.core();

// Define M3 theme with custom colors
$my-m3-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$azure-palette,
    tertiary: mat.$blue-palette,
  ),
  typography: (
    brand-family: 'Inter, Roboto, sans-serif',
    plain-family: 'Inter, Roboto, sans-serif',
  ),
  density: (
    scale: 0,
  )
));

// Apply theme
html {
  @include mat.all-component-themes($my-m3-theme);
  @include ash.all-component-themes($my-m3-theme);
}
```

#### Option 4: CSS Variable Overrides (Fine-Tuning)

**Override specific design tokens without recompiling Sass:**

```scss
// styles.scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';

// Override Ash UI Lib component variables
:root {
  // Table overrides
  --ash-table-header-bg: #f5f5f5;
  --ash-table-selected-row: #e3f2fd;
  --ash-table-hover-bg: #fafafa;
  
  // Form overrides
  --ash-form-input-border: #ccc;
  --ash-form-label-color: #333;
  
  // Calendar overrides
  --ash-calendar-day-selected-bg: #1976d2;
  --ash-calendar-day-hover-bg: #e3f2fd;
}
```

#### Multiple Themes in One App

```scss
// styles.scss
@use '@angular/material' as mat;
@use '@yourscope/ash-ui-lib/theming' as ash;

@include mat.core();

// Light theme
$light-theme: mat.define-light-theme((/* ... */));

// Dark theme
$dark-theme: mat.define-dark-theme((/* ... */));

// Default: light theme
@include mat.all-component-themes($light-theme);
@include ash.all-component-themes($light-theme);

// Dark theme class
.dark-theme {
  @include mat.all-component-colors($dark-theme);
  @include ash.all-component-themes($dark-theme);
}
```

```typescript
// app.component.ts
export class AppComponent {
  protected isDarkMode = signal(false);
  
  toggleTheme() {
    this.isDarkMode.update(v => !v);
    document.body.classList.toggle('dark-theme');
  }
}
```

---

## Custom Theme Creation

### Step-by-Step: Create a Corporate Brand Theme

#### 1. Extract Brand Colors

```
Brand Primary: #0066CC (Corporate Blue)
Brand Secondary: #FF6B35 (Accent Orange)
Neutral: #F5F5F5 (Background)
Error: #D32F2F (Standard red)
```

#### 2. Define Material Palettes

```scss
// _brand-theme.scss
@use '@angular/material' as mat;
@use 'sass:map';

// Custom palette based on brand blue
$brand-primary: (
  50: #e3f2fd,
  100: #bbdefb,
  200: #90caf9,
  300: #64b5f6,
  400: #42a5f5,
  500: #0066CC,  // Main brand color
  600: #0055AA,
  700: #004488,
  800: #003366,
  900: #002244,
  A100: #82b1ff,
  A200: #448aff,
  A400: #2979ff,
  A700: #2962ff,
  contrast: (
    50: rgba(black, 0.87),
    100: rgba(black, 0.87),
    200: rgba(black, 0.87),
    300: rgba(black, 0.87),
    400: white,
    500: white,
    600: white,
    700: white,
    800: white,
    900: white,
    A100: rgba(black, 0.87),
    A200: white,
    A400: white,
    A700: white,
  )
);

$brand-accent: (
  50: #fff3e0,
  100: #ffe0b2,
  200: #ffcc80,
  300: #ffb74d,
  400: #ffa726,
  500: #FF6B35,  // Main accent color
  600: #fb8c00,
  700: #f57c00,
  800: #ef6c00,
  900: #e65100,
  A100: #ffd180,
  A200: #ffab40,
  A400: #ff9100,
  A700: #ff6d00,
  contrast: (
    50: rgba(black, 0.87),
    100: rgba(black, 0.87),
    200: rgba(black, 0.87),
    300: rgba(black, 0.87),
    400: rgba(black, 0.87),
    500: white,
    600: white,
    700: white,
    800: white,
    900: white,
    A100: rgba(black, 0.87),
    A200: rgba(black, 0.87),
    A400: rgba(black, 0.87),
    A700: rgba(black, 0.87),
  )
);
```

#### 3. Create Theme Object

```scss
// _brand-theme.scss (continued)
$primary-palette: mat.define-palette($brand-primary, 500, 300, 700);
$accent-palette: mat.define-palette($brand-accent, 500, 300, 700);
$warn-palette: mat.define-palette(mat.$red-palette);

$corporate-theme: mat.define-light-theme((
  color: (
    primary: $primary-palette,
    accent: $accent-palette,
    warn: $warn-palette,
  ),
  typography: mat.define-typography-config(
    $font-family: 'Inter, "Helvetica Neue", sans-serif',
    $headline-1: mat.define-typography-level(112px, 112px, 300, $letter-spacing: -0.05em),
    $headline-2: mat.define-typography-level(56px, 56px, 400, $letter-spacing: -0.02em),
    $headline-3: mat.define-typography-level(45px, 48px, 400, $letter-spacing: -0.005em),
    $headline-4: mat.define-typography-level(34px, 40px, 400),
    $headline-5: mat.define-typography-level(24px, 32px, 500),
    $headline-6: mat.define-typography-level(20px, 32px, 500),
  ),
  density: -1,  // Slightly more compact
));
```

#### 4. Apply Theme in Your App

```scss
// styles.scss
@use '@angular/material' as mat;
@use '@yourscope/ash-ui-lib/theming' as ash;
@use './brand-theme' as brand;

@include mat.core();

// Apply corporate theme
@include mat.all-component-themes(brand.$corporate-theme);
@include ash.all-component-themes(brand.$corporate-theme);

// Additional brand-specific overrides
:root {
  --ash-table-header-bg: #0066CC;
  --ash-table-header-color: white;
}
```

---

## Component-Specific Theming

### AshTable Theming

**Exposed CSS Variables:**

```scss
:root {
  // Header
  --ash-table-header-bg: /* Surface color from theme */;
  --ash-table-header-color: /* On-surface color */;
  --ash-table-header-font-weight: 500;
  
  // Rows
  --ash-table-row-bg: transparent;
  --ash-table-row-hover-bg: /* Surface-variant */;
  --ash-table-row-selected-bg: /* Primary-container */;
  --ash-table-row-border-color: /* Outline-variant */;
  
  // Cells
  --ash-table-cell-padding: 12px 16px;
  --ash-table-cell-font-size: 14px;
  
  // Pagination
  --ash-table-paginator-bg: /* Surface */;
}
```

**Example Custom Table Theme:**

```scss
// Corporate blue header with white text
lib-ash-table {
  --ash-table-header-bg: #0066CC;
  --ash-table-header-color: white;
  --ash-table-selected-row: #e3f2fd;
  --ash-table-hover-bg: #f5f5f5;
}
```

### AshDynamicForm Theming

**Exposed CSS Variables:**

```scss
:root {
  --ash-form-input-border: /* Outline */;
  --ash-form-input-focus-border: /* Primary */;
  --ash-form-label-color: /* On-surface */;
  --ash-form-error-color: /* Error */;
  --ash-form-hint-color: /* On-surface-variant */;
}
```

### AshCalendar Theming

**Exposed CSS Variables:**

```scss
:root {
  --ash-calendar-day-selected-bg: /* Primary */;
  --ash-calendar-day-hover-bg: /* Surface-variant */;
  --ash-calendar-today-border: /* Primary */;
  --ash-calendar-event-badge-bg: /* Tertiary-container */;
}
```

---

## Dark Mode Support

### Strategy

**Ash UI Lib supports dark mode through Material's theming system:**

```scss
// styles.scss
@use '@angular/material' as mat;
@use '@yourscope/ash-ui-lib/theming' as ash;

@include mat.core();

// Light theme (default)
$light-theme: mat.define-light-theme((/* ... */));
@include mat.all-component-themes($light-theme);
@include ash.all-component-themes($light-theme);

// Dark theme
$dark-theme: mat.define-dark-theme((/* ... */));

// Apply dark theme when class is present
.dark-theme {
  @include mat.all-component-colors($dark-theme);
  @include ash.all-component-themes($dark-theme);
}
```

### System Preference Detection

```typescript
// theme.service.ts
import { Injectable, signal, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  
  readonly isDarkMode = signal<boolean>(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  constructor() {
    // Listen to system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        this.isDarkMode.set(e.matches);
      });
    
    // Apply theme class
    effect(() => {
      if (this.isDarkMode()) {
        this.document.body.classList.add('dark-theme');
      } else {
        this.document.body.classList.remove('dark-theme');
      }
    });
  }
  
  toggleDarkMode(): void {
    this.isDarkMode.update(v => !v);
  }
}
```

### Dark Mode Best Practices

- ✅ Use Material's semantic color tokens (they auto-adjust)
- ✅ Test contrast ratios in dark mode (WCAG 2.1 AA: 4.5:1 for text)
- ✅ Avoid hardcoded colors (use theme colors)
- ❌ Don't invert colors blindly (can break brand identity)
- ❌ Don't forget to test images/logos in dark mode

---

## Best Practices

### 1. Always Use Theme Colors

```scss
// ❌ WRONG - Hardcoded colors
.my-component {
  background-color: #fff;
  color: #333;
}

// ✅ CORRECT - Theme colors
.my-component {
  background-color: var(--ash-table-bg, #{mat.get-theme-color($theme, surface)});
  color: mat.get-theme-color($theme, on-surface);
}
```

### 2. Provide Fallbacks for CSS Variables

```scss
// ✅ Fallback ensures component works even without custom theme
.ash-table-header {
  background-color: var(--ash-table-header-bg, #f5f5f5);
}
```

### 3. Document All CSS Variables

```scss
/**
 * CSS Variables exposed for theming:
 * 
 * --ash-table-header-bg: Header background color (default: surface-container-high)
 * --ash-table-header-color: Header text color (default: on-surface)
 * --ash-table-hover-bg: Row hover background (default: surface-variant)
 * --ash-table-selected-row: Selected row background (default: primary-container)
 */
```

### 4. Maintain WCAG Contrast

```scss
// Always verify contrast ratios
// Use tools like https://webaim.org/resources/contrastchecker/

@mixin theme($theme) {
  $primary: mat.get-theme-color($theme, primary);
  $on-primary: mat.get-theme-color($theme, on-primary);
  
  // Material ensures this contrast is WCAG AA compliant
  .ash-button-primary {
    background-color: $primary;
    color: $on-primary;  // Guaranteed contrast
  }
}
```

### 5. Test All Theme Variants

- ✅ Light theme
- ✅ Dark theme
- ✅ High contrast mode (Windows)
- ✅ Custom brand themes
- ✅ Different color blindness simulations

---

## Troubleshooting

### Issue: Theme Not Applying

**Solution:** Ensure you import Material core once:

```scss
@use '@angular/material' as mat;
@include mat.core();  // Must be called once globally
```

### Issue: Components Look Unstyled

**Solution:** Make sure to apply Ash UI Lib themes:

```scss
@use '@yourscope/ash-ui-lib/theming' as ash;
@include ash.all-component-themes($my-theme);
```

### Issue: Dark Mode Not Working

**Solution:** Use `all-component-colors` for switching (not `all-component-themes`):

```scss
.dark-theme {
  @include mat.all-component-colors($dark-theme);  // Not themes!
  @include ash.all-component-themes($dark-theme);
}
```

### Issue: CSS Variables Not Updating

**Solution:** Ensure variables are defined at the right scope:

```scss
// ❌ WRONG - Too specific
lib-ash-table .header {
  --ash-table-header-bg: red;
}

// ✅ CORRECT - Component level
lib-ash-table {
  --ash-table-header-bg: red;
}
```

---

## Quick Reference

### Common Material Palettes

| Palette | Best For |
|---------|----------|
| `mat.$indigo-palette` | Professional, corporate |
| `mat.$blue-palette` | Tech, trustworthy |
| `mat.$teal-palette` | Modern, fresh |
| `mat.$purple-palette` | Creative, luxury |
| `mat.$pink-palette` | Vibrant, youthful |
| `mat.$red-palette` | Alerts, errors |
| `mat.$orange-palette` | Energy, warning |
| `mat.$green-palette` | Success, eco |

### Material Theme Colors

```scss
// Primary colors
mat.get-theme-color($theme, primary)
mat.get-theme-color($theme, on-primary)
mat.get-theme-color($theme, primary-container)

// Surfaces
mat.get-theme-color($theme, surface)
mat.get-theme-color($theme, surface-variant)
mat.get-theme-color($theme, on-surface)

// States
mat.get-theme-color($theme, error)
mat.get-theme-color($theme, on-error)
```

---

## Conclusion

**Theming in Ash UI Lib:**
- ✅ **Material-aligned** - Extends Angular Material's robust theming system
- ✅ **Zero-config default** - Works with prebuilt themes out-of-box
- ✅ **Customizable** - CSS variables for fine-grained control
- ✅ **Accessible** - WCAG 2.1 AA contrast guaranteed
- ✅ **Dark mode ready** - Full support for light/dark themes

**For Developers:** Create theme mixins, expose CSS variables, use semantic colors.

**For Implementers:** Choose prebuilt theme OR define custom brand theme, optionally override CSS variables.

---

*Document Version: 1.0*  
*Last Updated: January 26, 2026*  
*Related Guides: [RTL Guide](rtl-guide.md), [Storybook Guide](storybook-guide.md)*
