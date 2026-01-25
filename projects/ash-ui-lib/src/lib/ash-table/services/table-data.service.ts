import { Injectable } from '@angular/core';
import { FilterDescriptor, SortDescriptor } from '../models/table-event.model';

/**
 * Service for table data operations (filtering, sorting, pagination)
 */
@Injectable({
  providedIn: 'root'
})
export class TableDataService {
  
  /**
   * Filter data based on filter descriptors
   */
  filterData<T>(data: T[], filters: FilterDescriptor[]): T[] {
    if (!filters || filters.length === 0) {
      return data;
    }

    return data.filter(row => {
      return filters.every(filter => {
        const value = (row as any)[filter.field];
        const filterValue = filter.value;

        if (value === null || value === undefined) {
          return false;
        }

        const stringValue = String(value).toLowerCase();
        const stringFilterValue = String(filterValue).toLowerCase();

        switch (filter.operator) {
          case 'contains':
            return stringValue.includes(stringFilterValue);
          case 'equals':
            return stringValue === stringFilterValue;
          case 'startsWith':
            return stringValue.startsWith(stringFilterValue);
          case 'endsWith':
            return stringValue.endsWith(stringFilterValue);
          case 'gt':
            return Number(value) > Number(filterValue);
          case 'lt':
            return Number(value) < Number(filterValue);
          default:
            return true;
        }
      });
    });
  }

  /**
   * Sort data based on sort descriptor
   */
  sortData<T>(data: T[], sort: SortDescriptor): T[] {
    if (!sort || !sort.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sort.column];
      const bValue = (b as any)[sort.column];

      if (aValue === bValue) {
        return 0;
      }

      const comparison = aValue > bValue ? 1 : -1;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Paginate data
   */
  paginateData<T>(data: T[], pageIndex: number, pageSize: number): T[] {
    const startIndex = pageIndex * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }

  /**
   * Apply all transformations (filter, sort, paginate)
   */
  transformData<T>(
    data: T[],
    filters: FilterDescriptor[],
    sort: SortDescriptor | null,
    pageIndex: number,
    pageSize: number
  ): { data: T[]; total: number } {
    let transformed = this.filterData(data, filters);
    
    if (sort) {
      transformed = this.sortData(transformed, sort);
    }

    const total = transformed.length;
    const paginatedData = this.paginateData(transformed, pageIndex, pageSize);

    return { data: paginatedData, total };
  }
}
