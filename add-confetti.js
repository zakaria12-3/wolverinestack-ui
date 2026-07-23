const fs = require('fs');
const path = 'D:/Games/frontend/src/app/features/member/workouts/workouts.html';
let html = fs.readFileSync(path, 'utf8');

const confetti = `
  <!-- ==================== PR CELEBRATION CONFETTI ==================== -->
  <div *ngIf="showPrCelebration" class="pr-celebration-overlay">
    <div *ngFor="let p of confettiParticles" class="confetti-piece"
         [style.--confetti-color]="p.color"
         [style.--confetti-x]="p.x"
         [style.--confetti-size.px]="p.size"
         [style.--confetti-duration.s]="p.duration"
         [style.--confetti-delay.s]="p.delay"
         [style.--confetti-rotation.deg]="p.rotation"
         [style.--confetti-drift.px]="p.drift">
    </div>
  </div>

  <!-- PR Banner -->
  <div *ngIf="showPrCelebration && currentPrDetails" class="pr-banner">
    <span class="material-symbols-outlined pr-banner-icon">military_tech</span>
    <div class="pr-banner-title">NEW PR!</div>
    <div class="pr-banner-subtitle">{{ currentPrDetails.exerciseName }} &middot; {{ currentPrDetails.weight }}kg &times; {{ currentPrDetails.reps }} reps</div>
  </div>

</div>`;

// Find the last occurrence of the outermost closing div
const lastDivIdx = html.lastIndexOf('</div>');
const result = html.substring(0, lastDivIdx) + confetti;

fs.writeFileSync(path, result, 'utf8');
console.log('workouts.html updated with confetti overlay');
