import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, isObservable, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChartSeriesData, ChartClickEvent, ZoomRange, DataPointInfo, ChartType, EChartsOptions, YAxisConfig, XAxisConfig, VisualMapConfig } from './types';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, GaugeChart, HeatmapChart, CandlestickChart, ScatterChart, EffectScatterChart, FunnelChart, RadarChart, SankeyChart } from 'echarts/charts';
import { GridComponent, PolarComponent, GeoComponent, SingleAxisComponent, ParallelComponent, CalendarComponent, GraphicComponent, ToolboxComponent, TooltipComponent, AxisPointerComponent, LegendComponent, TitleComponent, MarkPointComponent, MarkLineComponent, MarkAreaComponent, TimelineComponent, DataZoomComponent, VisualMapComponent, AriaComponent } from 'echarts/components';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

// Register echarts components
echarts.use([BarChart, LineChart, PieChart, GaugeChart, HeatmapChart, CandlestickChart, ScatterChart, EffectScatterChart, FunnelChart, RadarChart, SankeyChart, GridComponent, PolarComponent, GeoComponent, SingleAxisComponent, ParallelComponent, CalendarComponent, GraphicComponent, ToolboxComponent, TooltipComponent, AxisPointerComponent, LegendComponent, TitleComponent, MarkPointComponent, MarkLineComponent, MarkAreaComponent, TimelineComponent, DataZoomComponent, VisualMapComponent, AriaComponent, CanvasRenderer, SVGRenderer]);

@Component({
  selector: 'ash-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective, MatProgressSpinnerModule],
  templateUrl: './ash-chart.component.html',
  styleUrls: ['./ash-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({ echarts })],
})
export class AshChartComponent {
  // Inputs as signals
  type = input<ChartType>('line');
  seriesData = input<ChartSeriesData | Observable<ChartSeriesData>>({ series: [] });
  options = input<EChartsOptions>({});
  height = input<string | number>('400px');
  width = input<string | number>('100%');
  loading = input<boolean>(false);
  theme = input<'light' | 'dark' | string>('light');
  showLegend = input<boolean>(true);
  showToolbar = input<boolean>(true);
  yAxis = input<YAxisConfig[]>([{}, {}]);
  xAxis = input<XAxisConfig>({});
  animations = input<boolean>(true);
  responsive = input<boolean>(true);
  visualMap = input<VisualMapConfig | undefined>(undefined);
  barMode = input<'default' | 'stacked' | 'grouped'>('default');

  // Outputs
  chartClick = output<ChartClickEvent>();
  dataZoom = output<ZoomRange>();
  seriesToggle = output<string>();
  dataPointHover = output<DataPointInfo>();

  // Internal signals
  private _dataSource = signal<ChartSeriesData>({ series: [] });

  // Convert observable to signal
  private _seriesDataSignal = computed(() => {
    const data = this.seriesData();
    if (isObservable(data)) {
      return toSignal(data, { initialValue: { series: [] } });
    }
    return signal(data);
  });

  // Processed ECharts options
  chartOptions = computed(() => {
    const data = this._seriesDataSignal()();
    const baseOptions = this.options();
    return this.buildEChartsOptions(data, baseOptions);
  });

  // View dimensions (for ngx-echarts, it's handled differently)
  // Remove view computed as ngx-echarts uses height/width directly

  constructor() {
    // Effect to update data source when seriesData changes
    effect(() => {
      const data = this._seriesDataSignal()();
      this._dataSource.set(data);
    });
  }

  private buildEChartsOptions(data: ChartSeriesData, baseOptions: EChartsOptions): EChartsOption {
    const chartType = this.type();
    const theme = this.theme();
    const showLegend = this.showLegend();
    const animations = this.animations();
    const visualMapConfig = this.visualMap();
    const barMode = this.barMode();

    // Base options
    const options: EChartsOption = {
      ...baseOptions,
      animation: animations,
      legend: showLegend ? { show: true, orient: 'horizontal', bottom: 0 } : { show: false },
      tooltip: {
        trigger: chartType === 'radar' ? 'item' : (chartType === 'heatmap' ? 'item' : 'axis'),
        ...baseOptions.tooltip,
      },
    };

    // Grid/axis setup - skip for pie, gauge, radar, geo
    if (!['pie', 'donut', 'gauge', 'radar', 'geo'].includes(chartType)) {
      options.grid = { left: '10%', right: '10%', bottom: '20%', containLabel: true };

      // Special handling for heatmap - both axes must be category type
      if (chartType === 'heatmap') {
        options.xAxis = {
          type: 'category',
          name: this.xAxis().name || 'X Axis',
          data: data.categories || Array.from({ length: 10 }, (_, i) => `X${i}`),
          ...this.xAxis(),
        } as any;
        options.yAxis = {
          type: 'category',
          name: this.yAxis()[0]?.name || 'Y Axis',
          data: Array.from({ length: 7 }, (_, i) => `Y${i}`),
          ...this.yAxis()[0],
        } as any;
      } else {
        options.xAxis = {
          type: (this.xAxis().type || 'category') as any,
          name: this.xAxis().name,
          data: data.categories,
          ...this.xAxis(),
        } as any;
        options.yAxis = this.yAxis().map((y, index) => {
          const axisConfig: any = {
            type: y.type || 'value',
            name: y.name,
            position: y.position || (index === 0 ? 'left' : 'right'),
            ...y,
          };
          return axisConfig;
        });
      }
    }

    // Radar coordinate system
    if (chartType === 'radar') {
      const dimensions = data.series[0]?.data?.length || 6;
      const radarData = data as any;
      options.radar = {
        indicator: Array.from({ length: dimensions }, (_, i) => ({
          name: radarData.categories?.[i] || `Dimension ${i + 1}`,
          max: 100,
        })),
        shape: 'polygon',
        splitNumber: 4,
        axisLine: { 
          lineStyle: { color: '#ddd' } 
        },
        splitLine: { 
          lineStyle: { color: '#eee' } 
        },
        splitArea: { 
          areaStyle: { color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'] } 
        },
        axisPointer: { type: 'cross' },
      } as any;
    }

    // Geo coordinate system - use scatterGL on geo plane or simple scatter
    if (chartType === 'geo') {
      options.geo = {
        map: 'world',
        roam: true,
        itemStyle: {
          normal: { areaColor: '#f3f3f3', borderColor: '#516b91' } as any,
          emphasis: { areaColor: '#ffd97d' } as any,
        },
        label: {
          emphasis: { show: false }
        }
      } as any;
      
      // Set up tooltip for geo
      options.tooltip = {
        trigger: 'item',
        formatter: '{b}: {c}'
      };
    }

    // Series configuration
    options.series = data.series.map((series, seriesIndex) => {
      const seriesType = this.mapChartType(series.type || chartType);
      const seriesOptions: any = {
        name: series.name,
        type: seriesType,
        data: series.data,
        color: series.color,
      };

      // Add axis indices for multi-axis charts (excluding special types)
      if (!['pie', 'donut', 'gauge', 'radar', 'geo', 'heatmap'].includes(chartType)) {
        seriesOptions.yAxisIndex = series.yAxisIndex || 0;
        seriesOptions.xAxisIndex = 0;

        // Handle stacking for bar/area charts
        if (['bar', 'area', 'line'].includes(chartType) && barMode === 'stacked') {
          seriesOptions.stack = 'total';
        } else if (['bar', 'area', 'line'].includes(chartType) && barMode === 'grouped') {
          seriesOptions.stack = undefined; // No stacking for grouped
        } else if (series.stack) {
          seriesOptions.stack = series.stack;
        }
      } else if (chartType === 'heatmap') {
        // Heatmap doesn't use axis indices
        seriesOptions.yAxisIndex = 0;
        seriesOptions.xAxisIndex = 0;
      }

      // Special handling for different chart types
      if (chartType === 'area' || series.type === 'area') {
        seriesOptions.areaStyle = { opacity: 0.7 };
      }
      if (chartType === 'donut' || series.type === 'donut') {
        seriesOptions.radius = ['40%', '70%'];
      }
      if (chartType === 'pie' || series.type === 'pie') {
        seriesOptions.radius = '50%';
      }
      if (chartType === 'gauge' || series.type === 'gauge') {
        seriesOptions.splitLine = { show: true };
        seriesOptions.axisLine = { lineStyle: { width: 30 } };
      }
      if (chartType === 'candlestick' || series.type === 'candlestick') {
        // Candlestick data format: [open, close, low, high]
        seriesOptions.data = series.data;
      }
      if (chartType === 'heatmap' || series.type === 'heatmap') {
        seriesOptions.emphasis = { itemStyle: { borderColor: '#333', borderWidth: 1 } };
        seriesOptions.progressive = 1000;
        seriesOptions.label = { show: false };
        // Heatmap data: [[x_index, y_index, value], ...]
      }
      if (chartType === 'radar' || series.type === 'radar') {
        seriesOptions.symbol = 'circle';
        seriesOptions.symbolSize = 4;
        seriesOptions.smooth = true;
        seriesOptions.itemStyle = { borderWidth: 2, borderColor: '#fff' };
        seriesOptions.lineStyle = { width: 3 };
        seriesOptions.areaStyle = { opacity: 0.3 };
      }
      if (chartType === 'scatter' || series.type === 'scatter') {
        seriesOptions.symbolSize = 8;
        seriesOptions.itemStyle = { opacity: 0.8 };
      }
      if (chartType === 'geo' || series.type === 'geo') {
        // For geo, use scatter or effectScatter on geo plane
        seriesOptions.type = 'scatter';
        seriesOptions.coordinateSystem = 'geo';
        seriesOptions.symbolSize = 10;
        seriesOptions.itemStyle = { 
          color: series.color || '#5470c6',
          opacity: 0.8,
          borderColor: '#fff',
          borderWidth: 2
        };
        seriesOptions.label = {
          formatter: '{b}',
          position: 'right',
          show: false
        };
        seriesOptions.emphasis = {
          label: { show: true },
          itemStyle: { 
            borderWidth: 3,
            opacity: 1 
          }
        };
      }

      return seriesOptions;
    });

    // Add visualMap for heatmap
    if ((chartType === 'heatmap' || data.series.some(s => s.type === 'heatmap')) && visualMapConfig) {
      options.visualMap = {
        min: visualMapConfig.min || 0,
        max: visualMapConfig.max || 100,
        text: visualMapConfig.text || ['High', 'Low'],
        realtime: visualMapConfig.realtime !== false,
        calculable: visualMapConfig.calculable !== false,
        inRange: {
          color: visualMapConfig.inRange?.color || ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
        },
        ...visualMapConfig,
      };
    } else if (chartType === 'heatmap' || data.series.some(s => s.type === 'heatmap')) {
      // Default visualMap for heatmap
      options.visualMap = {
        min: 0,
        max: 100,
        text: ['High', 'Low'],
        realtime: true,
        calculable: true,
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
        },
      };
    }

    // Theme-specific adjustments
    if (theme === 'dark') {
      options.backgroundColor = '#1a1a1a';
      options.textStyle = { color: '#ffffff' };
    }

    return options;
  }

  private mapChartType(type: ChartType): string {
    switch (type) {
      case 'area': return 'line'; // ECharts line with areaStyle
      case 'donut': return 'pie'; // Pie with radius
      case 'stacked-bar': return 'bar'; // Bar with stacking
      case 'grouped-bar': return 'bar'; // Bar without stacking
      case 'candlestick': return 'candlestick';
      case 'sankey': return 'sankey';
      case 'radar': return 'radar';
      case 'funnel': return 'funnel';
      case 'geo': return 'scatter'; // Geo as custom scatter on geo map
      default: return type;
    }
  }

  // Event handlers for ECharts
  onChartEvents(event: any) {
    const eventType = event.type;
    const params = event;

    switch (eventType) {
      case 'click':
        this.chartClick.emit({
          series: params.seriesName || '',
          data: params.data,
          index: params.dataIndex || 0
        });
        break;
      case 'mouseover':
        this.dataPointHover.emit({
          series: params.seriesName || '',
          data: params.data,
          position: { x: params.event?.offsetX || 0, y: params.event?.offsetY || 0 }
        });
        break;
      case 'dataZoom':
        if (params.batch && params.batch.length > 0) {
          const zoom = params.batch[0];
          this.dataZoom.emit({
            start: zoom.start || 0,
            end: zoom.end || 100
          });
        }
        break;
    }
  }
}