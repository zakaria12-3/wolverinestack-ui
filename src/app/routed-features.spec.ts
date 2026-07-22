import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Login } from './auth/login/login';
import { OnboardingComponent } from './features/onboarding/onboarding';
import { MemberDashboard } from './features/member/dashboard/dashboard';
import { WorkoutTracking } from './features/member/workouts/workouts';
import { NutritionTracking } from './features/member/nutrition/nutrition';
import { BodyMeasurements } from './features/member/measurements/measurements';
import { MealPlanner } from './features/member/meal-planner/meal-planner';
import { TrainerDashboard } from './features/trainer/dashboard/dashboard';
import { TrainerClients } from './features/trainer/clients/clients';
import { CreatePlan } from './features/trainer/create-plan/create-plan';
import { Admindashboard } from './features/admin/admindashboard/admindashboard';
import { Profile } from './features/shared/profile/profile';
import { Feed } from './features/shared/feed/feed';
import { SearchComponent } from './features/shared/search/search';
import { Messages } from './features/shared/messages/messages';

const routedComponents: Array<[string, Type<unknown>]> = [
  ['login', Login],
  ['onboarding', OnboardingComponent],
  ['member dashboard', MemberDashboard],
  ['workouts', WorkoutTracking],
  ['nutrition', NutritionTracking],
  ['measurements', BodyMeasurements],
  ['meal planner', MealPlanner],
  ['trainer dashboard', TrainerDashboard],
  ['trainer clients', TrainerClients],
  ['create plan', CreatePlan],
  ['admin dashboard', Admindashboard],
  ['profile', Profile],
  ['feed', Feed],
  ['search', SearchComponent],
  ['messages', Messages],
];

describe('routed features', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each(routedComponents)('creates the %s feature', async (_name, component) => {
    await TestBed.configureTestingModule({ imports: [component] }).compileComponents();
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
