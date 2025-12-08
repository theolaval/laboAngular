import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, retry } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry(1),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur: ${error.error.message}`;
        console.error('❌ Erreur côté client:', error.error.message);
      } else {
        errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;
        
        switch (error.status) {
          case 0:
            console.error('❌ Impossible de contacter le serveur');
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            break;
          case 400:
            console.error('❌ Requête invalide:', error.error);
            errorMessage = error.error?.message || 'Requête invalide';
            break;
          case 404:
            console.error('❌ Ressource non trouvée');
            errorMessage = 'Ressource non trouvée';
            break;
          case 500:
            console.error('❌ Erreur serveur:', error.error);
            errorMessage = 'Erreur serveur. Réessayez plus tard.';
            break;
          default:
            console.error(`❌ Erreur ${error.status}:`, error.error);
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
