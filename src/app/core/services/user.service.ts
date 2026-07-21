import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id?: number;
  username?: string;
  email?: string;
  bio?: string;
  headline?: string;
  location?: string;
  avatarUrl?: string;
  // Fitness fields
  fitnessGoal?: string;
  activityLevel?: string;
  gender?: string;
  weightKg?: number;
  heightCm?: number;
  dateOfBirth?: string;
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number;
  dailyCarbsGoal?: number;
  dailyFatGoal?: number;
  onboardingComplete?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getProfile(id?: number): Observable<UserProfile> {
    if (id) {
       return this.http.get<UserProfile>(`${this.apiUrl}/profile/${id}`, { headers: this.getHeaders() });
    } else {
       // if no ID is passed, we fetch our own from /users/me then use its ID or we can just fetch /me
       return this.http.get<UserProfile>(`${this.apiUrl}/me`, { headers: this.getHeaders() });
    }
  }

  getProfileByUsername(id?: number): Observable<UserProfile> {
    if (id) {
       return this.http.get<UserProfile>(`${this.apiUrl}/profile/${id}`, { headers: this.getHeaders() });
    }
    return this.http.get<UserProfile>(`${this.apiUrl}/me`, { headers: this.getHeaders() });
  }

  updateProfile(profile: UserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, profile, { headers: this.getHeaders() });
  }

  getFitnessProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/fitness-profile`, { headers: this.getHeaders() });
  }

  updateFitnessProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/fitness-profile`, data, { headers: this.getHeaders() });
  }
}
