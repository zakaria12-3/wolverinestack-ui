import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy} from '@angular/core';
import {HlmAvatarImports} from '@spartan-ng/helm/avatar';
import { RouterLink, RouterLinkActive, Router} from '@angular/router';
import {animate, style, transition, trigger} from '@angular/animations';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../../core/services/auth.service';
import {ThemeService} from '../../../core/services/theme.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [HlmAvatarImports, RouterLink, RouterLinkActive, NgIf, FormsModule],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Top Navigation Shell -->
    <header class="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-gutter h-16 z-50">
      <div class="flex items-center gap-4">
        <span class="material-symbols-outlined text-primary cursor-pointer active:scale-95 transition-transform" routerLink="/">arrow_back</span>
        <h1 class="font-headline-md text-headline-md font-bold text-primary tracking-tighter cursor-pointer" routerLink="/">WOLVERINE STACK</h1>
      </div>
      <div class="flex items-center gap-md">
        <!-- Theme Toggle -->
        <span class="material-symbols-outlined text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer active:scale-95"
              (click)="toggleTheme()" [title]="isLight ? 'Switch to Dark' : 'Switch to Light'">
          {{ isLight ? 'dark_mode' : 'light_mode' }}
        </span>
        <span *ngIf="isUserLoggedIn" class="material-symbols-outlined text-on-surface-variant hover:text-secondary-fixed-dim transition-colors cursor-pointer active:scale-95" (click)="goToDashboard()">dashboard</span>
        <span *ngIf="!isUserLoggedIn" class="material-symbols-outlined text-on-surface-variant hover:text-secondary-fixed-dim transition-colors cursor-pointer active:scale-95" routerLink="/login">person</span>
        <div *ngIf="isUserLoggedIn" class="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-white/10 cursor-pointer" (click)="goToDashboard()">
          <img class="w-full h-full object-cover" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" alt="Profile"/>
        </div>
      </div>
    </header>

    <!-- Side Navigation (Desktop) -->
    <nav class="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-surface-container-low z-40 pt-20 border-r border-white/5">
      <div class="mb-lg px-base px-4">
        <h2 class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest opacity-60">Navigation</h2>
      </div>
      <div class="space-y-sm flex-grow px-3">
        <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
           routerLink="/" routerLinkActive="bg-surface-variant text-primary opacity-100" [routerLinkActiveOptions]="{exact: true}">
          <span class="material-symbols-outlined text-xl">home</span>
          <span class="font-label-caps text-label-caps">Home</span>
        </a>

        <!-- Member Navigation -->
        <ng-container *ngIf="role === 'MEMBER'">
          <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
             routerLink="/member/dashboard" routerLinkActive="bg-surface-variant text-primary opacity-100">
            <span class="material-symbols-outlined text-xl">dashboard</span>
            <span class="font-label-caps text-label-caps">Dashboard</span>
          </a>
          <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
             routerLink="/member/workouts" routerLinkActive="bg-surface-variant text-primary opacity-100">
            <span class="material-symbols-outlined text-xl">fitness_center</span>
            <span class="font-label-caps text-label-caps">Lifts</span>
          </a>
          <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
             routerLink="/member/nutrition" routerLinkActive="bg-surface-variant text-primary opacity-100">
            <span class="material-symbols-outlined text-xl">restaurant</span>
            <span class="font-label-caps text-label-caps">Nutrition</span>
          </a>
          <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
             routerLink="/member/measurements" routerLinkActive="bg-surface-variant text-primary opacity-100">
            <span class="material-symbols-outlined text-xl">straighten</span>
            <span class="font-label-caps text-label-caps">Measure</span>
          </a>
          <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
             routerLink="/member/meal-planner" routerLinkActive="bg-surface-variant text-primary opacity-100">
            <span class="material-symbols-outlined text-xl">calendar_month</span>
            <span class="font-label-caps text-label-caps">Meal Plan</span>
          </a>
        </ng-container>

        <!-- Trainer Navigation -->
        <ng-container *ngIf="role === 'TRAINER'">
          <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
             routerLink="/trainer/dashboard" routerLinkActive="bg-surface-variant text-primary opacity-100">
            <span class="material-symbols-outlined text-xl">dashboard</span>
            <span class="font-label-caps text-label-caps">Dashboard</span>
          </a>
          <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
             routerLink="/trainer/clients" routerLinkActive="bg-surface-variant text-primary opacity-100">
            <span class="material-symbols-outlined text-xl">group</span>
            <span class="font-label-caps text-label-caps">Clients</span>
          </a>
          <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
             routerLink="/trainer/create-plan" routerLinkActive="bg-surface-variant text-primary opacity-100">
            <span class="material-symbols-outlined text-xl">add_box</span>
            <span class="font-label-caps text-label-caps">Create Plan</span>
          </a>
        </ng-container>

        <!-- Admin Navigation -->
        <ng-container *ngIf="role === 'ADMIN'">
          <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
             routerLink="/admin/dashboard" routerLinkActive="bg-surface-variant text-primary opacity-100">
            <span class="material-symbols-outlined text-xl">admin_panel_settings</span>
            <span class="font-label-caps text-label-caps">Admin</span>
          </a>
        </ng-container>

        <!-- Shared -->
        <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
           routerLink="/feed" routerLinkActive="bg-surface-variant text-primary opacity-100">
          <span class="material-symbols-outlined text-xl">forum</span>
          <span class="font-label-caps text-label-caps">Feed</span>
        </a>
        <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
           routerLink="/profile" routerLinkActive="bg-surface-variant text-primary opacity-100">
          <span class="material-symbols-outlined text-xl">person</span>
          <span class="font-label-caps text-label-caps">Profile</span>
        </a>
        <a class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:bg-surface-variant hover:text-primary transition-all duration-200 rounded-lg"
           routerLink="/search" routerLinkActive="bg-surface-variant text-primary opacity-100">
          <span class="material-symbols-outlined text-xl">search</span>
          <span class="font-label-caps text-label-caps">Search</span>
        </a>
      </div>

      <div class="pt-base border-t border-white/5 space-y-xs px-3">
        <a *ngIf="isUserLoggedIn" class="flex items-center gap-sm p-3 text-on-surface-variant opacity-70 hover:text-error transition-colors cursor-pointer rounded-lg" (click)="logout()">
          <span class="material-symbols-outlined text-xl">logout</span>
          <span class="font-label-caps text-label-caps">Logout</span>
        </a>
      </div>
    </nav>
  `,
  styleUrl: './navbar.css',
  standalone:true
})
export class Navbar implements OnInit, OnDestroy {
  isUserLoggedIn = false;
  role: string | null = null;
  searchQuery: string = '';
  isLight = false;
  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subs.push(
      this.authService.isLoggedIn$.subscribe(status => {
        this.isUserLoggedIn = status;
        this.role = this.authService.getRole();
        this.cd.detectChanges();
      }),
      this.themeService.isLight$.subscribe(light => {
        this.isLight = light;
        this.cd.detectChanges();
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    const role = localStorage.getItem('role');
    if (role === 'TRAINER') {
      this.router.navigate(['/trainer/dashboard']);
    } else if (role === 'MEMBER') {
      if (!this.authService.isOnboardingComplete()) {
        this.router.navigate(['/onboarding']);
      } else {
        this.router.navigate(['/member/dashboard']);
      }
    } else if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
    }
  }
}
