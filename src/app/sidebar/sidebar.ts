import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  standalone: true,
})
export class Sidebar implements OnInit {
  isLoggedIn = false;
  role: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.role = this.authService.getRole();
    this.authService.isLoggedIn$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      this.role = this.authService.getRole();
    });
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

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isMember(): boolean {
    return this.role === 'MEMBER';
  }

  isTrainer(): boolean {
    return this.role === 'TRAINER';
  }
}
