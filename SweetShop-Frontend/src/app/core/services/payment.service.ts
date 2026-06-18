import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StripePaymentIntentResult } from '../models/payment.models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = 'https://localhost:7052/api/payments';

  constructor(private http: HttpClient) { }

  createPaymentIntent(orderId: number): Observable<StripePaymentIntentResult> {
    return this.http.post<StripePaymentIntentResult>(
      `${this.apiUrl}/create-intent/${orderId}`,
      {}
    );
  }
}