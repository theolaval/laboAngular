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
      `${this.endpoint}?offset=${offset}&limit=${limit}`
    ).pipe(catchError(this.handleError));
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createProduct(product: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.endpoint, product)
      .pipe(catchError(this.handleError));
  }

  updateProduct(id: number, product: CreateProductDto): Observable<Product> {
    return this.http.put<Product>(`${this.endpoint}/${id}`, product)
      .pipe(catchError(this.handleError));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }

}
