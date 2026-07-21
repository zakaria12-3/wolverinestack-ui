import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';

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
    { value: 'LOSE_WEIGHT', label: 'Lose Weight', icon: '🔥', desc: 'Calorie deficit focused on fat loss' },
    { value: 'GAIN_WEIGHT', label: 'Gain Weight', icon: '💪', desc: 'Calorie surplus for mass gain' },
    { value: 'BUILD_MUSCLE', label: 'Build Muscle', icon: '🏋️', desc: 'Muscle growth with resistance training' },
    { value: 'GENERAL_FITNESS', label: 'General Fitness', icon: '🌟', desc: 'Balanced health and wellness' }
  ];

  activityLevels = [
    { value: 'SEDENTARY', label: 'Sedentary', icon: '🪑', desc: 'Little or no exercise' },
    { value: 'LIGHTLY_ACTIVE', label: 'Lightly Active', icon: '🚶', desc: 'Light exercise 1-3 days/week' },
    { value: 'MODERATELY_ACTIVE', label: 'Moderately Active', icon: '🏃', desc: 'Moderate exercise 3-5 days/week' },
    { value: 'VERY_ACTIVE', label: 'Very Active', icon: '🏋️', desc: 'Hard exercise 6-7 days/week' },
    { value: 'EXTRA_ACTIVE', label: 'Extra Active', icon: '🔥', desc: 'Very hard exercise + physical job' }
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
    this.http.post('http://localhost:8027/auth/onboarding/suggest-goals', this.metrics)
      .subscribe({
        next: (res: any) => {
          this.suggestions = res;
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
    this.showingSuggestions = false;
    this.step = 3;
  }

  confirmWithAiSuggestion() {
    if (this.suggestions?.goalSuggestions?.[0]) {
      this.selectedGoal = this.suggestions.goalSuggestions[0].value;
    }
    if (this.suggestions?.activitySuggestions?.[0]) {
      this.selectedActivity = this.suggestions.activitySuggestions[0].value;
    }
    this.step = 3;
    this.showingSuggestions = false;
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

    this.http.post('http://localhost:8027/auth/onboarding', payload)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.authService.setOnboardingComplete(true);
          this.toastr.success(res.message || 'Onboarding complete! 🎯');
          this.router.navigate(['/member/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(err.error?.message || 'Failed to complete onboarding');
        }
      });
  }
}
