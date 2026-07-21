import { Component, OnInit } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouterOutlet
} from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

import { Navbar } from './shared/components/navbar/navbar';
import { Loader } from './shared/components/loader/loader';
import { ReminderService } from './core/services/reminder.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [Navbar, RouterOutlet, Loader],
  animations: [
    trigger('routeFadeSlide', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateY(18px)' }),
        animate('420ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
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

  prepareRoute(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['animation'] || outlet?.activatedRoute?.routeConfig?.path || 'home';
  }

}
