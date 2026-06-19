import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FormControl } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductDto, CreateProductDto, UpdateProductDto } from '../../../core/models/product.models';
import { CategoryDto } from '../../../core/models/category.models';
import { UploadService } from '../../../core/services/upload.service';


@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss'
})
export class AdminProducts implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly uploadService = inject(UploadService);
  readonly isUploading = signal(false);

  readonly products = signal<ProductDto[]>([]);
  readonly categories = signal<CategoryDto[]>([]);
  readonly isLoading = signal(true);
  readonly totalCount = signal(0);
  readonly showForm = signal(false);
  readonly editingProduct = signal<ProductDto | null>(null);
  readonly isSubmitting = signal(false);

  // Tabela
  displayedColumns = ['id', 'image', 'name', 'category', 'price', 'stock', 'status', 'actions'];

  // Filteri
  page = 1;
  pageSize = 10;
  selectedCategoryId: number | null = null;
  searchControl = new FormControl('');

  readonly productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    categoryId: [null, [Validators.required]],
    imageUrl: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();

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
      error: () => this.snackBar.open('❌ Greška pri učitavanju kategorija.', 'Zatvori', { duration: 3000 })
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getAll({
      page: this.page,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value || undefined,
      categoryId: this.selectedCategoryId ?? undefined,
      sortBy: 'createdAt',
      sortDescending: true,
      includeInactive: true  
    }).subscribe({
      next: (result) => {
        this.products.set(result.items);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('❌ Greška pri učitavanju proizvoda.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.page = 1;
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  openAddForm(): void {
    this.editingProduct.set(null);
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      categoryId: null,
      imageUrl: '',
      isActive: true
    });
    this.showForm.set(true);
    
  }

  openEditForm(product: ProductDto): void {
     console.log('🔍 EDIT KLIKNUT', product);
    this.editingProduct.set(product);
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      imageUrl: product.images[0]?.imageUrl || '',
      isActive: product.isActive
    });
    this.showForm.set(true);
      setTimeout(() => {
    const adminContent = document.querySelector('.admin-content') as HTMLElement;
    if (adminContent) {
      adminContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Backup - skroluj i window i .mat-sidenav-content
    const sidenavContent = document.querySelector('.mat-sidenav-content') as HTMLElement;
    if (sidenavContent) {
      sidenavContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }

  submitForm(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.productForm.value;
    const editing = this.editingProduct();

    if (editing) {
    
  const dto: UpdateProductDto = {
    name: formValue.name,
    description: formValue.description,
    price: Number(formValue.price),
    stockQuantity: Number(formValue.stockQuantity),
    categoryId: Number(formValue.categoryId),
    isActive: formValue.isActive,
    imageUrl: formValue.imageUrl || undefined
  };

      this.productService.update(editing.id, dto).subscribe({
        next: () => {
          this.snackBar.open('✅ Proizvod ažuriran!', 'Zatvori', { duration: 3000 });
          this.isSubmitting.set(false);
          this.closeForm();
          this.loadProducts();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.snackBar.open(`❌ ${err.error?.message || 'Greška pri ažuriranju.'}`, 'Zatvori', { duration: 5000 });
        }
      });
    } else {
      // Create
      const dto: CreateProductDto = {
        name: formValue.name,
        description: formValue.description,
        price: Number(formValue.price),
        stockQuantity: Number(formValue.stockQuantity),
        categoryId: Number(formValue.categoryId),
        images: formValue.imageUrl ? [{
          imageUrl: formValue.imageUrl,
          isPrimary: true,
          displayOrder: 1
        }] : []
      };

      this.productService.create(dto).subscribe({
        next: () => {
          this.snackBar.open('✅ Proizvod dodat!', 'Zatvori', { duration: 3000 });
          this.isSubmitting.set(false);
          this.closeForm();
          this.loadProducts();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.snackBar.open(`❌ ${err.error?.message || 'Greška pri dodavanju.'}`, 'Zatvori', { duration: 5000 });
        }
      });
    }
  }

  deleteProduct(product: ProductDto): void {
    if (!confirm(`Da li ste sigurni da želite da obrišete "${product.name}"?`)) return;

    this.productService.delete(product.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Proizvod obrisan.', 'Zatvori', { duration: 3000 });
        this.loadProducts();
      },
      error: (err) => {
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri brisanju.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

 getProductImage(product: ProductDto): string {
  const url = product.images.find(img => img.isPrimary)?.imageUrl || product.images[0]?.imageUrl;
  return this.uploadService.getFullUrl(url);
}
  onImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];


  if (file.size > 5 * 1024 * 1024) {
    this.snackBar.open('❌ Fajl je prevelik. Maksimum 5MB.', 'Zatvori', { duration: 4000 });
    return;
  }

  this.isUploading.set(true);
  this.uploadService.uploadImage(file, 'products').subscribe({
    next: (result) => {
      this.productForm.patchValue({ imageUrl: result.url });
      this.isUploading.set(false);
      this.snackBar.open('✅ Slika uploadovana!', 'Zatvori', { duration: 3000 });
      // Reset file input
      input.value = '';
    },
    error: (err) => {
      this.isUploading.set(false);
      this.snackBar.open(`❌ ${err.error?.message || 'Greška pri uploadu.'}`, 'Zatvori', { duration: 5000 });
      input.value = '';
    }
  });
}

getImagePreviewUrl(): string {
  const url = this.productForm.get('imageUrl')?.value;
  return this.uploadService.getFullUrl(url);
}
}