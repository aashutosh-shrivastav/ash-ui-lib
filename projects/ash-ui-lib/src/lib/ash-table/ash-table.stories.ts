import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { AshTable } from './ash-table';
import { ColumnDef } from './models/column-def.model';
import { provideAnimations } from '@angular/platform-browser/animations';

interface Customer {
  id: number;
  name: string;
  email: string;
  revenue: number;
  status: 'active' | 'inactive' | 'pending';
  joinDate: Date;
}

const generateCustomers = (count: number): Customer[] => {
  const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];
  const names = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Digital Ventures'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`,
    email: `contact${i + 1}@example.com`,
    revenue: Math.floor(Math.random() * 500000) + 50000,
    status: statuses[i % 3],
    joinDate: new Date(2023 + Math.floor(i / 100), (i * 3) % 12, (i * 7) % 28 + 1)
  }));
};

const mockColumns: ColumnDef<Customer>[] = [
  { key: 'id', label: 'ID', type: 'number', sortable: true, width: '80px' },
  { key: 'name', label: 'Customer Name', sortable: true, filterable: true },
  { key: 'email', label: 'Email Address', filterable: true },
  { 
    key: 'revenue', 
    label: 'Revenue', 
    type: 'currency', 
    sortable: true,
    filterable: true,
    format: (value: number) => `$${value.toLocaleString()}`
  },
  { key: 'status', label: 'Status', sortable: true, filterable: true },
  { 
    key: 'joinDate', 
    label: 'Join Date', 
    type: 'date',
    sortable: true,
    format: (value: Date) => value.toLocaleDateString()
  }
];

const meta: Meta<AshTable> = {
  title: 'Enterprise/AshTable',
  component: AshTable,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Show loading spinner'
    },
    error: {
      control: 'boolean',
      description: 'Show error state'
    },
    pagination: {
      control: 'boolean',
      description: 'Enable pagination'
    },
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multi'],
      description: 'Row selection behavior'
    },
    serverSide: {
      control: 'boolean',
      description: 'Enable server-side mode'
    }
  }
};

export default meta;
type Story = StoryObj<AshTable>;

/**
 * Default - Basic table with 50 rows
 */
export const Default: Story = {
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(50),
    pagination: true,
    selectionMode: 'none',
    config: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100],
      stickyHeader: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic table with 50 customer records, pagination enabled, sortable and filterable columns. Try clicking column headers to sort, and the filter icon to filter data.'
      }
    }
  }
};

/**
 * Empty state - No data available
 */
export const Empty: Story = {
  args: {
    columns: mockColumns,
    dataSource: [],
    pagination: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays an empty state with icon and message when no data is available.'
      }
    }
  }
};

/**
 * Loading state - Async data loading
 */
export const Loading: Story = {
  args: {
    columns: mockColumns,
    dataSource: [],
    loading: true,
    pagination: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a loading spinner while data is being fetched.'
      }
    }
  }
};

/**
 * Error state - Failed to load data
 */
export const ErrorState: Story = {
  args: {
    columns: mockColumns,
    dataSource: [],
    error: true,
    errorMessage: 'Failed to fetch customer data. Please try again.',
    pagination: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays an error message when data loading fails.'
      }
    }
  }
};

/**
 * With Selection - Single row selection
 */
export const SingleSelection: Story = {
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(25),
    pagination: true,
    selectionMode: 'single'
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with single row selection enabled. Click on a checkbox to select a row.'
      }
    }
  }
};

/**
 * With Multi Selection - Multiple row selection
 */
export const MultiSelection: Story = {
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(25),
    pagination: true,
    selectionMode: 'multi'
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with multiple row selection. Use the header checkbox to select/deselect all visible rows.'
      }
    }
  }
};

/**
 * Large Dataset - 1000 rows for performance testing
 */
export const LargeDataset: Story = {
  name: '1,000 Rows',
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(1000),
    pagination: true,
    config: {
      pageSize: 50,
      pageSizeOptions: [25, 50, 100, 200]
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with 1,000 rows to test pagination and performance. Uses 50 rows per page.'
      }
    }
  }
};

/**
 * Without Pagination
 */
export const NoPagination: Story = {
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(15),
    pagination: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with pagination disabled, showing all rows at once.'
      }
    }
  }
};

/**
 * Custom Page Sizes
 */
export const CustomPageSizes: Story = {
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(100),
    pagination: true,
    config: {
      pageSize: 15,
      pageSizeOptions: [5, 15, 30, 50],
      showFirstLastButtons: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with custom page sizes and first/last page navigation buttons.'
      }
    }
  }
};

/**
 * Sticky Header
 */
export const StickyHeader: Story = {
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(50),
    pagination: false,
    config: {
      stickyHeader: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with sticky header that remains visible while scrolling.'
      }
    }
  },
  decorators: [
    (Story) => ({
      template: `
        <div style="max-height: 400px; overflow: auto;">
          <Story />
        </div>
      `
    })
  ]
};

/**
 * Performance Test - 5,000 Rows
 */
export const Performance5K: Story = {
  name: '5,000 Rows (Performance)',
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(5000),
    pagination: true,
    config: {
      pageSize: 100,
      pageSizeOptions: [50, 100, 200, 500]
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance test with 5,000 rows. Uses pagination with 100 rows per page.'
      }
    }
  }
};

/**
 * Virtual Scrolling - 10,000 Rows
 */
export const VirtualScrolling: Story = {
  name: 'Virtual Scroll (10K Rows)',
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(10000),
    pagination: false,
    config: {
      virtualScroll: true,
      itemSize: 48,
      minBufferPx: 480,
      maxBufferPx: 960
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with virtual scrolling enabled for 10,000 rows. Only renders visible rows for optimal performance. Scroll to see smooth rendering without lag.'
      }
    }
  }
};

/**
 * Column Filtering
 */
export const WithFiltering: Story = {
  name: 'Column Filtering',
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(100),
    pagination: true,
    config: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100]
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with column filtering enabled. Click the filter icon in column headers to filter data. Supports contains-based text filtering.'
      }
    }
  }
};

/**
 * Keyboard Navigation
 */
export const KeyboardNavigation: Story = {
  name: 'Keyboard Navigation',
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(25),
    pagination: true,
    selectionMode: 'multi',
    config: {
      pageSize: 10
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with full keyboard navigation support. Use Arrow Up/Down to navigate, Space to select, Enter to activate, Home/End for first/last row. Click on a row first to start keyboard navigation.'
      }
    }
  }
};

/**
 * All Features Combined
 */
export const AllFeatures: Story = {
  name: 'All Features',
  args: {
    columns: mockColumns,
    dataSource: generateCustomers(200),
    pagination: true,
    selectionMode: 'multi',
    config: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100],
      stickyHeader: true,
      showFirstLastButtons: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete demonstration with all features: sorting, filtering, pagination, multi-selection, keyboard navigation, and sticky header. Try all the interactions!'
      }
    }
  }
};
