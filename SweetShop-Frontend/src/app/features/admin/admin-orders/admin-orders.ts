import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe, NgClass } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

import { OrderService } from '../../../core/services/order.service';
import { OrderDto, OrderStatus } from '../../../core/models/order.models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    DatePipe,
    NgClass,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatExpansionModule,
    MatDividerModule
  ],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss'
})
export class AdminOrders implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly snackBar = inject(MatSnackBar);

  readonly orders = signal<OrderDto[]>([]);
  readonly isLoading = signal(true);
  readonly totalCount = signal(0);
  readonly updatingOrderId = signal<number | null>(null);
  readonly expandedOrderId = signal<number | null>(null);

  // Filteri
  page = 1;
  pageSize = 10;
  searchControl = new FormControl('');
  statusFilter: string | null = null;

  // Status enum vrednosti za update
  readonly OrderStatusValue = OrderStatus;

  ngOnInit(): void {
    this.loadOrders();

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.loadOrders();
    });
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.orderService.getAll(this.page, this.pageSize, this.searchControl.value || undefined).subscribe({
      next: (result) => {
        let items = result.items;
        // Frontend filtriranje po statusu (backend nema status filter)
        if (this.statusFilter) {
          items = items.filter(o => o.status === this.statusFilter);
        }
        this.orders.set(items);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('❌ Greška pri učitavanju porudžbina.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  onStatusFilterChange(value: string | null): void {
    this.statusFilter = value;
    this.page = 1;
    this.loadOrders();
  }

  updateStatus(order: OrderDto, newStatus: OrderStatus): void {
    this.updatingOrderId.set(order.id);
    this.orderService.updateStatus(order.id, { status: newStatus }).subscribe({
      next: () => {
        this.updatingOrderId.set(null);
        this.snackBar.open('✅ Status ažuriran!', 'Zatvori', { duration: 3000 });
        this.loadOrders();
      },
      error: (err) => {
        this.updatingOrderId.set(null);
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri ažuriranju.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

  toggleExpand(orderId: number): void {
    this.expandedOrderId.set(this.expandedOrderId() === orderId ? null : orderId);
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

  // Koji status admin može da postavi za datu trenutnu vrednost
  getAvailableStatuses(currentStatus: string): { value: OrderStatus, label: string, icon: string }[] {
    const all = [
      { value: OrderStatus.Processing, label: 'U obradi', icon: 'inventory_2' },
      { value: OrderStatus.Shipped, label: 'Poslato', icon: 'local_shipping' },
      { value: OrderStatus.Delivered, label: 'Isporučeno', icon: 'done_all' },
      { value: OrderStatus.Cancelled, label: 'Otkazano', icon: 'cancel' }
    ];

    // Filtriraj na osnovu trenutnog statusa - ne dozvoljavamo nazad u Pending/Paid
    if (currentStatus === 'Pending') {
      return [
        { value: OrderStatus.Cancelled, label: 'Otkazano', icon: 'cancel' }
      ];
    }
    if (currentStatus === 'Paid') {
      return all.filter(s => s.value !== OrderStatus.Delivered);
    }
    if (currentStatus === 'Processing') {
      return all.filter(s => s.value === OrderStatus.Shipped || s.value === OrderStatus.Cancelled);
    }
    if (currentStatus === 'Shipped') {
      return all.filter(s => s.value === OrderStatus.Delivered);
    }
    // Delivered i Cancelled su final
    return [];
  }
}