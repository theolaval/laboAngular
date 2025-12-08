import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  const publicUrls = ['/api/auth/login', '/api/auth/register'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  const token = localStorage.getItem('token');

  let authReq = req;
  if (token && !isPublicUrl) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.warn('Session expirée');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }

      if (error.status === 403) {
        console.error('Accès refusé');
        router.navigate(['/unauthorized']);
      }

      return throwError(() => error);
    })
  );
};
