/**
 * Table configuration options
 */
export interface TableConfig {
  /** Enable CDK virtual scrolling for large datasets */
  virtualScroll?: boolean;
  
  /** Row height in pixels (required for virtual scroll) */
  itemSize?: number;
  
  /** Minimum buffer size in pixels for virtual scroll */
  minBufferPx?: number;
  
  /** Maximum buffer size in pixels for virtual scroll */
  maxBufferPx?: number;
  
  /** Default page size */
  pageSize?: number;
  
  /** Available page size options */
  pageSizeOptions?: number[];
  
  /** Show first/last page buttons in paginator */
  showFirstLastButtons?: boolean;
  
  /** Sticky table header on scroll */
  stickyHeader?: boolean;
  
  /** Enable multi-column sorting (Shift+Click) */
  multiSort?: boolean;
  
  /** Enable column resizing */
  resizableColumns?: boolean;
  
  /** Enable column reordering via drag-drop */
  reorderableColumns?: boolean;
  
  /** Track by function for row identity */
  trackBy?: (index: number, item: any) => any;
  
  /** Table caption for accessibility */
  tableCaption?: string;
}
