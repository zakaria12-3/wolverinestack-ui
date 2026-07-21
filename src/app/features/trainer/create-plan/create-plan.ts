import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
export class CreatePlan implements OnInit {
  plan = {
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
  isLoading = false;
  isLoadingExercises = false;
  showManualExercise = false;

  difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  goals = ['GENERAL_FITNESS', 'LOSE_WEIGHT', 'BUILD_MUSCLE', 'INCREASE_STRENGTH', 'IMPROVE_ENDURANCE', 'FLEXIBILITY'];

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private exerciseLibrary: ExerciseLibraryService
  ) {}

  ngOnInit() {
    this.searchExercises();
  }

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
    this.plan.exercises.push({
      exerciseName: exercise.name,
      description: exercise.description,
      instructions: exercise.description,
      sets: 3,
      reps: 10,
      durationSeconds: 0,
      restSeconds: 60,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      orderIndex: this.plan.exercises.length + 1,
      imageUrl: exercise.imageUrl
    });
    this.toastr.success(`${exercise.name} added`);
  }

  addManualExercise() {
    if (!this.manualExercise.exerciseName.trim()) {
      this.toastr.error('Exercise name is required');
      return;
    }

    this.plan.exercises.push({
      ...this.manualExercise,
      orderIndex: this.plan.exercises.length + 1
    });
    this.manualExercise = this.defaultExercise();
    this.showManualExercise = false;
    this.toastr.success('Exercise added');
  }

  removeExercise(index: number) {
    this.plan.exercises.splice(index, 1);
    this.reorderExercises();
  }

  moveExercise(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= this.plan.exercises.length) return;

    const [exercise] = this.plan.exercises.splice(index, 1);
    this.plan.exercises.splice(nextIndex, 0, exercise);
    this.reorderExercises();
  }

  createPlan() {
    if (!this.plan.name.trim()) {
      this.toastr.error('Plan name is required');
      return;
    }

    if (!this.plan.exercises.length) {
      this.toastr.error('Add at least one exercise');
      return;
    }

    this.isLoading = true;
    this.http.post(`${environment.apiUrl}/trainer/plans`, this.plan, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastr.success('Workout plan created');
          this.router.navigate(['/trainer/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(err.error?.error || err.error || 'Failed to create plan');
        }
      });
  }

  formatGoal(goal: string): string {
    return goal.replace(/_/g, ' ');
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private reorderExercises() {
    this.plan.exercises.forEach((exercise, index) => exercise.orderIndex = index + 1);
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
}
