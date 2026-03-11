# AshChart Design Document

## Component Overview

The `AshChart` component is a reusable, enterprise-grade charting solution designed for Angular applications, specifically tailored for fintech dashboards. It leverages **Apache ECharts** via **ngx-echarts** to provide high-performance visualizations supporting 9+ chart types with multi-series data, real-time updates, interactivity, and accessibility. The component is built as a standalone Angular component using signals for reactive state management, ensuring optimal performance with OnPush change detection.

Key features include:
- Support for 9+ chart types (Line, Area, Bar, Pie, Donut, Gauge, Heatmap, Candlestick, Sankey, Radar, Funnel) with unified API
- Real-time data streaming via Observables
- Advanced interactivity (zoom, pan, drill-down, tooltips, hover effects)
- Responsive design with auto-sizing and ResizeObserver
- WCAG 2.1 AA accessibility compliance
- Material theming integration
- Performance optimizations for large datasets (up to 1M+ data points via ECharts WebGL)
- Directive-based implementation for optimal tree-shaking

## Design Decisions

### Unified Component Architecture
- **Single Component**: All chart types are handled by one `AshChart` component to ensure API consistency, reduce bundle size, and simplify maintenance.
- **Standalone Component**: No NgModules; uses Angular 20+ standalone architecture.
- **Signals for State**: Reactive state management using signals for data, loading, and configuration.
- **OnPush Change Detection**: Optimizes performance by minimizing unnecessary re-renders.

### Library Choice: Apache ECharts with ngx-echarts
- **Rationale**: Apache ECharts is the industry standard for high-performance dashboard visualizations. `ngx-echarts` provides seamless Angular integration with full TypeScript support, excellent tree-shaking, and extensive customization. Supports all required chart types out-of-the-box including advanced types (Candlestick, Sankey, Radar, Funnel).
- **Supported Types**: Line, Area, Bar, Pie, Donut, Gauge, Heatmap, Candlestick, Sankey, Radar, Funnel. All types are natively supported with unified API.
- **Performance**: Handles 1M+ data points efficiently. Includes WebGL renderer for ultra-high performance and Canvas renderer for compatibility. Built-in optimizations for data downsampling, incremental rendering, and ResizeObserver support.
- **Theming**: Full Material Design 3 token integration. Dynamic theme switching (light/dark/custom) with reactive signals.
- **Interactivity**: Native support for zoom/pan, drill-down, brushing, data linking, and advanced event handling via ECElementEvent API.
- **Bundle Size**: Optimized through tree-shaking. Only registered chart types and components are included. ~40KB min+gzip for common charts.

### Data Handling Strategy
- **Observable Inputs**: Accepts `Observable<ChartSeriesData>` for real-time updates.
- **Auto-Detection**: Automatically detects data shapes (time-series, categorical, etc.) and applies appropriate transformations.
- **Transformations**: Built-in support for moving averages, percentages, and rankings via computed signals.

### Interactivity and UX
- **Unified Toolbar**: Consistent zoom, pan, export, and legend controls across all chart types.
- **Event Emissions**: Outputs for clicks, hovers, zooms, and series toggles to enable drill-down and custom interactions.
- **Accessibility**: ARIA roles, keyboard navigation, screen reader support, and high-contrast modes.

### Performance Considerations
- **Incremental Updates**: Only re-renders changed series.
- **Lazy Loading**: Series load on demand (e.g., on legend hover).
- **ResizeObserver**: Handles dynamic resizing efficiently.
- **Data Downsampling**: Reduces data points for smooth 60fps rendering on large datasets.

## Supported Chart Types

All chart types are natively supported by Apache ECharts:
- **Line**: Portfolio trends, revenue forecasts, real-time price movements
- **Area**: Stacked area for cumulative data, resource utilization
- **Bar/Column**: Revenue by category, regional comparisons, performance metrics
- **Pie/Donut**: Asset allocation, market share, categorical breakdowns
- **Gauge**: KPI targets, risk scores, progress indicators
- **Heatmap**: Correlation matrices, volatility patterns, time-series intensity
- **Candlestick**: OHLC stock data, technical analysis charts
- **Sankey**: Flow diagrams, resource allocation, process flows
- **Radar**: Multi-dimensional comparisons, skill matrices
- **Funnel**: Sales pipeline, conversion funnels, drop-off analysis

All types support multi-series data, animations, interactions, and Material theming.

## Key Requirements

### Data Handling
- **Multi-Series Support**: Accepts an array of series with name, data, type, and styling options.
- **Streaming Data**: Reactive updates via RxJS Observables.
- **Data Shapes**: Supports arrays of numbers, objects with x/y values, or custom formats.
- **Transformations**: Computed signals for derived data (e.g., moving averages).

### Interactivity
- **Zoom/Pan**: Built-in zoom controls and drag-to-select.
- **Drill-Down**: Emits events on clicks for navigation.
- **Tooltips**: Synchronized across series with custom formatting.
- **Legend**: Toggle visibility, reorder, and filter series.

### Responsiveness
- **Auto-Sizing**: Adapts to container size with ResizeObserver.
- **Mobile Support**: Touch gestures for pinch-zoom and swipe.
- **Density Modes**: Compact mode for sparklines (e.g., height="24px").

### Advanced Features
- **Annotations**: Custom markers and labels (via ngx-charts extensions).
- **Export**: PNG/SVG/JSON export with optional watermarks.
- **RTL Support**: Bidirectional layouts and animations.
- **i18n**: Locale-aware formatting for numbers and dates.

### Accessibility & Enterprise
- **WCAG 2.1 AA**: Full compliance with ARIA, keyboard nav, and screen readers.
- **High Contrast**: Theme-aware color schemes.
- **Security**: Data masking for sensitive fields.

## API Specification

### Inputs (Signals)
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `type` | `signal<ChartType>` | Chart type: 'line' \| 'area' \| 'bar' \| 'pie' \| 'donut' \| 'gauge' \| 'heatmap' | `'line'` |
| `seriesData` | `signal<ChartSeriesData \| Observable<ChartSeriesData>>` | Multi-series data | `{ series: [] }` |
| `options` | `signal<NgxChartsOptions>` | ngx-charts configuration overrides | `{}` |
| `height` | `signal<string \| number>` | Container height | `'400px'` |
| `width` | `signal<string \| number>` | Container width | `'100%'` |
| `loading` | `signal<boolean>` | Shows loading overlay | `false` |
| `theme` | `signal<'light' \| 'dark' \| string>` | Chart theme | `'light'` |
| `showLegend` | `signal<boolean>` | Legend visibility | `true` |
| `showToolbar` | `signal<boolean>` | Toolbar visibility | `true` |
| `yAxis` | `signal<YAxisConfig[]>` | Y-axis configurations | `[{}, {}]` |
| `xAxis` | `signal<XAxisConfig>` | X-axis configuration | `{}` |
| `animations` | `signal<boolean>` | Enable animations | `true` |
| `responsive` | `signal<boolean>` | Responsive sizing | `true` |

### Outputs
| Property | Type | Description |
|----------|------|-------------|
| `chartClick` | `output<ChartClickEvent>` | Emitted on chart click |
| `dataZoom` | `output<ZoomRange>` | Emitted on zoom/pan |
| `seriesToggle` | `output<string>` | Emitted when series visibility changes |
| `dataPointHover` | `output<DataPointInfo>` | Emitted on hover |

## Data Interfaces

```typescript
interface ChartSeriesData {
  series: Array<{
    name: string;
    data: any[]; // Array of numbers, objects {x, y}, or custom
    type?: ChartType; // Overrides global type
    color?: string;
    yAxisIndex?: number;
    stack?: string; // For stacked charts
  }>;
  xAxis?: any[];
  categories?: string[];
}

interface ChartClickEvent {
  series: string;
  data: any;
  index: number;
}

interface ZoomRange {
  start: number;
  end: number;
}

interface DataPointInfo {
  series: string;
  data: any;
  position: { x: number; y: number };
}

type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'gauge' | 'heatmap';
```

## Example Usage

### Basic Line Chart
```html
<ash-chart 
  [type]="signal('line')"
  [seriesData]="portfolioData()"
  [height]="'400px'"
  [width]="'100%'"
  (chartClick)="onChartClick($event)"
  (chartDataZoom)="onZoom($event)">
</ash-chart>
```

```typescript
import { signal } from '@angular/core';
import { AshChart, ChartSeriesData, ChartClickEvent, ZoomRange } from 'ash-ui-lib';

portfolioData = signal<ChartSeriesData>({
  series: [
    { 
      name: 'Portfolio Value', 
      data: [100, 120, 110, 130, 125, 140, 135] 
    },
    { 
      name: 'Benchmark', 
      data: [100, 115, 108, 125, 122, 138, 132],
      color: '#888888'
    }
  ]
});

onChartClick(event: ChartClickEvent) {
  console.log(`Clicked ${event.series} at index ${event.index}:`, event.data);
}

onZoom(event: ZoomRange) {
  console.log(`Zoomed to: ${event.start}% - ${event.end}%`);
}
```

### Multi-Chart Dashboard
```typescript
// Area chart with stacked data
areaChartData = signal<ChartSeriesData>({
  series: [
    { name: 'Revenues', data: [120, 132, 101, 134, 90, 230, 210], stack: 'income' },
    { name: 'Expenses', data: [220, 182, 191, 234, 290, 330, 310], stack: 'income' }
  ]
});

// Pie chart for breakdown
pieChartData = signal<ChartSeriesData>({
  series: [
    {
      name: 'Asset Allocation',
      data: [
        { name: 'Stocks', value: 45 },
        { name: 'Bonds', value: 30 },
        { name: 'Real Estate', value: 15 },
        { name: 'Cash', value: 10 }
      ]
    }
  ]
});

// Candlestick for OHLC data
candleData = signal<ChartSeriesData>({
  series: [
    {
      name: 'AAPL',
      data: [
        [150, 155, 148, 153],  // [open, close, low, high]
        [153, 158, 152, 157],
        [157, 160, 155, 159]
      ],
      type: 'candlestick'
    }
  ]
});
```

### Real-time Updates via Observable
```typescript
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

// Simulate real-time ticker data
realtimeData$ = interval(1000).pipe(
  map(tick => ({
    series: [
      {
        name: 'Live Price',
        data: Array.from({ length: 20 }, (_, i) => 
          100 + Math.random() * 10 + (tick - i) * 0.5
        )
      }
    ]
  }))
);
```

### Advanced: Candlestick with Custom Options
```typescript
candleChartOptions = computed(() => ({
  xAxis: { type: 'category' as const },
  yAxis: { type: 'value' as const },
  series: [{
    type: 'candlestick' as const,
    itemStyle: {
      color: '#ec0000',        // Up color
      color0: '#00da3c',       // Down color
      borderColor: '#8a0000',
      borderColor0: '#008f28'
    }
  }]
}));
```

## Implementation Guidelines

### Setup & Dependencies
1. **Prerequisites**: `echarts` and `ngx-echarts` are listed as peerDependencies
2. **Root Installation**: Install both packages at root `package.json` level for proper tree-shaking and shared instances
3. **Location**: `projects/ash-ui-lib/src/lib/ash-chart/`
4. **Provider**: Component provides `provideEchartsCore({ echarts })` with registered chart types and renderers

### Key Implementation Details

#### Component Structure
```typescript
@Component({
  selector: 'ash-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective, MatProgressSpinnerModule],
  templateUrl: './ash-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({ echarts })],
})
export class AshChartComponent {
  // Inputs as signals
  type = input<ChartType>('line');
  seriesData = input<ChartSeriesData | Observable<ChartSeriesData>>({ series: [] });
  options = input<EChartsOptions>({});
  // ... other inputs
  
  // Outputs
  chartClick = output<ChartClickEvent>();
  dataZoom = output<ZoomRange>();
  // ... other outputs
  
  // Computed options
  chartOptions = computed(() => this.buildEChartsOptions(...));
}
```

#### Template (Directive-based)
```html
<div echarts 
  [options]="chartOptions()" 
  [theme]="theme()"
  [autoResize]="responsive()"
  (chartClick)="onChartEvents($event)"
  (chartDataZoom)="onChartEvents($event)">
</div>
```

#### ECharts Registration
- All chart types (Line, Bar, Pie, etc.) are registered via `echarts.use([...])`
- Grid, tooltip, legend, and other components included
- Both Canvas and SVG renderers available for optimization

### Files
- `ash-chart.component.ts`: Main component with signals and lifecycle
- `ash-chart.component.html`: Template with echarts directive
- `ash-chart.component.scss`: Styles for Chart container and loading states
- `types.ts`: Type definitions (ChartSeriesData, ChartClickEvent, etc.)

### Core Logic
- Use `computed()` for derived chart options
- Handle Observables with `effect()` and `toSignal()` for reactive updates
- Auto-detect and apply chart-specific formatting (e.g., areaStyle for area charts)
- Responsive resizing handled by ECharts directive's `autoResize` input

### Testing
- Unit tests with Jest for signals, computed values, and outputs
- E2E with Playwright for chart interactions (clicks, zooms, tooltips)
- Storybook stories with multiple data scenarios and chart configurations

This design ensures a scalable, performant, and accessible chart component aligned with Angular best practices.