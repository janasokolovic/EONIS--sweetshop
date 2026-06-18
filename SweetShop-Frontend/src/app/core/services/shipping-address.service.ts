import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ShippingAddressDetailsDto,
  CreateShippingAddressDto,
  UpdateShippingAddressDto
} from '../models/shipping-address.models';

@Injectable({
  providedIn: 'root'
})
export class ShippingAddressService {
  private readonly apiUrl = 'https://localhost:7052/api/shipping-addresses';

  constructor(private http: HttpClient) { }

  getMyAddresses(): Observable<ShippingAddressDetailsDto[]> {
    return this.http.get<ShippingAddressDetailsDto[]>(this.apiUrl);
  }

  getById(id: number): Observable<ShippingAddressDetailsDto> {
    return this.http.get<ShippingAddressDetailsDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateShippingAddressDto): Observable<ShippingAddressDetailsDto> {
    return this.http.post<ShippingAddressDetailsDto>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateShippingAddressDto): Observable<ShippingAddressDetailsDto> {
    return this.http.put<ShippingAddressDetailsDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}