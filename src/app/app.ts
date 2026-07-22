import { Component } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouterOutlet
} from '@angular/router';

import { Navbar } from './shared/components/navbar/navbar';
import { Loader } from './shared/components/loader/loader';
import { routeAnimations } from './shared/animations';
import { ReminderService } from './core/services/reminder.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [Navbar, RouterOutlet, Loader],
  animations: [routeAnimations]
})
export class App  {

  isLoading = true;

  constructor(
    private router: Router,
    private reminderService: ReminderService,
    private toastr: ToastrService
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

}
