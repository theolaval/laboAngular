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
    // Sauvegarder automatiquement dans le localStorage lors des changements
  }

  // Charger le panier depuis le localStorage
  private loadCartFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      return [];
    }
  }

  // Sauvegarder le panier dans le localStorage
  private saveCartToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  // Ajouter un produit au panier
  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(
      item => item.product.id === product.id
    );

    let newItems: CartItem[];
    
    if (existingItemIndex > -1) {
      // Le produit existe déjà, augmenter la quantité
      newItems = currentItems.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: Math.min(item.quantity + quantity, item.product.stock) }
          : item
      );
    } else {
      // Nouveau produit
      newItems = [...currentItems, { product, quantity: Math.min(quantity, product.stock) }];
    }

    this.cartItems.set(newItems);
    this.saveCartToStorage(newItems);
  }

  // Retirer un produit du panier
  removeFromCart(productId: number): void {
    const newItems = this.cartItems().filter(item => item.product.id !== productId);
    this.cartItems.set(newItems);
    this.saveCartToStorage(newItems);
  }

  // Mettre à jour la quantité d'un produit
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

  // Vider le panier
  clearCart(): void {
    this.cartItems.set([]);
    this.saveCartToStorage([]);
  }

  // Vérifier si un produit est dans le panier
  isInCart(productId: number): boolean {
    return this.cartItems().some(item => item.product.id === productId);
  }

  // Obtenir la quantité d'un produit dans le panier
  getQuantity(productId: number): number {
    const item = this.cartItems().find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }
}
