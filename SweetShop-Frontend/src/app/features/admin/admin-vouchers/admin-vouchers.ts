import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe, NgClass } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';

import { VoucherService } from '../../../core/services/voucher.service';
import { VoucherDto, CreateVoucherDto, UpdateVoucherDto } from '../../../core/models/voucher.models';

@Component({
  selector: 'app-admin-vouchers',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    DatePipe,
    NgClass,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule
  ],
  templateUrl: './admin-vouchers.html',
  styleUrl: './admin-vouchers.scss'
})
export class AdminVouchers implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly voucherService = inject(VoucherService);
  private readonly snackBar = inject(MatSnackBar);

  readonly vouchers = signal<VoucherDto[]>([]);
  readonly isLoading = signal(true);
  readonly showForm = signal(false);
  readonly editingVoucher = signal<VoucherDto | null>(null);
  readonly isSubmitting = signal(false);

  readonly voucherForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(500)]],
    isPercentage: [true, [Validators.required]],
    discountValue: [10, [Validators.required, Validators.min(0.01)]],
    validFrom: [new Date(), [Validators.required]],
    validUntil: [this.getDefaultEndDate(), [Validators.required]],
    minOrderAmount: [null],
    maxUsageCount: [null],
    isActive: [true]
  });

  ngOnInit(): void {
    this.loadVouchers();
  }

  getDefaultEndDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 1); // mesec dana ubuduće
    return date;
  }

  loadVouchers(): void {
    this.isLoading.set(true);
    this.voucherService.getAll().subscribe({
      next: (vouchers) => {
        this.vouchers.set(vouchers);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('❌ Greška pri učitavanju voucher-a.', 'Zatvori', { duration: 3000 });
      }
    });
  }

  openAddForm(): void {
    this.editingVoucher.set(null);
    this.voucherForm.reset({
      code: '',
      description: '',
      isPercentage: true,
      discountValue: 10,
      validFrom: new Date(),
      validUntil: this.getDefaultEndDate(),
      minOrderAmount: null,
      maxUsageCount: null,
      isActive: true
    });
    this.showForm.set(true);
    this.scrollToTop();
  }

  openEditForm(voucher: VoucherDto): void {
    this.editingVoucher.set(voucher);
    this.voucherForm.patchValue({
      code: voucher.code,
      description: voucher.description || '',
      isPercentage: voucher.isPercentage,
      discountValue: voucher.discountValue,
      validFrom: new Date(voucher.validFrom),
      validUntil: new Date(voucher.validUntil),
      minOrderAmount: voucher.minOrderAmount,
      maxUsageCount: voucher.maxUsageCount,
      isActive: voucher.isActive
    });
    this.showForm.set(true);
    this.scrollToTop();
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingVoucher.set(null);
  }

  submitForm(): void {
    if (this.voucherForm.invalid) {
      this.voucherForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.voucherForm.value;
    const editing = this.editingVoucher();

    const baseDto = {
      code: formValue.code.trim().toUpperCase(),
      description: formValue.description || undefined,
      isPercentage: formValue.isPercentage,
      discountValue: Number(formValue.discountValue),
      validFrom: new Date(formValue.validFrom).toISOString(),
      validUntil: new Date(formValue.validUntil).toISOString(),
      minOrderAmount: formValue.minOrderAmount ? Number(formValue.minOrderAmount) : undefined,
      maxUsageCount: formValue.maxUsageCount ? Number(formValue.maxUsageCount) : undefined,
      isActive: formValue.isActive
    };

    if (editing) {
      this.voucherService.update(editing.id, baseDto as UpdateVoucherDto).subscribe({
        next: () => {
          this.snackBar.open('✅ Voucher ažuriran!', 'Zatvori', { duration: 3000 });
          this.isSubmitting.set(false);
          this.closeForm();
          this.loadVouchers();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.snackBar.open(`❌ ${err.error?.message || 'Greška pri ažuriranju.'}`, 'Zatvori', { duration: 5000 });
        }
      });
    } else {
      this.voucherService.create(baseDto as CreateVoucherDto).subscribe({
        next: () => {
          this.snackBar.open('✅ Voucher dodat!', 'Zatvori', { duration: 3000 });
          this.isSubmitting.set(false);
          this.closeForm();
          this.loadVouchers();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.snackBar.open(`❌ ${err.error?.message || 'Greška pri dodavanju.'}`, 'Zatvori', { duration: 5000 });
        }
      });
    }
  }

  deleteVoucher(voucher: VoucherDto): void {
    if (!confirm(`Da li ste sigurni da želite da obrišete voucher "${voucher.code}"?`)) return;

    this.voucherService.delete(voucher.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Voucher obrisan.', 'Zatvori', { duration: 3000 });
        this.loadVouchers();
      },
      error: (err) => {
        this.snackBar.open(`❌ ${err.error?.message || 'Greška pri brisanju.'}`, 'Zatvori', { duration: 5000 });
      }
    });
  }

  getStatusClass(voucher: VoucherDto): string {
    if (!voucher.isActive) return 'status-inactive';
    if (voucher.isExpired) return 'status-expired';
    if (voucher.isUsageLimitReached) return 'status-limit-reached';
    return 'status-active';
  }

  getStatusLabel(voucher: VoucherDto): string {
    if (!voucher.isActive) return 'Neaktivan';
    if (voucher.isExpired) return 'Istekao';
    if (voucher.isUsageLimitReached) return 'Iskorišćen';
    return 'Aktivan';
  }

  private scrollToTop(): void {
    setTimeout(() => {
      const selectors = [
        '.admin-content',
        '.mat-sidenav-content',
        '.mat-drawer-content'
      ];
      for (const selector of selectors) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          element.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }
}