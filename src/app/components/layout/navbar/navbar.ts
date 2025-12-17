import { Component, inject, HostListener, signal, OnInit } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Accounts } from '../../../pages/accounts/accounts';
import { filter } from 'rxjs/operators';
import { CartService } from '../../../services/cart';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isLanguageMenuOpen = false;
  currentLanguage = 'en';
  currentRoute = '';
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  cartItemCount = this.cartService.itemCount;
  isAdmin = signal<boolean>(false);

  constructor() {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    this.currentLanguage = savedLanguage || this.translateService.currentLang || 'en';
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
    });
    
    this.currentRoute = this.router.url;
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin.set(user?.role === 'Admin');
    });
  }

  navigateTo(path: string, event: Event) {
    if (this.currentRoute === path) {
      event.preventDefault();
      window.location.href = path;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleLanguageMenu() {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  changeLanguage(lang: string) {
    this.translateService.use(lang);
    this.currentLanguage = lang;
    localStorage.setItem('selectedLanguage', lang);
    this.isLanguageMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const languageSelector = document.querySelector('.language-selector');

    if (languageSelector && !languageSelector.contains(target)) {
      this.isLanguageMenuOpen = false;
    }
  }
}
