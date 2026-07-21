import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MealEntryDto {
  id?: number;
  mealType: string;
  foodName: string;
  portionGrams?: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  loggedAt?: string;
}

export interface DailyProgressDto {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  caloriePercent: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  caloriesRemaining: number;
  meals?: MealEntryDto[];
}

export interface WeeklyReportDto {
  startDate: string;
  endDate: string;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  onTrackDays: number;
  totalDays: number;
}

export interface MealPlanDto {
  id?: number;
  date: string;
  meals: MealEntryDto[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
}

export interface MealAnalysisResult {
  foodName?: string;
  description?: string;
  estimatedCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  fiberGrams?: number;
  confidenceScore?: number;
  suggestions?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Meal Logging
  logMeal(entry: MealEntryDto): Observable<any> {
    return this.http.post(`${this.API}/nutrition/meals`, entry, { headers: this.getHeaders() });
  }

  getTodayMeals(): Observable<MealEntryDto[]> {
    return this.http.get<MealEntryDto[]>(`${this.API}/nutrition/meals/today`, { headers: this.getHeaders() });
  }

  deleteMeal(id: number): Observable<any> {
    return this.http.delete(`${this.API}/nutrition/meals/${id}`, { headers: this.getHeaders() });
  }

  // Daily Progress
  getDailyProgress(date?: string): Observable<DailyProgressDto> {
    const params = date ? `?date=${date}` : '';
    return this.http.get<DailyProgressDto>(`${this.API}/nutrition/daily-progress${params}`, { headers: this.getHeaders() });
  }

  // Weekly Report
  getWeeklyReport(): Observable<WeeklyReportDto> {
    return this.http.get<WeeklyReportDto>(`${this.API}/nutrition/weekly-report`, { headers: this.getHeaders() });
  }

  // Meal Planner
  getMealPlan(date: string): Observable<MealPlanDto> {
    return this.http.get<MealPlanDto>(`${this.API}/nutrition/meal-plan?date=${date}`, { headers: this.getHeaders() });
  }

  saveMealPlan(date: string, meals: MealEntryDto[]): Observable<any> {
    return this.http.post(`${this.API}/nutrition/meal-plan`, { date, meals }, { headers: this.getHeaders() });
  }

  getAiMealSuggestions(date: string): Observable<any> {
    return this.http.get(`${this.API}/ai/meal-suggestions?date=${date}`, { headers: this.getHeaders() });
  }

  analyzeMealPhoto(image: File, mealType: string): Observable<MealAnalysisResult> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('mealType', mealType);
    return this.http.post<MealAnalysisResult>(`${this.API}/ai/analyze-meal-image`, formData, { headers: this.getHeaders() });
  }
}
