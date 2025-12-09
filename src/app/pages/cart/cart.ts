import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../services/cart';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent {
  private cartService = inject(CartService);

  // Expose cart data
  cartItems = this.cartService.items;
  itemCount = this.cartService.itemCount;
  totalPrice = this.cartService.totalPrice;

  // Calculer les frais de livraison
  shippingCost = computed(() => {
    const total = this.totalPrice();
    return total > 0 ? (total >= 50 ? 0 : 5.99) : 0;
  });

  // Calculer le total final
  finalTotal = computed(() => this.totalPrice() + this.shippingCost());

  updateQuantity(productId: number, newQuantity: number): void {
    if (newQuantity > 0) {
      this.cartService.updateQuantity(productId, newQuantity);
    }
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    if (confirm(this.getTranslation('cart.confirmClear'))) {
      this.cartService.clearCart();
    }
  }

  checkout(): void {
    // TODO: Implémenter le processus de paiement
    alert(this.getTranslation('cart.checkoutNotImplemented'));
  }

  // Helper pour obtenir les traductions (à améliorer avec TranslateService si nécessaire)
  private getTranslation(key: string): string {
    // Traduction simple pour les confirmations
    const translations: { [key: string]: string } = {
      'cart.confirmClear': 'Êtes-vous sûr de vouloir vider votre panier ?',
      'cart.checkoutNotImplemented': 'La fonctionnalité de paiement sera bientôt disponible !'
    };
    return translations[key] || key;
  }
}
