import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-workout-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workouts.html',
  styleUrls: ['./workouts.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class WorkoutTracking implements OnInit {
  plans: any[] = [];
  sessions: any[] = [];
  activeSession: any = null;
  selectedPlan: any = null;
  viewMode: 'plans' | 'sessions' | 'active' = 'plans';
  isLoading = false;

  currentExercise = {
    exerciseName: '',
    sets: 4,
    reps: 10,
    weightKg: 0,
    notes: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  }

  ngOnInit() {
    this.loadPlans();
    this.loadSessions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlanDetails(+id);
    }
  }

  loadPlans() {
    this.http.get('https://wolverinestack-api.onrender.com/member/plans', this.getHeaders())
      .subscribe((data: any) => {
        this.plans = data || [];
        this.cdr.detectChanges();
      });
  }

  loadSessions() {
    this.http.get('https://wolverinestack-api.onrender.com/member/sessions', this.getHeaders())
      .subscribe((data: any) => {
        this.sessions = data || [];
        this.cdr.detectChanges();
      });
  }

  loadPlanDetails(id: number) {
    this.isLoading = true;
    this.http.get(`https://wolverinestack-api.onrender.com/member/plans/${id}`, this.getHeaders())
      .subscribe((data: any) => {
        this.selectedPlan = data;
        this.viewMode = 'plans';
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  startPlan(planId: number) {
    this.http.post(`https://wolverinestack-api.onrender.com/member/plans/${planId}/start`, {}, this.getHeaders())
      .subscribe({
        next: () => {
          this.toastr.success('Plan started!');
          this.startNewSession(planId);
        },
        error: (err) => this.toastr.error(err.error || 'Failed to start plan')
      });
  }

  startNewSession(planId?: number) {
    this.http.post('https://wolverinestack-api.onrender.com/member/sessions/start', 
      planId ? { planId } : {}, 
      this.getHeaders()
    ).subscribe({
      next: (res: any) => {
        this.activeSession = { ...res, exercises: [] };
        this.viewMode = 'active';
        this.toastr.success('Session started! 💪');
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(err.error || 'Failed to start session')
    });
  }

  logExercise() {
    if (!this.currentExercise.exerciseName || this.currentExercise.weightKg <= 0) {
      this.toastr.error('Please enter exercise name and weight');
      return;
    }

    if (!this.activeSession?.id) {
      this.toastr.error('No active session');
      return;
    }

    this.http.post(
      `https://wolverinestack-api.onrender.com/member/sessions/${this.activeSession.id}/exercises`,
      this.currentExercise,
      this.getHeaders()
    ).subscribe({
      next: (res: any) => {
        this.activeSession.exercises.push(res || this.currentExercise);
        this.currentExercise = { exerciseName: '', sets: 4, reps: 10, weightKg: 0, notes: '' };
        this.toastr.success('Exercise logged!');
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(err.error || 'Failed to log exercise')
    });
  }

  completeSession() {
    if (!this.activeSession?.id) return;

    this.http.put(
      `https://wolverinestack-api.onrender.com/member/sessions/${this.activeSession.id}/complete`,
      {},
      this.getHeaders()
    ).subscribe({
      next: () => {
        this.toastr.success('Workout complete! 🎉');
        this.activeSession = null;
        this.viewMode = 'sessions';
        this.loadSessions();
      },
      error: (err) => this.toastr.error(err.error || 'Failed to complete session')
    });
  }

  getDuration(startedAt: string): string {
    if (!startedAt) return '0 min';
    const start = new Date(startedAt);
    const now = new Date();
    const min = Math.floor((now.getTime() - start.getTime()) / 60000);
    return min < 1 ? '< 1 min' : `${min} min`;
  }

  formatDate(d: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
