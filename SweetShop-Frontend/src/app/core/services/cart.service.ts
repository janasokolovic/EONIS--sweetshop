import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import {
  CartDto,
  AddToCartDto,
  UpdateCartItemDto
} from '../models/cart.models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly apiUrl = 'https://localhost:7052/api/cart';

  // Signal za trenutnu korpu - reactive state
  private readonly _cart = signal<CartDto | null>(null);
  readonly cart = this._cart.asReadonly();

  constructor(private http: HttpClient) { }

  loadCart(): Observable<CartDto> {
    return this.http.get<CartDto>(this.apiUrl).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  addItem(dto: AddToCartDto): Observable<CartDto> {
    return this.http.post<CartDto>(`${this.apiUrl}/items`, dto).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  updateItem(itemId: number, dto: UpdateCartItemDto): Observable<CartDto> {
    return this.http.put<CartDto>(`${this.apiUrl}/items/${itemId}`, dto).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  removeItem(itemId: number): Observable<CartDto> {
    return this.http.delete<CartDto>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => this._cart.set(null))
    );
  }

  // Reset state nakon porudžbine
  resetCart(): void {
    this._cart.set(null);
  }
}