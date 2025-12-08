import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  loading = signal<boolean>(false);
  
  private activeRequests = 0;

  show() {
    this.activeRequests++;
    this.loading.set(true);
  }

  hide() {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      this.loading.set(false);
    }
  }

  reset() {
    this.activeRequests = 0;
    this.loading.set(false);
  }
}
