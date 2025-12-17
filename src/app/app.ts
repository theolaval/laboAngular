import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/layout/navbar/navbar';
import { FooterComponent } from './components/layout/footer/footer';
import { TranslateService } from '@ngx-translate/core';
import { inject } from '@angular/core';
import { LoadingComponent } from './components/layout/loading/loading';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, LoadingComponent],
template: `
    <app-navbar />
    <app-loading />
    <router-outlet />
    <app-footer />
  `
})
export class AppComponent {
  private readonly _translate = inject(TranslateService);

  ngOnInit(): void {
    this._translate.addLangs(['fr', 'en']);

    this._translate.setFallbackLang('en');

    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this._translate.use(savedLanguage);
  }
}
