import { Injectable } from '@angular/core';
import { ColumnDef } from '../models/column-def.model';

/**
 * Service for exporting table data to various formats
 */
@Injectable({
  providedIn: 'root'
})
export class TableExportService {
  
  /**
   * Export data to CSV format
   */
  exportToCSV<T>(data: T[], columns: ColumnDef<T>[], filename = 'table-export.csv'): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Create CSV headers
    const headers = columns
      .filter(col => col.visible !== false)
      .map(col => this.escapeCsvValue(col.label))
      .join(',');

    // Create CSV rows
    const rows = data.map(row => {
      return columns
        .filter(col => col.visible !== false)
        .map(col => {
          const value = (row as any)[col.key];
          const formattedValue = col.format ? col.format(value) : value;
          return this.escapeCsvValue(String(formattedValue ?? ''));
        })
        .join(',');
    });

    const csv = [headers, ...rows].join('\n');
    this.downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Export data to Excel format (requires xlsx library)
   */
  exportToExcel<T>(data: T[], columns: ColumnDef<T>[], filename = 'table-export.xlsx'): void {
    console.warn('Excel export requires xlsx library. Please install: npm install xlsx');
    // Implementation would require xlsx library
    // import * as XLSX from 'xlsx';
    // const ws = XLSX.utils.json_to_sheet(data);
    // const wb = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    // XLSX.writeFile(wb, filename);
  }

  /**
   * Export data to PDF format (requires jspdf library)
   */
  exportToPDF<T>(data: T[], columns: ColumnDef<T>[], filename = 'table-export.pdf'): void {
    console.warn('PDF export requires jspdf and jspdf-autotable libraries.');
    // Implementation would require jspdf library
    // import jsPDF from 'jspdf';
    // import autoTable from 'jspdf-autotable';
    // const doc = new jsPDF();
    // autoTable(doc, { head: [headers], body: rows });
    // doc.save(filename);
  }

  /**
   * Escape special characters in CSV values
   */
  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Download file helper
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
