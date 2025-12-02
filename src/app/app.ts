import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/layout/navbar/navbar';
import { Footer } from './components/layout/footer/footer';
import { TranslateService } from '@ngx-translate/core';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, Footer],
  templateUrl: './app.html',
})
export class AppComponent {
  private readonly _translate = inject(TranslateService);

  ngOnInit(): void {
    // Définition des langues disponibles
    this._translate.addLangs(['fr', 'en']);

    // Langue de secours
    this._translate.setFallbackLang('en');

    // Langue par défaut
    this._translate.use('en');
  }
}
