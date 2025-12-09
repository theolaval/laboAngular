import { TestBed } from '@angular/core/testing';
import { CartService } from './cart';
import { Product } from '../models/product';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty cart', () => {
    expect(service.items().length).toBe(0);
    expect(service.itemCount()).toBe(0);
    expect(service.totalPrice()).toBe(0);
  });

  it('should add product to cart', () => {
    const product: Product = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 10,
      stock: 5,
      categoryId: 1
    };

    service.addToCart(product);
    expect(service.items().length).toBe(1);
    expect(service.itemCount()).toBe(1);
    expect(service.totalPrice()).toBe(10);
  });

  it('should remove product from cart', () => {
    const product: Product = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 10,
      stock: 5,
      categoryId: 1
    };

    service.addToCart(product);
    service.removeFromCart(1);
    expect(service.items().length).toBe(0);
  });

  it('should clear cart', () => {
    const product: Product = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 10,
      stock: 5,
      categoryId: 1
    };

    service.addToCart(product);
    service.clearCart();
    expect(service.items().length).toBe(0);
  });
});
