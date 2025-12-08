import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends ApiService {
  private endpoint = `${this.apiUrl}/Product`;

  getProducts(offset = 0, limit = 20): Observable<Product[]> {
  return this.http.get<Product[]>(
    `${this.endpoint}?offset=${offset}&limit=${limit}`,
    { headers: this.getHeaders() }
  ).pipe(catchError(this.handleError));
}

}
