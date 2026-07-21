import {ChangeDetectionStrategy, Component} from '@angular/core';
import {HlmAvatarImports} from '@spartan-ng/helm/avatar';
import { RouterLink,Router} from '@angular/router';
import { hlmH3 } from '@spartan-ng/helm/typography';
import {animate, style, transition, trigger} from '@angular/animations';
import {FormsModule} from '@angular/forms';
@Component({
  selector: 'app-navbar',
  imports: [HlmAvatarImports,RouterLink, FormsModule],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="px-6 py-4 sticky top-0 z-50 transition-all duration-300" @fadeSlide>
    <div class="glass-card flex items-center justify-between !py-3 !px-6 !rounded-2xl !border-white/20 !bg-slate-900/40 !backdrop-blur-xl shadow-lg">
      
      <!-- Brand Logo -->
      <div class="flex items-center space-x-3 cursor-pointer group" routerLink="/">
        <div class="bg-blue-500/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
          <img src="/recruitment-icon-6.png" alt="logo" class="w-8 h-8 object-contain drop-shadow" />
        </div>
        <h2 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
          Step-Up Recruiting
        </h2>
      </div>

      <!-- Actions -->
      <div class="flex items-center space-x-4">
        
        <button class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex flex-col justify-center items-center gap-1.5 transition-colors border border-white/5">
          <svg class="w-5 h-5 text-slate-300" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </button>

        <div class="relative flex items-center">
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" placeholder="Search..."
                   class="bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-32 focus:w-48 text-sm h-10">
            <button class="absolute right-3 text-gray-400 hover:text-white" (click)="onSearch()">
               <svg class="w-4 h-4" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
               </svg>
            </button>
        </div>

        <button class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex flex-col justify-center items-center gap-1.5 transition-colors border border-white/5" routerLink="/login">
            <svg class="w-5 h-5 text-slate-300" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
        </button>
      </div>

    </div>
  </div>
  `,
  styleUrl: './navbar.css',

})
export class Navbar {
  searchQuery: string = '';

  constructor(private router: Router) {}

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
    }
  }
}
