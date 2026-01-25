import type { Preview } from '@storybook/angular'
import { setCompodocJson } from "@storybook/addon-docs/angular";
import docJson from "../documentation.json";

setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      const theme = context.globals['theme'] || 'light';
      
      // Apply theme class to body
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.style.backgroundColor = '#303030';
        document.body.style.color = 'rgba(255, 255, 255, 0.87)';
        document.documentElement.style.setProperty('--ash-table-header-bg', '#424242');
        document.documentElement.style.setProperty('--ash-table-header-color', 'rgba(255, 255, 255, 0.87)');
        document.documentElement.style.setProperty('--ash-table-row-hover-bg', 'rgba(255, 255, 255, 0.08)');
        document.documentElement.style.setProperty('--ash-table-row-selected-bg', '#1565c0');
      } else {
        document.body.classList.remove('dark-theme');
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = 'rgba(0, 0, 0, 0.87)';
        document.documentElement.style.setProperty('--ash-table-header-bg', '#fafafa');
        document.documentElement.style.setProperty('--ash-table-header-color', 'rgba(0, 0, 0, 0.87)');
        document.documentElement.style.setProperty('--ash-table-row-hover-bg', 'rgba(0, 0, 0, 0.04)');
        document.documentElement.style.setProperty('--ash-table-row-selected-bg', '#e3f2fd');
      }
      
      return story();
    },
  ],
};

export default preview;