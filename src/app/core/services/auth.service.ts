import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor() {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  login(token: string, role: string, onboardingComplete?: boolean) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if (onboardingComplete !== undefined) {
      localStorage.setItem('onboardingComplete', String(onboardingComplete));
    }
    this.loggedIn.next(true);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('onboardingComplete');
    this.loggedIn.next(false);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isOnboardingComplete(): boolean {
    return localStorage.getItem('onboardingComplete') === 'true';
  }

  setOnboardingComplete(complete: boolean) {
    localStorage.setItem('onboardingComplete', String(complete));
  }
}
