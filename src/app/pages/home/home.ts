import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent {}
