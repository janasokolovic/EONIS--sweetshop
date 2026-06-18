import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { ReviewService } from '../../../core/services/review.service';
import { ReviewDto } from '../../../core/models/review.models';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './admin-reviews.html',
  styleUrl: './admin-reviews.scss'
})
export class AdminReviews implements OnInit {
  private readonly reviewService = inject(ReviewService);
  private readonly snackBar = inject(MatSnackBar);

  readonly pendingReviews = signal<ReviewDto[]>([]);
  readonly isLoading = signal(true);
  readonly processingReviewId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadPendingReviews();
  }

  loadPendingReviews(): void {
    this.isLoading.set(true);
    this.reviewService.getPending().subscribe({
      next: (reviews) => {
        this.pendingReviews.set(reviews);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('❌ Greška pri učitavanju recenzija.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  approveReview(review: ReviewDto): void {
    this.processingReviewId.set(review.id);
    this.reviewService.approve(review.id).subscribe({
      next: () => {
        this.processingReviewId.set(null);
        this.snackBar.open(`✅ Recenzija od ${review.customerName} odobrena!`, 'Zatvori', { duration: 3000 });
        this.loadPendingReviews();
      },
      error: (err) => {
        this.processingReviewId.set(null);
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri odobravanju.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

  rejectReview(review: ReviewDto): void {
    if (!confirm(`Da li ste sigurni da želite da odbijete (obrišete) recenziju od ${review.customerName}?`)) return;

    this.processingReviewId.set(review.id);
    this.reviewService.reject(review.id).subscribe({
      next: () => {
        this.processingReviewId.set(null);
        this.snackBar.open(`✅ Recenzija odbijena.`, 'Zatvori', { duration: 3000 });
        this.loadPendingReviews();
      },
      error: (err) => {
        this.processingReviewId.set(null);
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri odbijanju.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}