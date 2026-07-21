import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-create-plan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-plan.html',
  styleUrls: ['./create-plan.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CreatePlan {
  plan = {
    name: '',
    description: '',
    difficulty: 'BEGINNER',
    daysPerWeek: 3
  };

  isLoading = false;

  difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  }

  createPlan() {
    if (!this.plan.name) {
      this.toastr.error('Plan name is required');
      return;
    }

    this.isLoading = true;
    this.http.post('http://localhost:8027/trainer/plans', this.plan, this.getHeaders())
      .subscribe({
        next: () => {
          this.toastr.success('Workout plan created! 💪');
          this.router.navigate(['/trainer/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(err.error || 'Failed to create plan');
        }
      });
  }
}
