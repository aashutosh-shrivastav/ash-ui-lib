import { Component, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AshTable, ColumnDef } from 'ash-ui-lib';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

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
    MatButtonToggleModule,
    MatSliderModule,
    MatExpansionModule,
    MatIconModule,
    MatDividerModule,
    FormsModule
  ],
  template: `
    <div class="page-content">
      <h1>Theme Playground - AshTable</h1>
      <p>Interactive theming demonstration with Material Design 3</p>
      
      <!-- Theme Controls -->
      <mat-expansion-panel class="theme-controls" [expanded]="true">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>palette</mat-icon>
            Theme Controls
          </mat-panel-title>
        </mat-expansion-panel-header>
        
        <div class="control-section">
          <h3>Color Palette</h3>
          <mat-button-toggle-group [(ngModel)]="selectedPalette" (change)="applyPalette()">
            <mat-button-toggle value="violet">Violet (Default)</mat-button-toggle>
            <mat-button-toggle value="indigo">Indigo</mat-button-toggle>
            <mat-button-toggle value="cyan">Cyan</mat-button-toggle>
            <mat-button-toggle value="green">Green</mat-button-toggle>
            <mat-button-toggle value="orange">Orange</mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <mat-divider></mat-divider>

        <div class="control-section">
          <h3>Density Scale</h3>
          <mat-button-toggle-group [(ngModel)]="densityScale" (change)="applyDensity()">
            <mat-button-toggle [value]="-2">Dense</mat-button-toggle>
            <mat-button-toggle [value]="-1">Compact</mat-button-toggle>
            <mat-button-toggle [value]="0">Standard</mat-button-toggle>
            <mat-button-toggle [value]="1">Comfortable</mat-button-toggle>
          </mat-button-toggle-group>
          <p class="density-info">
            Current: Row height {{ currentRowHeight() }}px, Header height {{ currentHeaderHeight() }}px
          </p>
        </div>

        <mat-divider></mat-divider>

        <div class="control-section">
          <h3>Custom Color Overrides</h3>
          <div class="color-overrides">
            <div class="color-control">
              <label>Header Background:</label>
              <input type="color" [(ngModel)]="customHeaderBg" (change)="applyCustomColors()">
              <button mat-icon-button (click)="resetColor('headerBg')" title="Reset">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>
            <div class="color-control">
              <label>Row Hover Background:</label>
              <input type="color" [(ngModel)]="customRowHover" (change)="applyCustomColors()">
              <button mat-icon-button (click)="resetColor('rowHover')" title="Reset">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>
            <div class="color-control">
              <label>Selected Row Background:</label>
              <input type="color" [(ngModel)]="customRowSelected" (change)="applyCustomColors()">
              <button mat-icon-button (click)="resetColor('rowSelected')" title="Reset">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </mat-expansion-panel>

      <!-- Table Demo -->
      <div class="table-section">
        <h2>Live Table Demo</h2>
        <lib-ash-table
          [columns]="columns()"
          [dataSource]="products()"
          [pagination]="true"
          [selectionMode]="'multi'"
          [config]="{
            pageSize: 10,
            pageSizeOptions: [5, 10, 25, 50],
            stickyHeader: true
          }"
          (rowSelect)="onRowSelect($event)">
        </lib-ash-table>
        
        @if (selectedCount() > 0) {
          <div class="selection-info">
            <mat-icon>check_circle</mat-icon>
            Selected {{ selectedCount() }} product(s)
          </div>
        }
      </div>

      <!-- Theme Information -->
      <mat-expansion-panel class="theme-info">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>info</mat-icon>
            Current Theme Configuration
          </mat-panel-title>
        </mat-expansion-panel-header>
        
        <div class="info-content">
          <h3>Active CSS Variables</h3>
          <div class="css-variables">
            <div class="variable-item">
              <code>--ash-table-header-bg:</code>
              <span class="color-preview" [style.background-color]="getComputedVariable('--ash-table-header-bg')"></span>
              <span>{{ getComputedVariable('--ash-table-header-bg') }}</span>
            </div>
            <div class="variable-item">
              <code>--ash-table-row-hover-bg:</code>
              <span class="color-preview" [style.background-color]="getComputedVariable('--ash-table-row-hover-bg')"></span>
              <span>{{ getComputedVariable('--ash-table-row-hover-bg') }}</span>
            </div>
            <div class="variable-item">
              <code>--ash-table-row-selected-bg:</code>
              <span class="color-preview" [style.background-color]="getComputedVariable('--ash-table-row-selected-bg')"></span>
              <span>{{ getComputedVariable('--ash-table-row-selected-bg') }}</span>
            </div>
            <div class="variable-item">
              <code>--ash-table-row-height:</code>
              <span>{{ getComputedVariable('--ash-table-row-height') }}</span>
            </div>
            <div class="variable-item">
              <code>--ash-table-header-height:</code>
              <span>{{ getComputedVariable('--ash-table-header-height') }}</span>
            </div>
          </div>
        </div>
      </mat-expansion-panel>
    </div>
  `,
  styles: [`
    .page-content {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    h1 {
      margin-bottom: 8px;
    }
    
    p {
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 24px;
    }

    .theme-controls, .theme-info {
      margin-bottom: 32px;
    }

    .control-section {
      padding: 16px 0;
    }

    .control-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    mat-button-toggle-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .density-info {
      margin-top: 12px;
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant);
    }

    .color-overrides {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .color-control {
      display: flex;
      align-items: center;
      gap: 12px;

      label {
        font-size: 14px;
        color: var(--mat-sys-on-surface);
        min-width: 180px;
      }

      input[type="color"] {
        width: 60px;
        height: 36px;
        border: 1px solid var(--mat-sys-outline);
        border-radius: 4px;
        cursor: pointer;
      }

      button {
        width: 36px;
        height: 36px;
      }
    }

    .table-section {
      margin-bottom: 32px;

      h2 {
        margin-bottom: 16px;
        font-size: 20px;
        font-weight: 500;
      }
    }
    
    .selection-info {
      margin-top: 16px;
      padding: 12px 16px;
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      border-left: 4px solid var(--mat-sys-primary);
      border-radius: 4px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-divider {
      margin: 16px 0;
    }

    .info-content {
      h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .css-variables {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .variable-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background-color: var(--mat-sys-surface-container-low);
      border-radius: 4px;
      font-size: 13px;

      code {
        font-family: 'Courier New', monospace;
        color: var(--mat-sys-primary);
        min-width: 250px;
      }

      .color-preview {
        width: 24px;
        height: 24px;
        border: 1px solid var(--mat-sys-outline);
        border-radius: 4px;
      }

      span:last-child {
        color: var(--mat-sys-on-surface-variant);
        font-family: 'Courier New', monospace;
      }
    }
  `]
})
export class PlaygroundPageComponent {
  private readonly platformId = inject(PLATFORM_ID);
  
  protected readonly selectedCount = signal(0);
  protected selectedPalette = 'violet';
  protected densityScale = 0;
  protected customHeaderBg = '';
  protected customRowHover = '';
  protected customRowSelected = '';
  
  protected readonly currentRowHeight = signal(52);
  protected readonly currentHeaderHeight = signal(56);
  
  constructor() {
    // Initialize density on load
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.updateDensitySignals(), 100);
    }
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

  private updateDensitySignals(): void {
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
}