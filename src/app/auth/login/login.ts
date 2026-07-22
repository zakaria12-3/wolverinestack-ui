import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true,
})
export class Login {
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  credentials = { email: '', password: '' };

  onLogin(form: any) {
    if (!form.valid) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.credentials.email.trim())) {
      this.toastr.error('Please enter a valid email address');
      return;
    }

    const payload = {
      email: this.credentials.email.trim().toLowerCase(),
      password: this.credentials.password
    };

    this.http.post<any>(`${environment.apiUrl}/auth/login`, payload,
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe({
      next: (res) => {
        if (!res?.token) {
          this.toastr.error('No token received');
          return;
        }
        const token = res.token;
        if (!token.includes('.')) {
          this.toastr.error('Invalid token format');
          return;
        }
        let decoded: any;
        try {
          const encodedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
          decoded = JSON.parse(atob(encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')));
        } catch {
          this.toastr.error('Invalid token received');
          return;
        }
        const role = String(decoded.role || decoded.authorities?.[0] || '').replace('ROLE_', '');
        if (!role) {
          this.toastr.error('Your account role is missing');
          return;
        }
        const onboardingComplete = res.onboardingComplete === true ||
          (res.fitnessGoal !== null && res.fitnessGoal !== undefined);

        localStorage.setItem('role', role);
        this.authService.login(token, role, onboardingComplete);

        if (role === 'MEMBER' && !onboardingComplete) {
          this.router.navigate(['/onboarding']);
        } else if (role === 'MEMBER') {
          this.router.navigate(['/member/dashboard']);
        } else if (role === 'TRAINER') {
          this.router.navigate(['/trainer/dashboard']);
        } else if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate([`/${role.toLowerCase()}`]);
        }
      },
      error: (err) => this.toastr.error(
        typeof err.error === 'string' ? err.error : err.error?.message || 'Login failed'
      )
    });
  }
}
