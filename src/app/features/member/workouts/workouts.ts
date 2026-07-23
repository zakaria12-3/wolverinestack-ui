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

interface ConfettiParticle {
  id: number;
  color: string;
  x: string;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  drift: number;
}

interface ExerciseSet {
  id?: number;
  setIndex: number;
  setType: string;
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  notes: string;
  isPersonalRecord?: boolean;
  previousBestWeight?: number;
  previousBestReps?: number;
}

interface SessionExercise {
  id: number;
  exerciseName: string;
  muscleGroup: string;
  equipment: string;
  imageUrl: string;
  targetSets: number;
  targetReps: number;
  completedSetCount: number;
  totalReps: number;
  totalVolume: number;
  orderIndex: number;
  notes: string;
  sets: ExerciseSet[];
  previousBestWeight?: number;
  previousBestReps?: number;
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
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
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

  // Hevy-style: add exercise shell, then log sets individually
  currentExercise = {
    exerciseName: '',
    muscleGroup: '',
    equipment: '',
    imageUrl: '',
    targetSets: 3,
    targetReps: 10,
    notes: ''
  };

  // Per-set form
  currentSet = {
    weightKg: 0,
    reps: 10,
    setType: 'NORMAL' as string,
    rpe: null as number | null,
    notes: ''
  };

  editingSet: { exerciseId: number; setId: number } | null = null;

  // PR Celebration
  showPrCelebration = false;
  confettiParticles: ConfettiParticle[] = [];
  currentPrDetails: { exerciseName: string; weight: number; reps: number } | null = null;

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
    if (id) this.loadPlanDetails(+id);
  }

  getSessionExercises(): SessionExercise[] {
    return this.activeSession?.sessionExercises || [];
  }

  getTotalExerciseSets(): number {
    return this.getSessionExercises().reduce((sum, ex) => sum + ((ex as any).sets?.length || 0), 0);
  }

  getTotalExerciseReps(): number {
    return this.getSessionExercises().reduce((sum, ex) => sum + ((ex as any).totalReps || 0), 0);
  }

  getTotalExerciseVolume(): string {
    const vol = this.getSessionExercises().reduce((sum, ex) => sum + ((ex as any).totalVolume || 0), 0);
    return vol.toFixed(0);
  }

  markImageFailed(exerciseName: string) { this.failedImages.add(exerciseName); }
  hasImageFailed(exerciseName: string): boolean { return this.failedImages.has(exerciseName); }

  // ======== Plan CRUD ========

  loadPlans() {
    this.http.get(`${environment.apiUrl}/member/plans`, this.getHeaders())
      .subscribe({
        next: (data: any) => { this.plans = data || []; this.cdr.detectChanges(); },
        error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to load workout plans'))
      });
  }

  loadPlanDetails(id: number) {
    this.isLoading = true;
    this.http.get(`${environment.apiUrl}/member/plans/${id}`, this.getHeaders())
      .subscribe({
        next: (data: any) => { this.selectedPlan = data; this.viewMode = 'plans'; this.isLoading = false; this.cdr.detectChanges(); },
        error: (err) => { this.isLoading = false; this.toastr.error(this.errorMessage(err, 'Failed to load workout plan')); }
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

  cancelPlanForm() { this.viewMode = 'plans'; this.resetPlanForm(); }

  savePlan() {
    if (!this.planForm.name.trim()) { this.toastr.error('Plan name is required'); return; }
    if (!this.planForm.exercises.length) { this.toastr.error('Add at least one exercise'); return; }
    this.isCreating = true;
    const body = { ...this.planForm };
    body.exercises.forEach((ex, i) => ex.orderIndex = i + 1);
    const headers = { headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`) };
    const request = this.isEditing
      ? this.http.put(`${environment.apiUrl}/member/plans/${this.editPlanId}`, body, headers)
      : this.http.post(`${environment.apiUrl}/member/plans`, body, headers);
    request.subscribe({
      next: () => { this.toastr.success(this.isEditing ? 'Plan updated!' : 'Plan created!'); this.isCreating = false; this.viewMode = 'plans'; this.loadPlans(); },
      error: (err: any) => { this.isCreating = false; this.toastr.error(this.errorMessage(err, 'Failed to save plan')); }
    });
  }

  deletePlan(planId: number, event?: Event) {
    if (event) event.stopPropagation();
    if (!confirm('Delete this workout plan? This cannot be undone.')) return;
    this.http.delete(`${environment.apiUrl}/member/plans/${planId}`, this.getHeaders())
      .subscribe({
        next: () => { this.toastr.success('Plan deleted'); this.loadPlans(); },
        error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to delete plan'))
      });
  }

  startPlan(planId: number) { this.startNewSession(planId); }

  // ======== SESSION MANAGEMENT ========

  loadSessions() {
    this.http.get(`${environment.apiUrl}/member/sessions`, this.getHeaders())
      .subscribe({
        next: (data: any) => { this.sessions = data || []; this.cdr.detectChanges(); },
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

  // ======== HEVY-STYLE: Add Exercise Shell ========

  addExerciseToSession() {
    if (!this.currentExercise.exerciseName) {
      this.toastr.error('Please enter exercise name');
      return;
    }
    if (!this.activeSession?.id) { this.toastr.error('No active session'); return; }

    const exercises = this.getSessionExercises();
    const payload = {
      exerciseName: this.currentExercise.exerciseName,
      muscleGroup: this.currentExercise.muscleGroup,
      equipment: this.currentExercise.equipment,
      imageUrl: this.currentExercise.imageUrl,
      targetSets: this.currentExercise.targetSets,
      targetReps: this.currentExercise.targetReps,
      orderIndex: exercises.length + 1,
      notes: this.currentExercise.notes
    };

    this.http.post(
      `${environment.apiUrl}/member/sessions/${this.activeSession.id}/exercises`,
      payload,
      this.getHeaders()
    ).subscribe({
      next: (res: any) => {
        this.activeSession = res;
        this.resetCurrentExercise();
        this.toastr.success('Exercise added! Now log your sets below.');
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to add exercise'))
    });
  }

  removeExercise(exerciseId: number) {
    if (!confirm('Remove this exercise from the session? Sets will be lost.')) return;
    this.http.delete(
      `${environment.apiUrl}/member/sessions/${this.activeSession.id}/exercises/${exerciseId}`,
      this.getHeaders()
    ).subscribe({
      next: (res: any) => {
        this.activeSession = res;
        this.toastr.info('Exercise removed');
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to remove exercise'))
    });
  }

  // ======== HEVY-STYLE: Per-Set Logging ========

  addSet(exerciseId: number) {
    if (this.currentSet.weightKg <= 0 && this.currentSet.reps <= 0) {
      this.toastr.error('Enter weight or reps');
      return;
    }
    this.http.post(
      `${environment.apiUrl}/member/sessions/${this.activeSession.id}/exercises/${exerciseId}/sets`,
      {
        setType: this.currentSet.setType,
        weightKg: this.currentSet.weightKg || null,
        reps: this.currentSet.reps || null,
        rpe: this.currentSet.rpe,
        notes: this.currentSet.notes
      },
      this.getHeaders()
    ).subscribe({
      next: (updatedExercise: any) => {
        this.updateExerciseInSession(updatedExercise);
        // Check if any set in the response is a new PR
        const prSet = updatedExercise.sets?.find((s: any) => s.isPersonalRecord);
        if (prSet) {
          this.triggerPrCelebration(updatedExercise.exerciseName, prSet.weightKg || 0, prSet.reps || 0);
        }
        this.resetCurrentSet();
        this.toastr.success('Set logged! 💪');
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to log set'))
    });
  }

  updateSet(exerciseId: number, setId: number) {
    if (!this.editingSet || this.editingSet.setId !== setId) return;
    this.http.put(
      `${environment.apiUrl}/member/sessions/${this.activeSession.id}/exercises/${exerciseId}/sets/${setId}`,
      {
        setType: this.currentSet.setType,
        weightKg: this.currentSet.weightKg || null,
        reps: this.currentSet.reps || null,
        rpe: this.currentSet.rpe,
        notes: this.currentSet.notes
      },
      this.getHeaders()
    ).subscribe({
      next: (updatedExercise: any) => {
        this.updateExerciseInSession(updatedExercise);
        this.editingSet = null;
        this.resetCurrentSet();
        this.toastr.success('Set updated');
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to update set'))
    });
  }

  startEditSet(exercise: SessionExercise, set: ExerciseSet) {
    this.editingSet = { exerciseId: exercise.id, setId: set.id! };
    this.currentSet = {
      weightKg: set.weightKg || 0,
      reps: set.reps || 0,
      setType: set.setType || 'NORMAL',
      rpe: set.rpe,
      notes: set.notes || ''
    };
  }

  cancelEditSet() {
    this.editingSet = null;
    this.resetCurrentSet();
  }

  deleteSet(exerciseId: number, setId: number) {
    if (!confirm('Delete this set?')) return;
    this.http.delete(
      `${environment.apiUrl}/member/sessions/${this.activeSession.id}/exercises/${exerciseId}/sets/${setId}`,
      this.getHeaders()
    ).subscribe({
      next: (updatedExercise: any) => {
        this.updateExerciseInSession(updatedExercise);
        this.toastr.info('Set deleted');
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to delete set'))
    });
  }

  quickAddSet(exerciseId: number, weightKg: number, reps: number) {
    this.http.post(
      `${environment.apiUrl}/member/sessions/${this.activeSession.id}/exercises/${exerciseId}/sets`,
      { setType: 'NORMAL', weightKg, reps },
      this.getHeaders()
    ).subscribe({
      next: (updatedExercise: any) => {
        this.updateExerciseInSession(updatedExercise);
        this.toastr.success(`${reps}×${weightKg}kg logged`);
        this.cdr.detectChanges();
      },
      error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to log quick set'))
    });
  }

  duplicateLastSet(exerciseId: number) {
    const exercises = this.getSessionExercises().find(e => e.id === exerciseId);
    if (!exercises?.sets?.length) return;
    const lastSet = exercises.sets[exercises.sets.length - 1];
    this.quickAddSet(exerciseId, lastSet.weightKg || 0, lastSet.reps || 0);
  }

  private updateExerciseInSession(updatedExercise: any) {
    if (!this.activeSession?.sessionExercises) return;
    const idx = this.activeSession.sessionExercises.findIndex((e: any) => e.id === updatedExercise.id);
    if (idx >= 0) {
      this.activeSession.sessionExercises[idx] = updatedExercise;
    }
  }

  // ======== Complete Session ========

  completeSession() {
    if (!this.activeSession?.id) return;
    const exercises = this.getSessionExercises();
    const totalSets = exercises.reduce((sum, ex) => sum + ((ex as any).sets?.length || 0), 0);
    if (totalSets === 0 && !confirm('No sets logged. Complete anyway?')) return;

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
        next: () => { this.toastr.success('Session deleted'); this.loadSessions(); },
        error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to delete session'))
      });
  }

  // ======== Exercise Library (Wger) ========

  searchExercises() {
    this.isLoadingExercises = true;
    this.exerciseLibrary.searchExercises(this.libraryQuery).subscribe({
      next: (exercises) => { this.exerciseResults = exercises; this.isLoadingExercises = false; },
      error: () => { this.exerciseResults = []; this.isLoadingExercises = false; }
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
    if (!this.manualExercise.exerciseName.trim()) { this.toastr.error('Exercise name is required'); return; }
    this.planForm.exercises.push({ ...this.manualExercise, orderIndex: this.planForm.exercises.length + 1 });
    this.manualExercise = this.defaultExercise();
    this.showManualExercise = false;
    this.toastr.success('Exercise added');
  }

  removeFromPlan(index: number) { this.planForm.exercises.splice(index, 1); this.reorderExercises(); }

  moveExercise(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= this.planForm.exercises.length) return;
    const [exercise] = this.planForm.exercises.splice(index, 1);
    this.planForm.exercises.splice(nextIndex, 0, exercise);
    this.reorderExercises();
  }

  // ======== Session Exercise Search (Wger) ========

  searchSessionExercises() {
    this.isLoadingSessionExercises = true;
    this.exerciseLibrary.searchExercises(this.sessionLibraryQuery).subscribe({
      next: (exercises) => { this.sessionExerciseResults = exercises; this.isLoadingSessionExercises = false; },
      error: () => { this.sessionExerciseResults = []; this.isLoadingSessionExercises = false; }
    });
  }

  selectSessionExercise(exercise: ExerciseLibraryItem) {
    this.currentExercise = {
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      imageUrl: exercise.imageUrl || '',
      targetSets: 3,
      targetReps: 10,
      notes: exercise.description || ''
    };
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

  formatGoal(goal: string): string { return goal.replace(/_/g, ' '); }
  planExerciseCount(): number { return this.planForm.exercises.length; }

  isEditingThisSet(exerciseId: number, setId: number): boolean {
    return this.editingSet?.exerciseId === exerciseId && this.editingSet?.setId === setId;
  }

  getSetTypeLabel(t: string): string { return t ? t.charAt(0) + t.slice(1).toLowerCase() : 'Normal'; }
  formatWeightKg(w: number | null): string { return w ? `${w} kg` : 'BW'; }

  // ======== PR Celebration ========

  triggerPrCelebration(exerciseName: string, weight: number, reps: number) {
    this.currentPrDetails = { exerciseName, weight, reps };
    this.confettiParticles = this.generateConfettiParticles(60);
    this.showPrCelebration = true;
    this.cdr.detectChanges();

    // Auto-hide after 3s
    setTimeout(() => {
      this.showPrCelebration = false;
      this.currentPrDetails = null;
      this.confettiParticles = [];
      this.cdr.detectChanges();
    }, 3000);
  }

  private generateConfettiParticles(count: number): ConfettiParticle[] {
    const colors = ['#FFB800', '#FFD700', '#FF6B35', '#00DBE9', '#CCF200', '#FF4D6D', '#7B2FF7', '#00E676'];
    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * 100 + '%',
        size: 4 + Math.random() * 10,
        duration: 1.5 + Math.random() * 1.5,
        delay: Math.random() * 0.8,
        rotation: 360 + Math.random() * 720,
        drift: -150 + Math.random() * 300
      });
    }
    return particles;
  }

  private resetCurrentExercise() {
    this.currentExercise = { exerciseName: '', muscleGroup: '', equipment: '', imageUrl: '', targetSets: 3, targetReps: 10, notes: '' };
  }

  private resetCurrentSet() {
    this.currentSet = { weightKg: 0, reps: 10, setType: 'NORMAL', rpe: null, notes: '' };
  }

  private resetPlanForm() {
    this.planForm = {
      name: '', description: '', goal: 'GENERAL_FITNESS', difficulty: 'BEGINNER',
      durationWeeks: 4, sessionsPerWeek: 3, estimatedDailyCalories: 2200, exercises: []
    };
  }

  private reorderExercises() {
    this.planForm.exercises.forEach((exercise, index) => exercise.orderIndex = index + 1);
  }

  private defaultExercise(): PlanExercise {
    return { exerciseName: '', description: '', instructions: '', sets: 3, reps: 10, durationSeconds: 0, restSeconds: 60, muscleGroup: 'General', equipment: 'Bodyweight', orderIndex: 1, imageUrl: '' };
  }

  private errorMessage(err: any, fallback: string): string {
    return typeof err?.error === 'string' ? err.error : err?.error?.message || fallback;
  }
}
