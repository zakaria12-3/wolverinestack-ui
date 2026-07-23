import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MemberService, DashboardDto } from '../../../core/services/member.service';
import { UserService } from '../../../core/services/user.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class MemberDashboard implements OnInit {
  dashboard: DashboardDto | null = null;
  isLoading = true;
  error = false;

  quickLogStatus: any = null;
  isLoggingWorkout = false;
  isLoggingMeal = false;

  // Goals editor
  showGoalsEditor = false;
  isSavingGoals = false;
  goalsForm = {
    fitnessGoal: '',
    activityLevel: '',
    dailyCalorieGoal: 0,
    dailyProteinGoal: 0,
    dailyCarbsGoal: 0,
    dailyFatGoal: 0,
    weightKg: 0,
    heightCm: 0,
  };
  fitnessGoals = ['GENERAL_FITNESS', 'LOSE_WEIGHT', 'BUILD_MUSCLE', 'INCREASE_STRENGTH', 'IMPROVE_ENDURANCE', 'SPORTS_PERFORMANCE', 'FLEXIBILITY'];
  activityLevels = ['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE'];

  constructor(
    private memberService: MemberService,
    private userService: UserService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadDashboard();
    this.loadQuickLogStatus();
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  }

  loadDashboard() {
    this.isLoading = true;
    this.memberService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.isLoading = false;
        this.populateGoalsForm(data);
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

  // ======== Goals Editor ========

  toggleGoalsEditor() {
    this.showGoalsEditor = !this.showGoalsEditor;
    if (this.showGoalsEditor && this.dashboard) {
      this.populateGoalsForm(this.dashboard);
    }
  }

  private populateGoalsForm(data: DashboardDto) {
    this.goalsForm = {
      fitnessGoal: data.profile.fitnessGoal || 'GENERAL_FITNESS',
      activityLevel: data.profile.activityLevel || 'MODERATELY_ACTIVE',
      dailyCalorieGoal: data.profile.dailyCalorieGoal || 2000,
      dailyProteinGoal: data.profile.dailyProteinGoal || 150,
      dailyCarbsGoal: data.profile.dailyCarbsGoal || 250,
      dailyFatGoal: data.profile.dailyFatGoal || 65,
      weightKg: data.profile.weightKg || 70,
      heightCm: data.profile.heightCm || 175,
    };
  }

  saveGoals() {
    this.isSavingGoals = true;
    this.userService.updateProfile(this.goalsForm).subscribe({
      next: () => {
        this.toastr.success('Goals updated!');
        this.showGoalsEditor = false;
        this.isSavingGoals = false;
        this.loadDashboard();
      },
      error: (err) => {
        this.isSavingGoals = false;
        this.toastr.error(err.error || 'Failed to update goals');
      }
    });
  }

  recalculateTdee() {
    this.http.post(`${environment.apiUrl}/member/nutrition/tdee/apply`, {}, this.getHeaders())
      .subscribe({
        next: (result: any) => {
          this.goalsForm.dailyCalorieGoal = result.recommendedCalories || this.goalsForm.dailyCalorieGoal;
          this.goalsForm.dailyProteinGoal = result.recommendedProteinGrams || this.goalsForm.dailyProteinGoal;
          this.goalsForm.dailyCarbsGoal = result.recommendedCarbsGrams || this.goalsForm.dailyCarbsGoal;
          this.goalsForm.dailyFatGoal = result.recommendedFatGrams || this.goalsForm.dailyFatGoal;
          this.toastr.success(`TDEE recalculated: ${result.recommendedCalories} kcal/day`);
          this.cdr.detectChanges();
        },
        error: () => this.toastr.error('Could not recalculate TDEE — update weight, height, and DOB first')
      });
  }

  // ======== Quick Log ========

  loadQuickLogStatus() {
    this.http.get(`${environment.apiUrl}/member/quick-log/status`, this.getHeaders())
      .subscribe({
        next: (data: any) => {
          this.quickLogStatus = data;
          this.cdr.detectChanges();
        },
        error: () => { /* silently ignore — not critical */ }
      });
  }

  quickLogWorkout() {
    this.isLoggingWorkout = true;
    this.http.post(`${environment.apiUrl}/member/quick-log/workout`, {}, this.getHeaders())
      .subscribe({
        next: (res: any) => {
          this.toastr.success(res.message || 'Workout logged! 💪');
          this.isLoggingWorkout = false;
          if (this.quickLogStatus) this.quickLogStatus.missedWorkout = false;
          this.loadDashboard();
        },
        error: () => {
          this.isLoggingWorkout = false;
          this.toastr.error('Failed to log workout');
        }
      });
  }

  quickLogMeal() {
    this.isLoggingMeal = true;
    this.http.post(`${environment.apiUrl}/member/quick-log/meal`, {}, this.getHeaders())
      .subscribe({
        next: (res: any) => {
          this.toastr.success('Meal logged! 🥗');
          this.isLoggingMeal = false;
          if (this.quickLogStatus) this.quickLogStatus.missedMeals = false;
          this.loadDashboard();
        },
        error: () => {
          this.isLoggingMeal = false;
          this.toastr.error('Failed to log meal');
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
