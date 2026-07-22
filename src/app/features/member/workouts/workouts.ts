import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';
import { environment } from '../../../../environments/environment';
import { ExerciseLibraryItem, ExerciseLibraryService } from '../../../core/services/exercise-library.service';

interface PlanExercise {
  exerciseName: string;
  description: string;
  instructions: string;
  sets: number;
  reps: number;
  durationSeconds: number;
  restSeconds: number;
  muscleGroup: string;
  equipment: string;
  orderIndex: number;
  imageUrl?: string;
}

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
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, height: '0', overflow: 'hidden' }),
        animate('400ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, height: '*' }),
        animate('300ms ease-in', style({ opacity: 0, height: '0' }))
      ])
    ])
  ]
})
export class WorkoutTracking implements OnInit {
  plans: any[] = [];
  sessions: any[] = [];
  activeSession: any = null;
  selectedPlan: any = null;
  viewMode: 'plans' | 'sessions' | 'active' | 'create' | 'edit' = 'plans';
  isEditing = false;
  editPlanId: number | null = null;
  isLoading = false;
  isCreating = false;

  // Current exercise for logging during session
  currentExercise = {
    exerciseName: '',
    sets: 4,
    reps: 10,
    weightKg: 0,
    notes: ''
  };

  // Session exercise search (Wger API)
  showSessionExerciseSearch = false;
  sessionLibraryQuery = '';
  isLoadingSessionExercises = false;
  sessionExerciseResults: ExerciseLibraryItem[] = [];

  // Plan builder form
  planForm = {
    name: '',
    description: '',
    goal: 'GENERAL_FITNESS',
    difficulty: 'BEGINNER',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    estimatedDailyCalories: 2200,
    exercises: [] as PlanExercise[]
  };

  manualExercise: PlanExercise = this.defaultExercise();
  exerciseResults: ExerciseLibraryItem[] = [];
  libraryQuery = '';
  isLoadingExercises = false;
  showManualExercise = false;

  difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  goals = ['GENERAL_FITNESS', 'LOSE_WEIGHT', 'BUILD_MUSCLE', 'INCREASE_STRENGTH', 'IMPROVE_ENDURANCE', 'FLEXIBILITY'];

  // Tracks images that failed to load so the template can show fallback icons
  failedImages: Set<string> = new Set();

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private exerciseLibrary: ExerciseLibraryService
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

  markImageFailed(exerciseName: string) {
    this.failedImages.add(exerciseName);
  }

  hasImageFailed(exerciseName: string): boolean {
    return this.failedImages.has(exerciseName);
  }

  // ======== Plan CRUD ========

  loadPlans() {
    this.http.get(`${environment.apiUrl}/member/plans`, this.getHeaders())
      .subscribe({
        next: (data: any) => {
          this.plans = data || [];
          this.cdr.detectChanges();
        },
        error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to load workout plans'))
      });
  }

  loadPlanDetails(id: number) {
    this.isLoading = true;
    this.http.get(`${environment.apiUrl}/member/plans/${id}`, this.getHeaders())
      .subscribe({
        next: (data: any) => {
          this.selectedPlan = data;
          this.viewMode = 'plans';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(this.errorMessage(err, 'Failed to load workout plan'));
        }
      });
  }

  openCreatePlan() {
    this.isEditing = false;
    this.editPlanId = null;
    this.resetPlanForm();
    this.viewMode = 'create';
    this.showManualExercise = false;
    this.searchExercises();
  }

  openEditPlan(plan: any) {
    this.isEditing = true;
    this.editPlanId = plan.id;
    this.planForm = {
      name: plan.name || '',
      description: plan.description || '',
      goal: plan.goal || 'GENERAL_FITNESS',
      difficulty: plan.difficulty || 'BEGINNER',
      durationWeeks: plan.durationWeeks || 4,
      sessionsPerWeek: plan.sessionsPerWeek || 3,
      estimatedDailyCalories: plan.estimatedDailyCalories || 2200,
      exercises: (plan.exercises || []).map((ex: any) => ({
        exerciseName: ex.exerciseName || '',
        description: ex.description || '',
        instructions: ex.instructions || '',
        sets: ex.sets || 3,
        reps: ex.reps || 10,
        durationSeconds: ex.durationSeconds || 0,
        restSeconds: ex.restSeconds || 60,
        muscleGroup: ex.muscleGroup || 'General',
        equipment: ex.equipment || 'Bodyweight',
        orderIndex: ex.orderIndex || 1,
        imageUrl: ex.imageUrl || ''
      }))
    };
    this.viewMode = 'edit';
    this.showManualExercise = false;
    this.searchExercises();
  }

  cancelPlanForm() {
    this.viewMode = 'plans';
    this.resetPlanForm();
  }

  savePlan() {
    if (!this.planForm.name.trim()) {
      this.toastr.error('Plan name is required');
      return;
    }
    if (!this.planForm.exercises.length) {
      this.toastr.error('Add at least one exercise');
      return;
    }

    this.isCreating = true;
    const body = { ...this.planForm };
    body.exercises.forEach((ex, i) => ex.orderIndex = i + 1);

    const headers = { headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`) };

    const request = this.isEditing
      ? this.http.put(`${environment.apiUrl}/member/plans/${this.editPlanId}`, body, headers)
      : this.http.post(`${environment.apiUrl}/member/plans`, body, headers);

    request.subscribe({
      next: () => {
        this.toastr.success(this.isEditing ? 'Plan updated!' : 'Plan created!');
        this.isCreating = false;
        this.viewMode = 'plans';
        this.loadPlans();
      },
      error: (err: any) => {
        this.isCreating = false;
        this.toastr.error(this.errorMessage(err, 'Failed to save plan'));
      }
    });
  }

  deletePlan(planId: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (!confirm('Delete this workout plan? This cannot be undone.')) return;

    this.http.delete(`${environment.apiUrl}/member/plans/${planId}`, this.getHeaders())
      .subscribe({
        next: () => {
          this.toastr.success('Plan deleted');
          this.loadPlans();
        },
        error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to delete plan'))
      });
  }

  startPlan(planId: number) {
    this.startNewSession(planId);
  }

  // ======== Session Management ========

  loadSessions() {
    this.http.get(`${environment.apiUrl}/member/sessions`, this.getHeaders())
      .subscribe({
        next: (data: any) => {
          this.sessions = data || [];
          this.cdr.detectChanges();
        },
        error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to load workout history'))
      });
  }

  startNewSession(planId?: number) {
    this.http.post(`${environment.apiUrl}/member/sessions/start`,
      planId ? { planId, sessionName: 'Workout Session' } : { sessionName: 'Quick Workout' },
      this.getHeaders()
    ).subscribe({
      next: (res: any) => {
        this.activeSession = res;
        this.viewMode = 'active';
        this.showSessionExerciseSearch = false;
        this.toastr.success('Session started! 💪');
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to start session'))
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

    const payload = {
      exerciseName: this.currentExercise.exerciseName,
      actualSets: this.currentExercise.sets,
      actualReps: this.currentExercise.reps,
      weightKg: this.currentExercise.weightKg,
      notes: this.currentExercise.notes,
      targetSets: this.currentExercise.sets,
      targetReps: this.currentExercise.reps,
      orderIndex: (this.activeSession.logEntries || []).length + 1
    };

    this.http.post(
      `${environment.apiUrl}/member/sessions/${this.activeSession.id}/log`,
      payload,
      this.getHeaders()
    ).subscribe({
      next: (res: any) => {
        this.activeSession = res;
        this.currentExercise = { exerciseName: '', sets: 4, reps: 10, weightKg: 0, notes: '' };
        this.toastr.success('Exercise logged!');
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to log exercise'))
    });
  }

  completeSession() {
    if (!this.activeSession?.id) return;

    this.http.post(
      `${environment.apiUrl}/member/sessions/${this.activeSession.id}/complete`,
      {},
      this.getHeaders()
    ).subscribe({
      next: () => {
        this.toastr.success('Workout complete! 🎉');
        this.activeSession = null;
        this.viewMode = 'sessions';
        this.loadSessions();
      },
      error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to complete session'))
    });
  }

  deleteSession(sessionId: number) {
    if (!confirm('Delete this session? This cannot be undone.')) return;

    this.http.delete(`${environment.apiUrl}/member/sessions/${sessionId}`, this.getHeaders())
      .subscribe({
        next: () => {
          this.toastr.success('Session deleted');
          this.loadSessions();
        },
        error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to delete session'))
      });
  }

  // ======== Exercise Library (Wger API — Plan Builder) ========

  searchExercises() {
    this.isLoadingExercises = true;
    this.exerciseLibrary.searchExercises(this.libraryQuery).subscribe({
      next: (exercises) => {
        this.exerciseResults = exercises;
        this.isLoadingExercises = false;
      },
      error: () => {
        this.exerciseResults = [];
        this.isLoadingExercises = false;
      }
    });
  }

  addExerciseFromLibrary(exercise: ExerciseLibraryItem) {
    this.planForm.exercises.push({
      exerciseName: exercise.name,
      description: exercise.description,
      instructions: exercise.description,
      sets: 3,
      reps: 10,
      durationSeconds: 0,
      restSeconds: 60,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      orderIndex: this.planForm.exercises.length + 1,
      imageUrl: exercise.imageUrl
    });
    this.toastr.success(`${exercise.name} added`);
  }

  addManualExercise() {
    if (!this.manualExercise.exerciseName.trim()) {
      this.toastr.error('Exercise name is required');
      return;
    }
    this.planForm.exercises.push({
      ...this.manualExercise,
      orderIndex: this.planForm.exercises.length + 1
    });
    this.manualExercise = this.defaultExercise();
    this.showManualExercise = false;
    this.toastr.success('Exercise added');
  }

  removeExercise(index: number) {
    this.planForm.exercises.splice(index, 1);
    this.reorderExercises();
  }

  moveExercise(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= this.planForm.exercises.length) return;
    const [exercise] = this.planForm.exercises.splice(index, 1);
    this.planForm.exercises.splice(nextIndex, 0, exercise);
    this.reorderExercises();
  }

  // ======== Session Exercise Search (Wger — Active Session) ========

  searchSessionExercises() {
    this.isLoadingSessionExercises = true;
    this.exerciseLibrary.searchExercises(this.sessionLibraryQuery).subscribe({
      next: (exercises) => {
        this.sessionExerciseResults = exercises;
        this.isLoadingSessionExercises = false;
      },
      error: () => {
        this.sessionExerciseResults = [];
        this.isLoadingSessionExercises = false;
      }
    });
  }

  selectSessionExercise(exercise: ExerciseLibraryItem) {
    this.currentExercise.exerciseName = exercise.name;
    this.showSessionExerciseSearch = false;
    this.toastr.info(`Selected: ${exercise.name}`);
  }

  // ======== Utility ========

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

  formatGoal(goal: string): string {
    return goal.replace(/_/g, ' ');
  }

  planExerciseCount(): number {
    return this.planForm.exercises.length;
  }

  private resetPlanForm() {
    this.planForm = {
      name: '',
      description: '',
      goal: 'GENERAL_FITNESS',
      difficulty: 'BEGINNER',
      durationWeeks: 4,
      sessionsPerWeek: 3,
      estimatedDailyCalories: 2200,
      exercises: []
    };
  }

  private reorderExercises() {
    this.planForm.exercises.forEach((exercise, index) => exercise.orderIndex = index + 1);
  }

  private defaultExercise(): PlanExercise {
    return {
      exerciseName: '',
      description: '',
      instructions: '',
      sets: 3,
      reps: 10,
      durationSeconds: 0,
      restSeconds: 60,
      muscleGroup: 'General',
      equipment: 'Bodyweight',
      orderIndex: 1,
      imageUrl: ''
    };
  }

  private errorMessage(err: any, fallback: string): string {
    return typeof err?.error === 'string' ? err.error : err?.error?.message || fallback;
  }
}
