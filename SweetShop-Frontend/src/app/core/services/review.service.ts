import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ReviewDto,
  CreateReviewDto,
  UpdateReviewDto
} from '../models/review.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly apiUrl = 'https://localhost:7052/api/reviews';

  constructor(private http: HttpClient) { }

  // Public
  getProductReviews(productId: number): Observable<ReviewDto[]> {
    return this.http.get<ReviewDto[]>(`${this.apiUrl}/product/${productId}`);
  }

  // Customer
  create(dto: CreateReviewDto): Observable<ReviewDto> {
    return this.http.post<ReviewDto>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateReviewDto): Observable<ReviewDto> {
    return this.http.put<ReviewDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Admin
  getPending(): Observable<ReviewDto[]> {
    return this.http.get<ReviewDto[]>(`${this.apiUrl}/pending`);
  }

  approve(id: number): Observable<ReviewDto> {
    return this.http.put<ReviewDto>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reject`, {});
  }
}