import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Conversation {
  id: number;
  participantId: number;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface Message {
  id?: number;
  conversationId?: number;
  senderId?: number;
  receiverId?: number;
  senderName?: string;
  content: string;
  createdAt?: string;
  mine?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private readonly apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`, { headers: this.getHeaders() });
  }

  getMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/conversations/${conversationId}`, { headers: this.getHeaders() });
  }

  sendMessage(receiverId: number, content: string, conversationId?: number): Observable<Message> {
    return this.http.post<Message>(
      `${this.apiUrl}/send`,
      { receiverId, conversationId, content },
      { headers: this.getHeaders() }
    );
  }
}
