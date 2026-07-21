import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  standalone: true
})
export class Signup {
  private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  private readonly passwordRequirementsMessage = 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.';

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) {}

  user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    weightKg: null as number | null,
    heightCm: null as number | null,
    dateOfBirth: ''
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

    const payload: any = {
      username: this.user.username,
      email: this.user.email.trim().toLowerCase(),
      password: this.user.password,
      role: 'MEMBER'
    };

    if (this.user.gender) payload.gender = this.user.gender;
    if (this.user.weightKg) payload.weightKg = this.user.weightKg;
    if (this.user.heightCm) payload.heightCm = this.user.heightCm;
    if (this.user.dateOfBirth) payload.dateOfBirth = this.user.dateOfBirth;

    this.isLoading = true;

    this.http.post('https://wolverinestack-api.onrender.com/auth/signup', payload)
      .subscribe({
        next: () => {
          this.isLoading = false;
          localStorage.setItem('verifyEmail', this.user.email);
          this.router.navigate(['/verify'], { queryParams: { email: this.user.email } });
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
