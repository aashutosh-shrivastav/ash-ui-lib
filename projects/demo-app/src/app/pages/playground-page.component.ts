import { Component, signal } from '@angular/core';
import { AshTable, ColumnDef } from 'ash-ui-lib';

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
  imports: [AshTable],
  template: `
    <div class="page-content">
      <h1>Playground - AshTable Demo</h1>
      <p>Testing the AshTable component with product data</p>
      
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
          Selected {{ selectedCount() }} product(s)
        </div>
      }
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
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 24px;
    }
    
    .selection-info {
      margin-top: 16px;
      padding: 12px 16px;
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      border-radius: 4px;
      font-weight: 500;
    }
  `]
})
export class PlaygroundPageComponent {
  protected readonly selectedCount = signal(0);
  
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
}