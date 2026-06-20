/*import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CartService } from '../../../core/services/cart.service';
import { ShippingAddressService } from '../../../core/services/shipping-address.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';

import { ShippingAddressDetailsDto } from '../../../core/models/shipping-address.models';
import { OrderDto } from '../../../core/models/order.models';

import { StripePayment } from '../stripe-payment/stripe-payment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatStepperModule,
    MatSnackBarModule,
    StripePayment
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit {
  protected readonly cartService = inject(CartService);
  private readonly addressService = inject(ShippingAddressService);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly addresses = signal<ShippingAddressDetailsDto[]>([]);
  readonly selectedAddressId = signal<number | null>(null);
  readonly isLoading = signal(true);
  readonly currentStep = signal<'address' | 'payment'>('address');
  readonly isCreatingOrder = signal(false);

  readonly createdOrder = signal<OrderDto | null>(null);
  readonly clientSecret = signal<string | null>(null);

  ngOnInit(): void {
    // Učitaj korpu
    this.cartService.loadCart().subscribe();

    // Učitaj adrese
    this.loadAddresses();

    // Provera za returnUrl iz Addresses stranice
    const addressId = this.route.snapshot.queryParams['addressId'];
    if (addressId) {
      this.selectedAddressId.set(Number(addressId));
    }
  }

  loadAddresses(): void {
    this.isLoading.set(true);
    this.addressService.getMyAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        this.isLoading.set(false);

        // Auto-select default address ako nema već izabranog
        if (!this.selectedAddressId() && addresses.length > 0) {
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          this.selectedAddressId.set(defaultAddr.id);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('❌ Greška pri učitavanju adresa.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  goToPayment(): void {
    if (!this.selectedAddressId()) {
      this.snackBar.open('⚠️ Izaberite adresu isporuke.', 'Zatvori', { duration: 3000 });
      return;
    }

    const cart = this.cartService.cart();
    if (!cart || cart.items.length === 0) {
      this.snackBar.open('⚠️ Korpa je prazna.', 'Zatvori', { duration: 3000 });
      this.router.navigate(['/cart']);
      return;
    }

    this.isCreatingOrder.set(true);

    // 1. Kreiraj porudžbinu
    this.orderService.createOrder({ shippingAddressId: this.selectedAddressId()! }).subscribe({
      next: (order) => {
        this.createdOrder.set(order);

        // 2. Kreiraj PaymentIntent
        this.paymentService.createPaymentIntent(order.id).subscribe({
          next: (result) => {
            this.clientSecret.set(result.clientSecret);
            this.isCreatingOrder.set(false);
            this.currentStep.set('payment');
          },
          error: (err) => {
            this.isCreatingOrder.set(false);
            this.snackBar.open(`❌ ${err.error?.message || 'Greška pri pripremi plaćanja.'}`, 'Zatvori', { duration: 5000 });
          }
        });
      },
      error: (err) => {
        this.isCreatingOrder.set(false);
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri kreiranju porudžbine.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

  onPaymentSuccess(): void {
    this.snackBar.open('✅ Plaćanje uspešno! Hvala na kupovini! 🍬', 'Zatvori', { duration: 5000 });
    // Sačekaj malo da webhook ažurira status, pa preusmeri
    setTimeout(() => {
      this.router.navigate(['/orders/my']);
    }, 1500);
  }

  onPaymentError(message: string): void {
    this.snackBar.open(`❌ ${message}`, 'Zatvori', { duration: 5000 });
  }

  backToAddress(): void {
    this.currentStep.set('address');
  }

  getSelectedAddress(): ShippingAddressDetailsDto | undefined {
    return this.addresses().find(a => a.id === this.selectedAddressId());
  }
}*/

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CartService } from '../../../core/services/cart.service';
import { ShippingAddressService } from '../../../core/services/shipping-address.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { VoucherService } from '../../../core/services/voucher.service';

import { ShippingAddressDetailsDto } from '../../../core/models/shipping-address.models';
import { OrderDto } from '../../../core/models/order.models';
import { VoucherCalculationDto } from '../../../core/models/voucher.models';

import { StripePayment } from '../stripe-payment/stripe-payment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatStepperModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    StripePayment
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit {
  protected readonly cartService = inject(CartService);
  private readonly addressService = inject(ShippingAddressService);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly voucherService = inject(VoucherService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly addresses = signal<ShippingAddressDetailsDto[]>([]);
  readonly selectedAddressId = signal<number | null>(null);
  readonly isLoading = signal(true);
  readonly currentStep = signal<'address' | 'payment'>('address');
  readonly isCreatingOrder = signal(false);

  readonly createdOrder = signal<OrderDto | null>(null);
  readonly clientSecret = signal<string | null>(null);

  // Voucher
  voucherCodeInput = '';
  readonly appliedVoucher = signal<VoucherCalculationDto | null>(null);
  readonly isApplyingVoucher = signal(false);

  // Computed: konačna cena posle popusta
  readonly finalAmount = computed(() => {
    const cart = this.cartService.cart();
    if (!cart) return 0;
    const voucher = this.appliedVoucher();
    if (voucher) return voucher.finalAmount;
    return cart.totalPrice;
  });

  ngOnInit(): void {
    this.cartService.loadCart().subscribe();
    this.loadAddresses();

    const addressId = this.route.snapshot.queryParams['addressId'];
    if (addressId) {
      this.selectedAddressId.set(Number(addressId));
    }
  }

  loadAddresses(): void {
    this.isLoading.set(true);
    this.addressService.getMyAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        this.isLoading.set(false);

        if (!this.selectedAddressId() && addresses.length > 0) {
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          this.selectedAddressId.set(defaultAddr.id);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('❌ Greška pri učitavanju adresa.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  applyVoucher(): void {
    const code = this.voucherCodeInput.trim();
    if (!code) {
      this.snackBar.open('⚠️ Unesite voucher kod.', 'Zatvori', { duration: 3000 });
      return;
    }

    const cart = this.cartService.cart();
    if (!cart) return;

    this.isApplyingVoucher.set(true);
    this.voucherService.applyVoucher({
      code: code,
      orderSubtotal: cart.totalPrice
    }).subscribe({
      next: (result) => {
        this.appliedVoucher.set(result);
        this.isApplyingVoucher.set(false);
        this.snackBar.open(`✅ ${result.message || 'Voucher primenjen!'}`, 'Zatvori', { duration: 3000 });
      },
      error: (err) => {
        this.isApplyingVoucher.set(false);
        this.appliedVoucher.set(null);
        this.snackBar.open(`❌ ${err.error?.message || 'Nevažeći voucher kod.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

  removeVoucher(): void {
    this.appliedVoucher.set(null);
    this.voucherCodeInput = '';
    this.snackBar.open('Voucher uklonjen.', 'Zatvori', { duration: 2000 });
  }

  goToPayment(): void {
    if (!this.selectedAddressId()) {
      this.snackBar.open('⚠️ Izaberite adresu isporuke.', 'Zatvori', { duration: 3000 });
      return;
    }

    const cart = this.cartService.cart();
    if (!cart || cart.items.length === 0) {
      this.snackBar.open('⚠️ Korpa je prazna.', 'Zatvori', { duration: 3000 });
      this.router.navigate(['/cart']);
      return;
    }

    this.isCreatingOrder.set(true);

    // Pripremimo DTO sa voucher kodom (ako je primenjen)
    const orderDto = {
      shippingAddressId: this.selectedAddressId()!,
      voucherCode: this.appliedVoucher()?.code
    };

    this.orderService.createOrder(orderDto).subscribe({
      next: (order) => {
        this.createdOrder.set(order);

        this.paymentService.createPaymentIntent(order.id).subscribe({
          next: (result) => {
            this.clientSecret.set(result.clientSecret);
            this.isCreatingOrder.set(false);
            this.currentStep.set('payment');
          },
          error: (err) => {
            this.isCreatingOrder.set(false);
            this.snackBar.open(`❌ ${err.error?.message || 'Greška pri pripremi plaćanja.'}`, 'Zatvori', { duration: 5000 });
          }
        });
      },
      error: (err) => {
        this.isCreatingOrder.set(false);
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri kreiranju porudžbine.'}`, 'Zatvori', { duration: 5000 });
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

  backToAddress(): void {
    this.currentStep.set('address');
  }

  getSelectedAddress(): ShippingAddressDetailsDto | undefined {
    return this.addresses().find(a => a.id === this.selectedAddressId());
  }
}