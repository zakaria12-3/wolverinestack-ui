import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardDto {
  profile: {
    username: string;
    email: string;
    fitnessGoal: string;
    activityLevel: string;
    gender: string;
    weightKg: number;
    heightCm: number;
    dailyCalorieGoal: number;
    dailyProteinGoal: number;
    dailyCarbsGoal: number;
    dailyFatGoal: number;
    onboardingComplete: boolean;
  };
  nutrition: {
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
  };
  measurement: {
    hasData: boolean;
    latestDate?: string;
    weightKg?: number;
    bodyFatPercent?: number;
    waistCm?: number;
    chestCm?: number;
    weightChangeKg?: number;
    bodyFatChange?: number;
  };
  workout: {
    totalSessions: number;
    sessionsThisWeek: number;
    totalMinutesThisWeek: number;
    totalCaloriesBurnedThisWeek: number;
    currentPlanName?: string;
    recentSessions: any[];
  };
  coachNote: {
    message: string;
    focus: string;
    suggestion: string;
  };
}

@Injectable({ providedIn: 'root' })
export class MemberService {
  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getDashboard(): Observable<DashboardDto> {
    return this.http.get<DashboardDto>(`${this.API}/member/dashboard`, { headers: this.getHeaders() });
  }
}
