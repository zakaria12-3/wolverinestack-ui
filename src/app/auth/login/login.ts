import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
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

    this.http.post<any>('https://wolverinestack-api.onrender.com/auth/login', payload,
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
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const role = decoded.role.replace('ROLE_', '');
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
      error: (err) => this.toastr.error(err.error || 'Login failed')
    });
  }
}
