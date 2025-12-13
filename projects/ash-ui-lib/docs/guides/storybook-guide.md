# Storybook Guide for Ash UI Lib

*Enterprise-Grade Component Documentation \& Testing*

**Version 1.0** | **Angular 20+** | **December 2025**

***

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Concepts](#core-concepts)
3. [Enterprise Checklist](#enterprise-checklist)
4. [Best Practices](#best-practices)
5. [Common Patterns](#common-patterns)
6. [Commands Reference](#commands-reference)

***

## 🚀 Quick Start (2 Minutes)

### Prerequisites

```
Angular 20+ workspace with ash-new-lib
Angular Material installed
```


### Installation

```bash
# From workspace root (where angular.json exists)
npx storybook@latest init
```

**Select `ash-new-lib` when prompted**

### Verify

```bash
npm run storybook
```

**→ http://localhost:6006**

***

## 🎯 Core Concepts

### Stories = Component Variants

```
1 Story = 1 specific use case
8 Stories = Complete component documentation
```


### File Organization

```
projects/ash-new-lib/src/lib/ash-table/
├── ash-table.component.ts
└── ash-table.component.stories.ts  ← Always co-located
```


### Basic Template

```typescript
import { Meta, StoryObj } from '@storybook/angular';
import { AshTableComponent } from './ash-table.component';

const meta: Meta<AshTableComponent> = {
  title: 'Enterprise/AshTable',
  component: AshTableComponent,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<AshTableComponent>;

export const Empty: Story = { args: { dataSource: [] } };
```


***

## 🏆 Enterprise Checklist

| \# | Story Type | Purpose | Implementation |
| :-- | :-- | :-- | :-- |
| 1 | **Empty** | No data state | `dataSource: []` |
| 2 | **Loading** | Async loading | `loading: true` |
| 3 | **Default** | Primary use case | 25 realistic rows |
| 4 | **Large** | Performance | 5K+ rows |
| 5 | **Error** | Failure state | `error: true` |
| 6 | **Mobile** | Responsive | `viewport: 'iphonex'` |
| 7 | **Dark Mode** | Theming | `class="dark-theme"` |
| 8 | **RTL** | International | `dir="rtl"` |


***

## 📋 Best Practices

### 1. Empty State

```typescript
export const Empty: Story = {
  args: {
    columns: [{ key: 'name', label: 'Customer' }],
    dataSource: []
  },
  parameters: {
    docs: { 
      description: { 
        story: 'Displays skeleton UI when no data available' 
      } 
    }
  }
};
```


### 2. Loading State

```typescript
export const Loading: Story = {
  args: {
    ...Empty.args,
    loading: true
  }
};
```


### 3. Default (Realistic)

```typescript
const sampleData = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Customer ${i + 1}`,
  revenue: Math.floor(Math.random() * 100000) + 10000
}));

export const Default: Story = {
  args: { 
    columns: [
      { key: 'name', label: 'Customer' },
      { key: 'revenue', label: 'Revenue ($)', type: 'currency' }
    ],
    dataSource: sampleData 
  }
};
```


### 4. Performance Test

```typescript
const largeData = Array.from({ length: 5000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  value: Math.random() * 100
}));

export const Performance: Story = {
  name: '5,000 Rows',
  args: { dataSource: largeData }
};
```


### 5. Error State

```typescript
export const ErrorState: Story = {
  args: {
    ...Empty.args,
    error: true,
    errorMessage: 'Failed to fetch customer data'
  }
};
```


### 6. Mobile Responsive

```typescript
export const Mobile: Story = {
  ...Default,
  parameters: {
    viewport: {
      defaultViewport: 'iphonex'
    }
  }
};
```


***

## 🎛 Controls (Interactive Demo)

```typescript
const meta: Meta<AshTableComponent> = {
  // ... other config
  argTypes: {
    loading: { 
      control: 'boolean',
      description: 'Show loading spinner'
    },
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multi'],
      description: 'Row selection behavior'
    },
    pageSize: {
      control: 'range',
      min: 10,
      max: 100,
      step: 10
    }
  }
};
```

**Control Types:**

- `boolean` → Toggle switch
- `select` → Dropdown
- `radio` → Radio buttons
- `range` → Slider
- `color` → Color picker
- `number` → Number input

***

## 🏗️ Common Patterns

### Async Data

```typescript
import { of } from 'rxjs';

export const AsyncData: Story = {
  args: { 
    dataSource: of(sampleData) 
  }
};
```


### Multiple Sizes

```typescript
const sizes = ['compact', 'normal', 'spacious'];

export const Sizes = sizes.map(size => ({
  name: `Size: ${size}`,
  args: { size }
})) as StoryObj<AshTableComponent>[];
```


### Theming Decorator

```typescript
decorators: [
  (Story) => ({
    template: `
      <div class="mat-app-background p-4">
        <mat-card>
          <mat-card-content>
            <Story />
          </mat-card-content>
        </mat-card>
      </div>
    `
  })
]
```


***

## 📱 Viewports (Mobile Testing)

```typescript
parameters: {
  viewport: {
    defaultViewport: 'iphonex'  // iPhone X
    // Options: 'ipad', 'iphone6', 'responsive'
  }
}
```

**Available Viewports:**

- `iphonex` - 375x812
- `iphone6` - 375x667
- `ipad` - 1024x768
- `responsive` - Auto-scale

***

## 🚀 Commands Reference

```bash
npm run storybook          # Development (hot reload)
npm run build-storybook    # Static build → storybook-static/
ng build ash-new-lib       # Library build
ng test ash-new-lib        # Component tests
```


***

## ✅ Production Checklist

Before merging stories, verify:

- [ ] **8 canonical stories** created
- [ ] **Realistic data** (25+ items minimum)
- [ ] **Controls** for all `@Input()` properties
- [ ] **Mobile viewport** tested
- [ ] **Loading/Error** states covered
- [ ] **Performance** (1K+ rows) validated
- [ ] **Dark mode** compatible
- [ ] **Auto-docs** enabled (`tags: ['autodocs']`)

***

## 📤 Sharing Stories

```bash
npm run build-storybook
```

**Creates** `storybook-static/` folder with complete documentation.

**Host anywhere:**

- GitHub Pages
- Netlify (drag \& drop)
- Vercel
- Internal docs site

***

*Built for Ash UI Lib enterprise components. Follow this guide = production-ready documentation.*

**Questions?** Check your Storybook sidebar → Docs tab for auto-generated API reference.

