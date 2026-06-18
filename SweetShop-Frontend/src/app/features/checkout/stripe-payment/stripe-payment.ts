import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject, signal } from '@angular/core';
import { Stripe, StripeElements, StripePaymentElement, loadStripe } from '@stripe/stripe-js';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// ⚠️ ZAMENI sa svojim Stripe Publishable Key-om iz appsettings.json!
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TfkFEGs6BqccVMBmncKBdkSDkLcmKMQa9X616eh4sKjXPWVEgkab4QkVhFWJdG5tTmO1DtLXEpyySt0mUpMyLVR00acZQdM5O';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './stripe-payment.html',
  styleUrl: './stripe-payment.scss'
})
export class StripePayment implements OnInit {
  @Input({ required: true }) clientSecret!: string;
  @Output() paymentSuccess = new EventEmitter<void>();
  @Output() paymentError = new EventEmitter<string>();

  @ViewChild('paymentElement', { static: true }) paymentElementRef!: ElementRef;

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;

  readonly isLoading = signal(true);
  readonly isProcessing = signal(false);
  readonly errorMessage = signal('');

  async ngOnInit(): Promise<void> {
    try {
      // Učitaj Stripe.js
      this.stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      if (!this.stripe) {
        this.errorMessage.set('Stripe nije mogao da se učita.');
        this.isLoading.set(false);
        return;
      }

      // Kreiraj Elements sa client secret-om
      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#FF6B9D',
            colorBackground: '#ffffff',
            colorText: '#3D2817',
            borderRadius: '8px'
          }
        }
      });

      // Mount payment element
      this.paymentElement = this.elements.create('payment');
      this.paymentElement.mount(this.paymentElementRef.nativeElement);
      this.paymentElement.on('ready', () => this.isLoading.set(false));
    } catch (error) {
      console.error('Stripe init error:', error);
      this.errorMessage.set('Greška pri inicijalizaciji plaćanja.');
      this.isLoading.set(false);
    }
  }

  async submitPayment(): Promise<void> {
    if (!this.stripe || !this.elements) {
      this.errorMessage.set('Stripe nije spreman.');
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.origin + '/orders/my'
      },
      redirect: 'if_required'
    });

    if (error) {
      this.isProcessing.set(false);
      this.errorMessage.set(error.message || 'Greška pri plaćanju.');
      this.paymentError.emit(error.message || 'Greška pri plaćanju.');
    } else {
      // Plaćanje uspešno (bez redirect-a) - webhook na backend-u će ažurirati status
      this.paymentSuccess.emit();
    }
  }
}