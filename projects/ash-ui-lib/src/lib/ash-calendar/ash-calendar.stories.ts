import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { AshCalendar } from './ash-calendar';
import { DateStyle } from './models/date-style.model';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Component } from '@angular/core';

const meta: Meta<AshCalendar> = {
  title: 'Enterprise/AshCalendar',
  component: AshCalendar,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimations(), provideNativeDateAdapter()],
    }),
  ],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disable calendar interaction'
    },
    locale: {
      control: 'select',
      options: ['en-US', 'ar', 'fr', 'de'],
      description: 'Calendar locale'
    }
  }
};

export default meta;
type Story = StoryObj<AshCalendar>;

/**
 * Empty calendar without date styles
 */
export const Empty: Story = {
  args: {
    dateStyles: [],
    selectedDates: [],
    viewDate: new Date(2026, 2, 20), // March 20, 2026
    disabled: false
  }
};

/**
 * Calendar with custom CSS styled dates (success event)
 */
export const WithSuccessEvents: Story = {
  args: {
    dateStyles: [
      {
        date: new Date(2026, 2, 5),
        cssClass: 'event-success',
        label: 'Event Success',
        tooltip: 'Successful completion'
      },
      {
        date: new Date(2026, 2, 12),
        cssClass: 'event-success',
        tooltip: 'Project milestone'
      },
      {
        date: new Date(2026, 2, 19),
        cssClass: 'event-success',
        tooltip: 'Release day'
      }
    ] as DateStyle[],
    selectedDates: [],
    viewDate: new Date(2026, 2, 20),
    disabled: false
  }
};

/**
 * Calendar with alert events
 */
export const WithAlertEvents: Story = {
  args: {
    dateStyles: [
      {
        date: new Date(2026, 2, 3),
        cssClass: 'event-alert',
        tooltip: 'Deadline approaching'
      },
      {
        date: new Date(2026, 2, 10),
        cssClass: 'event-alert',
        tooltip: 'Critical issue'
      },
      {
        date: new Date(2026, 2, 25),
        cssClass: 'event-alert',
        tooltip: 'System maintenance'
      }
    ] as DateStyle[],
    selectedDates: [],
    viewDate: new Date(2026, 2, 20),
    disabled: false
  }
};

/**
 * Calendar with mixed event types
 */
export const WithMixedEvents: Story = {
  args: {
    dateStyles: [
      {
        date: new Date(2026, 2, 2),
        cssClass: 'event-info',
        tooltip: 'Team meeting'
      },
      {
        date: new Date(2026, 2, 5),
        cssClass: 'event-success',
        tooltip: 'Project launched'
      },
      {
        date: new Date(2026, 2, 8),
        cssClass: 'event-warning',
        tooltip: 'Review pending'
      },
      {
        date: new Date(2026, 2, 12),
        cssClass: 'event-success',
        tooltip: 'Milestone reached'
      },
      {
        date: new Date(2026, 2, 15),
        cssClass: 'event-alert',
        tooltip: 'Urgent issue'
      },
      {
        date: new Date(2026, 2, 18),
        cssClass: 'event-info',
        tooltip: 'Conference'
      },
      {
        date: new Date(2026, 2, 22),
        cssClass: 'event-success',
        tooltip: 'Deployment successful'
      },
      {
        date: new Date(2026, 2, 25),
        cssClass: 'event-warning',
        tooltip: 'Maintenance window'
      }
    ] as DateStyle[],
    selectedDates: [],
    viewDate: new Date(2026, 2, 20),
    disabled: false
  }
};

/**
 * Calendar with date range and pre-selected dates
 */
export const WithSelectedDates: Story = {
  args: {
    dateStyles: [
      {
        date: new Date(2026, 2, 5),
        cssClass: 'event-success',
        tooltip: 'Start date'
      },
      {
        date: new Date(2026, 2, 6),
        cssClass: 'event-info',
        tooltip: 'In range'
      },
      {
        date: new Date(2026, 2, 7),
        cssClass: 'event-info',
        tooltip: 'In range'
      },
      {
        date: new Date(2026, 2, 8),
        cssClass: 'event-info',
        tooltip: 'In range'
      },
      {
        date: new Date(2026, 2, 9),
        cssClass: 'event-alert',
        tooltip: 'End date'
      }
    ] as DateStyle[],
    selectedDates: [
      new Date(2026, 2, 5),
      new Date(2026, 2, 6),
      new Date(2026, 2, 7),
      new Date(2026, 2, 8),
      new Date(2026, 2, 9)
    ],
    viewDate: new Date(2026, 2, 20),
    disabled: false
  }
};

/**
 * Calendar with min and max date restrictions
 */
export const WithDateRestrictions: Story = {
  args: {
    dateStyles: [
      {
        date: new Date(2026, 2, 10),
        cssClass: 'event-success',
        tooltip: 'Selectable'
      },
      {
        date: new Date(2026, 2, 20),
        cssClass: 'event-success',
        tooltip: 'Today - Selectable'
      }
    ] as DateStyle[],
    selectedDates: [],
    viewDate: new Date(2026, 2, 20),
    minDate: new Date(2026, 2, 1),
    maxDate: new Date(2026, 2, 31),
    disabled: false
  }
};

/**
 * Disabled calendar
 */
export const Disabled: Story = {
  args: {
    dateStyles: [
      {
        date: new Date(2026, 2, 5),
        cssClass: 'event-success',
        tooltip: 'Not selectable'
      }
    ] as DateStyle[],
    selectedDates: [],
    viewDate: new Date(2026, 2, 20),
    disabled: true
  }
};

/**
 * Calendar in RTL mode
 */
export const RTL: Story = {
  args: {
    dateStyles: [
      {
        date: new Date(2026, 2, 5),
        cssClass: 'event-success',
        tooltip: 'حدث ناجح'
      },
      {
        date: new Date(2026, 2, 12),
        cssClass: 'event-alert',
        tooltip: 'مشكلة حرجة'
      }
    ] as DateStyle[],
    selectedDates: [],
    viewDate: new Date(2026, 2, 20),
    disabled: false
  },
  decorators: [
    (Story) => ({
      template: `<div dir="rtl"><Story /></div>`
    })
  ]
};

/**
 * Different locale (Arabic)
 */
export const ArabicLocale: Story = {
  args: {
    dateStyles: [
      {
        date: new Date(2026, 2, 5),
        cssClass: 'event-success',
        tooltip: 'حدث ناجح'
      }
    ] as DateStyle[],
    selectedDates: [],
    viewDate: new Date(2026, 2, 20),
    locale: 'ar',
    disabled: false
  }
};

/**
 * Large dataset with many events
 */
export const ManyEvents: Story = {
  args: {
    dateStyles: Array.from({ length: 20 }, (_, i) => ({
      date: new Date(2026, 2, (i % 28) + 1),
      cssClass: ['event-success', 'event-alert', 'event-warning', 'event-info'][i % 4],
      tooltip: `Event ${i + 1}`
    })) as DateStyle[],
    selectedDates: [],
    viewDate: new Date(2026, 2, 20),
    disabled: false
  }
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    dateStyles: [
      {
        date: new Date(2026, 2, 5),
        cssClass: 'event-success',
        tooltip: 'Success'
      },
      {
        date: new Date(2026, 2, 12),
        cssClass: 'event-alert',
        tooltip: 'Alert'
      }
    ] as DateStyle[],
    selectedDates: [],
    viewDate: new Date(2026, 2, 20),
    disabled: false
  },
  parameters: {
    viewport: {
      defaultViewport: 'iphonex'
    }
  }
};

/**
 * Calendar with fire emoji event highlights
 */
export const WithFireEvent: Story = {
  args: {
    dateStyles: [
      {
        date: new Date(2026, 2, 5),
        cssClass: 'event-fire',
        tooltip: 'Critical issue - System overload',
        label: 'Critical'
      },
      {
        date: new Date(2026, 2, 8),
        cssClass: 'event-fire',
        tooltip: 'Emergency maintenance',
        label: 'Emergency'
      },
      {
        date: new Date(2026, 2, 15),
        cssClass: 'event-success',
        tooltip: 'Issue resolved'
      }
    ] as DateStyle[],
    selectedDates: [],
    viewDate: new Date(2026, 2, 20),
    disabled: false
  }
};
