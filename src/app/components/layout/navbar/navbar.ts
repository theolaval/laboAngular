import { Component, inject, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Accounts } from '../../../pages/accounts/accounts';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent {
  isMenuOpen = false;
  isLanguageMenuOpen = false;
  currentLanguage = 'en';
  private translateService = inject(TranslateService);

  constructor() {
    this.currentLanguage = this.translateService.currentLang || 'en';
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
