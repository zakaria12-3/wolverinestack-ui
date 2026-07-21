import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-nutrition-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nutrition.html',
  styleUrls: ['./nutrition.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class NutritionTracking implements OnInit {
  progress: any = null;
  meals: any[] = [];
  weeklyReport: any = null;
  isLoading = false;
  activeTab: 'today' | 'weekly' = 'today';
  showLogForm = false;

  mealEntry = {
    mealType: 'BREAKFAST',
    foodName: '',
    portionGrams: 100,
    calories: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0
  };

  mealTypes = [
    { value: 'BREAKFAST', label: '🌅 Breakfast' },
    { value: 'LUNCH', label: '☀️ Lunch' },
    { value: 'DINNER', label: '🌙 Dinner' },
    { value: 'SNACK', label: '🍿 Snack' }
  ];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  }

  ngOnInit() {
    this.loadProgress();
  }

  loadProgress() {
    this.isLoading = true;
    this.http.get('http://localhost:8027/nutrition/daily-progress', this.getHeaders())
      .subscribe((data: any) => {
        this.progress = data;
        this.meals = data?.meals || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  loadWeeklyReport() {
    this.isLoading = true;
    this.http.get('http://localhost:8027/nutrition/weekly-report', this.getHeaders())
      .subscribe((data: any) => {
        this.weeklyReport = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  switchTab(tab: 'today' | 'weekly') {
    this.activeTab = tab;
    if (tab === 'weekly' && !this.weeklyReport) {
      this.loadWeeklyReport();
    }
  }

  logMeal() {
    if (!this.mealEntry.foodName) {
      this.toastr.error('Please enter a food name');
      return;
    }

    this.http.post('http://localhost:8027/nutrition/meals', this.mealEntry, this.getHeaders())
      .subscribe({
        next: () => {
          this.toastr.success('Meal logged! 🍽️');
          this.showLogForm = false;
          this.mealEntry = { mealType: 'BREAKFAST', foodName: '', portionGrams: 100, calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 };
          this.loadProgress();
        },
        error: (err) => this.toastr.error(err.error || 'Failed to log meal')
      });
  }

  deleteMeal(id: number) {
    this.http.delete(`http://localhost:8027/nutrition/meals/${id}`, this.getHeaders())
      .subscribe({
        next: () => {
          this.toastr.info('Meal removed');
          this.loadProgress();
        },
        error: (err) => this.toastr.error(err.error || 'Failed to delete')
      });
  }

  getGroupedMeals(): any[] {
    const groups: any = { BREAKFAST: [], LUNCH: [], DINNER: [], SNACK: [] };
    this.meals.forEach(m => {
      if (groups[m.mealType]) groups[m.mealType].push(m);
      else groups[m.mealType] = [m];
    });
    return Object.entries(groups).map(([key, items]: any) => ({
      type: key,
      label: this.mealTypes.find(t => t.value === key)?.label || key,
      items
    })).filter(g => g.items.length > 0);
  }

  getProgressColor(percent: number): string {
    if (percent >= 100) return '#22c55e';
    if (percent >= 75) return '#3b82f6';
    if (percent >= 50) return '#f59e0b';
    return '#ef4444';
  }
}
