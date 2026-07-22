import { Component, HostListener, AfterViewInit, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ResearchFeedService, ResearchStudy } from '../core/services/research-feed.service';

interface Slide {
  name: string;
  era: string;
  quote: string;
  stat: string;
  image: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  standalone: true,
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  currentSlide = 0;
  slideInterval: any;
  isTransitioning = false;
  scrollProgress = 0;
  activeSection = 0;
  visibleSections: Set<number> = new Set();
  isLoggedIn = false;
  role: string | null = null;
  studies: ResearchStudy[] = [];
  studiesLoading = false;
  studiesError = false;

  // Wolverine Stack — Wolverine character slideshow
  slides: Slide[] = [
    {
      name: 'The Wolverine',
      era: 'Weapon X',
      quote: "I'm the best there is at what I do. But what I do best isn't very nice.",
      stat: 'ADAMANTIUM CLAWS',
      image: 'images/wolverine-1.jpg'
    },
    {
      name: 'Berserker',
      era: 'Unleash the Beast',
      quote: 'Pain lets you know you\'re still alive. Push through it, and you\'ll come out stronger on the other side.',
      stat: 'BERSERKER RAGE',
      image: 'images/wolverine-2.jpg'
    },
    {
      name: 'Healing Factor',
      era: 'Recover & Rise',
      quote: 'The strength of the wolf is the pack, and the strength of the pack is the wolf.',
      stat: 'MUTANT REGENERATION',
      image: 'images/wolverine-3.jpg'
    },
  ];

  features = [
    { icon: 'fitness_center', title: 'Adamantium Workouts', desc: 'AI-powered training plans built on an unbreakable foundation. Adaptive volume, intensity, and frequency that forge steel will.', color: '#FFB800' },
    { icon: 'nutrition', title: 'Berserker Nutrition', desc: 'Precision macro tracking with surgical accuracy. AI meal suggestions and real-time adjustments to fuel the beast within.', color: '#FF8C00' },
    { icon: 'monitoring', title: 'Claw Analytics', desc: 'Body composition trends, volume tracking, strength curves, and recovery metrics — all in a command-center dashboard.', color: '#FFB800' },
  ];

  stats = [
    { targetValue: 250, suffix: 'K+', decimal: 0, label: 'WORKOUTS LOGGED', icon: 'fitness_center', current: 0 },
    { targetValue: 98.2, suffix: '%', decimal: 1, label: 'GOAL ACCURACY', icon: 'target', current: 0 },
    { targetValue: 12, suffix: 'M+', decimal: 0, label: 'MEALS TRACKED', icon: 'nutrition', current: 0 },
    { targetValue: 4.9, suffix: '★', decimal: 1, label: 'USER RATING', icon: 'star', current: 0 }
  ];

  private animationFrameId: number | null = null;
  private statsAnimated = false;

  constructor(
    private authService: AuthService,
    private researchFeedService: ResearchFeedService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.role = this.authService.getRole();
    if (this.isLoggedIn) {
      this.loadStudies();
    }
  }

  ngAfterViewInit() {
    this.startSlideshow();
    this.setupScrollObserver();
  }

  ngOnDestroy() {
    this.stopSlideshow();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  startSlideshow() {
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  stopSlideshow() {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  goToSlide(index: number) {
    if (this.isTransitioning || index === this.currentSlide) return;
    this.isTransitioning = true;
    this.currentSlide = index;
    this.stopSlideshow();
    setTimeout(() => { this.isTransitioning = false; this.startSlideshow(); }, 800);
  }

  nextSlide() {
    this.isTransitioning = true;
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    setTimeout(() => { this.isTransitioning = false; }, 200);
  }

  prevSlide() {
    this.isTransitioning = true;
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    setTimeout(() => { this.isTransitioning = false; }, 200);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = Math.min(scrollY / maxScroll, 1);
    document.querySelectorAll('.section-reveal').forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) this.visibleSections.add(i);
    });
  }

  isVisible(index: number): boolean {
    return this.visibleSections.has(index);
  }

  formatStat(stat: { current: number; suffix: string; decimal: number }): string {
    return stat.current.toFixed(stat.decimal) + stat.suffix;
  }

  loadStudies() {
    this.studiesLoading = true;
    this.studiesError = false;
    this.researchFeedService.getWorkoutStudies().subscribe({
      next: (studies) => {
        this.studies = studies;
        this.studiesLoading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.studiesError = true;
        this.studiesLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  getDashboardLink(): string {
    if (this.role === 'TRAINER') return '/trainer/dashboard';
    if (this.role === 'ADMIN') return '/admin/dashboard';
    return '/member/dashboard';
  }

  animateStats() {
    if (this.statsAnimated) return;
    this.statsAnimated = true;
    const duration = 2000;
    const startTime = performance.now();
    const targets = this.stats.map(s => s.targetValue);
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(rawProgress);
      this.stats.forEach((s, i) => { s.current = targets[i] * easedProgress; });
      if (rawProgress < 1) {
        this.animationFrameId = requestAnimationFrame(tick);
      } else {
        this.stats.forEach((s, i) => { s.current = targets[i]; });
        this.animationFrameId = null;
      }
    };
    this.animationFrameId = requestAnimationFrame(tick);
  }

  private setupScrollObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          if (entry.target.classList.contains('stats-grid')) this.animateStats();
        }
      });
    }, { threshold: 0.15 });
    setTimeout(() => document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el)), 500);
  }
}
