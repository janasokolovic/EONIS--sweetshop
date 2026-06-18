import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto
} from '../models/category.models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = 'https://localhost:7052/api/categories';

  constructor(private http: HttpClient) { }

  getAll(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.apiUrl);
  }

  getById(id: number): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateCategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateCategoryDto): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}