# RTL (Right-to-Left) Compatibility Guide

**Library:** ash-ui-lib  
**Version:** 1.0  
**Last Updated:** January 26, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Enterprise RTL Strategy](#enterprise-rtl-strategy)
3. [Development Guidelines](#development-guidelines)
4. [Implementation Guidelines](#implementation-guidelines)
5. [Component-Specific Considerations](#component-specific-considerations)
6. [Testing & Validation](#testing--validation)
7. [Common Pitfalls](#common-pitfalls)

---

## Overview

### What is RTL Support?

RTL (Right-to-Left) support ensures components properly display and function for languages written right-to-left (Arabic, Hebrew, Persian, Urdu, etc.). This includes:

- **Layout mirroring** - UI elements flip horizontally
- **Text alignment** - Content aligns to the right
- **Icon orientation** - Directional icons flip appropriately
- **Logical properties** - Use `start/end` instead of `left/right`

### Why Enterprise-Grade RTL?

Enterprise applications must serve global markets. Poor RTL support results in:
- ❌ Broken layouts and overlapping elements
- ❌ Non-intuitive user interactions
- ❌ Failed accessibility audits
- ❌ Lost market opportunities in MENA/Israel regions

### Our Approach

**Ash UI Lib uses a layered RTL strategy:**

```
┌─────────────────────────────────────────────────┐
│   Angular Material 21 (Base RTL Support)        │
│   - CDK Bidi Module                             │
│   - Material Components RTL-ready               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│   Ash UI Lib Component Layer                    │
│   - Logical CSS properties                      │
│   - Dir-aware component logic                   │
│   - Custom style adjustments                    │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│   Implementation Project                        │
│   - Set `dir="rtl"` attribute                   │
│   - Configure locale/i18n                       │
│   - Load RTL-compatible fonts                   │
└─────────────────────────────────────────────────┘
```

---

## Enterprise RTL Strategy

### Core Principles

| Principle | Description | Example |
|-----------|-------------|---------|
| **Automatic Inheritance** | Components detect direction from DOM | `<html dir="rtl">` propagates to all components |
| **No Explicit Configuration** | Zero config needed for basic RTL | Import component → works in RTL automatically |
| **Logical Properties** | Use CSS logical properties | `margin-inline-start` not `margin-left` |
| **Bidi Service Integration** | Leverage Angular CDK's Directionality | `inject(Directionality)` for programmatic checks |
| **Graceful Degradation** | Works in both LTR and RTL contexts | Same component, different directions |

### Technology Stack

```typescript
// 1. Angular CDK Bidi Module (Foundation)
import { BidiModule, Directionality } from '@angular/cdk/bidi';

// 2. Component detects direction automatically
protected readonly dir = inject(Directionality);

// 3. Conditional logic based on direction
protected readonly isRtl = computed(() => this.dir.value === 'rtl');
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| **No `rtl` Input Flag** | Direction determined by DOM, not props (follows web standards) |
| **CSS-First Approach** | Logical properties handle 90% of cases without JS |
| **Material Alignment** | Extend Material's RTL, don't reinvent it |
| **Selective Mirroring** | Not all icons/elements should flip (e.g., logos, media controls) |

---

## Development Guidelines

### 1. CSS Best Practices

#### ✅ Use Logical Properties

```scss
// ✅ CORRECT - Auto-flips in RTL
.table-cell {
  padding-inline-start: 16px;  // Left in LTR, Right in RTL
  padding-inline-end: 8px;
  margin-inline: 12px;
  border-inline-start: 1px solid #ccc;
}

// ❌ WRONG - Hardcoded direction
.table-cell {
  padding-left: 16px;  // Always left, even in RTL
  margin-right: 8px;
}
```

#### Logical Property Reference

| Physical Property | Logical Equivalent | RTL Behavior |
|-------------------|-------------------|--------------|
| `left` | `inset-inline-start` | Becomes `right` |
| `right` | `inset-inline-end` | Becomes `left` |
| `margin-left` | `margin-inline-start` | Flips |
| `padding-right` | `padding-inline-end` | Flips |
| `border-left` | `border-inline-start` | Flips |
| `text-align: left` | `text-align: start` | Right in RTL |

#### Handle Non-Flippable Elements

```scss
// Icons that SHOULD flip (directional)
.arrow-icon {
  // Auto-flips via logical properties
  margin-inline-end: 8px;
  
  // Or explicit transform in RTL
  [dir="rtl"] & {
    transform: scaleX(-1);
  }
}

// Icons that SHOULD NOT flip (semantic)
.logo,
.media-play-button,
.checkmark-icon {
  // Prevent auto-flip
  [dir="rtl"] & {
    transform: none !important;
  }
}
```

#### Flexbox & Grid RTL

```scss
// ✅ Flexbox - Auto-reverses in RTL
.table-actions {
  display: flex;
  gap: 8px;
  // No need for flex-direction changes
}

// ✅ Grid - Use named areas or logical start/end
.dashboard-grid {
  display: grid;
  grid-template-columns: 
    [sidebar-start] 250px 
    [content-start] 1fr 
    [content-end];
}
```

### 2. Component Implementation

#### Inject Directionality Service

```typescript
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';

@Component({
  selector: 'lib-ash-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.dir]': 'dir.value',  // Expose direction to template
    '[class.rtl-mode]': 'isRtl()'  // Optional class for specific overrides
  }
})
export class AshTable {
  // Auto-detect direction from DOM
  protected readonly dir = inject(Directionality);
  
  // Computed flag for conditional logic
  protected readonly isRtl = computed(() => this.dir.value === 'rtl');
  
  // Example: Adjust sorting icons in RTL
  protected getSortIcon(direction: 'asc' | 'desc'): string {
    if (this.isRtl()) {
      return direction === 'asc' ? 'arrow_forward' : 'arrow_back';
    }
    return direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }
}
```

#### Template Adjustments

```html
<!-- Icons that should flip -->
@if (isRtl()) {
  <mat-icon class="next-icon">arrow_back</mat-icon>
} @else {
  <mat-icon class="next-icon">arrow_forward</mat-icon>
}

<!-- Or use CSS transforms -->
<button class="next-button">
  <mat-icon>arrow_forward</mat-icon>  <!-- Auto-flips via CSS -->
  Next
</button>
```

### 3. Testing During Development

```typescript
// Unit test with RTL context
describe('AshTable RTL', () => {
  it('should apply RTL styles when dir="rtl"', () => {
    const fixture = TestBed.configureTestingModule({
      providers: [
        { 
          provide: Directionality, 
          useValue: { value: 'rtl', change: new Subject() } 
        }
      ]
    }).createComponent(AshTable);
    
    fixture.detectChanges();
    
    expect(fixture.nativeElement.classList.contains('rtl-mode')).toBe(true);
  });
});
```

---

## Implementation Guidelines

### For Projects Using Ash UI Lib

#### 1. Minimum Requirements

**No special setup required!** Components auto-detect RTL from your HTML:

```html
<!-- Option A: Set at document level (recommended) -->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <title>تطبيقي</title>
  </head>
  <body>
    <app-root></app-root>  <!-- All components auto-RTL -->
  </body>
</html>
```

```typescript
// Option B: Dynamically set in Angular
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

export class AppComponent {
  private readonly document = inject(DOCUMENT);
  
  setLanguage(lang: 'en' | 'ar') {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.setAttribute('dir', dir);
    this.document.documentElement.setAttribute('lang', lang);
  }
}
```

#### 2. Angular Material Configuration

Ensure Material is imported properly:

```typescript
// app.config.ts
import { provideAnimations } from '@angular/platform-browser/animations';
import { BidiModule } from '@angular/cdk/bidi';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    // Material's Bidi module handles RTL automatically
  ]
};
```

#### 3. Font Configuration

Load fonts that support RTL languages:

```css
/* styles.scss */
@import '@angular/material/prebuilt-themes/indigo-pink.css';

/* RTL-compatible fonts */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}

[dir="rtl"] body {
  font-family: 'Noto Sans Arabic', 'Roboto', sans-serif;
}
```

#### 4. Custom Styles for RTL

If you need project-specific RTL overrides:

```scss
// Override component styles in RTL context
[dir="rtl"] {
  lib-ash-table {
    .custom-action-column {
      // Your RTL-specific adjustments
      padding-inline-start: 24px;
    }
  }
}
```

#### 5. Dynamic Direction Switching

```typescript
// language.service.ts
import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly directionSubject = new BehaviorSubject<'ltr' | 'rtl'>('ltr');
  
  readonly direction$ = this.directionSubject.asObservable();
  
  setDirection(dir: 'ltr' | 'rtl'): void {
    this.document.documentElement.setAttribute('dir', dir);
    this.directionSubject.next(dir);
    
    // Trigger Material's Directionality change detection
    // Components will auto-update
  }
  
  toggleDirection(): void {
    const current = this.directionSubject.value;
    this.setDirection(current === 'ltr' ? 'rtl' : 'ltr');
  }
}
```

#### 6. Testing Your Implementation

```typescript
// e2e-test.spec.ts (Playwright)
test('should render table correctly in RTL', async ({ page }) => {
  await page.goto('/dashboard?lang=ar');
  
  // Check dir attribute
  const dir = await page.getAttribute('html', 'dir');
  expect(dir).toBe('rtl');
  
  // Check visual regression (optional)
  await expect(page.locator('lib-ash-table')).toHaveScreenshot('table-rtl.png');
  
  // Check interactive elements
  const sortButton = page.locator('th[mat-sort-header]').first();
  await sortButton.click();
  // Verify sorting works correctly
});
```

---

## Component-Specific Considerations

### AshTable

| Feature | RTL Behavior | Implementation |
|---------|--------------|----------------|
| **Column Order** | Reverses visually | Automatic (flexbox) |
| **Sort Icons** | Position flips | Logical `margin-inline-start` |
| **Action Buttons** | Right-aligned → Left | Automatic |
| **Pagination** | Next/Prev swap | Material Paginator handles it |
| **Checkboxes** | Left side → Right | Automatic via logical properties |
| **Scroll Direction** | Inverted (browser native) | No code needed |

#### Table-Specific SCSS

```scss
// ash-table.scss
.ash-table-container {
  // Filter inputs align correctly
  .filter-input-container {
    text-align: start;  // Right in RTL
  }
  
  // Action column always on the "end" side
  .action-column {
    text-align: end;  // Left in LTR, Right in RTL
  }
  
  // Sorting icons
  .mat-sort-header-arrow {
    margin-inline-start: 6px;  // Auto-flips
  }
}
```

### AshDynamicForm

| Feature | RTL Behavior |
|---------|--------------|
| **Field Labels** | Right-aligned |
| **Input Text** | Right-to-left entry |
| **Validation Messages** | Right-aligned |
| **Multi-step Progress** | Reverses direction |

### AshCalendar

| Feature | RTL Behavior |
|---------|--------------|
| **Week Start** | Saturday (configurable) |
| **Navigation Arrows** | Flip meaning (next → ◄) |
| **Date Numerals** | Use Arabic-Indic numerals (optional) |

### AshMultiChart

| Feature | RTL Behavior |
|---------|--------------|
| **Legend Position** | Right → Left |
| **Axis Labels** | Text aligns right |
| **Tooltip** | Appears on appropriate side |

### AshDashboard

| Feature | RTL Behavior |
|---------|--------------|
| **Widget Stacking** | Right-to-left flow |
| **Resize Handles** | Mirror positions |
| **Menu Drawers** | Open from right |

---

## Testing & Validation

### Manual Testing Checklist

- [ ] Set `<html dir="rtl">` and reload app
- [ ] Verify all text aligns right
- [ ] Check icons flip appropriately (arrows, etc.)
- [ ] Verify non-directional icons don't flip (logos, checkmarks)
- [ ] Test interactions (sorting, pagination, selection)
- [ ] Verify scrollbars appear on left side (browser default)
- [ ] Check responsive behavior (mobile/tablet)
- [ ] Validate with actual RTL language content (not mirrored English)

### Automated Testing

```typescript
// Visual regression test
describe('RTL Visual Regression', () => {
  it('should match RTL snapshot', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:6006/?dir=rtl');
    
    const screenshot = await page.screenshot();
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: 'table-rtl'
    });
  });
});
```

### Browser Testing Matrix

| Browser | RTL Support | Notes |
|---------|-------------|-------|
| Chrome 90+ | ✅ Full | Best CSS logical property support |
| Firefox 88+ | ✅ Full | Excellent RTL rendering |
| Safari 14+ | ✅ Full | Good support, test on iOS too |
| Edge 90+ | ✅ Full | Chromium-based, same as Chrome |

---

## Common Pitfalls

### ❌ Pitfall 1: Hardcoded `left`/`right`

```scss
// ❌ WRONG
.cell {
  padding-left: 16px;  // Won't flip in RTL
}

// ✅ CORRECT
.cell {
  padding-inline-start: 16px;  // Auto-flips
}
```

### ❌ Pitfall 2: Assuming Icon Names

```typescript
// ❌ WRONG - Icons named "left"/"right" confuse direction
<mat-icon>arrow_right</mat-icon>  // Still points right in RTL!

// ✅ CORRECT - Use semantic names or conditional logic
<mat-icon>arrow_forward</mat-icon>  // Material auto-flips this
// OR
<mat-icon>{{ isRtl() ? 'arrow_back' : 'arrow_forward' }}</mat-icon>
```

### ❌ Pitfall 3: Forgetting Absolute Positioning

```scss
// ❌ WRONG
.overlay {
  position: absolute;
  left: 0;  // Won't flip
}

// ✅ CORRECT
.overlay {
  position: absolute;
  inset-inline-start: 0;  // Flips correctly
}
```

### ❌ Pitfall 4: Text Transforms

```scss
// ❌ WRONG - Breaking Arabic ligatures
.uppercase-text {
  text-transform: uppercase;  // Breaks Arabic script
}

// ✅ CORRECT - Conditional transforms
.uppercase-text {
  text-transform: uppercase;
  
  [dir="rtl"] & {
    text-transform: none;  // Preserve Arabic
  }
}
```

### ❌ Pitfall 5: Not Testing with Real Content

```html
<!-- ❌ WRONG - Testing with mirrored English -->
<html dir="rtl">
  <body>Hello World</body>  <!-- Looks wrong, doesn't validate actual RTL -->
</html>

<!-- ✅ CORRECT - Test with actual RTL languages -->
<html dir="rtl" lang="ar">
  <body>مرحبا بالعالم</body>  <!-- Validates real-world usage -->
</html>
```

---

## Quick Reference

### Decision Tree: When to Flip?

```
Does the element have direction meaning?
├─ YES → Should flip
│   ├─ Arrows (◄ ►)
│   ├─ "Next"/"Previous" buttons
│   ├─ Progress indicators (→)
│   └─ Breadcrumbs (/)
└─ NO → Should NOT flip
    ├─ Logos
    ├─ Media controls (▶ ⏸)
    ├─ Checkmarks (✓)
    └─ Close icons (✕)
```

### CSS Property Quick Map

```scss
/* LTR Property → Logical Property */
margin-left      → margin-inline-start
margin-right     → margin-inline-end
padding-left     → padding-inline-start
padding-right    → padding-inline-end
border-left      → border-inline-start
border-right     → border-inline-end
left             → inset-inline-start
right            → inset-inline-end
text-align: left → text-align: start
float: left      → float: inline-start
```

---

## Conclusion

**RTL support in Ash UI Lib is:**
- ✅ **Automatic** - No configuration needed in implementation projects
- ✅ **Standards-based** - Uses CSS logical properties and CDK Bidi
- ✅ **Material-aligned** - Extends Angular Material's RTL foundation
- ✅ **Enterprise-ready** - Tested with real Arabic/Hebrew content

**For Developers:** Use logical properties, inject `Directionality`, test in both directions.

**For Implementers:** Set `<html dir="rtl">`, load RTL fonts, and components work automatically.

---

*Document Version: 1.0*  
*Last Updated: January 26, 2026*  
*Related Guides: [Theming Guide](theming-guide.md), [Performance Guide](perf-guide.md)*
