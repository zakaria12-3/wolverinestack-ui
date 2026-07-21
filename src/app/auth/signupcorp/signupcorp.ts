import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-signupcorp',
  imports: [FormsModule, RouterLink],
  templateUrl: './signupcorp.html',
  styleUrls: ['./signupcorp.css'],
  standalone: true
})
export class Signupcorp {
  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) {}

  user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;

  onSubmit(form: any) {
    if (!form.valid) return;

    if (this.user.password !== this.user.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    const payload = {
      username: this.user.username,
      email: this.user.email.trim().toLowerCase(),
      password: this.user.password,
      role: 'TRAINER'
    };

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
          this.toastr.error(err.status === 400 ? 'User already exists or invalid data' : 'Something went wrong');
        }
      });
  }
}
