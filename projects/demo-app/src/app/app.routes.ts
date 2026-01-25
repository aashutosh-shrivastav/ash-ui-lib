import { Routes } from '@angular/router';

import { DemoPageComponent } from './pages/demo-page.component';
import { PlaygroundPageComponent } from './pages/playground-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'demo', pathMatch: 'full' },
	{ path: 'demo', component: DemoPageComponent },
	{ path: 'playground', component: PlaygroundPageComponent },
	{ path: 'dashboard', component: DashboardPageComponent },
];
