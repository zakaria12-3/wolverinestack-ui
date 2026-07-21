import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { VerificationMailService } from '../../core/services/verification-mail.service';
@Component({
  selector: 'app-signupcorp',
  imports: [FormsModule, RouterLink],
  templateUrl: './signupcorp.html',
  styleUrls: ['./signupcorp.css'],
  standalone: true
})
export class Signupcorp {
  private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  private readonly passwordRequirementsMessage = 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private verificationMail: VerificationMailService
  ) {}

  user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;

  onSubmit(form: any) {
    if (!form.valid) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email.trim())) {
      this.toastr.error('Please enter a valid email address');
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    if (!this.passwordRegex.test(this.user.password)) {
      this.toastr.error(this.passwordRequirementsMessage);
      return;
    }

    const email = this.user.email.trim().toLowerCase();
    const payload = {
      username: this.user.username,
      email,
      password: this.user.password,
      role: 'TRAINER'
    };

    this.isLoading = true;

    this.http.post(`${environment.apiUrl}/auth/signup`, payload)
      .subscribe({
        next: () => {
          localStorage.setItem('verifyEmail', email);
          this.verificationMail.sendVerificationCode(email).subscribe({
            next: () => {
              this.isLoading = false;
              this.toastr.success('Verification code sent.');
              this.router.navigate(['/verify'], { queryParams: { email } });
            },
            error: () => {
              this.isLoading = false;
              this.toastr.warning('Account created, but the verification email could not be resent automatically. Use Resend Code on the next screen.');
              this.router.navigate(['/verify'], { queryParams: { email } });
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(this.getSignupErrorMessage(err));
        }
      });
  }

  private getSignupErrorMessage(err: any): string {
    if (typeof err?.error === 'string' && err.error.trim()) {
      return err.error;
    }

    if (typeof err?.error?.message === 'string' && err.error.message.trim()) {
      return err.error.message;
    }

    return err?.status === 400 ? 'User already exists or invalid data' : 'Something went wrong';
  }
}
