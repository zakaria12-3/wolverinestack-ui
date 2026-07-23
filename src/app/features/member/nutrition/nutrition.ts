import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';
import { MealAnalysisResult, NutritionService } from '../../../core/services/nutrition.service';

@Component({
  selector: 'app-nutrition-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nutrition.html',
  styleUrls: ['./nutrition.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class NutritionTracking implements OnInit {
  progress: any = null;
  meals: any[] = [];
  weeklyReport: any = null;
  isLoading = false;
  isAnalyzingMealPhoto = false;
  activeTab: 'today' | 'weekly' = 'today';
  showLogForm = false;
  mealPhotoPreview = '';
  mealAnalysis: MealAnalysisResult | null = null;

  mealEntry = this.defaultMealEntry();

  mealTypes = [
    { value: 'BREAKFAST', label: 'Breakfast' },
    { value: 'LUNCH', label: 'Lunch' },
    { value: 'DINNER', label: 'Dinner' },
    { value: 'SNACK', label: 'Snack' }
  ];

  constructor(
    private nutritionService: NutritionService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadProgress();
  }

  loadProgress() {
    this.isLoading = true;
    this.nutritionService.getDailyProgress().subscribe({
      next: (data: any) => {
        this.progress = data;
        this.meals = data?.meals || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err.error || 'Failed to load nutrition progress');
      }
    });
  }

  loadWeeklyReport() {
    this.isLoading = true;
    this.nutritionService.getWeeklyReport().subscribe({
      next: (data: any) => {
        this.weeklyReport = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err.error || 'Failed to load weekly report');
      }
    });
  }

  switchTab(tab: 'today' | 'weekly') {
    this.activeTab = tab;
    if (tab === 'weekly' && !this.weeklyReport) {
      this.loadWeeklyReport();
    }
  }

  onMealPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastr.error('Please choose an image file');
      input.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      this.toastr.error('Image must be smaller than 8MB');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.mealPhotoPreview = String(reader.result || '');
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    this.analyzeMealPhoto(file);
  }

  analyzeMealPhoto(file: File) {
    this.isAnalyzingMealPhoto = true;
    this.mealAnalysis = null;

    this.nutritionService.analyzeMealPhoto(file, this.mealEntry.mealType).subscribe({
      next: (analysis) => {
        this.isAnalyzingMealPhoto = false;
        if (analysis.error) {
          this.toastr.error(analysis.error);
          return;
        }
        this.applyMealAnalysis(analysis);
        this.toastr.success('Meal photo analyzed');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isAnalyzingMealPhoto = false;
        this.toastr.error(err.error?.error || err.error || 'Failed to analyze meal photo');
      }
    });
  }

  logMeal() {
    if (!this.mealEntry.foodName) {
      this.toastr.error('Please enter a food name');
      return;
    }

    this.nutritionService.logMeal(this.mealEntry).subscribe({
      next: () => {
        this.toastr.success('Meal logged');
        this.showLogForm = false;
        this.resetMealForm();
        this.loadProgress();
      },
      error: (err) => this.toastr.error(err.error || 'Failed to log meal')
    });
  }

  deleteMeal(id: number) {
    this.nutritionService.deleteMeal(id).subscribe({
      next: () => {
        this.toastr.info('Meal removed');
        this.loadProgress();
      },
      error: (err) => this.toastr.error(err.error || 'Failed to delete')
    });
  }

  getGroupedMeals(): any[] {
    const groups: any = { BREAKFAST: [], LUNCH: [], DINNER: [], SNACK: [] };
    this.meals.forEach(m => {
      if (groups[m.mealType]) groups[m.mealType].push(m);
      else groups[m.mealType] = [m];
    });
    return Object.entries(groups).map(([key, items]: any) => ({
      type: key,
      label: this.mealTypes.find(t => t.value === key)?.label || key,
      items
    })).filter(g => g.items.length > 0);
  }

  getProgressColor(percent: number): string {
    if (percent >= 100) return '#22c55e';
    if (percent >= 75) return '#3b82f6';
    if (percent >= 50) return '#f59e0b';
    return '#ef4444';
  }

  resetMealForm() {
    this.mealEntry = this.defaultMealEntry();
    this.mealPhotoPreview = '';
    this.mealAnalysis = null;
    this.isAnalyzingMealPhoto = false;
  }

  private applyMealAnalysis(analysis: MealAnalysisResult) {
    this.mealAnalysis = analysis;
    this.mealEntry.foodName = analysis.foodName || this.mealEntry.foodName || 'AI analyzed meal';
    this.mealEntry.calories = Math.round(analysis.estimatedCalories || 0);
    this.mealEntry.proteinGrams = this.roundMacro(analysis.proteinGrams);
    this.mealEntry.carbsGrams = this.roundMacro(analysis.carbsGrams);
    this.mealEntry.fatGrams = this.roundMacro(analysis.fatGrams);
  }

  private roundMacro(value?: number): number {
    return Math.round((value || 0) * 10) / 10;
  }

  private defaultMealEntry() {
    return {
      mealType: 'BREAKFAST',
      foodName: '',
      portionGrams: 100,
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0
    };
  }
}
