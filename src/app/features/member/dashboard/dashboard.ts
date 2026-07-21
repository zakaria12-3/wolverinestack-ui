import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MemberService, DashboardDto } from '../../../core/services/member.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MemberDashboard implements OnInit {
  dashboard: DashboardDto | null = null;
  isLoading = true;
  error = false;

  constructor(
    private memberService: MemberService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading = true;
    this.memberService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard error', err);
        this.isLoading = false;
        this.error = true;
        this.cdr.detectChanges();
      }
    });
  }

  clampPercent(value?: number): number {
    const percent = Number(value) || 0;
    return Math.max(0, Math.min(100, percent));
  }

  getCalorieRingStyle(): string {
    const percent = this.clampPercent(this.dashboard?.nutrition.caloriePercent);
    return `conic-gradient(#FFB800 ${percent * 3.6}deg, rgba(255,255,255,0.08) 0deg)`;
  }

  getProgressColor(percent: number): string {
    if (percent >= 100) return '#22c55e';
    if (percent >= 75) return '#FFB800';
    if (percent >= 50) return '#FF8C00';
    return '#c5c9ac';
  }

  getInitials(name?: string): string {
    const source = name || 'Member';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'M';
  }

  getBmi(): string {
    const weight = this.dashboard?.profile.weightKg;
    const height = this.dashboard?.profile.heightCm;
    if (!weight || !height) return '--';
    return (weight / Math.pow(height / 100, 2)).toFixed(1);
  }

  getWeeklyMinutesLabel(): string {
    const minutes = this.dashboard?.workout.totalMinutesThisWeek || 0;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'No date yet';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatLabel(value: string | undefined): string {
    if (!value) return 'Not set';
    return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
