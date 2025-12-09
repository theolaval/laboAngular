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
    // Écouter les changements d'utilisateur
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser.set(user);
      this.isLoggedIn.set(!!user);
    });
    
    // Vérifier si l'utilisateur est connecté
    if (this.authService.isLoggedIn()) {
      const currentUser = this.authService.getCurrentUser();
      
      // Si l'utilisateur existe mais n'a pas de username, récupérer depuis le backend
      if (!currentUser || !currentUser.username) {
        console.log('User incomplete, fetching from backend...');
        this.authService.getCurrentUserFromBackend().subscribe({
          next: (response) => {
            console.log('User fetched from backend:', response.user);
            this.currentUser.set(response.user);
            this.isLoggedIn.set(true);
          },
          error: (error) => {
            console.error('Failed to fetch user:', error);
            // Si échec, déconnecter l'utilisateur
            this.authService.logout();
          }
        });
      } else {
        console.log('User loaded from localStorage:', currentUser);
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
    this.errorMessage.set('');
    this.isLoading.set(true);

    const loginRequest: LoginRequest = {
      username: this.loginForm().username,
      password: this.loginForm().password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        
        // Afficher le message de succès
        this.translateService.get('accounts.messages.loginSuccess').subscribe(message => {
          this.successMessage.set(message);
        });
        
        // Mettre à jour l'état de connexion et l'utilisateur
        this.isLoggedIn.set(true);
        this.currentUser.set(response.user);
        this.resetLoginForm();
        
        // Effacer le message après 3 secondes
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
        console.log('Registration successful:', response);
        
        // Si l'inscription réussit mais pas de token, se connecter automatiquement
        if (!response || !response.token) {
          console.log('No token received, logging in automatically...');
          
          // Se connecter automatiquement avec les identifiants d'inscription
          const loginRequest: LoginRequest = {
            username: registerRequest.username,
            password: registerRequest.password
          };
          
          this.authService.login(loginRequest).subscribe({
            next: (loginResponse) => {
              this.isLoading.set(false);
              
              // Afficher le message de succès
              this.translateService.get('accounts.messages.registerSuccess').subscribe(message => {
                this.successMessage.set(message);
              });
              
              // Mettre à jour l'état de connexion et l'utilisateur
              this.isLoggedIn.set(true);
              this.currentUser.set(loginResponse.user);
              this.showRegister.set(false);
              this.resetRegisterForm();
              
              // Effacer le message après 3 secondes
              setTimeout(() => {
                this.successMessage.set('');
              }, 3000);
            },
            error: (loginError) => {
              this.isLoading.set(false);
              console.error('Auto-login error:', loginError);
              
              // Afficher quand même le message de succès d'inscription
              this.translateService.get('accounts.messages.registerSuccess').subscribe(message => {
                this.successMessage.set(message + ' Veuillez vous connecter.');
              });
              
              this.showRegister.set(false);
              this.resetRegisterForm();
            }
          });
        } else {
          // Si on a bien reçu le token et l'utilisateur
          this.isLoading.set(false);
          
          // Afficher le message de succès
          this.translateService.get('accounts.messages.registerSuccess').subscribe(message => {
            this.successMessage.set(message);
          });
          
          // Mettre à jour l'état de connexion et l'utilisateur
          this.isLoggedIn.set(true);
          this.currentUser.set(response.user);
          this.showRegister.set(false);
          this.resetRegisterForm();
          
          // Effacer le message après 3 secondes
          setTimeout(() => {
            this.successMessage.set('');
          }, 3000);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Registration error:', error);
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
