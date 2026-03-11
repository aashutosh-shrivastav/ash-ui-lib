import { EChartsOption } from 'echarts';

export interface ChartSeriesData {
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

export interface ChartClickEvent {
  series: string;
  data: any;
  index: number;
}

export interface ZoomRange {
  start: number;
  end: number;
}

export interface DataPointInfo {
  series: string;
  data: any;
  position: { x: number; y: number };
}

export type ChartType = 'line' | 'area' | 'bar' | 'stacked-bar' | 'grouped-bar' | 'pie' | 'donut' | 'gauge' | 'heatmap' | 'scatter' | 'candlestick' | 'sankey' | 'radar' | 'funnel' | 'geo';

// ECharts options type
export type EChartsOptions = EChartsOption;

export interface YAxisConfig {
  // ECharts y-axis options
  type?: 'value' | 'category' | 'time' | 'log';
  name?: string;
  min?: number;
  max?: number;
  position?: 'left' | 'right';
}

export interface XAxisConfig {
  // ECharts x-axis options
  type?: 'value' | 'category' | 'time' | 'log';
  name?: string;
  min?: number;
  max?: number;
}

export interface VisualMapConfig {
  // For heatmap visualization mapping
  min?: number;
  max?: number;
  text?: [string, string];
  realtime?: boolean;
  calculable?: boolean;
  inRange?: {
    color?: string[];
  };
}