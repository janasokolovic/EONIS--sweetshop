import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

import { ProductDto, PagedResult } from '../../../core/models/product.models';
import { CategoryDto } from '../../../core/models/category.models';
import { UploadService } from '../../../core/services/upload.service';
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly uploadService = inject(UploadService);
  // Stanje
  readonly products = signal<ProductDto[]>([]);
  readonly categories = signal<CategoryDto[]>([]);
  readonly isLoading = signal(false);
  readonly totalCount = signal(0);

  // Pagination
  page = 1;
  pageSize = 12;

  // Filtering
  selectedCategoryId: number | null = null;
  sortBy = 'createdAt';
  sortDescending = true;

  // Search input control
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();

    // Pretraga sa debounce - sačeka 400ms posle zadnjeg kucanja
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.loadProducts();
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.showError('Greška pri učitavanju kategorija.')
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getAll({
      page: this.page,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value || undefined,
      sortBy: this.sortBy,
      sortDescending: this.sortDescending,
      categoryId: this.selectedCategoryId ?? undefined
    }).subscribe({
      next: (result: PagedResult<ProductDto>) => {
        this.products.set(result.items);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showError('Greška pri učitavanju proizvoda.');
      }
    });
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.page = 1;
    this.loadProducts();
  }

  onSortChange(value: string): void {
    const [field, direction] = value.split(':');
    this.sortBy = field;
    this.sortDescending = direction === 'desc';
    this.page = 1;
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  addToCart(product: ProductDto, event: Event): void {
    event.stopPropagation();

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/products' } });
      return;
    }

    if (!this.authService.isCustomer()) {
      this.showError('Samo kupci mogu dodavati u korpu.');
      return;
    }

    this.cartService.addItem({ productId: product.id, quantity: 1 }).subscribe({
      next: () => {
        this.snackBar.open(`✅ ${product.name} dodato u korpu!`, 'Zatvori', { duration: 3000 });
      },
      error: (err) => {
        this.showError(err.error?.message || 'Greška pri dodavanju u korpu.');
      }
    });
  }

  getPrimaryImage(product: ProductDto): string {
  const primaryImage = product.images.find(img => img.isPrimary);
  const url = primaryImage?.imageUrl || product.images[0]?.imageUrl;
  return this.uploadService.getFullUrl(url);
}
  private showError(message: string): void {
    this.snackBar.open(`❌ ${message}`, 'Zatvori', { duration: 5000 });
  }
}