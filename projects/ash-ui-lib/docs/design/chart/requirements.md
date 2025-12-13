# AshChart Requirements

## Component Overview

The reusable enterprise-grade chart component, named `AshChart`, integrates Apache ECharts for high-performance fintech dashboard visualizations. It supports 9+ dynamic chart types with multi-series data, real-time streaming, zooming, and drill-downs while maintaining WCAG 2.1 AA accessibility and Material theming. Designed for `ash-new-lib`, it handles 1M+ data points with 60fps rendering.

## 🎯 Design Decision: Single Component for Multiple Chart Types

**Pros of Unified Chart Component:**


| Advantage | Business Impact |
| :-- | :-- |
| **Consistent API** | Single learning curve, predictable props across all charts |
| **Theme Consistency** | Material design tokens, loading states, error handling unified |
| **Bundle Optimization** | Tree-shakable ECharts (only used features imported) |
| **Dashboard UX** | Drag-drop charts, consistent toolbar/legends/export |
| **Maintenance** | One component = one Storybook story = one test suite |
| **Type Safety** | TypeScript presets for fintech data shapes (OHLC, P\&L, KPIs) |
| **Performance** | Shared caching, resize observers, data downsampling logic |

**vs Separate Components**: Eliminates prop duplication, reduces bundle size by 40%, consistent accessibility patterns.

## Supported Fintech Chart Types

- **Line/Area**: Portfolio trends, revenue forecasts, real-time prices
- **Candlestick**: OHLC stock/crypto data with volume
- **Bar/Column**: Revenue by category, top customers, budget vs actual
- **Pie/Donut**: Asset allocation, expense breakdowns, market share
- **Gauge**: KPI targets (ROI, completion %, risk scores)
- **Heatmap**: Correlation matrices, volatility heatmaps
- **Sankey**: Cash flow paths, transaction waterfalls
- **Radar**: Multi-metric fund comparisons
- **Funnel**: Sales pipeline, loan approval stages


## Key Requirements

### Data Handling

- **Multi-Series**: `seriesData: ChartSeriesData | Observable<ChartSeriesData>`
- **Streaming**: Real-time updates via WebSocket/Observables
- **Data Shapes**: Auto-detects time-series, categorical, OHLC formats
- **Transformations**: Moving averages, percentage calculations, ranking


### Interactivity

- **Zoom/Pan**: Date range selection, box zoom, drag-to-select
- **Drill-Down**: Click series/categories → detail view emission
- **Crosshair**: Sync tooltips across dual Y-axes, multi-series
- **Legend**: Toggle series, drag-to-reorder, search/filter


### Responsiveness

- **Auto-Sizing**: ResizeObserver, mobile breakpoints
- **Density Modes**: Compact/sparkline vs detailed dashboard
- **Touch Gestures**: Pinch-zoom, swipe navigation


## Advanced Fintech Features

- **Technical Indicators**: MA, Bollinger Bands, RSI overlays
- **Volume Profiles**: Candlestick + volume bars (dual Y-axis)
- **Annotations**: Price targets, earnings events, custom markers
- **Sparklines**: Micro-charts in tables (`height="24px"`)
- **Data Masking**: Role-based field hiding for compliance


## Performance Optimizations

- **Incremental Rendering**: Only re-renders changed series
- **Data Downsampling**: 100K+ points → smooth 60fps
- **Lazy Loading**: Series load on legend hover/visibility
- **Virtual Canvas**: ECharts WebGL acceleration


## Accessibility \& Enterprise

- **WCAG 2.1 AA**: ARIA roles, screen reader data tables, keyboard nav
- **High Contrast**: Auto-detects theme, color-blind friendly palettes
- **Export**: PNG/PDF/SVG/JSON with watermarks
- **RTL Support**: Bidirectional text, mirrored animations
- **i18n**: Locale-aware number/date formats, legend labels


## API Specification

| Property | Type | Description | Default |
| :-- | :-- | :-- | :-- |
| `type` | `'line'\|'candlestick'\|'bar'\|'pie'\|'gauge'\|...` | Chart renderer | `'line'` |
| `seriesData` | `ChartSeriesData \| Observable<ChartSeriesData>` | Multi-series data | `{}` |
| `options` | `EChartsOption` | Full ECharts override | `{}` |
| `height` | `string \| number` | Container height | `'400px'` |
| `loading` | `boolean` | Material loading overlay | `false` |
| `theme` | `'light'\|'dark'\|string` | ECharts theme | `'light'` |
| `yAxis` | `EChartsYAxis[]` | Dual Y-axis configs | `[{}, {}]` |
| `showLegend` | `boolean` | Legend visibility | `true` |
| `toolbar` | `boolean \| ToolbarConfig` | Zoom/export toolbar | `true` |

### Data Interface

```typescript
interface ChartSeriesData {
  series: Array<{
    name: string;
    data: any[];
    type?: string;     // overrides global type
    color?: string;
    yAxisIndex?: number;
    stack?: string;    // for stacked charts
  }>;
  xAxis?: any[];
  categories?: string[];
}
```

**Key Outputs**:

- `@Output() chartClick: EventEmitter<ChartClickEvent>`
- `@Output() dataZoom: EventEmitter<ZoomRange>`
- `@Output() seriesToggle: EventEmitter<string>`
- `@Output() dataPointHover: EventEmitter<DataPointInfo>`


## Example Usage - Portfolio Dashboard

```html
<ash-chart 
  type="candlestick"
  [seriesData]="stockData$"
  [yAxis]="yAxisConfig"
  height="500px"
  (chartClick)="onStockClick($event)">
</ash-chart>
```

```typescript
stockData$ = of({
  series: [
    { name: 'NSE:BANKNIFTY', data: ohlcData, type: 'candlestick' },
    { name: 'Volume', data: volumeData, type: 'bar', yAxisIndex: 1 },
    { name: 'MA20', data: ma20Data, type: 'line', yAxisIndex: 0 }
  ]
});
```


## Implementation Guidelines

1. **Install**: `npm i echarts @types/echarts`
2. **Location**: `ash-new-lib/src/lib/ash-chart`
3. **Core**: `EChartsDirective` wrapper + `ResizeObserver`
4. **Service**: `FintechChartPresetsService` (candlestick+volume, P\&L combo)
5. **Stories**: 20+ variants (empty, loading, all chart types, fintech samples)
6. **Tests**: Snapshot testing, interaction flows, performance benchmarks

**Export**: Add to `public-api.ts`. Perfect complement to AshTable for complete fintech dashboard solution.
<span style="display:none">[^1]</span>

<div align="center">⁂</div>

[^1]: goals.career

