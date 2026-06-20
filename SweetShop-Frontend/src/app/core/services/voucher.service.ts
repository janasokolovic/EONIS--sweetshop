import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  VoucherDto,
  CreateVoucherDto,
  UpdateVoucherDto,
  ApplyVoucherDto,
  VoucherCalculationDto
} from '../models/voucher.models';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private readonly apiUrl = 'https://localhost:7052/api/vouchers';

  constructor(private http: HttpClient) {}

  // Admin
  getAll(): Observable<VoucherDto[]> {
    return this.http.get<VoucherDto[]>(this.apiUrl);
  }

  getById(id: number): Observable<VoucherDto> {
    return this.http.get<VoucherDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateVoucherDto): Observable<VoucherDto> {
    return this.http.post<VoucherDto>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateVoucherDto): Observable<VoucherDto> {
    return this.http.put<VoucherDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Customer
  applyVoucher(dto: ApplyVoucherDto): Observable<VoucherCalculationDto> {
    return this.http.post<VoucherCalculationDto>(`${this.apiUrl}/apply`, dto);
  }
}