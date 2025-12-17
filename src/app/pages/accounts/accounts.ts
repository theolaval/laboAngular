import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { User, LoginRequest, RegisterRequest } from '../../models/user';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss',
})
export class Accounts implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private translateService = inject(TranslateService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  isLoggedIn = signal<boolean>(false);
  currentUser = signal<User | null>(null);
  showRegister = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      birthdate: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser.set(user);
      this.isLoggedIn.set(!!user);
    });
    
    if (this.authService.isLoggedIn()) {
      const currentUser = this.authService.getCurrentUser();
      
      if (!currentUser || !currentUser.username) {
        this.authService.getCurrentUserFromBackend().subscribe({
          next: (response) => {
            this.currentUser.set(response.user);
            this.isLoggedIn.set(true);
          },
          error: (error) => {
            this.authService.logout();
          }
        });
      } else {
        this.currentUser.set(currentUser);
        this.isLoggedIn.set(true);
      }
    } else {
      this.isLoggedIn.set(false);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    const loginRequest: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        
        this.translateService.get('accounts.messages.loginSuccess').subscribe(message => {
          this.successMessage.set(message);
        });
        
        this.isLoggedIn.set(true);
        this.currentUser.set(response.user);
        this.resetLoginForm();
        
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        const message = error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.errorMessage.set(message);
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      return;
    }

    this.errorMessage.set('');

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.translateService.get('accounts.messages.passwordMismatch').subscribe(message => {
        this.errorMessage.set(message);
      });
      return;
    }

    this.isLoading.set(true);

    const registerRequest: RegisterRequest = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      birthdate: this.registerForm.value.birthdate
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        if (!response || !response.token) {
          const loginRequest: LoginRequest = {
            username: registerRequest.username,
            password: registerRequest.password
          };
          
          this.authService.login(loginRequest).subscribe({
            next: (loginResponse) => {
              this.isLoading.set(false);
              
              this.translateService.get('accounts.messages.registerSuccess').subscribe(message => {
                this.successMessage.set(message);
              });
              
              this.isLoggedIn.set(true);
              this.currentUser.set(loginResponse.user);
              this.showRegister.set(false);
              this.resetRegisterForm();
              
              setTimeout(() => {
                this.successMessage.set('');
              }, 3000);
            },
            error: (loginError) => {
              this.isLoading.set(false);
              
              this.translateService.get('accounts.messages.registerSuccess').subscribe(message => {
                this.successMessage.set(message + ' Veuillez vous connecter.');
              });
              
              this.showRegister.set(false);
              this.resetRegisterForm();
            }
          });
        } else {
          this.isLoading.set(false);
          
          this.translateService.get('accounts.messages.registerSuccess').subscribe(message => {
            this.successMessage.set(message);
          });
          
          this.isLoggedIn.set(true);
          this.currentUser.set(response.user);
          this.showRegister.set(false);
          this.resetRegisterForm();
          
          setTimeout(() => {
            this.successMessage.set('');
          }, 3000);
        }
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
    this.errorMessage.set('');
    this.successMessage.set('');
    this.resetLoginForm();
  }

  resetLoginForm() {
    this.loginForm.reset({
      username: '',
      password: ''
    });
  }

  resetRegisterForm() {
    this.registerForm.reset({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthdate: ''
    });
  }
}
