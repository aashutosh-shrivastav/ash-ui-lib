import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('demo-app');

  // Theme mode: 'light' | 'dark'
  protected readonly theme = signal<'light' | 'dark'>(getInitialTheme());

  toggleTheme() {
    this.theme.update(mode => (mode === 'light' ? 'dark' : 'light'));
    setThemeClass(this.theme());
  }

  ngOnInit() {
    setThemeClass(this.theme());
  }
}

function getInitialTheme(): 'light' | 'dark' {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function setThemeClass(mode: 'light' | 'dark') {
  document.documentElement.classList.remove('light-theme', 'dark-theme');
  document.documentElement.classList.add(`${mode}-theme`);
}
