import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VerificationMailService {
  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  sendVerificationCode(email: string): Observable<string> {
    return this.http.post(
      `${this.authUrl}/resend`,
      { email: email.trim().toLowerCase() },
      { responseType: 'text' }
    );
  }

  verifyCode(email: string, verificationCode: string): Observable<string> {
    return this.http.post(
      `${this.authUrl}/verify`,
      {
        email: email.trim().toLowerCase(),
        verificationCode: String(verificationCode).trim()
      },
      { responseType: 'text' }
    );
  }
}
