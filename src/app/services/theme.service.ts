import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDark = new BehaviorSubject<boolean>(false);
  isDark$ = this.isDark.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('isDarkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialValue = savedTheme ? JSON.parse(savedTheme) : prefersDark;
    this.setTheme(initialValue);
  }

  setTheme(isDarkMode: boolean) {
    this.isDark.next(isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }

  toggleTheme() {
    this.setTheme(!this.isDark.value);
  }
}