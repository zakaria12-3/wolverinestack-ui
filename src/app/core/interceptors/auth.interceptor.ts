import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // Skip auth for public auth endpoints only
  const publicEndpoints = ['/auth/login', '/auth/signup', '/auth/verify', '/auth/resend', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-reset'];
  const isPublic = publicEndpoints.some(e => req.url.includes(e));
  
  if (isPublic) {
    return next(req);
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};

