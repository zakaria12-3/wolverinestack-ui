import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../environments/environment';
import { NutritionService } from './core/services/nutrition.service';
import { WorkoutService } from './core/services/workout.service';
import { MeasurementsService } from './core/services/measurements.service';
import { ResearchFeedService } from './core/services/research-feed.service';
import { OnboardingComponent } from './features/onboarding/onboarding';
import { Messages } from './features/shared/messages/messages';

const dummyMember = {
  email: 'dummy.member@example.test',
  token: 'dummy-member-token',
};

describe('dummy member journey', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', dummyMember.token);
    localStorage.setItem('role', 'MEMBER');
    TestBed.configureTestingModule({ imports: [OnboardingComponent, Messages] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads research through the same-origin proxy without leaking the member token', () => {
    TestBed.inject(ResearchFeedService).getWorkoutStudies().subscribe();
    const request = http.expectOne('/api/research');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ message: { items: [] } });
  });

  it('loads and mutates workouts, nutrition, meals, AI analysis, and measurements', () => {
    const workouts = TestBed.inject(WorkoutService);
    const nutrition = TestBed.inject(NutritionService);
    const measurements = TestBed.inject(MeasurementsService);

    workouts.getPlans().subscribe();
    expectAuthorized(http.expectOne(`${environment.apiUrl}/member/plans`)).flush([]);

    workouts.startSession(7).subscribe();
    expectAuthorized(http.expectOne(`${environment.apiUrl}/member/sessions/start`)).flush({ id: 11 });

    workouts.logExercise(11, { exerciseName: 'Squat', sets: 3, reps: 8, weightKg: 60 }).subscribe();
    expectAuthorized(http.expectOne(`${environment.apiUrl}/member/sessions/11/exercises`)).flush({ id: 1 });

    nutrition.getDailyProgress().subscribe();
    expectAuthorized(http.expectOne(`${environment.apiUrl}/nutrition/daily-progress`)).flush({});

    nutrition.saveMealPlan('2026-07-22', []).subscribe();
    expectAuthorized(http.expectOne(`${environment.apiUrl}/nutrition/meal-plan`)).flush({ meals: [] });

    nutrition.getAiMealSuggestions('2026-07-22').subscribe();
    expectAuthorized(http.expectOne(`${environment.apiUrl}/ai/meal-suggestions?date=2026-07-22`)).flush([]);

    const image = new File(['image'], 'meal.jpg', { type: 'image/jpeg' });
    nutrition.analyzeMealPhoto(image, 'LUNCH').subscribe();
    expectAuthorized(http.expectOne(`${environment.apiUrl}/ai/analyze-meal-image`)).flush({ foodName: 'Test meal' });

    measurements.logMeasurement({ weightKg: 82 }).subscribe();
    expectAuthorized(http.expectOne(`${environment.apiUrl}/measurements`)).flush({ id: 1 });
  });

  it('preselects the highest-confidence AI onboarding recommendations', async () => {
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(OnboardingComponent);
    const component = fixture.componentInstance;
    component.metrics = { gender: 'MALE', weightKg: 82, heightCm: 180, dateOfBirth: '1995-04-12' };
    component.getAiSuggestions();

    http.expectOne(`${environment.apiUrl}/auth/onboarding/suggest-goals`).flush({
      goalSuggestions: [
        { value: 'GENERAL_FITNESS', confidence: 60 },
        { value: 'LOSE_WEIGHT', confidence: 70 },
      ],
      activitySuggestions: [
        { value: 'LIGHTLY_ACTIVE', confidence: 80 },
        { value: 'MODERATELY_ACTIVE', confidence: 90 },
      ],
    });

    expect(component.step).toBe(2);
    expect(component.selectedGoal).toBe('LOSE_WEIGHT');
    expect(component.selectedActivity).toBe('MODERATELY_ACTIVE');
  });

  it('finds a message recipient by username while keeping the numeric ID internal', async () => {
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(Messages);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expectAuthorized(http.expectOne(`${environment.apiUrl}/messages/conversations`)).flush([]);

    component.usernameQuery = 'logan';
    component.searchMembers();
    const search = expectAuthorized(http.expectOne(`${environment.apiUrl}/search?q=logan&type=users`));
    search.flush({ users: [{ id: 42, username: 'logan' }], posts: [] });

    expect(component.memberResults[0].username).toBe('logan');
    component.chooseMember(component.memberResults[0]);
    expect(component.newReceiverId).toBe(42);
    expect(component.getConversationName()).toBe('logan');
  });
});

function expectAuthorized(request: ReturnType<HttpTestingController['expectOne']>) {
  expect(request.request.headers.get('Authorization')).toBe(`Bearer ${dummyMember.token}`);
  return request;
}
