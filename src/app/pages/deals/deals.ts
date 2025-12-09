import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './deals.html',
  styleUrls: ['./deals.scss']
})
export class DealsComponent {
}
