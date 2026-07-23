import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface PrOverviewItem {
  exerciseName: string;
  muscleGroup: string;
  equipment: string;
  bestWeightKg: number;
  bestReps: number;
  estimatedOneRm: number;
  achievedDate: string;
  sessionId: number;
  sessionName: string;
  totalSessionsLogged: number;
  totalSetsLogged: number;
}

interface ChartPoint {
  date: string;
  estimatedOneRm: number;
}

@Component({
  selector: 'app-progress-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen">
      <!-- Header -->
      <div class="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <span class="font-label-caps text-secondary-fixed-dim mb-xs block">WOLVERINE STACK</span>
          <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight">PERSONAL RECORDS</h1>
          <div class="flex items-center gap-base mt-base">
            <span class="material-symbols-outlined text-outline-variant">military_tech</span>
            <span class="font-body-md text-on-surface-variant">All-time best lifts, 1RM estimates & progression</span>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button class="btn-outline text-xs" (click)="viewMode = 'grid'" [class.!bg-primary-container]="viewMode === 'grid'" [class.!text-on-primary]="viewMode === 'grid'">
            <span class="material-symbols-outlined text-sm">grid_view</span> Grid
          </button>
          <button class="btn-outline text-xs" (click)="viewMode = 'list'" [class.!bg-primary-container]="viewMode === 'list'" [class.!text-on-primary]="viewMode === 'list'">
            <span class="material-symbols-outlined text-sm">list</span> List
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="flex min-h-[40vh] items-center justify-center">
        <div class="text-center">
          <div class="animate-spin w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full mx-auto mb-3"></div>
          <p class="font-label-caps text-[10px] text-on-surface-variant">Loading PR data...</p>
        </div>
      </div>

      <!-- === PR OVERVIEW GRID === -->
      <div *ngIf="!isLoading && viewMode === 'grid' && prItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div *ngFor="let item of prItems; let i = index"
             class="bg-surface-container-low border border-white/5 rounded-xl p-4 card-hover card-enter cursor-pointer transition-all"
             [style.--card-delay]="i * 0.05 + 's'"
             (click)="selectExercise(item)">
          <!-- PR Header -->
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-primary-container/20 border border-primary-container/30 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary-container text-sm">military_tech</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-headline-md text-[14px] text-primary truncate">{{ item.exerciseName }}</h3>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span *ngIf="item.muscleGroup" class="font-label-caps text-[7px] text-on-surface-variant bg-surface-container-highest px-1.5 py-0.5 rounded">{{ item.muscleGroup }}</span>
              </div>
            </div>
          </div>
          <!-- PR Stats -->
          <div class="grid grid-cols-2 gap-2 mb-3">
            <div class="bg-surface-container-highest/50 rounded-lg p-2 text-center">
              <div class="font-data-metric text-[20px] text-primary">{{ item.bestWeightKg }}</div>
              <div class="font-label-caps text-[7px] text-on-surface-variant">BEST KG</div>
            </div>
            <div class="bg-surface-container-highest/50 rounded-lg p-2 text-center">
              <div class="font-data-metric text-[20px] text-primary">{{ item.bestReps }}</div>
              <div class="font-label-caps text-[7px] text-on-surface-variant">BEST REPS</div>
            </div>
          </div>
          <!-- 1RM -->
          <div class="bg-primary-container/10 border border-primary-container/20 rounded-lg p-2.5 text-center">
            <div class="font-label-caps text-[7px] text-primary-container uppercase tracking-wider">ESTIMATED 1RM</div>
            <div class="font-display-lg text-[28px] text-primary leading-none mt-1">{{ item.estimatedOneRm }} <span class="font-label-caps text-[10px] text-on-surface-variant">kg</span></div>
          </div>
          <!-- Footer -->
          <div class="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
            <span class="font-label-caps text-[7px] text-on-surface-variant">{{ item.totalSessionsLogged }} sessions</span>
            <span class="font-label-caps text-[7px] text-primary-container">{{ item.achievedDate ? (item.achievedDate | date:'MMM d, yyyy') : '\u2014' }}</span>
          </div>
        </div>
      </div>

      <!-- === LIST VIEW === -->
      <div *ngIf="!isLoading && viewMode === 'list' && prItems.length > 0" class="space-y-2">
        <div *ngFor="let item of prItems; let i = index"
             class="bg-surface-container-low border border-white/5 rounded-lg p-3 flex items-center gap-4 card-hover card-enter cursor-pointer hover:bg-surface-container transition-all"
             (click)="selectExercise(item)">
          <div class="w-10 h-10 rounded-lg bg-primary-container/20 border border-primary-container/30 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-primary-container text-sm">military_tech</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-headline-md text-[14px] text-primary truncate">{{ item.exerciseName }}</div>
            <div class="font-label-caps text-[8px] text-on-surface-variant mt-0.5">{{ item.muscleGroup }} · {{ item.totalSetsLogged }} sets across {{ item.totalSessionsLogged }} sessions</div>
          </div>
          <div class="text-right flex-shrink-0">
            <div class="font-data-metric text-[20px] text-primary">{{ item.estimatedOneRm }}</div>
            <div class="font-label-caps text-[7px] text-on-surface-variant">1RM</div>
          </div>
          <div class="text-right flex-shrink-0 min-w-[60px]">
            <div class="font-headline-md text-[14px] text-primary">{{ item.bestWeightKg }}\u00d7{{ item.bestReps }}</div>
            <div class="font-label-caps text-[7px] text-primary-container">BEST SET</div>
          </div>
          <span class="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && prItems.length === 0" class="flex min-h-[40vh] items-center justify-center">
        <div class="text-center card-enter">
          <span class="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">military_tech</span>
          <h2 class="font-headline-md text-headline-md text-primary mb-2">No PRs Yet</h2>
          <p class="font-body-md text-on-surface-variant max-w-md">Log some workouts with weight and reps to see your personal records here.</p>
        </div>
      </div>
    </div>

    <!-- === EXERCISE DETAIL MODAL === -->
    <div *ngIf="selectedExercise" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in"
         (click)="selectedExercise = null">
      <div class="bg-surface-container-low border border-white/10 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 card-elevated"
           (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-container/20 border border-primary-container/30 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary-container text-sm">military_tech</span>
            </div>
            <div>
              <h2 class="font-headline-md text-headline-md text-primary">{{ selectedExercise.exerciseName }}</h2>
              <span class="font-label-caps text-[9px] text-on-surface-variant">{{ selectedExercise.muscleGroup || 'General' }}</span>
            </div>
          </div>
          <button class="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:text-primary transition-colors"
                  (click)="selectedExercise = null">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <!-- PR Stats Row -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="bg-surface-container-highest/50 rounded-lg p-3 text-center">
            <div class="font-label-caps text-[7px] text-on-surface-variant uppercase">Best Set</div>
            <div class="font-data-metric text-[22px] text-primary mt-1">{{ selectedExercise.bestWeightKg }} \u00d7 {{ selectedExercise.bestReps }}</div>
          </div>
          <div class="bg-primary-container/10 border border-primary-container/20 rounded-lg p-3 text-center">
            <div class="font-label-caps text-[7px] text-primary-container uppercase">Est. 1RM</div>
            <div class="font-display-lg text-[28px] text-primary mt-1">{{ selectedExercise.estimatedOneRm }} <span class="font-label-caps text-[9px] text-on-surface-variant">kg</span></div>
          </div>
          <div class="bg-surface-container-highest/50 rounded-lg p-3 text-center">
            <div class="font-label-caps text-[7px] text-on-surface-variant uppercase">Achieved</div>
            <div class="font-headline-md text-[13px] text-primary mt-1">{{ selectedExercise.achievedDate ? (selectedExercise.achievedDate | date:'MMM d') : '\u2014' }}</div>
          </div>
        </div>

        <!-- 1RM Progression Chart -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-label-caps text-label-caps text-secondary-fixed-dim uppercase">1RM PROGRESSION</h3>
            <button class="btn-outline text-[9px]" (click)="loadChartData(selectedExercise.exerciseName)" [disabled]="isLoadingChart">
              <span class="material-symbols-outlined text-sm">refresh</span>
            </button>
          </div>

          <div *ngIf="isLoadingChart" class="flex items-center justify-center py-8">
            <div class="animate-spin w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full"></div>
          </div>

          <div *ngIf="!isLoadingChart && chartData.length > 0" class="bg-background rounded-lg p-4 border border-white/5">
            <!-- Chart Bars -->
            <div class="flex items-end gap-1.5 h-40" style="align-items: flex-end;">
              <div *ngFor="let point of chartData; let i = index"
                   class="flex-1 flex flex-col items-center gap-1 group relative"
                   [style.height.%]="getBarHeight(point.estimatedOneRm)">
                <div class="w-full rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
                     [class.bg-primary-container]="isNewestPoint(i)"
                     [class.bg-primary-container/40]="!isNewestPoint(i)"
                     [style.height.%]="getBarHeight(point.estimatedOneRm)"
                     [style.min-height]="chartMax1Rm > 0 ? '4px' : '0px'"
                     (mouseenter)="hoveredPoint = i"
                     (mouseleave)="hoveredPoint = null">
                </div>
                <!-- Tooltip -->
                <div *ngIf="hoveredPoint === i"
                     class="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest text-primary text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 border border-white/10 shadow-lg">
                  {{ point.estimatedOneRm }} kg
                </div>
              </div>
            </div>
            <!-- X-Axis Labels -->
            <div class="flex gap-1.5 mt-2">
              <div *ngFor="let point of chartData; let i = index"
                   class="flex-1 text-center">
                <span class="font-label-caps text-[6px] text-on-surface-variant/40 truncate block">{{ formatChartDate(point.date) }}</span>
              </div>
            </div>
          </div>

          <div *ngIf="!isLoadingChart && chartData.length === 0" class="text-center py-6">
            <span class="font-label-caps text-[10px] text-on-surface-variant">Not enough data for a chart yet. Log more sets to see progression.</span>
          </div>
        </div>

        <!-- Details -->
        <div class="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
          <div class="bg-surface-container-highest/30 rounded-lg p-3">
            <div class="font-label-caps text-[7px] text-on-surface-variant uppercase">Total Sessions</div>
            <div class="font-headline-md text-[16px] text-primary mt-1">{{ selectedExercise.totalSessionsLogged }}</div>
          </div>
          <div class="bg-surface-container-highest/30 rounded-lg p-3">
            <div class="font-label-caps text-[7px] text-on-surface-variant uppercase">Total Sets</div>
            <div class="font-headline-md text-[16px] text-primary mt-1">{{ selectedExercise.totalSetsLogged }}</div>
          </div>
        </div>

        <div class="mt-4">
          <button class="btn-primary w-full text-xs" routerLink="/member/workouts">
            <span class="material-symbols-outlined text-sm">fitness_center</span> Log This Exercise
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 80vh; }
    .card-enter { animation: cardEnter 0.5s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes cardEnter { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .card-enter:nth-child(1) { animation-delay: 0.05s; }
    .card-enter:nth-child(2) { animation-delay: 0.10s; }
    .card-enter:nth-child(3) { animation-delay: 0.15s; }
    .card-enter:nth-child(4) { animation-delay: 0.20s; }
    .card-enter:nth-child(5) { animation-delay: 0.25s; }
    .card-enter:nth-child(6) { animation-delay: 0.30s; }
    .card-enter:nth-child(7) { animation-delay: 0.35s; }
    .card-enter:nth-child(8) { animation-delay: 0.40s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .fade-in { animation: fadeIn 0.3s ease both; }
  `]
})
export class ProgressTracking implements OnInit {
  prItems: PrOverviewItem[] = [];
  selectedExercise: PrOverviewItem | null = null;
  chartData: ChartPoint[] = [];
  chartMax1Rm = 0;
  hoveredPoint: number | null = null;
  viewMode: 'grid' | 'list' = 'grid';
  isLoading = false;
  isLoadingChart = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  }

  ngOnInit() {
    this.loadPrOverview();
  }

  loadPrOverview() {
    this.isLoading = true;
    this.http.get<PrOverviewItem[]>(`${environment.apiUrl}/member/progress/overview`, this.getHeaders())
      .subscribe({
        next: (data) => {
          this.prItems = data || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.prItems = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  selectExercise(item: PrOverviewItem) {
    this.selectedExercise = item;
    this.loadChartData(item.exerciseName);
  }

  loadChartData(exerciseName: string) {
    this.isLoadingChart = true;
    this.chartData = [];
    this.chartMax1Rm = 0;
    this.http.get<ChartPoint[]>(
      `${environment.apiUrl}/member/progress/chart/${encodeURIComponent(exerciseName)}`,
      this.getHeaders()
    ).subscribe({
      next: (data) => {
        this.chartData = data || [];
        this.chartMax1Rm = Math.max(...this.chartData.map(p => p.estimatedOneRm), 0);
        this.isLoadingChart = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.chartData = [];
        this.chartMax1Rm = 0;
        this.isLoadingChart = false;
        this.cdr.detectChanges();
      }
    });
  }

  getBarHeight(value: number): number {
    if (this.chartMax1Rm <= 0) return 0;
    return Math.max((value / this.chartMax1Rm) * 100, 4);
  }

  isNewestPoint(index: number): boolean {
    return index === this.chartData.length - 1;
  }

  formatChartDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
