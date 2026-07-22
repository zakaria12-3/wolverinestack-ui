import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class OnboardingComponent implements OnInit {
  step = 1;
  today = new Date().toISOString().split('T')[0];

  metrics = {
    gender: '',
    weightKg: null as number | null,
    heightCm: null as number | null,
    dateOfBirth: ''
  };

  suggestions: any = null;
  selectedGoal = '';
  selectedActivity = '';
  isLoading = false;
  showingSuggestions = false;

  goals = [
    { value: 'LOSE_WEIGHT', label: 'Lose Weight', icon: 'local_fire_department', desc: 'Calorie deficit focused on fat loss' },
    { value: 'GAIN_WEIGHT', label: 'Gain Weight', icon: 'add_circle', desc: 'Calorie surplus for mass gain' },
    { value: 'BUILD_MUSCLE', label: 'Build Muscle', icon: 'fitness_center', desc: 'Muscle growth with resistance training' },
    { value: 'GENERAL_FITNESS', label: 'General Fitness', icon: 'star', desc: 'Balanced health and wellness' }
  ];

  activityLevels = [
    { value: 'SEDENTARY', label: 'Sedentary', icon: 'airline_seat_flat', desc: 'Little or no exercise' },
    { value: 'LIGHTLY_ACTIVE', label: 'Lightly Active', icon: 'directions_walk', desc: 'Light exercise 1-3 days/week' },
    { value: 'MODERATELY_ACTIVE', label: 'Moderately Active', icon: 'directions_run', desc: 'Moderate exercise 3-5 days/week' },
    { value: 'VERY_ACTIVE', label: 'Very Active', icon: 'fitness_center', desc: 'Hard exercise 6-7 days/week' },
    { value: 'EXTRA_ACTIVE', label: 'Extra Active', icon: 'whatshot', desc: 'Very hard exercise + physical job' }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isOnboardingComplete()) {
      this.router.navigate(['/member/dashboard']);
    }
  }

  getAiSuggestions() {
    if (!this.metrics.gender || !this.metrics.weightKg || !this.metrics.heightCm || !this.metrics.dateOfBirth) {
      this.toastr.error('Please fill in all fields');
      return;
    }

    this.isLoading = true;
    this.http.post(`${environment.apiUrl}/auth/onboarding/suggest-goals`, this.metrics)
      .subscribe({
        next: (res: any) => {
          this.suggestions = res;
          this.selectedGoal = this.bestSuggestion(res?.goalSuggestions)?.value || '';
          this.selectedActivity = this.bestSuggestion(res?.activitySuggestions)?.value || '';
          this.step = 2;
          this.showingSuggestions = true;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.step = 3;
          this.showingSuggestions = false;
        }
      });
  }

  selectGoal(value: string) {
    this.selectedGoal = value;
  }

  selectActivity(value: string) {
    this.selectedActivity = value;
  }

  goToManualSelect() {
    if (this.step === 1 && !this.hasValidMetrics()) {
      this.toastr.error('Please complete your body metrics before choosing goals');
      return;
    }
    this.showingSuggestions = false;
    this.step = 3;
  }

  confirmWithAiSuggestion() {
    this.selectedGoal ||= this.bestSuggestion(this.suggestions?.goalSuggestions)?.value || '';
    this.selectedActivity ||= this.bestSuggestion(this.suggestions?.activitySuggestions)?.value || '';
    this.step = 3;
    this.showingSuggestions = false;
  }

  private hasValidMetrics(): boolean {
    const { gender, weightKg, heightCm, dateOfBirth } = this.metrics;
    return !!gender && !!dateOfBirth && weightKg !== null && weightKg >= 30 && weightKg <= 300 &&
      heightCm !== null && heightCm >= 100 && heightCm <= 250;
  }

  private bestSuggestion(items: any[] | undefined): any | undefined {
    return items?.reduce((best, item) =>
      !best || Number(item.confidence || 0) > Number(best.confidence || 0) ? item : best, undefined);
  }

  completeOnboarding() {
    if (!this.selectedGoal || !this.selectedActivity) {
      this.toastr.error('Please select a goal and activity level');
      return;
    }

    this.isLoading = true;
    const payload = {
      gender: this.metrics.gender,
      weightKg: this.metrics.weightKg,
      heightCm: this.metrics.heightCm,
      dateOfBirth: this.metrics.dateOfBirth,
      fitnessGoal: this.selectedGoal,
      activityLevel: this.selectedActivity,
      calculateTdee: true
    };

    this.http.post(`${environment.apiUrl}/auth/onboarding`, payload)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.authService.setOnboardingComplete(true);
          this.toastr.success(res.message || 'Onboarding complete! 🎯');
          this.router.navigate(['/member/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          const message = typeof err.error === 'string' ? err.error : err.error?.message;
          this.toastr.error(message || 'Failed to complete onboarding');
        }
      });
  }
}
