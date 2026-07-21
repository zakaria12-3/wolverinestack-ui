import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private API = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/users`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API}/users/${id}`);
  }

  updateUserRole(id: number, role: string): Observable<any> {
    return this.http.put(`${this.API}/users/${id}/role?role=${role}`, {});
  }

  updateUserStatus(id: number, enabled: boolean): Observable<any> {
    return this.http.put(`${this.API}/users/${id}/status?enabled=${enabled}`, {});
  }

  getJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/jobs`);
  }

  deleteJob(id: number): Observable<any> {
    return this.http.delete(`${this.API}/jobs/${id}`);
  }

  getApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/applications`);
  }

  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${this.API}/applications/${id}`);
  }
}
