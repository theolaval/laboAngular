import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { User, LoginRequest, RegisterRequest } from '../../models/user';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss',
})
export class Accounts implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private translateService = inject(TranslateService);
  private destroy$ = new Subject<void>();

  isLoggedIn = signal<boolean>(false);
  currentUser = signal<User | null>(null);
  showRegister = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  loginForm = signal({
    username: '',
    password: ''
  });

  registerForm = signal({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthdate: ''
  });

  ngOnInit() {
    this.checkLoginStatus();
    
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser.set(user);
      this.isLoggedIn.set(!!user);
    });
    
    const currentUser = this.authService.getCurrentUser();
    if (this.authService.isLoggedIn() && currentUser) {
      if (currentUser.username) {
        this.currentUser.set(currentUser);
      } else {
        this.authService.getCurrentUserFromBackend().subscribe({
          next: (response) => {
            this.currentUser.set(response.user);
          },
          error: (error) => {
            if (currentUser) {
              this.currentUser.set(currentUser);
            }
          }
        });
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkLoginStatus() {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
    this.isLoggedIn.set(!!user);
  }

  onLogin() {
    this.errorMessage.set('');
    this.isLoading.set(true);

    const loginRequest: LoginRequest = {
      username: this.loginForm().username,
      password: this.loginForm().password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.currentUser.set(response.user);
        this.isLoggedIn.set(true);
        this.translateService.get('accounts.messages.loginSuccess').subscribe(message => {
          this.successMessage.set(message);
        });
        this.resetLoginForm();
      },
      error: (error: any) => {
        this.isLoading.set(false);
        const message = error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.errorMessage.set(message);
      }
    });
  }

  onRegister() {
    this.errorMessage.set('');

    if (this.registerForm().password !== this.registerForm().confirmPassword) {
      this.translateService.get('accounts.messages.passwordMismatch').subscribe(message => {
        this.errorMessage.set(message);
      });
      return;
    }

    if (this.registerForm().password.length < 6) {
      this.translateService.get('accounts.messages.passwordTooShort').subscribe(message => {
        this.errorMessage.set(message);
      });
      return;
    }

    this.isLoading.set(true);

    const registerRequest: RegisterRequest = {
      username: this.registerForm().username,
      email: this.registerForm().email,
      password: this.registerForm().password,
      birthdate: this.registerForm().birthdate
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.currentUser.set(response.user);
        this.isLoggedIn.set(true);
        this.showRegister.set(false);
        this.translateService.get('accounts.messages.registerSuccess').subscribe(message => {
          this.successMessage.set(message);
        });
        this.resetRegisterForm();
      },
      error: (error: any) => {
        this.isLoading.set(false);
        const message = error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.errorMessage.set(message);
      }
    });
  }

  toggleRegister() {
    this.showRegister.update(val => !val);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onLogout() {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.resetLoginForm();
  }

  resetLoginForm() {
    this.loginForm.set({
      username: '',
      password: ''
    });
  }

  resetRegisterForm() {
    this.registerForm.set({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthdate: ''
    });
  }

  updateLoginForm(field: string, value: string) {
    this.loginForm.update(form => ({ ...form, [field]: value }));
  }

  updateRegisterForm(field: string, value: string) {
    this.registerForm.update(form => ({ ...form, [field]: value }));
  }
}
