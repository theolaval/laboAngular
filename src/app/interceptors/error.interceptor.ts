import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, retry } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry(1),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;
        
        switch (error.status) {
          case 0:
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Requête invalide';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Réessayez plus tard.';
            break;
        }
      }

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        error: error.error
      }));
    })
  );
};
