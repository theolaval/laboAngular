import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  console.log(`🌐 [HTTP] ${req.method} ${req.urlWithParams}`);

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const elapsedTime = Date.now() - startTime;
        console.log(`✅ [HTTP] ${req.method} ${req.urlWithParams}`);
        console.log(`   Status: ${event.status} | Temps: ${elapsedTime}ms`);
        console.log(`   Données:`, event.body);
      }
    })
  );
};
