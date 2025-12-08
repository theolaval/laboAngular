import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../services/loading';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.loading()) {
      <div class="loading-overlay">
        <div class="spinner"></div>
      </div>
    }
  `,
})
export class LoadingComponent {
  loadingService = inject(LoadingService);
}
