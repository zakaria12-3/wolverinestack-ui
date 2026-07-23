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

  /** Send a message to the AI fitness coach and get a reply */
  sendMessage(message: string): Observable<string> {
    return this.http
      .post<{ reply: string }>(
        `${this.API}/ai/chat`,
        { message },
        { headers: this.getHeaders() }
      )
      .pipe(map(res => res.reply));
  }

  /** Send a message to the role-aware chatbot (includes goal context) */
  sendChatbotMessage(message: string): Observable<string> {
    return this.http
      .post<{ reply: string }>(
        `${this.API}/chat`,
        { message },
        { headers: this.getHeaders() }
      )
      .pipe(map(res => res.reply));
  }
}
