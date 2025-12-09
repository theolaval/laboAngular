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
      if (userJson && userJson !== 'undefined') {
        const user = JSON.parse(userJson);
        return user;
      }
      return null;
    } catch (error) {
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
    return this.http.post<LoginResponse>(`${this.endpoint}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          
          if (response.user && response.user.username) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          } else {
            this.getCurrentUserFromBackend().subscribe({
              next: (userResponse) => {
              },
              error: (error) => {
                const user = this.decodeToken(response.token);
                if (user) {
                  localStorage.setItem('user', JSON.stringify(user));
                  this.currentUserSubject.next(user);
                }
              }
            });
          }
        }),
        catchError(error => this.handleError(error))
      );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.endpoint}/register`, userData)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          
          if (response.user && response.user.username) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          } else {
            this.getCurrentUserFromBackend().subscribe({
              next: (userResponse) => {
              },
              error: (error) => {
                const user = this.decodeToken(response.token);
                if (user) {
                  localStorage.setItem('user', JSON.stringify(user));
                  this.currentUserSubject.next(user);
                }
              }
            });
          }
        }),
        catchError(error => this.handleError(error))
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
