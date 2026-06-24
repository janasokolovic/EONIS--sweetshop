import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CustomerService } from '../../../core/services/customer.service';
import { CustomerDto } from '../../../core/models/customer.models';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './admin-customers.html',
  styleUrl: './admin-customers.scss'
})
export class AdminCustomers implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly snackBar = inject(MatSnackBar);

  readonly customers = signal<CustomerDto[]>([]);
  readonly isLoading = signal(true);

  displayedColumns = ['id', 'name', 'email', 'phone', 'createdAt', 'actions'];
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadCustomers();

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => this.loadCustomers());
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.customerService.getAll(this.searchControl.value || undefined).subscribe({
      next: (data) => {
        this.customers.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Greška pri učitavanju kupaca.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  deleteCustomer(customer: CustomerDto): void {
    if (!confirm(`Da li ste sigurni da želite da obrišete kupca "${customer.firstName} ${customer.lastName}"?`)) return;

    this.customerService.delete(customer.id).subscribe({
      next: () => {
        this.snackBar.open('Kupac obrisan.', 'Zatvori', { duration: 3000 });
        this.loadCustomers();
      },
      error: (err) => {
        this.snackBar.open(`Greška: ${err.error?.message || 'Brisanje nije uspelo.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }
}
