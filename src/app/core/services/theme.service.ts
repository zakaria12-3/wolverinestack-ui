import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly STORAGE_KEY = 'titan-theme';

  private isLight = new BehaviorSubject<boolean>(this.loadPreference());
  isLight$ = this.isLight.asObservable();

  constructor() {
    this.applyTheme(this.isLight.value, false);
  }

  private loadPreference(): boolean {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved === 'light';
  }

  toggle(): boolean {
    const next = !this.isLight.value;
    this.isLight.next(next);
    this.applyTheme(next, true);
    return next;
  }

  private applyTheme(light: boolean, animate: boolean) {
    const html = document.documentElement;
    if (animate) {
      html.style.setProperty('--theme-transition', 'all 0.3s ease-out');
    } else {
      html.style.removeProperty('--theme-transition');
    }
    html.classList.toggle('light', light);
    localStorage.setItem(this.STORAGE_KEY, light ? 'light' : 'dark');
  }
}
