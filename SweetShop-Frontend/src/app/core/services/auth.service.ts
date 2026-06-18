import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { LoginDto, RegisterDto, AuthResponseDto, UserDto } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'https://localhost:7052/api/auth';
  private readonly tokenKey = 'sweetshop_token';
  private readonly userKey = 'sweetshop_user';

  // Signali - moderni način za reactive state u Angular-u (umesto BehaviorSubject)
  private readonly _currentUser = signal<UserDto | null>(this.getUserFromStorage());

  // Public read-only signali
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'Admin');
  readonly isCustomer = computed(() => this._currentUser()?.role === 'Customer');

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  register(dto: RegisterDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/register`, dto).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  login(dto: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, dto).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/me`);
  }

  // ============= PRIVATE =============

  private handleAuthSuccess(response: AuthResponseDto): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this._currentUser.set(response.user);
  }

  private getUserFromStorage(): UserDto | null {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }
}