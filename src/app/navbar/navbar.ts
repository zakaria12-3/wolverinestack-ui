import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
})
export class Navbar implements OnInit {
  isLoggedIn = false;
  role: string | null = null;
  isDarkMode = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.role = this.authService.getRole();
    this.isDarkMode = document.documentElement.classList.contains('light');

    // Watch for auth changes
    this.authService.isLoggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      this.role = this.authService.getRole();
      this.cdr.detectChanges();
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('light');
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getDashboardLink(): string {
    if (this.role === 'ADMIN') return '/admin/dashboard';
    if (this.role === 'TRAINER') return '/trainer/dashboard';
    return '/member/dashboard';
  }

  getInitials(): string {
    return 'WS';
  }
}
