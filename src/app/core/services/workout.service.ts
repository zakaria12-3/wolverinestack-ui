import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WorkoutPlanDto {
  id?: number;
  name: string;
  description?: string;
  difficulty?: string;
  daysPerWeek?: number;
  createdBy?: string;
  createdAt?: string;
}

export interface ExerciseLogDto {
  id?: number;
  exerciseName: string;
  sets: number;
  reps: number;
  weightKg: number;
  notes?: string;
}

export interface WorkoutSessionDto {
  id?: number;
  sessionName: string;
  planName?: string;
  durationMinutes?: number;
  caloriesBurned?: number;
  startedAt?: string;
  completedAt?: string;
  exercises?: ExerciseLogDto[];
}

export interface WorkoutSummaryDto {
  totalSessions: number;
  sessionsThisWeek: number;
  totalMinutesThisWeek: number;
  totalCaloriesBurnedThisWeek: number;
  currentPlanName?: string;
  recentSessions: WorkoutSessionDto[];
}

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Workout Plans
  getPlans(): Observable<WorkoutPlanDto[]> {
    return this.http.get<WorkoutPlanDto[]>(`${this.API}/member/plans`, { headers: this.getHeaders() });
  }

  getPlanById(id: number): Observable<WorkoutPlanDto> {
    return this.http.get<WorkoutPlanDto>(`${this.API}/member/plans/${id}`, { headers: this.getHeaders() });
  }

  startPlan(planId: number): Observable<any> {
    return this.startSession(planId);
  }

  // Workout Sessions
  getSessions(): Observable<WorkoutSessionDto[]> {
    return this.http.get<WorkoutSessionDto[]>(`${this.API}/member/sessions`, { headers: this.getHeaders() });
  }

  getSessionById(id: number): Observable<WorkoutSessionDto> {
    return this.http.get<WorkoutSessionDto>(`${this.API}/member/sessions/${id}`, { headers: this.getHeaders() });
  }

  startSession(planId?: number): Observable<any> {
    return this.http.post(`${this.API}/member/sessions/start`, { planId }, { headers: this.getHeaders() });
  }

  completeSession(sessionId: number, data: any): Observable<any> {
    return this.http.put(`${this.API}/member/sessions/${sessionId}/complete`, data, { headers: this.getHeaders() });
  }

  logExercise(sessionId: number, exercise: ExerciseLogDto): Observable<any> {
    return this.http.post(`${this.API}/member/sessions/${sessionId}/exercises`, exercise, { headers: this.getHeaders() });
  }

  getWorkoutSummary(): Observable<WorkoutSummaryDto> {
    return this.http.get<WorkoutSummaryDto>(`${this.API}/member/workout-summary`, { headers: this.getHeaders() });
  }
}
