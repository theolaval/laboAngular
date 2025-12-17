import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; 
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product';
import { Category } from '../../models/category';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private cartService = inject(CartService);
  private translateService = inject(TranslateService);
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  featuredProducts = signal<Product[]>([]);
  selectedCategory = signal<number | null>(null);
  error = signal<string>('');

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts(0, 20).subscribe({
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
