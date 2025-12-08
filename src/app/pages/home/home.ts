import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core'; // ✅ Ajout
import { environment } from '../../../environments/environment';

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
  imports: [CommonModule, TranslateModule], // ✅ TranslateModule ajouté
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

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
        console.log('✅ Produits chargés:', data);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des produits');
        console.error('❌ Erreur:', err);
      }
    });
}

  addToCart(product: Product) {
    if (product.stock > 0) {
      console.log('Ajout au panier:', product);
      alert(`${product.name} ajouté au panier !`);
    } else {
      alert('Produit en rupture de stock');
    }
  }

  viewProductDetails(productId: number) {
    this.router.navigate(['/products', productId]);
  }

  viewAllProducts() {
    this.router.navigate(['/products']);
  }
}
