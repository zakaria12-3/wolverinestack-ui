import { Component, OnInit } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouterOutlet
} from '@angular/router';

import { Navbar } from './navbar/navbar';
import { Loader } from './loader/loader';
import { routeAnimations } from './shared/animations';
import { ReminderService } from './core/services/reminder.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [Navbar, RouterOutlet, Loader],
  animations: [routeAnimations]
})
export class App implements OnInit {
  isLoading = true;
  isLoggedIn = false;
  quickActionIcon = 'fitness_center';

  constructor(
    private router: Router,
    private reminderService: ReminderService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.reminderService.start();
    window.addEventListener('app-reminder', ((event: Event) => {
      const detail = (event as CustomEvent).detail;
      this.toastr.info(detail.body, detail.title);
    }) as EventListener);

    setTimeout(() => {
      this.isLoading = false;
    }, 300);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isLoading = false;
      }
    });
  }

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.authService.isLoggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });
  }

  quickAction() {
    // Navigate to workout quick start
    this.router.navigate(['/member/workouts']);
  }
}
