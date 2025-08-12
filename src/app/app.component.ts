import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentUser$: Observable<any | null>;
  isDark$: Observable<boolean>;

  lottieOptions: AnimationOptions = {
    path: '/assets/Bouncing Cricket Ball.json',
  };

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isDark$ = this.themeService.isDark$;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
  }
}