import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [Navbar, RouterOutlet, Loader]
})
export class App  {

  isLoading = true;

  constructor(private router: Router) {
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
