import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {

    const encodedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      localStorage.clear();
      router.navigate(['/login']);
      return false;
    }

    return true;

  } catch (error) {
    localStorage.clear();
    router.navigate(['/login']);
    return false;
  }
};
