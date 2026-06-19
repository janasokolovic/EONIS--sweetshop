import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  PagedResult
} from '../models/product.models';

export interface ProductSearchParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
  categoryId?: number;
  includeInactive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'https://localhost:7052/api/products';

  constructor(private http: HttpClient) { }

  getAll(params?: ProductSearchParams): Observable<PagedResult<ProductDto>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDescending !== undefined) httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
      if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId.toString());
      if (params.includeInactive) httpParams = httpParams.set('includeInactive', 'true');
    }

    return this.http.get<PagedResult<ProductDto>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateProductDto): Observable<ProductDto> {
    return this.http.post<ProductDto>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateProductDto): Observable<ProductDto> {
    return this.http.put<ProductDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}