import { Routes } from '@angular/router';
import {Home} from './home/home';
import {Signup} from './auth/signup/signup';
import {Signupmain} from './signupmain/signupmain';
import {Calendar} from './calendar/calendar';
import {Verify} from './auth/verify/verify';
import {Login} from './auth/login/login';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path:'login',
    pathMatch: 'full',
    component:Login
  },
  {
    path:'',
    pathMatch: 'full',
    component:Home
  },
  {
    path:'signupcand',
    pathMatch: 'full',
    component:Signup
  },
  {
    path:'signup',
    pathMatch: 'full',
    component:Signupmain
  },
  {
    path:'verify',
    pathMatch:'full',
    component:Verify
  },
  {
    path:'calendar',
    pathMatch: 'full',
    component:Calendar
  },
  // --- Gym Community Routes ---

  // Onboarding (first-time fitness profile setup)
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding').then(m => m.OnboardingComponent),
    canActivate: [authGuard]
  },

  // Member Dashboard
  {
    path:'member',
    pathMatch: 'full',
    component: Home, // will be replaced by lazy-loaded MemberDashboard
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEMBER' }
  },
  {
    path: 'member/dashboard',
    loadComponent: () => import('./features/member/dashboard/dashboard').then(m => m.MemberDashboard),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEMBER' }
  },
  {
    path: 'member/workouts',
    loadComponent: () => import('./features/member/workouts/workouts').then(m => m.WorkoutTracking),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEMBER' }
  },
  {
    path: 'member/workouts/:id',
    loadComponent: () => import('./features/member/workouts/workouts').then(m => m.WorkoutTracking),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEMBER' }
  },
  {
    path: 'member/nutrition',
    loadComponent: () => import('./features/member/nutrition/nutrition').then(m => m.NutritionTracking),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEMBER' }
  },
  {
    path: 'member/measurements',
    loadComponent: () => import('./features/member/measurements/measurements').then(m => m.BodyMeasurements),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEMBER' }
  },
  {
    path: 'member/meal-planner',
    loadComponent: () => import('./features/member/meal-planner/meal-planner').then(m => m.MealPlanner),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEMBER' }
  },

  // Trainer Dashboard
  {
    path:'trainer',
    pathMatch: 'full',
    component: Home,
    canActivate: [authGuard, roleGuard],
    data: { role: 'TRAINER' }
  },
  {
    path: 'trainer/dashboard',
    loadComponent: () => import('./features/trainer/dashboard/dashboard').then(m => m.TrainerDashboard),
    canActivate: [authGuard, roleGuard],
    data: { role: 'TRAINER' }
  },
  {
    path: 'trainer/clients',
    loadComponent: () => import('./features/trainer/clients/clients').then(m => m.TrainerClients),
    canActivate: [authGuard, roleGuard],
    data: { role: 'TRAINER' }
  },
  {
    path: 'trainer/create-plan',
    loadComponent: () => import('./features/trainer/create-plan/create-plan').then(m => m.CreatePlan),
    canActivate: [authGuard, roleGuard],
    data: { role: 'TRAINER' }
  },

  // Admin Dashboard
  {
    path:'admin',
    pathMatch: 'full',
    component: Home,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/admindashboard/admindashboard').then(m => m.Admindashboard),
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' }
  },

  // Shared routes
  {
    path: 'profile',
    loadComponent: () => import('./features/shared/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },
  {
    path: 'feed',
    loadComponent: () => import('./features/shared/feed/feed').then(m => m.Feed),
    canActivate: [authGuard]
  },
  {
    path: 'search',
    loadComponent: () => import('./features/shared/search/search').then(m => m.SearchComponent),
    canActivate: [authGuard]
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/shared/messages/messages').then(m => m.Messages),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
