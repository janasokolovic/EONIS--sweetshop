import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ShippingAddressService } from '../../../core/services/shipping-address.service';
import { ShippingAddressDetailsDto, CreateShippingAddressDto, UpdateShippingAddressDto } from '../../../core/models/shipping-address.models';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './addresses.html',
  styleUrl: './addresses.scss'
})
export class Addresses implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly addressService = inject(ShippingAddressService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly addresses = signal<ShippingAddressDetailsDto[]>([]);
  readonly isLoading = signal(true);
  readonly showForm = signal(false);
  readonly editingAddress = signal<ShippingAddressDetailsDto | null>(null);
  readonly isSubmitting = signal(false);

  // Da li je korisnik došao sa checkout-a (returnUrl)
  returnUrl: string | null = null;

  readonly addressForm: FormGroup = this.fb.group({
    recipientName: ['', [Validators.required, Validators.maxLength(200)]],
    street: ['', [Validators.required, Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    postalCode: ['', [Validators.required, Validators.maxLength(20)]],
    country: ['Srbija', [Validators.required, Validators.maxLength(100)]],
    phoneNumber: ['', [Validators.maxLength(20)]],
    isDefault: [false]
  });

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.isLoading.set(true);
    this.addressService.getMyAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('❌ Greška pri učitavanju adresa.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  openAddForm(): void {
    this.editingAddress.set(null);
    this.addressForm.reset({ country: 'Srbija', isDefault: this.addresses().length === 0 });
    this.showForm.set(true);
  }

  openEditForm(address: ShippingAddressDetailsDto): void {
    this.editingAddress.set(address);
    this.addressForm.patchValue(address);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingAddress.set(null);
  }

  submitForm(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.addressForm.value;
    const editing = this.editingAddress();

    if (editing) {
      // Edit
      this.addressService.update(editing.id, formValue as UpdateShippingAddressDto).subscribe({
        next: () => {
          this.snackBar.open('✅ Adresa ažurirana!', 'Zatvori', { duration: 3000 });
          this.isSubmitting.set(false);
          this.closeForm();
          this.loadAddresses();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.snackBar.open(`❌ ${err.error?.message || 'Greška.'}`, 'Zatvori', { duration: 5000 });
        }
      });
    } else {
      // Create
      this.addressService.create(formValue as CreateShippingAddressDto).subscribe({
        next: () => {
          this.snackBar.open('✅ Adresa dodata!', 'Zatvori', { duration: 3000 });
          this.isSubmitting.set(false);
          this.closeForm();
          this.loadAddresses();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.snackBar.open(`❌ ${err.error?.message || 'Greška.'}`, 'Zatvori', { duration: 5000 });
        }
      });
    }
  }

  deleteAddress(address: ShippingAddressDetailsDto): void {
    if (!confirm(`Da li ste sigurni da želite da obrišete adresu "${address.street}, ${address.city}"?`)) return;

    this.addressService.delete(address.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Adresa obrisana.', 'Zatvori', { duration: 3000 });
        this.loadAddresses();
      },
      error: (err) => {
        this.snackBar.open(`❌ ${err.error?.message || 'Greška.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

  selectAndReturn(address: ShippingAddressDetailsDto): void {
    // Ako je došao sa checkout-a, vrati se sa odabranom adresom
    if (this.returnUrl) {
      this.router.navigate([this.returnUrl], { queryParams: { addressId: address.id } });
    }
  }
}