import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'amazoun_cart';
  
  // Signal pour stocker les items du panier
  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());
  
  // Computed signals pour les statistiques du panier
  items = computed(() => this.cartItems());
  itemCount = computed(() => 
    this.cartItems().reduce((total, item) => total + item.quantity, 0)
  );
  totalPrice = computed(() =>
    this.cartItems().reduce((total, item) => total + (item.product.price * item.quantity), 0)
  );

  constructor() {
  }

  private loadCartFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  private saveCartToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
    }
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(
      item => item.product.id === product.id
    );

    let newItems: CartItem[];
    
    if (existingItemIndex > -1) {
      newItems = currentItems.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: Math.min(item.quantity + quantity, item.product.stock) }
          : item
      );
    } else {
      newItems = [...currentItems, { product, quantity: Math.min(quantity, product.stock) }];
    }

    this.cartItems.set(newItems);
    this.saveCartToStorage(newItems);
  }

  removeFromCart(productId: number): void {
    const newItems = this.cartItems().filter(item => item.product.id !== productId);
    this.cartItems.set(newItems);
    this.saveCartToStorage(newItems);
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const newItems = this.cartItems().map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.min(quantity, item.product.stock) }
        : item
    );
    
    this.cartItems.set(newItems);
    this.saveCartToStorage(newItems);
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveCartToStorage([]);
  }

  isInCart(productId: number): boolean {
    return this.cartItems().some(item => item.product.id === productId);
  }

  getQuantity(productId: number): number {
    const item = this.cartItems().find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }
}
