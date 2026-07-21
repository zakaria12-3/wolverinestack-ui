import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ReminderSettings {
  workoutEnabled: boolean;
  workoutTime: string;
  mealEnabled: boolean;
  mealTimes: string[];
}

const DEFAULT_SETTINGS: ReminderSettings = {
  workoutEnabled: true,
  workoutTime: '18:00',
  mealEnabled: true,
  mealTimes: ['08:00', '13:00', '19:00']
};

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private readonly settingsKey = 'reminderSettings';
  private readonly sentKey = 'reminderSentLog';
  private timerId?: number;
  private settingsSubject = new BehaviorSubject<ReminderSettings>(this.loadSettings());
  settings$ = this.settingsSubject.asObservable();

  get settings(): ReminderSettings {
    return this.settingsSubject.value;
  }

  start(): void {
    if (this.timerId || typeof window === 'undefined') return;
    this.checkReminders();
    this.timerId = window.setInterval(() => this.checkReminders(), 60000);
  }

  saveSettings(settings: ReminderSettings): void {
    const normalized = {
      workoutEnabled: settings.workoutEnabled,
      workoutTime: settings.workoutTime || DEFAULT_SETTINGS.workoutTime,
      mealEnabled: settings.mealEnabled,
      mealTimes: settings.mealTimes.filter(Boolean).slice(0, 5)
    };
    localStorage.setItem(this.settingsKey, JSON.stringify(normalized));
    this.settingsSubject.next(normalized);
  }

  requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!('Notification' in window)) return Promise.resolve('unsupported');
    if (Notification.permission !== 'default') return Promise.resolve(Notification.permission);
    return Notification.requestPermission();
  }

  private loadSettings(): ReminderSettings {
    try {
      const raw = localStorage.getItem(this.settingsKey);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  private checkReminders(): void {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateKey = now.toISOString().slice(0, 10);
    const settings = this.settings;

    if (settings.workoutEnabled && settings.workoutTime === currentTime) {
      this.notifyOnce(`${dateKey}:workout:${currentTime}`, 'Workout reminder', 'Time to get your training session in.');
    }

    if (settings.mealEnabled && settings.mealTimes.includes(currentTime)) {
      this.notifyOnce(`${dateKey}:meal:${currentTime}`, 'Meal reminder', 'Log your meal and keep your nutrition on track.');
    }
  }

  private notifyOnce(key: string, title: string, body: string): void {
    const sent = this.getSentLog();
    if (sent[key]) return;
    sent[key] = true;
    localStorage.setItem(this.sentKey, JSON.stringify(sent));

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
      return;
    }

    window.dispatchEvent(new CustomEvent('app-reminder', { detail: { title, body } }));
  }

  private getSentLog(): Record<string, boolean> {
    try {
      return JSON.parse(localStorage.getItem(this.sentKey) || '{}');
    } catch {
      return {};
    }
  }
}
