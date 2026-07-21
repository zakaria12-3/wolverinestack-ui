import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PostDto {
  id?: number;
  authorId?: number;
  authorName?: string;
  authorAvatar?: string;
  content?: string;
  createdAt?: string;
  likesCount?: number;
  likedByCurrentUser?: boolean;
  comments?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllPosts(): Observable<PostDto[]> {
    return this.http.get<PostDto[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createPost(content: string): Observable<PostDto> {
    return this.http.post<PostDto>(this.apiUrl, { content }, { headers: this.getHeaders() });
  }

  toggleLike(postId: number): Observable<PostDto> {
    return this.http.post<PostDto>(`${this.apiUrl}/${postId}/like`, {}, { headers: this.getHeaders() });
  }

  addComment(postId: number, content: string): Observable<PostDto> {
    return this.http.post<PostDto>(`${this.apiUrl}/${postId}/comment`, { content }, { headers: this.getHeaders() });
  }
}
