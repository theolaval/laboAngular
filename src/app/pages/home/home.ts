import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; 
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  imageUrl?: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cartService = inject(CartService);
  private translateService = inject(TranslateService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  featuredProducts = signal<Product[]>([]);
  selectedCategory = signal<number | null>(null);
  error = signal<string>('');

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
  this.http
    .get<Product[]>(`${environment.apiUrl}/Product?offset=0&limit=20`)
    .subscribe({
      next: (data) => {
        this.products.set(data);
        this.featuredProducts.set(data.slice(0, 8));
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des produits');
      }
    });
}

  addToCart(product: Product) {
    if (product.stock > 0) {
      this.cartService.addToCart(product);
    } else {
      this.translateService.get('home.products.outOfStockMessage')
        .subscribe(message => {
          alert(message || 'Produit en rupture de stock');
        });
    }
  }

  viewProductDetails(productId: number) {
    this.router.navigate(['/products', productId]);
  }

  viewAllProducts() {
    this.router.navigate(['/products']);
  }
}
