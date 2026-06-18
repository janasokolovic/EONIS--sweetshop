import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { OrderService } from '../../../core/services/order.service';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    DatePipe, 
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly orderService = inject(OrderService);
  private readonly reviewService = inject(ReviewService);
  protected readonly authService = inject(AuthService);

  readonly isLoading = signal(true);

  readonly totalProducts = signal(0);
  readonly totalCategories = signal(0);
  readonly totalOrders = signal(0);
  readonly pendingReviews = signal(0);
  readonly totalRevenue = signal(0);
  readonly recentOrders = signal<any[]>([]);

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading.set(true);

    forkJoin({
      products: this.productService.getAll({ page: 1, pageSize: 1 }),
      categories: this.categoryService.getAll(),
      orders: this.orderService.getAll(1, 20),
      pendingReviews: this.reviewService.getPending()
    }).subscribe({
      next: (result) => {
        this.totalProducts.set(result.products.totalCount);
        this.totalCategories.set(result.categories.length);
        this.totalOrders.set(result.orders.totalCount);
        this.pendingReviews.set(result.pendingReviews.length);

        // Računanje ukupnog prihoda od plaćenih porudžbina
        const paidOrders = result.orders.items.filter(o => o.status !== 'Pending' && o.status !== 'Cancelled');
        const revenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        this.totalRevenue.set(revenue);

        // Poslednjih 5 porudžbina
        this.recentOrders.set(result.orders.items.slice(0, 5));

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'Pending': 'Na čekanju',
      'Paid': 'Plaćeno',
      'Processing': 'U obradi',
      'Shipped': 'Poslato',
      'Delivered': 'Isporučeno',
      'Cancelled': 'Otkazano'
    };
    return labels[status] || status;
  }
}