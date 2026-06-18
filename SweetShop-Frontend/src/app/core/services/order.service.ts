import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  OrderDto,
  CreateOrderDto,
  UpdateOrderStatusDto
} from '../models/order.models';
import { PagedResult } from '../models/product.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'https://localhost:7052/api/orders';

  constructor(private http: HttpClient) { }

  // Customer
  createOrder(dto: CreateOrderDto): Observable<OrderDto> {
    return this.http.post<OrderDto>(this.apiUrl, dto);
  }

  getMyOrders(): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(`${this.apiUrl}/my`);
  }

  getById(id: number): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.apiUrl}/${id}`);
  }

  // Admin
  getAll(page = 1, pageSize = 10, searchTerm?: string): Observable<PagedResult<OrderDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<PagedResult<OrderDto>>(this.apiUrl, { params });
  }

  updateStatus(id: number, dto: UpdateOrderStatusDto): Observable<OrderDto> {
    return this.http.put<OrderDto>(`${this.apiUrl}/${id}/status`, dto);
  }
}