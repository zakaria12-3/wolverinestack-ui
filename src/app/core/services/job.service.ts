import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobService {

  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getJobs() {
    return this.http.get<any[]>(`${this.API}/candidate/jobs`);
  }
}
