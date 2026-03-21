import { Component, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AshTable, ColumnDef, AshToastService, AshChart, ChartSeriesData, ChartType, AshCalendar, DateStyle } from 'ash-ui-lib';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AshFormDemoComponent } from './ash-form-demo.component';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  lastUpdated: Date;
}

@Component({
  selector: 'app-playground-page',
  imports: [
    AshTable,
    AshChart,
    AshCalendar,
    AshFormDemoComponent,
    CommonModule,
    MatButtonToggleModule,
    MatSliderModule,
    MatExpansionModule,
    MatIconModule,
    MatDividerModule,
    FormsModule
  ],
  templateUrl: './playground-page.component.html',
  styleUrl: './playground-page.component.scss'
})
export class PlaygroundPageComponent {
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly toast = inject(AshToastService);
  
  protected selectedComponent = 'table';
  protected readonly selectedCount = signal(0);
  protected selectedPalette = 'violet';
  protected densityScale = 0;
  protected customHeaderBg = '';
  protected customRowHover = '';
  protected customRowSelected = '';
  
  protected readonly currentRowHeight = signal(52);
  protected readonly currentHeaderHeight = signal(56);

  // Calendar demo data
  protected readonly selectedCalendarType = signal<'empty' | 'success' | 'alert' | 'warning' | 'info' | 'mixed' | 'fire' | 'restrictions' | 'disabled' | 'rtl' | 'manyEvents'>('mixed');
  
  // Calendar reference dates for template
  protected readonly calendarRefDate = new Date(2026, 2, 20); // March 20, 2026
  protected readonly calendarMinDate = new Date(2026, 2, 1);   // March 1, 2026
  protected readonly calendarMaxDate = new Date(2026, 2, 31);  // March 31, 2026
  
  protected readonly emptyCalendarData = signal<DateStyle[]>([]);
  
  protected readonly successCalendarData = signal<DateStyle[]>([
    { date: new Date(2026, 2, 5), cssClass: 'event-success', tooltip: 'Project launched' },
    { date: new Date(2026, 2, 12), cssClass: 'event-success', tooltip: 'Milestone reached' },
    { date: new Date(2026, 2, 19), cssClass: 'event-success', tooltip: 'Release day' },
    { date: new Date(2026, 2, 26), cssClass: 'event-success', tooltip: 'Deployment successful' }
  ]);

  protected readonly alertCalendarData = signal<DateStyle[]>([
    { date: new Date(2026, 2, 3), cssClass: 'event-alert', tooltip: 'Deadline approaching' },
    { date: new Date(2026, 2, 10), cssClass: 'event-alert', tooltip: 'Critical issue' },
    { date: new Date(2026, 2, 17), cssClass: 'event-alert', tooltip: 'Urgent review' },
    { date: new Date(2026, 2, 25), cssClass: 'event-alert', tooltip: 'System maintenance' }
  ]);

  protected readonly mixedCalendarData = signal<DateStyle[]>([
    { date: new Date(2026, 2, 2), cssClass: 'event-info', tooltip: 'Team meeting' },
    { date: new Date(2026, 2, 5), cssClass: 'event-success', tooltip: 'Project launched' },
    { date: new Date(2026, 2, 8), cssClass: 'event-warning', tooltip: 'Review pending' },
    { date: new Date(2026, 2, 12), cssClass: 'event-success', tooltip: 'Milestone reached' },
    { date: new Date(2026, 2, 15), cssClass: 'event-alert', tooltip: 'Urgent issue' },
    { date: new Date(2026, 2, 18), cssClass: 'event-info', tooltip: 'Conference' },
    { date: new Date(2026, 2, 22), cssClass: 'event-success', tooltip: 'Deployment successful' },
    { date: new Date(2026, 2, 25), cssClass: 'event-warning', tooltip: 'Maintenance window' }
  ]);

  protected readonly restrictedCalendarData = signal<DateStyle[]>([
    { date: new Date(2026, 2, 5), cssClass: 'event-success', tooltip: 'Available' },
    { date: new Date(2026, 2, 10), cssClass: 'event-info', tooltip: 'Available' },
    { date: new Date(2026, 2, 15), cssClass: 'event-success', tooltip: 'Available' },
    { date: new Date(2026, 2, 20), cssClass: 'event-success', tooltip: 'Today - Available' }
  ]);

  protected readonly disabledCalendarData = signal<DateStyle[]>([
    { date: new Date(2026, 2, 5), cssClass: 'event-success', tooltip: 'Not selectable' },
    { date: new Date(2026, 2, 12), cssClass: 'event-alert', tooltip: 'Not selectable' }
  ]);

  protected readonly warningCalendarData = signal<DateStyle[]>([
    { date: new Date(2026, 2, 4), cssClass: 'event-warning', tooltip: 'Scheduled maintenance' },
    { date: new Date(2026, 2, 9), cssClass: 'event-warning', tooltip: 'System update pending' },
    { date: new Date(2026, 2, 16), cssClass: 'event-warning', tooltip: 'Performance review' },
    { date: new Date(2026, 2, 23), cssClass: 'event-warning', tooltip: 'Database optimization' }
  ]);

  protected readonly infoCalendarData = signal<DateStyle[]>([
    { date: new Date(2026, 2, 3), cssClass: 'event-info', tooltip: 'Team standup' },
    { date: new Date(2026, 2, 7), cssClass: 'event-info', tooltip: 'Sprint planning' },
    { date: new Date(2026, 2, 11), cssClass: 'event-info', tooltip: 'All hands meeting' },
    { date: new Date(2026, 2, 14), cssClass: 'event-info', tooltip: 'One-on-one reviews' },
    { date: new Date(2026, 2, 21), cssClass: 'event-info', tooltip: 'Retrospective' },
    { date: new Date(2026, 2, 28), cssClass: 'event-info', tooltip: 'Q2 planning' }
  ]);

  protected readonly fireCalendarData = signal<DateStyle[]>([
    { date: new Date(2026, 2, 5), cssClass: 'event-fire', tooltip: 'Critical issue - System overload' },
    { date: new Date(2026, 2, 8), cssClass: 'event-fire', tooltip: 'Emergency maintenance required' },
    { date: new Date(2026, 2, 12), cssClass: 'event-success', tooltip: 'Issue resolved' },
    { date: new Date(2026, 2, 15), cssClass: 'event-success', tooltip: 'System stabilized' }
  ]);

  protected readonly rtlCalendarData = signal<DateStyle[]>([
    { date: new Date(2026, 2, 5), cssClass: 'event-success', tooltip: 'مرحبا - مشروع تم إطلاقه' },
    { date: new Date(2026, 2, 12), cssClass: 'event-alert', tooltip: 'مشكلة حرجة' },
    { date: new Date(2026, 2, 19), cssClass: 'event-info', tooltip: 'اجتماع الفريق' },
    { date: new Date(2026, 2, 26), cssClass: 'event-success', tooltip: 'نشر ناجح' }
  ]);

  protected readonly manyEventsData = signal<DateStyle[]>([
    // Week 1
    { date: new Date(2026, 2, 2), cssClass: 'event-info', tooltip: 'Event 1' },
    { date: new Date(2026, 2, 3), cssClass: 'event-success', tooltip: 'Event 2' },
    { date: new Date(2026, 2, 4), cssClass: 'event-warning', tooltip: 'Event 3' },
    { date: new Date(2026, 2, 5), cssClass: 'event-alert', tooltip: 'Event 4' },
    { date: new Date(2026, 2, 6), cssClass: 'event-info', tooltip: 'Event 5' },
    // Week 2
    { date: new Date(2026, 2, 9), cssClass: 'event-success', tooltip: 'Event 6' },
    { date: new Date(2026, 2, 10), cssClass: 'event-warning', tooltip: 'Event 7' },
    { date: new Date(2026, 2, 11), cssClass: 'event-alert', tooltip: 'Event 8' },
    { date: new Date(2026, 2, 12), cssClass: 'event-fire', tooltip: 'Event 9' },
    { date: new Date(2026, 2, 13), cssClass: 'event-info', tooltip: 'Event 10' },
    // Week 3
    { date: new Date(2026, 2, 16), cssClass: 'event-success', tooltip: 'Event 11' },
    { date: new Date(2026, 2, 17), cssClass: 'event-warning', tooltip: 'Event 12' },
    { date: new Date(2026, 2, 18), cssClass: 'event-alert', tooltip: 'Event 13' },
    { date: new Date(2026, 2, 19), cssClass: 'event-success', tooltip: 'Event 14' },
    { date: new Date(2026, 2, 20), cssClass: 'event-fire', tooltip: 'Event 15' },
    // Week 4
    { date: new Date(2026, 2, 23), cssClass: 'event-info', tooltip: 'Event 16' },
    { date: new Date(2026, 2, 24), cssClass: 'event-success', tooltip: 'Event 17' },
    { date: new Date(2026, 2, 25), cssClass: 'event-warning', tooltip: 'Event 18' },
    { date: new Date(2026, 2, 26), cssClass: 'event-alert', tooltip: 'Event 19' },
    { date: new Date(2026, 2, 27), cssClass: 'event-success', tooltip: 'Event 20' }
  ]);
  
  // Chart demo data
  protected readonly selectedChart = signal<ChartType>('line');
  protected readonly lineChartData = signal<ChartSeriesData>({
    series: [
      {
        name: 'Revenue',
        data: [120, 132, 101, 134, 90, 230, 210, 220, 182, 191, 234, 290]
      },
      {
        name: 'Profit',
        data: [220, 182, 191, 234, 290, 330, 310, 320, 332, 301, 334, 360]
      }
    ]
  });

  protected readonly areaChartData = signal<ChartSeriesData>({
    series: [
      {
        name: 'Income',
        data: [120, 132, 101, 134, 90, 230, 210, 220, 182, 191, 234, 290]
      },
      {
        name: 'Expenses',
        data: [220, 182, 191, 234, 290, 330, 310, 320, 332, 301, 334, 360]
      }
    ]
  });

  protected readonly barChartData = signal<ChartSeriesData>({
    series: [
      {
        name: 'Q1 Sales',
        data: [320, 302, 301, 334, 390]
      },
      {
        name: 'Q2 Sales',
        data: [120, 132, 101, 134, 90]
      },
      {
        name: 'Q3 Sales',
        data: [220, 182, 191, 234, 290]
      }
    ]
  });

  protected readonly pieChartData = signal<ChartSeriesData>({
    series: [
      {
        name: 'Market Share',
        data: [
          { name: 'Product A', value: 45 },
          { name: 'Product B', value: 30 },
          { name: 'Product C', value: 15 },
          { name: 'Product D', value: 10 }
        ]
      }
    ]
  });

  protected readonly gaugeChartData = signal<ChartSeriesData>({
    series: [
      {
        name: 'KPI Achievement',
        data: [75],
        type: 'gauge'
      }
    ]
  });

  protected readonly heatmapChartData = signal<ChartSeriesData>({
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    series: [
      {
        name: 'Heatmap Data',
        data: Array.from({ length: 10 }, (_, x) =>
          Array.from({ length: 7 }, (_, y) => [x, y, Math.floor(Math.random() * 100)])
        ).flat()
      }
    ]
  });

  protected readonly scatterChartData = signal<ChartSeriesData>({
    series: [
      {
        name: 'Series 1',
        data: Array.from({ length: 20 }, () => [
          Math.random() * 100,
          Math.random() * 100
        ])
      },
      {
        name: 'Series 2',
        data: Array.from({ length: 20 }, () => [
          Math.random() * 100,
          Math.random() * 100
        ])
      }
    ]
  });

  protected readonly radarChartData = signal<ChartSeriesData>({
    series: [
      {
        name: 'Skills',
        data: [80, 90, 70, 85, 75, 95]
      },
      {
        name: 'Competitor',
        data: [70, 85, 75, 80, 80, 85]
      }
    ]
  });

  protected readonly funnelChartData = signal<ChartSeriesData>({
    series: [
      {
        name: 'Sales Funnel',
        data: [
          { name: 'Leads', value: 100 },
          { name: 'Interested', value: 75 },
          { name: 'Qualified', value: 50 },
          { name: 'Negotiation', value: 30 },
          { name: 'Closed', value: 20 }
        ]
      }
    ]
  });

  protected readonly stackedBarData = signal<ChartSeriesData>({
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      {
        name: 'Product A',
        data: [120, 132, 101, 134, 90, 230],
        stack: 'total'
      },
      {
        name: 'Product B',
        data: [220, 182, 191, 234, 290, 330],
        stack: 'total'
      },
      {
        name: 'Product C',
        data: [150, 232, 201, 154, 190, 330],
        stack: 'total'
      }
    ]
  });

  protected readonly groupedBarData = signal<ChartSeriesData>({
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      {
        name: 'Product A',
        data: [120, 132, 101, 134, 90, 230]
      },
      {
        name: 'Product B',
        data: [220, 182, 191, 234, 290, 330]
      },
      {
        name: 'Product C',
        data: [150, 232, 201, 154, 190, 330]
      }
    ]
  });

  protected readonly improvedRadarData = signal<ChartSeriesData>({
    categories: ['Sales', 'Marketing', 'Development', 'Customer Support', 'Information Technology', 'Administration'],
    series: [
      {
        name: 'Team A',
        data: [85, 90, 78, 82, 88, 92]
      },
      {
        name: 'Team B',
        data: [78, 82, 85, 78, 92, 85]
      }
    ]
  });

  protected readonly geoMapData = signal<ChartSeriesData>({
    series: [
      {
        name: 'Geographic Distribution',
        type: 'scatter',
        data: [
          { name: 'New York', value: [-74.0060, 40.7128, 8500000] },
          { name: 'London', value: [-0.1278, 51.5074, 9000000] },
          { name: 'Tokyo', value: [139.6503, 35.6762, 13960000] },
          { name: 'Singapore', value: [103.8198, 1.3521, 5850000] },
          { name: 'Dubai', value: [55.2708, 25.2048, 3600000] },
          { name: 'Sydney', value: [151.2093, -33.8688, 5300000] }
        ]
      }
    ]
  });

  constructor() {
    // Initialize density on load
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.updateDensitySignals(), 100);
    }
  }

  protected showSuccessToast(): void {
    this.toast.success('Operation completed successfully',50000);
  }

  protected showErrorToast(): void {
    this.toast.error('An error occurred',50000);
  }
  
  protected readonly columns = signal<ColumnDef<Product>[]>([
    { 
      key: 'id', 
      label: 'ID', 
      type: 'number', 
      sortable: true, 
      width: '80px' 
    },
    { 
      key: 'name', 
      label: 'Product Name', 
      sortable: true, 
      filterable: true 
    },
    { 
      key: 'category', 
      label: 'Category', 
      sortable: true, 
      filterable: true 
    },
    { 
      key: 'price', 
      label: 'Price', 
      type: 'currency', 
      sortable: true,
      format: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      key: 'stock', 
      label: 'Stock', 
      type: 'number', 
      sortable: true,
      filterable: true 
    },
    { 
      key: 'lastUpdated', 
      label: 'Last Updated', 
      type: 'date',
      sortable: true,
      format: (value: Date) => value.toLocaleDateString()
    }
  ]);
  
  protected readonly products = signal<Product[]>([
    { id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock: 150, lastUpdated: new Date('2024-01-15') },
    { id: 2, name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99, stock: 75, lastUpdated: new Date('2024-01-18') },
    { id: 3, name: 'USB-C Cable', category: 'Accessories', price: 12.99, stock: 300, lastUpdated: new Date('2024-01-10') },
    { id: 4, name: 'Laptop Stand', category: 'Accessories', price: 45.50, stock: 120, lastUpdated: new Date('2024-01-20') },
    { id: 5, name: 'Webcam HD', category: 'Electronics', price: 69.99, stock: 90, lastUpdated: new Date('2024-01-12') },
    { id: 6, name: 'Desk Lamp', category: 'Furniture', price: 35.00, stock: 60, lastUpdated: new Date('2024-01-22') },
    { id: 7, name: 'Monitor 24"', category: 'Electronics', price: 199.99, stock: 45, lastUpdated: new Date('2024-01-14') },
    { id: 8, name: 'Office Chair', category: 'Furniture', price: 299.99, stock: 30, lastUpdated: new Date('2024-01-16') },
    { id: 9, name: 'Headphones', category: 'Electronics', price: 79.99, stock: 100, lastUpdated: new Date('2024-01-19') },
    { id: 10, name: 'Mouse Pad', category: 'Accessories', price: 15.99, stock: 200, lastUpdated: new Date('2024-01-11') },
    { id: 11, name: 'External SSD 1TB', category: 'Storage', price: 129.99, stock: 85, lastUpdated: new Date('2024-01-13') },
    { id: 12, name: 'USB Hub', category: 'Accessories', price: 24.99, stock: 150, lastUpdated: new Date('2024-01-17') },
    { id: 13, name: 'Bluetooth Speaker', category: 'Electronics', price: 49.99, stock: 110, lastUpdated: new Date('2024-01-21') },
    { id: 14, name: 'Desk Organizer', category: 'Furniture', price: 19.99, stock: 75, lastUpdated: new Date('2024-01-09') },
    { id: 15, name: 'Wireless Charger', category: 'Accessories', price: 34.99, stock: 95, lastUpdated: new Date('2024-01-23') },
  ]);
  
  protected onRowSelect(event: any): void {
    this.selectedCount.set(event.selected.length);
    console.log('Selected products:', event.selected);
  }

  protected applyPalette(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Map palette names to color values that simulate different Material palettes
    // These directly update the --ash-table-* variables to demonstrate theming
    const paletteMap: { [key: string]: { primary: string; container: string; onContainer: string } } = {
      violet: { primary: '#6750a4', container: '#ecdcff', onContainer: '#21005e' },
      indigo: { primary: '#3f51b5', container: '#c5cae9', onContainer: '#1a237e' },
      cyan: { primary: '#00bcd4', container: '#b2ebf2', onContainer: '#006064' },
      green: { primary: '#4caf50', container: '#c8e6c9', onContainer: '#1b5e20' },
      orange: { primary: '#ff9800', container: '#ffe0b2', onContainer: '#e65100' }
    };
    
    // Target the table element directly, not the root
    const tableElement = document.querySelector('lib-ash-table') as HTMLElement;
    if (!tableElement) {
      console.warn('Table element not found');
      return;
    }
    
    const palette = paletteMap[this.selectedPalette];
    
    if (palette) {
      // Update table-specific variables on the component element
      tableElement.style.setProperty('--ash-table-row-selected-bg', palette.container);
      tableElement.style.setProperty('--ash-table-row-selected-color', palette.onContainer);
      tableElement.style.setProperty('--ash-table-filter-active-color', palette.primary);
      tableElement.style.setProperty('--ash-table-filter-input-focus-border', palette.primary);
      tableElement.style.setProperty('--ash-table-resize-handle-hover', palette.primary);
      tableElement.style.setProperty('--ash-table-resize-handle-active', palette.primary);
      
      console.log(`Applied ${this.selectedPalette} palette colors to table element`);
    }
  }

  protected applyDensity(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const tableElement = document.querySelector('lib-ash-table') as HTMLElement;
    if (!tableElement) {
      console.warn('Table element not found');
      return;
    }
    
    const densityMap: { [key: number]: { row: number; header: number; paddingV: number; paddingH: number } } = {
      '-2': { row: 36, header: 40, paddingV: 6, paddingH: 8 },
      '-1': { row: 44, header: 48, paddingV: 8, paddingH: 12 },
      '0': { row: 52, header: 56, paddingV: 12, paddingH: 16 },
      '1': { row: 60, header: 64, paddingV: 16, paddingH: 20 }
    };
    
    const density = densityMap[this.densityScale];
    if (density) {
      tableElement.style.setProperty('--ash-table-row-height', `${density.row}px`);
      tableElement.style.setProperty('--ash-table-header-height', `${density.header}px`);
      tableElement.style.setProperty('--ash-table-cell-padding-vertical', `${density.paddingV}px`);
      tableElement.style.setProperty('--ash-table-cell-padding-horizontal', `${density.paddingH}px`);
      
      // Update signals to reflect current values
      this.currentRowHeight.set(density.row);
      this.currentHeaderHeight.set(density.header);
      
      console.log(`Applied density ${this.densityScale}: row ${density.row}px, header ${density.header}px`);
    }
  }

  protected applyCustomColors(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const tableElement = document.querySelector('lib-ash-table') as HTMLElement;
    if (!tableElement) {
      console.warn('Table element not found');
      return;
    }
    
    if (this.customHeaderBg) {
      tableElement.style.setProperty('--ash-table-header-bg', this.customHeaderBg);
      console.log('Applied custom header background:', this.customHeaderBg);
    }
    
    if (this.customRowHover) {
      tableElement.style.setProperty('--ash-table-row-hover-bg', this.customRowHover);
      console.log('Applied custom row hover background:', this.customRowHover);
    }
    
    if (this.customRowSelected) {
      tableElement.style.setProperty('--ash-table-row-selected-bg', this.customRowSelected);
      console.log('Applied custom selected row background:', this.customRowSelected);
    }
  }

  protected resetColor(type: 'headerBg' | 'rowHover' | 'rowSelected'): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const tableElement = document.querySelector('lib-ash-table') as HTMLElement;
    if (!tableElement) {
      console.warn('Table element not found');
      return;
    }
    
    switch (type) {
      case 'headerBg':
        this.customHeaderBg = '';
        tableElement.style.removeProperty('--ash-table-header-bg');
        console.log('Reset header background to default');
        break;
      case 'rowHover':
        this.customRowHover = '';
        tableElement.style.removeProperty('--ash-table-row-hover-bg');
        console.log('Reset row hover to default');
        break;
      case 'rowSelected':
        this.customRowSelected = '';
        tableElement.style.removeProperty('--ash-table-row-selected-bg');
        console.log('Reset selected row to default');
        break;
    }
  }

  protected getComputedVariable(variableName: string): string {
    if (!isPlatformBrowser(this.platformId)) return 'N/A';
    
    const tableElement = document.querySelector('lib-ash-table') as HTMLElement;
    if (!tableElement) return 'Table not found';
    
    const computedStyle = getComputedStyle(tableElement);
    return computedStyle.getPropertyValue(variableName).trim() || 'Not set';
  }

  protected updateDensitySignals(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const tableElement = document.querySelector('lib-ash-table') as HTMLElement;
    if (!tableElement) return;
    
    const computedStyle = getComputedStyle(tableElement);
    
    const rowHeight = computedStyle.getPropertyValue('--ash-table-row-height').trim();
    const headerHeight = computedStyle.getPropertyValue('--ash-table-header-height').trim();
    
    if (rowHeight) {
      this.currentRowHeight.set(parseInt(rowHeight));
    }
    
    if (headerHeight) {
      this.currentHeaderHeight.set(parseInt(headerHeight));
    }
  }

  protected getCurrentChartData(): ChartSeriesData {
    const dataMap: { [key: string]: ChartSeriesData } = {
      'line': this.lineChartData(),
      'area': this.areaChartData(),
      'bar': this.barChartData(),
      'stacked-bar': this.stackedBarData(),
      'grouped-bar': this.groupedBarData(),
      'pie': this.pieChartData(),
      'gauge': this.gaugeChartData(),
      'heatmap': this.heatmapChartData(),
      'scatter': this.scatterChartData(),
      'radar': this.improvedRadarData(),
      'funnel': this.funnelChartData(),
      'geo': this.geoMapData()
    };
    return dataMap[this.selectedChart()] || this.lineChartData();
  }

  protected onChartClick(event: any): void {
    this.toast.success(`Chart clicked on ${event.series || 'chart'}`, 3000);
  }

  protected onChartZoom(event: any): void {
    console.log('Chart zoom/pan event:', event);
  }

  protected getCurrentCalendarData(): DateStyle[] {
    const dataMap: { [key: string]: DateStyle[] } = {
      'empty': this.emptyCalendarData(),
      'success': this.successCalendarData(),
      'alert': this.alertCalendarData(),
      'warning': this.warningCalendarData(),
      'info': this.infoCalendarData(),
      'mixed': this.mixedCalendarData(),
      'fire': this.fireCalendarData(),
      'restrictions': this.restrictedCalendarData(),
      'disabled': this.disabledCalendarData(),
      'rtl': this.rtlCalendarData(),
      'manyEvents': this.manyEventsData()
    };
    return dataMap[this.selectedCalendarType()] || this.mixedCalendarData();
  }

  protected onCalendarDateSelect(date: Date): void {
    this.toast.success(`Selected: ${date.toLocaleDateString()}`, 3000);
    console.log('Calendar date selected:', date);
  }
}