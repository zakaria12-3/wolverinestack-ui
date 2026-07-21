import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService, UserProfile } from '../../../core/services/user.service';
import { MemberService, DashboardDto } from '../../../core/services/member.service';
import { ReminderService, ReminderSettings } from '../../../core/services/reminder.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  profile: UserProfile = {};
  dashboard: DashboardDto | null = null;
  reminderSettings: ReminderSettings;
  isEditing = false;
  isLoading = true;
  reminderPermission = 'default';

  readonly fallbackAvatar = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

  constructor(
    private userService: UserService,
    private memberService: MemberService,
    private reminderService: ReminderService,
    private cd: ChangeDetectorRef
  ) {
    this.reminderSettings = { ...this.reminderService.settings };
  }

  ngOnInit(): void {
    this.loadProfile();
    this.reminderPermission = 'Notification' in window ? Notification.permission : 'unsupported';
  }

  loadProfile(): void {
    this.isLoading = true;

    forkJoin({
      profile: this.userService.getProfile().pipe(catchError(err => {
        console.error('Failed to load profile', err);
        return of(null);
      })),
      dashboard: this.memberService.getDashboard().pipe(catchError(() => of(null)))
    }).subscribe(({ profile, dashboard }) => {
      if (profile) {
        this.profile = {
          ...profile,
          username: profile.username || profile.email,
          bio: profile.bio || '',
          headline: profile.headline || '',
          location: profile.location || '',
          avatarUrl: profile.avatarUrl || this.fallbackAvatar
        };
      }

      this.dashboard = dashboard;
      this.mergeDashboardProfile();
      this.isLoading = false;
      this.cd.detectChanges();
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfile();
    }
  }

  saveProfile(): void {
    this.isLoading = true;
    this.userService.updateProfile(this.profile).subscribe({
      next: (data) => {
        this.profile = {
          ...this.profile,
          ...data,
          avatarUrl: data.avatarUrl || this.fallbackAvatar
        };
        this.isEditing = false;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Update failed', err);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  saveReminders(): void {
    this.reminderService.saveSettings(this.reminderSettings);
    this.reminderService.requestPermission().then(permission => {
      this.reminderPermission = permission;
      this.cd.detectChanges();
    });
  }

  updateMealTime(index: number, value: string): void {
    this.reminderSettings = {
      ...this.reminderSettings,
      mealTimes: this.reminderSettings.mealTimes.map((time, i) => i === index ? value : time)
    };
  }

  addMealReminder(): void {
    this.reminderSettings = {
      ...this.reminderSettings,
      mealTimes: [...this.reminderSettings.mealTimes, '16:00']
    };
  }

  removeMealReminder(index: number): void {
    this.reminderSettings = {
      ...this.reminderSettings,
      mealTimes: this.reminderSettings.mealTimes.filter((_, i) => i !== index)
    };
  }

  getProfileCompletion(): number {
    const fields = [
      this.profile.username,
      this.profile.email,
      this.profile.headline,
      this.profile.bio,
      this.profile.location,
      this.profile.fitnessGoal,
      this.profile.activityLevel,
      this.profile.weightKg,
      this.profile.heightCm,
      this.profile.dailyCalorieGoal
    ];
    const complete = fields.filter(Boolean).length;
    return Math.round((complete / fields.length) * 100);
  }

  getReminderStatus(): string {
    if (this.reminderPermission === 'granted') return 'Browser reminders enabled';
    if (this.reminderPermission === 'denied') return 'Notifications blocked in browser settings';
    if (this.reminderPermission === 'unsupported') return 'Browser notifications unavailable';
    return 'Permission needed for browser notifications';
  }

  private mergeDashboardProfile(): void {
    const dashboardProfile = this.dashboard?.profile;
    if (!dashboardProfile) return;

    this.profile = {
      ...this.profile,
      email: this.profile.email || dashboardProfile.email,
      username: this.profile.username || dashboardProfile.username,
      fitnessGoal: this.profile.fitnessGoal || dashboardProfile.fitnessGoal,
      activityLevel: this.profile.activityLevel || dashboardProfile.activityLevel,
      gender: this.profile.gender || dashboardProfile.gender,
      weightKg: this.profile.weightKg || dashboardProfile.weightKg,
      heightCm: this.profile.heightCm || dashboardProfile.heightCm,
      dailyCalorieGoal: this.profile.dailyCalorieGoal || dashboardProfile.dailyCalorieGoal,
      dailyProteinGoal: this.profile.dailyProteinGoal || dashboardProfile.dailyProteinGoal,
      dailyCarbsGoal: this.profile.dailyCarbsGoal || dashboardProfile.dailyCarbsGoal,
      dailyFatGoal: this.profile.dailyFatGoal || dashboardProfile.dailyFatGoal,
      onboardingComplete: this.profile.onboardingComplete ?? dashboardProfile.onboardingComplete
    };
  }

  getInitials(): string {
    const source = this.profile.username || this.profile.email || 'Member';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'M';
  }

  getDisplayName(): string {
    return this.profile.username || this.profile.email || 'Member';
  }

  getBmi(): string {
    const weight = this.profile.weightKg;
    const height = this.profile.heightCm;
    if (!weight || !height) return '--';
    return (weight / Math.pow(height / 100, 2)).toFixed(1);
  }

  getBmiLabel(): string {
    const bmi = Number(this.getBmi());
    if (!bmi) return 'Not enough data';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Healthy range';
    if (bmi < 30) return 'Above range';
    return 'High range';
  }

  getWeeklyMinutesLabel(): string {
    const minutes = this.dashboard?.workout.totalMinutesThisWeek || 0;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }

  formatLabel(value?: string): string {
    if (!value) return 'Not set';
    return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  formatDate(value?: string): string {
    if (!value) return 'No date yet';
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
