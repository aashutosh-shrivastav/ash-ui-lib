# AshToast Requirements

*Enterprise-Grade Notification System*

**Fills the UX feedback gap across all Ash UI Lib components**

***

## Component Overview

The `AshToast` is a production-ready, stackable notification system for enterprise applications. Unlike Angular Material's basic `mat-snack-bar`, it supports rich content (actions, progress bars, forms), swipe-to-dismiss, grouping by type, and persistent system alerts. Perfect for fintech confirmations, form feedback, dashboard actions, and compliance warnings.

**Key Metrics:**

- 100+ simultaneous toasts with smooth animations
- Swipe gestures on mobile (60fps)
- Auto-grouping by type/category
- Full accessibility with ARIA live regions

***

## 🎯 Why Needed (Gap Analysis)

| Current Components | Toast Gap |
| :-- | :-- |
| **No feedback mechanism** | ❌ No confirmation for Table deletes |
| **No rich notifications** | ❌ Form validation needs detailed errors |
| **No system alerts** | ❌ Dashboard widget save confirmation |
| **Material snack-bar limited** | ❌ No progress bars, no swipe, no forms |


***

## Key Requirements

### **1. Toast Types \& Variants**

```
✅ Success    → Green ✓ "Item saved successfully"
✅ Error      → Red ✗ "Failed to delete user"  
✅ Warning    → Orange ⚠ "Unsaved changes detected"
✅ Info       → Blue ℹ "New data available"
✅ Progress   → Indeterminate/determinate bar
✅ Custom     → Rich HTML content (AshDynamicForm)
```


### **2. Display \& Behavior**

- **Stacking**: Top-right, top-left, bottom, full-width banners
- **Auto-dismiss**: Configurable timeouts (3s-∞)
- **Swipe-to-dismiss**: Native touch gestures
- **Priority queuing**: Errors > Warnings > Success
- **Pause on hover**: Stops countdown


### **3. Interactive Toasts**

- **Action buttons**: "Undo", "Retry", "View Details"
- **Forms**: Mini-forms in toast (e.g., quick feedback)
- **Progress tracking**: File upload, batch operations
- **Sticky toasts**: Manual dismiss only (system alerts)

***

## Enterprise Features

| Feature | Description | Fintech Use Case |
| :-- | :-- | :-- |
| **Toast Groups** | Auto-group same-type notifications | Multiple table row deletes |
| **Rich Content** | HTML + Angular components | Chart export progress |
| **Sound Alerts** | Audio feedback for critical errors | Failed compliance check |
| **Do Not Disturb** | User-configurable mute | Focus mode |
| **Audit Trail** | Toast interactions logged | User action tracking |
| **Localization** | i18n + RTL support | Global teams |


***

## 📐 Data Model

```typescript
interface ToastConfig {
  id?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'progress';
  duration?: number;       // ms, 0 = persistent
  position?: 'top-right' | 'top-left' | 'bottom' | 'full-width';
  actions?: ToastAction[];
  progress?: number;       // 0-100
  component?: Type<any>;   // Rich content
  data?: any;              // Payload
  groupId?: string;        // Auto-grouping
  sound?: 'success' | 'error' | 'alert';
}

interface ToastAction {
  label: string;
  callback: () => void;
  color?: 'primary' | 'warn';
}
```


***

## API Specification

### **Service API (Recommended)**

```typescript
@Injectable({ providedIn: 'root' })
export abstract class AshToastService {
  abstract success(message: string, config?: Partial<ToastConfig>): void;
  abstract error(message: string, config?: Partial<ToastConfig>): void;
  abstract warning(message: string, config?: Partial<ToastConfig>): void;
  abstract info(message: string, config?: Partial<ToastConfig>): void;
  abstract progress(message: string, progress: number): void;
  abstract dismiss(id: string): void;
  abstract dismissAll(type?: ToastType): void;
}
```


### **Component API**

```html
<ash-toast-container position="top-right" maxStack="5"></ash-toast-container>
```

| Property | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `position` | `ToastPosition` | Display location | `'top-right'` |
| `maxStack` | `number` | Max visible toasts | `5` |
| `autoDismiss` | `boolean` | Enable timeouts | `true` |
| `swipeDismiss` | `boolean` | Mobile swipe | `true` |


***

## Integration with Existing Components

| Component | Toast Integration | Example |
| :-- | :-- | :-- |
| **AshDataGrid** | Bulk actions, row deletes | "3 customers deleted ✓ Undo?" |
| **AshDynamicForm** | Field validation, submit | "Email invalid ✗ Fix \& retry" |
| **AshMultiChart** | Export, data refresh | "Chart exported to PDF 📊" |
| **AshDashboard** | Widget save/load | "Layout saved automatically 💾" |
| **AshCalendar** | Event create/edit | "Meeting scheduled with John 📅" |


***

## Example Usage

### **Service (Primary)**

```typescript
constructor(private toast: AshToastService) {}

onSaveSuccess() {
  this.toast.success('Dashboard saved successfully', {
    duration: 3000,
    actions: [{ label: 'Undo', callback: this.undoSave }]
  });
}

onBulkDelete(customers: Customer[]) {
  this.toast.success(`${customers.length} customers deleted`, {
    groupId: 'bulk-delete',
    actions: [{ label: 'Undo All', callback: this.undoBulk }]
  });
}
```


### **Progress Toast**

```typescript
exportFile() {
  this.toast.progress('Exporting data...', 0);
  this.exportService.download().subscribe(progress => {
    this.toast.progress('Exporting data...', progress);
    if (progress === 100) {
      this.toast.success('Export complete 📥');
    }
  });
}
```


***

## Performance \& UX

```
✅ 100+ toasts: Virtual scrolling stack
✅ 60fps swipe animations (GPU accelerated)
✅ Memory: Auto-cleanup after dismiss
✅ No layout thrashing: Transform animations
✅ Mobile: Native swipe + haptic feedback
✅ Accessibility: ARIA live regions + focus management
```


***

## 🎨 Visual Features

```
✅ Stack animations (slide-in/out)
✅ Progress bars (determinate/indeterminate)
✅ Icon badges per type (✓ ✗ ⚠ ℹ)
✅ Avatar initials for user notifications
✅ Corner radius + Material elevation
✅ Dark mode + high contrast variants
✅ Full-width banners for system alerts
✅ Swipe progress indicator
```


***

## 🧪 Storybook Stories (8 Required)

| Story | Purpose |
| :-- | :-- |
| `BasicSuccess` | Simple success toast |
| `ErrorWithAction` | Retry button |
| `ProgressBar` | File upload simulation |
| `StackedNotifications` | 10+ simultaneous |
| `SwipeDismiss` | Mobile gesture demo |
| `RichContent` | Embedded form |
| `FullWidthBanner` | System alert |
| `Performance100` | Stress test |


***

## 🚀 Implementation Priority

```
Week 1: Basic service + container (2 days)
Week 2: Animations + swipe gestures (2 days)  
Week 3: Rich content + progress (1 day)
Week 4: Enterprise polish (1 day)
```

**Bundle Target:** +25KB (total lib: 173KB)

***

## 📈 Perfect UX Glue for Your Library

```
AshDataGrid    → "Row deleted ✓ Undo?"
AshDynamicForm → "Form validated ✓ Submit?"
AshMultiChart  → "Data refreshed 📊" 
AshDashboard   → "Layout saved 💾 Paused"
AshCalendar    → "Event created 📅 View"

AshToast       → **FEEDBACK FOR ALL** ✅
```

**Result:** Complete enterprise UX - every action has perfect feedback. Your lib now has data + forms + visualization + layout + events + notifications = **100% production dashboard solution**.

