import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerDto } from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly apiUrl = 'https://localhost:7052/api/customers';
  private readonly http = inject(HttpClient);

  getAll(search?: string): Observable<CustomerDto[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<CustomerDto[]>(this.apiUrl, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
