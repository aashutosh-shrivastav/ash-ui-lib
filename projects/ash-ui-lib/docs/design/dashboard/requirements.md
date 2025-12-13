# AshDashboard Requirements \& Design Plan

*Enterprise-Grade Dashboard Layout Composer

**Version 2.0** | **Angular 20+** | **December 2025** | **Author: Senior Google Architect**

***

## 🎯 Architecture Philosophy

```
"Build systems that scale to 10,000 users, perform at 60fps, 
 and require zero configuration. Prioritize developer velocity 
 and runtime performance equally." - Google Design Principles
```

**Core Tenets:**

1. **Declarative over Imperative** - JSON layouts, no state mutation
2. **CSS-First** - Native Grid + ResizeObserver, zero JS layout
3. **Composability** - Widgets are standalone Angular components
4. **Progressive Enhancement** - Works without JS, enhances with drag
5. **Zero Configuration** - Sensible defaults + TypeScript inference

***

## 📊 System Requirements

| Non-Functional | Target | Measurement |
| :-- | :-- | :-- |
| **Performance** | 60fps drag/resize, 50+ widgets | Chrome DevTools Performance |
| **Bundle Size** | ≤ 120KB | webpack-bundle-analyzer |
| **Memory** | ≤ 40MB (50 widgets) | Chrome Heap Snapshot |
| **Accessibility** | WCAG 2.2 AAA | axe-core + Lighthouse |
| **Reliability** | 99.99% uptime | Error boundaries + recovery |


***

## 🏗️ Component Architecture (3-Tier)

```
┌─────────────────────────────────────┐
│ AshDashboard (Orchestrator)         │
│ ├─ Layout Engine (CSS Grid)         │
│ ├─ Persistence Layer (IndexedDB)    │
│ └─ Undo/Redo Stack (30 actions)     │
├─────────────────────────────────────┤
│ AshWidget (Atomic Unit)             │
│ ├─ Drag Handle (CDK DragDrop)       │
│ ├─ Resize Handles (8 corners)       │
│ ├─ Header (Title + Controls)        │
│ └─ Content (ngComponentOutlet)      │
└─────────────────────────────────────┘
```


***

## 📐 Data Model Specification (TypeScript-First)

```typescript
export interface DashboardLayoutV2 {
  readonly version: '2.0';
  readonly metadata: {
    name: string;
    description?: string;
    author?: string;
    created: string;  // ISO 8601
    updated: string;
  };
  
  // Grid specification
  readonly grid: {
    rows: number;     // 12/24/48
    cols: number;     // 12/24/48
    gap: {
      row: number;    // 16px
      col: number;    // 16px
    };
    unit: 'px' | 'fr' | '%';  // CSS grid-template unit
  };
  
  // Responsive breakpoints
  readonly breakpoints: BreakpointRule[];
  
  // Widgets (immutable)
  readonly widgets: readonly WidgetNode[];
  
  // Layout constraints
  readonly constraints: {
    maxWidgets: number;
    minWidgetSize: { w: number; h: number };
    allowOverflow?: boolean;
  };
}

export interface WidgetNode {
  readonly id: string;              // UUID v4
  readonly type: WidgetType;        // 'chart'|'table'|'form'
  readonly position: GridPosition;  // { x, y }
  readonly size: GridSize;          // { w, h }
  readonly config: Record<string, unknown>;
  readonly state: WidgetState;
  readonly metadata: WidgetMetadata;
}

export type WidgetType = 'chart' | 'table' | 'form' | 'calendar' | 'toast' | 'stats' | 'custom';
```


***

## 🎛 Complete API Specification

### **AshDashboard Inputs**

| Property | Type | Required | Default | Description |
| :-- | :-- | :-- | :-- | :-- |
| `layout` | `DashboardLayoutV2 \| Observable<DashboardLayoutV2>` | ✅ | - | Complete layout definition |
| `widgets` | `WidgetRegistry \| Observable<WidgetRegistry>` | ✅ | `{}` | Component factory mapping |
| `persistenceKey` | `string` | ❌ | `null` | IndexedDB key (user-specific) |
| `editable` | `boolean` | ❌ | `true` | Enable drag/resize |
| `maxWidgets` | `number` | ❌ | `50` | Maximum widget count |
| `theme` | `'light' \| 'dark' \| CustomTheme` | ❌ | `'light'` | Dashboard theme |
| `loadingTemplate` | `TemplateRef` | ❌ | Material skeleton | Custom loading UI |

### **AshDashboard Outputs**

```typescript
@Output() layoutChange: EventEmitter<DashboardLayoutV2> = new EventEmitter();
@Output() widgetAction: EventEmitter<WidgetActionEvent> = new EventEmitter();
@Output() persistenceState: EventEmitter<PersistenceStatus> = new EventEmitter();
```


***

## 🔧 Widget Registry System (Type-Safe)

```typescript
export interface WidgetFactory {
  type: WidgetType;
  name: string;
  icon: string;                    // Material icon
  preview: Type<NgComponent>;     // Storybook preview
  component: Type<NgComponent>;
  defaultConfig: Record<string, unknown>;
  schema?: FormSchema;            // AshDynamicForm schema
}

@Injectable()
export class WidgetRegistryService {
  register(factory: WidgetFactory): void;
  getWidget(type: WidgetType): WidgetFactory;
  getAvailableWidgets(): WidgetFactory[];
}
```


***

## 🧩 Detailed Component Breakdown

### **1. AshDashboard (Root Container)**

```html
<ash-dashboard 
  [layout]="layout$"
  [widgets]="registry"
  [editable]="isAdmin"
  persistenceKey="user-123-dashboard"
  (layoutChange)="onLayoutChange($event)"
  (widgetAction)="handleWidgetAction($event)">
  
  <!-- Edit Mode Toolbar -->
  <ng-container *ashToolbar>
    <ash-widget-selector [registry]="registry"></ash-widget-selector>
    <button mat-button (click)="saveLayout()">💾 Save Layout</button>
  </ng-container>
</ash-dashboard>
```


### **2. AshWidget (Draggable Unit)**

```html
<ash-widget 
  [definition]="widget"
  [grid]="activeGrid"
  cdkDrag
  [cdkDragLockAxis]="'both'"
  (dragEnded)="onDragEnd($event)"
  (resized)="onResize($event)">
  
  <!-- Widget Header -->
  <div class="widget-header" cdkDragHandle>
    <mat-icon>{{ widget.icon }}</mat-icon>
    {{ widget.name }}
    <span class="status" *ngIf="widget.state.loading">⏳</span>
  </div>
  
  <!-- Dynamic Content -->
  <ng-container *ngComponentOutlet="widget.component; 
    inputs: widget.config">
  </ng-container>
</ash-widget>
```


***

## 🚀 Advanced Enterprise Features

### **Persistence Layer (Zero-Config)**

```typescript
// Auto-save every layout change (debounced 500ms)
@Effect()
saveLayout$ = this.layoutChange$.pipe(
  debounceTime(500),
  switchMap(layout => this.persistence.save(layout, this.persistenceKey))
);
```

**Storage Strategy:**

```
1. Memory (current session)
2. IndexedDB (persistent, 50MB+ layouts) 
3. LocalStorage (fallback, <5MB)
4. REST API (enterprise sync)
```


### **Undo/Redo System**

```
✅ 30 actions max (2MB memory)
✅ Widget-level undo (resize, move, delete)
✅ Layout snapshots (immutable)
✅ Keyboard shortcuts: Ctrl+Z/Y
✅ Timeline visualization
```


### **Collision Detection \& Resolution**

```
✅ Real-time overlap prevention
✅ Smart positioning (nudge algorithm)
✅ Animated resolution
✅ User confirmation for conflicts
```


***

## 📱 Responsive Breakpoint System

```typescript
const DEFAULT_BREAKPOINTS: BreakpointRule[] = [
  { name: 'mobile',   minWidth: 0,   cols: 1,  rows: 9999, autoStack: true  },
  { name: 'tablet',   minWidth: 768, cols: 8,  rows: 12,  autoStack: false },
  { name: 'desktop',  minWidth: 1200, cols: 16, rows: 12,  autoStack: false },
  { name: 'wide',     minWidth: 1800, cols: 24, rows: 12,  autoStack: false }
];
```

**Auto-Stack Algorithm:**

```
if (widget.width > availableWidth) {
  stack vertically with animation
}
```


***

## ♿ Accessibility Implementation

| Feature | WCAG Level | Implementation |
| :-- | :-- | :-- |
| **Keyboard Drag** | AAA | Arrow keys + modifier |
| **Screen Reader** | AAA | Live regions for layout changes |
| **Focus Management** | AA | Widget activation ring |
| **High Contrast** | AAA | CSS custom properties |
| **Reduced Motion** | AA | `@prefers-reduced-motion` |


***

## 🎨 CSS Architecture (Zero Layout Thrashing)

```scss
:host {
  display: grid;
  grid-template-columns: repeat(var(--cols, 12), 1fr);
  grid-template-rows: repeat(var(--rows, 12), auto);
  gap: var(--grid-gap-row, 16px) var(--grid-gap-col, 16px);
  
  // Drag animations (GPU accelerated)
  .cdk-drag-preview {
    transform: translate3d(0, 0, 0);
    will-change: transform;
  }
}
```


***

## 🧪 Testing \& Storybook Requirements

### **Canonical Stories (12 Required)**

```
1. EmptyDashboard        → No widgets
2. SingleWidget          → Basic chart
3. FullProduction        → 24 widgets mixed types
4. DragResizeInteractive → Live editing
5. MobileResponsive      → iPhone viewport
6. PerformanceStress     → 50 widgets @ 60fps
7. PersistenceDemo       → Save/load cycle
8. UndoRedoDemo          → 10 actions
9. CollisionResolution   → Overlap handling
10. PrintOptimized       → CSS print media
11. DarkMode             → Theme switching
12. AccessibilityDemo    → Keyboard navigation
```


***

## 🚀 Implementation Roadmap (4 Weeks)

### **Week 1: Core Grid (MVP)**

```
✅ CSS Grid container
✅ Basic widget rendering
✅ ngComponentOutlet integration
✅ 5 demo widgets (your components)
```


### **Week 2: Drag \& Resize**

```
✅ CDK DragDrop integration
✅ ResizeObserver (8 handles)
✅ Collision detection
✅ Basic persistence
```


### **Week 3: Enterprise Features**

```
✅ Responsive breakpoints
✅ Undo/redo stack
✅ Widget registry
✅ Toolbar + add widget
```


### **Week 4: Production Polish**

```
✅ Performance optimization
✅ Accessibility AAA
✅ Storybook 12 stories
✅ npm publish ready
```


***

## 📈 Success Metrics (Must Pass)

| Metric | Target | Verification |
| :-- | :-- | :-- |
| **Drag FPS** | ≥ 60fps | Chrome Performance tab |
| **Resize FPS** | ≥ 60fps | Chrome Performance tab |
| **Bundle Size** | ≤ 120KB | webpack-bundle-analyzer |
| **Memory (50 widgets)** | ≤ 40MB | Chrome Heap Snapshot |
| **Lighthouse Score** | 100/100 | Chrome Lighthouse |
| **axe-core Score** | 100/100 | Accessibility audit |


***

## 💎 Integration with Ash UI Lib Ecosystem

```
┌─────────────────┐    ┌─────────────────┐
│   AshDashboard  │───▶│ Widget Registry │
│                 │    │ chart/table/... │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│ AshDataGrid     │◀──▶│   AshToast      │
│ AshDynamicForm  │    │   Feedback      │
│ AshMultiChart   │    └─────────────────┘
│ AshCalendar     │
└─────────────────┘
```

**Result:** Complete enterprise dashboard platform. Every fintech/enterprise use case covered in 120KB.

