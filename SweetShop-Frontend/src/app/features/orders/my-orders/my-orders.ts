import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe, NgClass } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { OrderService } from '../../../core/services/order.service';
import { OrderDto, OrderStatus } from '../../../core/models/order.models';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    DatePipe,
    NgClass,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss'
})
export class MyOrders implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly snackBar = inject(MatSnackBar);

  readonly orders = signal<OrderDto[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('❌ Greška pri učitavanju porudžbina.', 'Zatvori', { duration: 3000 });
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

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'Pending': 'status-pending',
      'Paid': 'status-paid',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled'
    };
    return classes[status] || '';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'Pending': 'schedule',
      'Paid': 'check_circle',
      'Processing': 'inventory_2',
      'Shipped': 'local_shipping',
      'Delivered': 'done_all',
      'Cancelled': 'cancel'
    };
    return icons[status] || 'help';
  }

 
}