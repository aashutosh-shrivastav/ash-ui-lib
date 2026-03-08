import { Component, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AshTable, ColumnDef, AshToastService } from 'ash-ui-lib';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
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
    AshFormDemoComponent,
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