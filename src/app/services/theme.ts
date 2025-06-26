import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeKey = 'theme';
  
  // Using Angular 20 signals
  readonly theme = signal<Theme>(this.getInitialTheme());
  readonly isDarkMode = signal(this.theme() === 'dark');

  constructor() {
    // Effect to update DOM and localStorage when theme changes
    effect(() => {
      const currentTheme = this.theme();
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem(this.themeKey, currentTheme);
      this.isDarkMode.set(currentTheme === 'dark');
    });
  }

  private getInitialTheme(): Theme {
    // Check saved preference
    const savedTheme = localStorage.getItem(this.themeKey) as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  toggleTheme(): void {
    const newTheme = this.theme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}