import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-payment-confirm',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './payment-confirm.component.html',
})
export class PaymentConfirmComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private router = inject(Router);

  orderId = signal('');
  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  submitted = signal(false);
  error = signal('');


  ngOnInit(): void {
    this.orderId.set(this.route.snapshot.paramMap.get('orderId') ?? '');
  }

  onFileChange(e: Event): void {
    const files = (e.target as HTMLInputElement).files;
    if (files?.length) this.selectedFile.set(files[0]);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files?.length) this.selectedFile.set(files[0]);
  }

  submit(): void {
    const file = this.selectedFile();
    if (!file) return;
    this.uploading.set(true);
    this.error.set('');

    this.orderService.uploadPaymentConfirmation(this.orderId(), file).subscribe({
      next: () => {
        this.submitted.set(true);
        this.toast.success('Receipt submitted successfully!');
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Upload failed. Please try again.');
        this.uploading.set(false);
      }
    });
  }
}
