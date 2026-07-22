import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meal-planner.html',
  styleUrls: ['./meal-planner.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MealPlanner implements OnInit {
  planDate: string = '';
  plan: any = null;
  isLoading = false;
  aiSuggestions: any = null;
  showAiSuggestions = false;

  mealTypes = [
    { value: 'BREAKFAST', label: '🌅 Breakfast' },
    { value: 'LUNCH', label: '☀️ Lunch' },
    { value: 'DINNER', label: '🌙 Dinner' },
    { value: 'SNACK', label: '🍿 Snack' }
  ];

  newMeal = { mealType: 'BREAKFAST', foodName: '', calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 };

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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.planDate = tomorrow.toISOString().split('T')[0];
    this.loadPlan();
  }

  loadPlan() {
    if (!this.planDate) return;
    this.isLoading = true;
    this.http.get(`${environment.apiUrl}/nutrition/meal-plan?date=${this.planDate}`, this.getHeaders())
      .subscribe({
        next: (data: any) => {
          this.plan = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(this.errorMessage(err, 'Failed to load meal plan'));
        }
      });
  }

  addMeal() {
    if (!this.newMeal.foodName) {
      this.toastr.error('Please enter a food name');
      return;
    }

    const meals = this.plan?.meals || [];
    meals.push({ ...this.newMeal });

    this.http.post(`${environment.apiUrl}/nutrition/meal-plan`,
      { date: this.planDate, meals },
      this.getHeaders()
    ).subscribe({
      next: (res: any) => {
        this.plan = res;
        this.newMeal = { mealType: 'BREAKFAST', foodName: '', calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 };
        this.toastr.success('Meal added to plan!');
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to save plan'))
    });
  }

  removeMeal(index: number) {
    const meals = this.plan?.meals || [];
    meals.splice(index, 1);
    this.http.post(`${environment.apiUrl}/nutrition/meal-plan`,
      { date: this.planDate, meals },
      this.getHeaders()
    ).subscribe({
      next: (res: any) => {
        this.plan = res;
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to remove meal'))
    });
  }

  getAiSuggestions() {
    this.isLoading = true;
    this.http.get(`${environment.apiUrl}/ai/meal-suggestions?date=${this.planDate}`, this.getHeaders())
      .subscribe({
        next: (res: any) => {
          this.aiSuggestions = res;
          this.showAiSuggestions = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Failed to get AI suggestions');
        }
      });
  }

  private errorMessage(err: any, fallback: string): string {
    return typeof err?.error === 'string' ? err.error : err?.error?.message || fallback;
  }

  addAiMeal(meal: any) {
    this.newMeal = {
      mealType: meal.mealType || 'SNACK',
      foodName: meal.foodName || meal.name || '',
      calories: meal.calories || 0,
      proteinGrams: meal.proteinGrams || 0,
      carbsGrams: meal.carbsGrams || 0,
      fatGrams: meal.fatGrams || 0
    };
    this.addMeal();
  }

  getGroupedMeals(): any[] {
    if (!this.plan?.meals) return [];
    const groups: any = {};
    this.plan.meals.forEach((m: any) => {
      if (!groups[m.mealType]) groups[m.mealType] = [];
      groups[m.mealType].push(m);
    });
    return Object.entries(groups).map(([key, items]: any) => ({
      type: key,
      label: this.mealTypes.find(t => t.value === key)?.label || key,
      items,
      totalCal: items.reduce((s: number, i: any) => s + (i.calories || 0), 0),
      totalProtein: items.reduce((s: number, i: any) => s + (i.proteinGrams || 0), 0)
    }));
  }
}
