import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product';
import { Product, CreateProductDto } from '../../models/product';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent implements OnInit {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private translateService = inject(TranslateService);

  products = signal<Product[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  showCreateForm = signal<boolean>(false);
  
  productForm: FormGroup;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts(0, 100).subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.translateService.get('admin.messages.loadError').subscribe(msg => {
          this.errorMessage.set(msg);
        });
        this.isLoading.set(false);
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm.update(val => !val);
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      discount: 0
    });
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onCreateProduct() {
    if (this.productForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const productDto: CreateProductDto = {
      name: this.productForm.value.name,
      description: this.productForm.value.description,
      price: this.productForm.value.price,
      stock: this.productForm.value.stock,
      discount: this.productForm.value.discount
    };

    this.productService.createProduct(productDto).subscribe({
      next: (product) => {
        this.translateService.get('admin.messages.createSuccess').subscribe(msg => {
          this.successMessage.set(msg);
        });
        this.isLoading.set(false);
        this.showCreateForm.set(false);
        this.loadProducts();
        
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error) => {
        const errorMsg = error?.message;
        this.translateService.get('admin.messages.createError').subscribe(msg => {
          this.errorMessage.set(errorMsg || msg);
        });
        this.isLoading.set(false);
      }
    });
  }

  onDeleteProduct(productId: number, productName: string) {
    this.translateService.get('admin.list.deleteConfirm', { name: productName }).subscribe(msg => {
      if (!confirm(msg)) {
        return;
      }

      this.isLoading.set(true);
      this.errorMessage.set('');

      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.translateService.get('admin.messages.deleteSuccess').subscribe(successMsg => {
            this.successMessage.set(successMsg);
          });
          this.isLoading.set(false);
          this.loadProducts();
          
          setTimeout(() => {
            this.successMessage.set('');
          }, 3000);
        },
        error: (error) => {
          const errorMsg = error?.message;
          this.translateService.get('admin.messages.deleteError').subscribe(msg => {
            this.errorMessage.set(errorMsg || msg);
          });
          this.isLoading.set(false);
        }
      });
    });
  }
}
