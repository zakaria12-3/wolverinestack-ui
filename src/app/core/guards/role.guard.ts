import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);

  const userRole = localStorage.getItem('role');
  const requiredRole = route.data['role'];

  if (userRole === requiredRole) return true;
  router.navigate(['/']);
  return false;
};
