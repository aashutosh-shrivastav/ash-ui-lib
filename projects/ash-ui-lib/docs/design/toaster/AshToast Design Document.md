  
# AshToast Design Document

This design doc outlines the architecture, implementation strategy, and technical specifications for the AshToast library component. It builds directly on the provided requirements, focusing on scalability, performance, and seamless integration with Angular Material and Ash UI Lib.

***

## Architecture Overview

AshToast follows a service-container-toast model with virtual stacking for 100+ toasts. Key layers:

- **AshToastService**: Injectable API for creating/dismissing toasts
- **AshToastContainer**: Portal host managing stack positions and animations
- **AshToastComponent**: Individual toast with swipe, progress, and actions
- **ToastRef**: Tracks lifecycle, config, and callbacks

```
App → AshToastService → ToastRef → AshToastContainer → AshToastComponent(s)
```

Uses Angular CDK Overlay for positioning, animations via Angular Animations, and Gesture API for swipes.

***

## Data Flow \& State Management

```
Service.show() → Create ToastRef → Container.add(ToastRef) → Render AshToast
Toast swipe/dismiss → Container.remove(ToastRef) → Service emits dismiss event
```

**State Management**: OnPush change detection with RxJS signals for toast queue. Groups use Map<groupId, ToastRef[]> for auto-stacking.

**Priority Queue**: RxJS queueScheduler ensures error/warning toasts bypass success queue.

***

## Core Interfaces \& Types

```typescript
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'progress' | 'custom';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom' | 'full-width';

export interface ToastConfig {
  id?: string;
  message: string;
  type: ToastType;
  duration?: number;           // ms, 0 = sticky
  position?: ToastPosition;
  actions?: ToastAction[];
  progress?: number;           // 0-100 or undefined (indeterminate)
  component?: Type<any>;       // Dynamic content
  data?: any;
  groupId?: string;
  sound?: 'success' | 'error' | 'alert';
  priority?: number;           // 1-10, higher = front of queue
}

export interface ToastAction {
  label: string;
  callback: (toastRef: ToastRef) => void;
  color?: 'primary' | 'warn';
}

export interface ToastRef {
  readonly id: string;
  readonly config: ToastConfig;
  dismiss(): void;
  update(config: Partial<ToastConfig>): void;
}
```


***

## Component Structure

### AshToastContainer

```html
<ash-toast-container
  [position]="position"
  [maxStack]="maxStack"
  [swipeDismiss]="swipeDismiss">
</ash-toast-container>
```

**Responsibilities**:

- Manages toast stack per position (Map<position, ToastRef[]>)
- Virtual scrolling for 100+ toasts (only renders maxStack)
- Priority insertion and grouping
- ARIA live region announcements


### AshToastComponent (Individual Toast)

```
┌─────────────────────────────┐
│ [✓] Item saved ✓ Undo? [X]  │ ← Header w/ icon, title, actions
├─────────────────────────────┤
│ Content area / Progress     │ ← Dynamic content or progress bar
│ [██████████░░░░░░░░░░] 45%  │
└─────────────────────────────┘
```

**Template zones**:

- Header: Icon + message + actions
- Body: Progress bar or custom component
- Footer: Secondary actions

***

## Animation System

**Stack Animations** (Angular Animations):

```typescript
animations: [
  trigger('stackSlide', [
    transition(':enter', [
      style({ transform: 'translateX(100%)', opacity: 0 }),
      animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)')
    ]),
    transition(':leave', [
      animate('200ms cubic-bezier(0.4, 0, 1, 1)', 
        style({ transform: 'translateX(100%)', opacity: 0 }))
    ])
  ])
]
```

**Swipe Gestures** (CDK Gesture):

- Horizontal threshold: 50% width
- Visual feedback: Scale + opacity during swipe
- Haptic feedback on mobile (navigator.vibrate)

***

## Service Implementation

```typescript
@Injectable({ providedIn: 'root' })
export class AshToastService {
  private readonly containers = new Map<ToastPosition, AshToastContainer>();
  private readonly toastSubjects = new Map<string, Subject<ToastRef>>();

  success(message: string, config?: Partial<ToastConfig>): ToastRef {
    return this.show({ type: 'success', message, ...config });
  }

  private show(config: ToastConfig): ToastRef {
    const toastRef = new ToastRef(this.generateId(), config);
    const container = this.getOrCreateContainer(config.position);
    container.add(toastRef);
    return toastRef;
  }
}
```


***

## Progress \& Rich Content

**Progress Types**:

- Indeterminate: Spinner + pulsing animation
- Determinate: Linear progress bar (0-100%)
- Paused: Hold icon + tooltip

**Rich Content** (Angular CDK Portal):

```typescript
// Embed AshDynamicForm or any component
this.toast.success('Quick feedback', {
  component: QuickFeedbackFormComponent,
  data: { rating: 5 }
});
```

Container injects data via `@Input()` and handles dismiss on form submit.

***

## Enterprise Features Implementation

### Toast Grouping

```
Map<groupId, ToastRef[]> → Counter badge → Single visual stack
"3 more items deleted..." → Click expands group
```


### Sound System

```typescript
private audioCache = new Map<string, HTMLAudioElement>();
playSound(type: string) {
  const sound = this.audioCache.get(type) || this.loadSound(type);
  sound?.play().catch(() => {}); // Graceful fallback
}
```


### Do Not Disturb

User preference via `localStorage` + service toggle:

```typescript
this.toast.muteUntil('2026-02-17'); // Session mute
```


### Audit Trail

```typescript
this.toastService.interaction$.subscribe(event => {
  this.auditLogService.log('toast', {
    action: event.action,
    toastId: event.toastId,
    timestamp: new Date()
  });
});
```


***

## Performance Optimizations

| Optimization | Impact | Implementation |
| :-- | :-- | :-- |
| **Virtual Stack** | 100+ toasts | Only render `maxStack` visible |
| **OnPush + Signals** | 60fps | RxJS signals for state |
| **Transform Animations** | No layout thrashing | `transform: translate3d()` |
| **Debounced Grouping** | Memory | 500ms debounce same `groupId` |
| **Auto-cleanup** | Memory leaks | `takeUntilDestroyed()` everywhere |

**Bundle Target**: +25KB gzipped (animations: 8KB, service: 5KB, templates: 12KB)

***

## Accessibility \& Mobile

**ARIA Live Regions**:

```html
<div class="cdk-live-announcer" aria-live="polite" aria-atomic="true">
  {{ announcement$ | async }}
</div>
```

**Mobile Features**:

- Swipe threshold adapts to screen size
- Touch-friendly action buttons (44x44px min)
- Haptic feedback (`navigator.vibrate([50])`)
- RTL swipe direction detection

**Keyboard**:

- Tab navigation through actions
- Escape dismisses toast
- Focus management on dismiss

***

## Integration Patterns

### AshDataGrid Bulk Delete

```typescript
onBulkDelete(customers: Customer[]) {
  const groupId = `delete-${this.gridId}`;
  customers.forEach(customer => 
    this.toast.success(`Customer deleted`, { groupId })
  );
}
```


### AshDynamicForm Validation

```typescript
onFieldError(field: string, errors: string[]) {
  this.toast.error(errors[0], {
    actions: [{ label: 'Fix', callback: () => this.focusField(field) }]
  });
}
```


***

## Testing Strategy

| Test Type | Coverage | Examples |
| :-- | :-- | :-- |
| **Unit** | 95% | Service methods, animations, swipe logic |
| **E2E** | 100 toasts | Performance under load, mobile gestures |
| **Visual** | Storybook | All 8 stories + responsive breakpoints |
| **a11y** | Lighthouse 100 | Screen reader, keyboard nav |


***

## Storybook Stories Implementation

```
BasicSuccess
├── Simple message + auto-dismiss
ErrorWithAction
├── Retry button + callback
ProgressBar
├── 0→100% determinate + indeterminate
StackedNotifications  
├── 10+ toasts with grouping
SwipeDismiss
├── Mobile simulator + gesture demo
RichContent
├── Embedded AshDynamicForm
FullWidthBanner
├── System alert spanning viewport
Performance100
├── Stress test w/ FPS counter
```


***

## Implementation Roadmap (4 Weeks)

```
Week 1: Core service + container + basic toast (2 days)
  ✅ Service API + ToastRef
  ✅ Container positioning + stacking
  ✅ Basic success/error/info types

Week 2: Animations + gestures (2 days)
  ✅ Stack slide animations
  ✅ Swipe-to-dismiss (desktop/mobile)
  ✅ Progress bars + pause on hover

Week 3: Enterprise features (1 day)
  ✅ Grouping + priority queue
  ✅ Rich content (CDK Portal)
  ✅ Actions + callbacks

Week 4: Polish + testing (1 day)
  ✅ Sounds, DND, audit trail
  ✅ a11y + RTL
  ✅ Storybook + perf tests
```

**Launch Criteria**:

- 60fps on 100+ toasts
- Lighthouse a11y score: 100
- Bundle: +25KB
- All 8 stories working

***

This design delivers a production-ready, enterprise-grade toast system that fills the critical UX feedback gap across Ash UI Lib. Every action now has perfect, consistent feedback.

Would you like me to start with the Week 1 implementation (service + container) or adjust any architectural decisions?

