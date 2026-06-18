import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  protected readonly authService = inject(AuthService);
  protected readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  // Broj stavki u korpi (signal koji prati promene)
  protected readonly cartItemCount = computed(() => {
    const cart = this.cartService.cart();
    return cart?.totalItems ?? 0;
  });

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}