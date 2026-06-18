import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CategoryService } from '../../../core/services/category.service';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../../../core/models/category.models';
import { UploadService } from '../../../core/services/upload.service';
@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss'
})
export class AdminCategories implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly uploadService = inject(UploadService);
  readonly isUploading = signal(false);

  readonly categories = signal<CategoryDto[]>([]);
  readonly isLoading = signal(true);
  readonly showForm = signal(false);
  readonly editingCategory = signal<CategoryDto | null>(null);
  readonly isSubmitting = signal(false);

  readonly categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    imageUrl: ['']
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('❌ Greška pri učitavanju kategorija.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  openAddForm(): void {
    this.editingCategory.set(null);
    this.categoryForm.reset({ name: '', description: '', imageUrl: '' });
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openEditForm(category: CategoryDto): void {
    this.editingCategory.set(category);
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || ''
    });
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingCategory.set(null);
  }

  submitForm(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.categoryForm.value;
    const editing = this.editingCategory();

    if (editing) {
      // Update
      const dto: UpdateCategoryDto = {
        name: formValue.name,
        description: formValue.description || undefined,
        imageUrl: formValue.imageUrl || undefined
      };

      this.categoryService.update(editing.id, dto).subscribe({
        next: () => {
          this.snackBar.open('✅ Kategorija ažurirana!', 'Zatvori', { duration: 3000 });
          this.isSubmitting.set(false);
          this.closeForm();
          this.loadCategories();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.snackBar.open(`❌ ${err.error?.message || 'Greška pri ažuriranju.'}`, 'Zatvori', { duration: 5000 });
        }
      });
    } else {
      // Create
      const dto: CreateCategoryDto = {
        name: formValue.name,
        description: formValue.description || undefined,
        imageUrl: formValue.imageUrl || undefined
      };

      this.categoryService.create(dto).subscribe({
        next: () => {
          this.snackBar.open('✅ Kategorija dodata!', 'Zatvori', { duration: 3000 });
          this.isSubmitting.set(false);
          this.closeForm();
          this.loadCategories();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.snackBar.open(`❌ ${err.error?.message || 'Greška pri dodavanju.'}`, 'Zatvori', { duration: 5000 });
        }
      });
    }
  }

  deleteCategory(category: CategoryDto): void {
    if (category.productCount > 0) {
      this.snackBar.open(
        `❌ Ne možete obrisati kategoriju "${category.name}" jer ima ${category.productCount} proizvoda.`,
        'Zatvori',
        { duration: 5000 }
      );
      return;
    }

    if (!confirm(`Da li ste sigurni da želite da obrišete kategoriju "${category.name}"?`)) return;

    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Kategorija obrisana.', 'Zatvori', { duration: 3000 });
        this.loadCategories();
      },
      error: (err) => {
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri brisanju.'}`, 'Zatvori', { duration: 5000 });
      }
    });
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
  this.uploadService.uploadImage(file, 'categories').subscribe({
    next: (result) => {
      this.categoryForm.patchValue({ imageUrl: result.url });
      this.isUploading.set(false);
      this.snackBar.open('✅ Slika uploadovana!', 'Zatvori', { duration: 3000 });
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
  const url = this.categoryForm.get('imageUrl')?.value;
  return this.uploadService.getFullUrl(url);
}
}