import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiService {
  private endpoint = `${this.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    protected override http: HttpClient,
    private router: Router
  ) {
    super(http);
  }

  private getUserFromStorage(): User | null {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson && userJson !== 'undefined' && userJson !== 'null') {
        const user = JSON.parse(userJson);
        
        // Vérifier que l'utilisateur a au moins un username et un id
        if (user && (user.username || user.id)) {
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem('user');
      return null;
    }
  }

  private decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const user: User = {
        id: parseInt(
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
          payload.nameid || 
          payload.sub || 
          payload.id
        ),
        username: 
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
          payload.unique_name || 
          payload.username || 
          payload.name,
        email: 
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
          payload.email,
        birthdate: 
          payload.birthdate ||
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/dateofbirth'],
        role: 
          payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          payload.role
      };
      
      return user;
    } catch (error) {
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.endpoint}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          console.log('Response type:', typeof response);
          console.log('Response keys:', Object.keys(response || {}));
          
          // Sauvegarder le token (essayer différentes variantes)
          const token = response?.token || response?.Token || response?.access_token;
          if (token) {
            localStorage.setItem('token', token);
            console.log('Token saved');
          } else {
            console.warn('No token in login response');
          }
          
          // Essayer de récupérer l'utilisateur depuis la réponse (différentes variantes)
          const user = response?.user || response?.User || response?.data?.user;
          
          if (user && user.username) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
            console.log('User saved from login response:', user);
          } else if (token) {
            console.log('No user in response, trying to decode token');
            // Si pas d'utilisateur dans la réponse, essayer de décoder le token
            const decodedUser = this.decodeToken(token);
            console.log('Decoded user:', decodedUser);
            
            if (decodedUser && decodedUser.username) {
              localStorage.setItem('user', JSON.stringify(decodedUser));
              this.currentUserSubject.next(decodedUser);
              console.log('User saved from decoded token');
            } else {
              console.log('Failed to decode user, fetching from backend');
              // En dernier recours, récupérer l'utilisateur depuis le backend
              this.getCurrentUserFromBackend().subscribe({
                next: (userResponse) => {
                  if (userResponse.user) {
                    localStorage.setItem('user', JSON.stringify(userResponse.user));
                    this.currentUserSubject.next(userResponse.user);
                    console.log('User fetched from backend:', userResponse.user);
                  }
                },
                error: (error) => {
                  console.error('Erreur lors de la récupération de l\'utilisateur:', error);
                }
              });
            }
          } else {
            console.error('Invalid login response format:', response);
          }
        }),
        catchError(error => {
          console.error('Login error in service:', error);
          return this.handleError(error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.endpoint}/register`, userData)
      .pipe(
        tap(response => {
          console.log('Register response:', response);
          console.log('Response type:', typeof response);
          console.log('Response keys:', Object.keys(response || {}));
          
          // Sauvegarder le token (essayer différentes variantes)
          const token = response?.token || response?.Token || response?.access_token;
          if (token) {
            localStorage.setItem('token', token);
            console.log('Token saved');
          } else {
            console.warn('No token in response');
          }
          
          // Essayer de récupérer l'utilisateur depuis la réponse (différentes variantes)
          const user = response?.user || response?.User || response?.data?.user;
          
          if (user && user.username) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
            console.log('User saved from response:', user);
          } else if (token) {
            console.log('No user in response, trying to decode token');
            // Si pas d'utilisateur dans la réponse, essayer de décoder le token
            const decodedUser = this.decodeToken(token);
            console.log('Decoded user:', decodedUser);
            
            if (decodedUser && decodedUser.username) {
              localStorage.setItem('user', JSON.stringify(decodedUser));
              this.currentUserSubject.next(decodedUser);
              console.log('User saved from decoded token');
            } else {
              console.log('Failed to decode user, fetching from backend');
              // En dernier recours, récupérer l'utilisateur depuis le backend
              this.getCurrentUserFromBackend().subscribe({
                next: (userResponse) => {
                  if (userResponse.user) {
                    localStorage.setItem('user', JSON.stringify(userResponse.user));
                    this.currentUserSubject.next(userResponse.user);
                    console.log('User fetched from backend:', userResponse.user);
                  }
                },
                error: (error) => {
                  console.error('Erreur lors de la récupération de l\'utilisateur:', error);
                }
              });
            }
          } else {
            console.error('Invalid response format:', response);
          }
        }),
        catchError(error => {
          console.error('Register error in service:', error);
          return this.handleError(error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/accounts']);
  }

  getCurrentUserFromBackend(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${this.endpoint}/me`)
      .pipe(
        tap(response => {
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          return this.handleError(error);
        })
      );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
