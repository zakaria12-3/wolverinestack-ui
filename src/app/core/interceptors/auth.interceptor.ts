import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // Never leak our bearer token to third-party APIs. Besides being a security
  // issue, doing so forces a CORS preflight that many public APIs reject.
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

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

