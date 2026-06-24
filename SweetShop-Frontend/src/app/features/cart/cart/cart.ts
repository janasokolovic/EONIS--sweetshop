import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { CartService } from '../../../core/services/cart.service';
import { CartItemDto } from '../../../core/models/cart.models';
import { UploadService } from '../../../core/services/upload.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart implements OnInit {
  protected readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly uploadService = inject(UploadService);

  readonly isLoading = signal(true);
  readonly updatingItemId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading.set(true);
    this.cartService.loadCart().subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('❌ Greška pri učitavanju korpe.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  increaseQuantity(item: CartItemDto): void {
    if (item.quantity >= item.availableStock) {
      this.snackBar.open(`⚠️ Maksimalna količina na zalihama je ${item.availableStock}.`, 'Zatvori', { duration: 3000 });
      return;
    }
    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItemDto): void {
    if (item.quantity <= 1) {
      this.removeItem(item);
      return;
    }
    this.updateQuantity(item, item.quantity - 1);
  }

  updateQuantity(item: CartItemDto, newQuantity: number): void {
    this.updatingItemId.set(item.id);
    this.cartService.updateItem(item.id, { quantity: newQuantity }).subscribe({
      next: () => this.updatingItemId.set(null),
      error: (err) => {
        this.updatingItemId.set(null);
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri ažuriranju.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

  removeItem(item: CartItemDto): void {
    this.updatingItemId.set(item.id);
    this.cartService.removeItem(item.id).subscribe({
      next: () => {
        this.updatingItemId.set(null);
        this.snackBar.open(`✅ ${item.productName} uklonjen iz korpe.`, 'Zatvori', { duration: 3000 });
      },
      error: (err) => {
        this.updatingItemId.set(null);
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri uklanjanju.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

  clearCart(): void {
    if (!confirm('Da li ste sigurni da želite da ispraznite korpu?')) return;

    this.cartService.clearCart().subscribe({
      next: () => {
        this.snackBar.open('✅ Korpa je ispražnjena.', 'Zatvori', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(`❌ ${err.error?.message || 'Greška.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

  getItemImage(imageUrl: string | null | undefined): string {
    return this.uploadService.getFullUrl(imageUrl || undefined);
  }

  goToCheckout(): void {
    const cart = this.cartService.cart();
    if (!cart || cart.items.length === 0) {
      this.snackBar.open('⚠️ Korpa je prazna.', 'Zatvori', { duration: 3000 });
      return;
    }
    this.router.navigate(['/checkout']);
  }
}