import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * Send a message to the role-aware chatbot endpoint.
   * The backend enriches the prompt with the user's fitness goal,
   * activity level, and profile context for personalized replies.
   */
  sendMessage(message: string): Observable<string> {
    return this.http
      .post<{ reply: string }>(
        `${this.API}/chat`,
        { message },
        { headers: this.getHeaders() }
      )
      .pipe(map(res => res.reply));
  }
}
