import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';

import { OrderDto } from '../../../core/models/order.models';

import { StripePayment } from '../stripe-payment/stripe-payment';

@Component({
  selector: 'app-pay-order',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    StripePayment
  ],
  templateUrl: './pay-order.html',
  styleUrl: './pay-order.scss'
})
export class PayOrder implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly snackBar = inject(MatSnackBar);

  readonly order = signal<OrderDto | null>(null);
  readonly clientSecret = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));

    if (!orderId) {
      this.errorMessage.set('Nepoznata porudžbina.');
      this.isLoading.set(false);
      return;
    }

    // 1. Učitaj porudžbinu
    this.orderService.getById(orderId).subscribe({
      next: (order) => {
        // Provera da je Pending
        if (order.status !== 'Pending') {
          this.errorMessage.set(`Ova porudžbina ne može biti plaćena. Trenutni status: ${order.status}`);
          this.isLoading.set(false);
          return;
        }

        this.order.set(order);

        // 2. Kreiraj novi PaymentIntent
        this.paymentService.createPaymentIntent(order.id).subscribe({
          next: (result) => {
            this.clientSecret.set(result.clientSecret);
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(err.error?.message || 'Greška pri pripremi plaćanja.');
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Greška pri učitavanju porudžbine.');
      }
    });
  }

  onPaymentSuccess(): void {
    this.snackBar.open('✅ Plaćanje uspešno! Hvala na kupovini! 🍬', 'Zatvori', { duration: 5000 });
    setTimeout(() => {
      this.router.navigate(['/orders/my']);
    }, 1500);
  }

  onPaymentError(message: string): void {
    this.snackBar.open(`❌ ${message}`, 'Zatvori', { duration: 5000 });
  }
}