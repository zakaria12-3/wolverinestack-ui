import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from './user.service';
import { PostDto } from './post.service';

export interface SearchResponseDto {
  users: UserProfile[];
  workoutPlans?: any[];
  posts: PostDto[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = localStorage.getItem('token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  globalSearch(query: string, type?: string): Observable<SearchResponseDto> {
    let url = `${this.apiUrl}?q=${encodeURIComponent(query)}`;
    if (type) url += `&type=${type}`;
    return this.http.get<SearchResponseDto>(url, { headers: this.getHeaders() });
  }
}
