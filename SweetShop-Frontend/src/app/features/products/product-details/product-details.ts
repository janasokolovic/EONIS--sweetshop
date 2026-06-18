import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';

import { ProductDto } from '../../../core/models/product.models';
import { ReviewDto } from '../../../core/models/review.models';
import { UploadService } from '../../../core/services/upload.service';
@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly reviewService = inject(ReviewService);
  protected readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly uploadService = inject(UploadService);
  readonly product = signal<ProductDto | null>(null);
  readonly reviews = signal<ReviewDto[]>([]);
  readonly isLoading = signal(true);
  readonly isSubmittingReview = signal(false);
  readonly selectedImageIndex = signal(0);
  readonly quantity = signal(1);

  readonly reviewForm: FormGroup = this.fb.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(2000)]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/products']);
      return;
    }

    this.loadProduct(id);
    this.loadReviews(id);
  }

  loadProduct(id: number): void {
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('❌ Proizvod nije pronađen.', 'Zatvori', { duration: 3000 });
        this.router.navigate(['/products']);
      }
    });
  }

  loadReviews(id: number): void {
    this.reviewService.getProductReviews(id).subscribe({
      next: (reviews) => this.reviews.set(reviews),
      error: () => {} // Tiho ignorišemo
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  getCurrentImageUrl(): string {
  const product = this.product();
  if (!product || product.images.length === 0) return '';
  const url = product.images[this.selectedImageIndex()]?.imageUrl;
  return this.uploadService.getFullUrl(url);
}

getImageUrl(imageUrl: string): string {
  return this.uploadService.getFullUrl(imageUrl);
}

  increaseQuantity(): void {
    const product = this.product();
    if (product && this.quantity() < product.stockQuantity) {
      this.quantity.update(q => q + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!this.authService.isCustomer()) {
      this.snackBar.open('❌ Samo kupci mogu dodavati u korpu.', 'Zatvori', { duration: 3000 });
      return;
    }

    this.cartService.addItem({ productId: product.id, quantity: this.quantity() }).subscribe({
      next: () => {
        this.snackBar.open(`✅ ${product.name} (${this.quantity()}x) dodato u korpu!`, 'Zatvori', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri dodavanju u korpu.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const product = this.product();
    if (!product) return;

    this.isSubmittingReview.set(true);
    const { rating, comment } = this.reviewForm.value;

    this.reviewService.create({
      productId: product.id,
      rating: rating,
      comment: comment
    }).subscribe({
      next: () => {
        this.snackBar.open('✅ Hvala na recenziji! Čekamo da je admin odobri.', 'Zatvori', { duration: 4000 });
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.isSubmittingReview.set(false);
        // Ponovo učitaj recenzije
        this.loadReviews(product.id);
      },
      error: (err) => {
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri slanju recenzije.'}`, 'Zatvori', { duration: 5000 });
        this.isSubmittingReview.set(false);
      }
    });
  }

  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}