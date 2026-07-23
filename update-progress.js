const fs = require('fs');
const path = 'D:/Games/frontend/src/app/features/member/progress/progress.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Add StalledLiftItem interface after ChartPoint
content = content.replace(
  'interface ChartPoint {',
  'interface StalledLiftItem {\n  exerciseName: string;\n  muscleGroup: string;\n  equipment: string;\n  bestWeightKg: number;\n  bestReps: number;\n  estimatedOneRm: number;\n  bestAchievedDate: string;\n  daysSinceImprovement: number;\n  totalSessionsLogged: number;\n  totalSetsLogged: number;\n  aiSuggestion: string;\n}\n\ninterface ChartPoint {'
);

// 2. Add stalledItems property and loadStalledLifts call
content = content.replace(
  '  viewMode: \'grid\' | \'list\' = \'grid\';',
  '  stalledItems: StalledLiftItem[] = [];\n  isLoadingStalled = false;\n  showStalledLifts = false;\n  viewMode: \'grid\' | \'list\' = \'grid\';'
);

// 3. Add loadStalledLifts after loadPrOverview
content = content.replace(
  '  loadPrOverview() {',
  '  loadStalledLifts() {\n    this.isLoadingStalled = true;\n    this.http.get<StalledLiftItem[]>(`${environment.apiUrl}/member/progress/stalled`, this.getHeaders())\n      .subscribe({\n        next: (data) => {\n          this.stalledItems = data || [];\n          this.isLoadingStalled = false;\n          this.showStalledLifts = this.stalledItems.length > 0;\n          this.cdr.detectChanges();\n        },\n        error: () => {\n          this.stalledItems = [];\n          this.isLoadingStalled = false;\n          this.showStalledLifts = false;\n          this.cdr.detectChanges();\n        }\n      });\n  }\n\n  loadPrOverview() {'
);

// 4. Update ngOnInit to also load stalled lifts
content = content.replace(
  "  ngOnInit() {\n    this.loadPrOverview();\n  }",
  "  ngOnInit() {\n    this.loadPrOverview();\n    this.loadStalledLifts();\n  }"
);

// 5. Add the stalled lifts tab button and section to the template
// First, add the tab button after the view mode toggle buttons
content = content.replace(
  `          </button>
        </div>
      </div>

      <div *ngIf="isLoading"`,
  `          </button>
          <button class="btn-outline text-xs" (click)="viewMode = 'stalled'" [class.!bg-primary-container]="viewMode === 'stalled'" [class.!text-on-primary]="viewMode === 'stalled'" *ngIf="showStalledLifts">
            <span class="material-symbols-outlined text-sm">warning</span> Stalled ({{ stalledItems.length }})
          </button>
        </div>
      </div>

      <!-- === STALLED LIFTS SECTION === -->
      <div *ngIf="viewMode === 'stalled'" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-headline-md text-headline-md text-primary uppercase flex items-center gap-2">
              <span class="material-symbols-outlined text-warning">warning</span> Stalled Lifts
            </h2>
            <p class="font-body-md text-sm text-on-surface-variant mt-1">Exercises where you haven\\'t improved your best set in 30+ days — with AI suggestions to break through</p>
          </div>
          <button class="btn-outline text-[9px]" (click)="loadStalledLifts()" [disabled]="isLoadingStalled">
            <span class="material-symbols-outlined text-sm">refresh</span>
          </button>
        </div>

        <div *ngIf="isLoadingStalled" class="flex items-center justify-center py-12">
          <div class="animate-spin w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full"></div>
        </div>

        <div *ngIf="!isLoadingStalled && stalledItems.length === 0" class="bg-surface-container-low border border-dashed border-white/10 rounded-xl text-center py-12 card-hover card-enter">
          <span class="material-symbols-outlined text-4xl text-primary-container mb-3 block">check_circle</span>
          <h3 class="font-headline-md text-headline-md text-primary mb-1">No Stalled Lifts</h3>
          <p class="font-body-md text-on-surface-variant text-sm">You\\'ve improved all your lifts within the last 30 days. Keep pushing!</p>
        </div>

        <div *ngIf="!isLoadingStalled" class="space-y-4">
          <div *ngFor="let item of stalledItems; let i = index" class="bg-surface-container-low border border-white/5 rounded-xl overflow-hidden card-hover card-enter" [style.--card-delay]="i * 0.05 + 's'">
            <!-- Stalled Lift Header -->
            <div class="flex items-center justify-between p-4 bg-surface-container-high/30 border-b border-white/5">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-lg bg-error/20 border border-error/30 flex items-center justify-center flex-shrink-0">
                  <span class="material-symbols-outlined text-error text-sm">trending_flat</span>
                </div>
                <div class="min-w-0">
                  <h3 class="font-headline-md text-[16px] text-primary truncate">{{ item.exerciseName }}</h3>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span *ngIf="item.muscleGroup" class="font-label-caps text-[8px] text-on-surface-variant">{{ item.muscleGroup }}</span>
                    <span class="font-label-caps text-[8px] text-error/80">{{ item.daysSinceImprovement }} days stalled</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <div class="text-right">
                  <div class="font-data-metric text-[18px] text-primary">{{ item.estimatedOneRm }}</div>
                  <div class="font-label-caps text-[7px] text-on-surface-variant">LAST 1RM</div>
                </div>
              </div>
            </div>

            <!-- Stalled Lift Details -->
            <div class="p-4">
              <div class="grid grid-cols-3 gap-3 mb-4">
                <div class="bg-surface-container-highest/50 rounded-lg p-2 text-center">
                  <div class="font-label-caps text-[7px] text-on-surface-variant uppercase">Best Set</div>
                  <div class="font-headline-md text-[14px] text-primary mt-1">{{ item.bestWeightKg }}\\u00d7{{ item.bestReps }}</div>
                </div>
                <div class="bg-surface-container-highest/50 rounded-lg p-2 text-center">
                  <div class="font-label-caps text-[7px] text-on-surface-variant uppercase">Stalled Since</div>
                  <div class="font-headline-md text-[14px] text-primary mt-1">{{ item.bestAchievedDate ? (item.bestAchievedDate | date:\\'MMM d\\') : '\\u2014' }}</div>
                </div>
                <div class="bg-surface-container-highest/50 rounded-lg p-2 text-center">
                  <div class="font-label-caps text-[7px] text-on-surface-variant uppercase">Sessions</div>
                  <div class="font-headline-md text-[14px] text-primary mt-1">{{ item.totalSessionsLogged }}</div>
                </div>
              </div>

              <!-- AI Suggestion Card -->
              <div *ngIf="item.aiSuggestion" class="bg-primary-container/5 border border-primary-container/20 rounded-lg p-3 relative overflow-hidden">
                <div class="absolute -right-4 -top-4 w-16 h-16 bg-primary-container/10 rounded-full blur-xl"></div>
                <div class="relative z-10">
                  <div class="flex items-center gap-1.5 mb-2">
                    <span class="material-symbols-outlined text-primary-container text-sm">auto_awesome</span>
                    <span class="font-label-caps text-[8px] text-primary-container uppercase">AI Coach Suggestion</span>
                  </div>
                  <p class="font-body-md text-sm text-primary leading-relaxed">{{ item.aiSuggestion }}</p>
                </div>
              </div>

              <div *ngIf="!item.aiSuggestion" class="bg-surface-container-highest/30 rounded-lg p-3 text-center">
                <span class="font-label-caps text-[9px] text-on-surface-variant">No AI suggestion available. Try varying your rep ranges or adding accessory work.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading"`,
  false
);

fs.writeFileSync(path, content, 'utf8');
console.log('progress.ts updated with stalled lifts');
