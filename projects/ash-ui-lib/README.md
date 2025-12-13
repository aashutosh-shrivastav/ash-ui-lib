# Ash UI Lib

Enterprise Angular components for high-performance dashboards. Angular 20+, Material Design 3, ECharts. 148KB bundle, WCAG 2.1 AA.

**Status:** 🏗️ Requirements complete. Building components (Week 1-4).

## Components

| Component | Status |
| :-- | :-- |
| **AshDataGrid** | 10K+ rows, server pagination, Excel export |
| **AshDynamicForm** | JSON schema forms, wizards |
| **AshMultiChart** | 9 ECharts types, real-time |
| **AshCalendar** | Event color-coding |
| **AshDashboard** | Drag-drop layout composer |
| **AshToast** | Rich notifications |

## Quick Start

```bash
ng new ash-ui-workspace --no-create-application
ng generate library ash-ui-lib --primary
npx storybook@latest init  # Select ash-ui-lib
npm run storybook          # http://localhost:6006
```


## Development

```bash
# Generate component
ng g c ash-datagrid --project=ash-ui-lib --standalone

# Build & test
ng build ash-ui-lib --configuration production
npm run storybook
```


## Documentation

- [Requirements](/docs/)
- [Performance Benchmarks](/perf/)
- [Storybook Stories](/storybook-static)


## Roadmap

```
Week 1: AshDataGrid
Week 2: AshDynamicForm + AshMultiChart  
Week 3: AshDashboard + AshCalendar
Week 4: AshToast + npm publish
```


***

**Production dashboards in 5 components. 60fps performance.**

