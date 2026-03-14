import { Injectable, inject, signal } from '@angular/core';
import { SellerOrderApiService } from '../../../core/api/seller-order-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ShopContextService } from '../../../core/services/shop-context.service';
import { PaymentDetail } from '../../../core/api/seller-order-api.service';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SellerPaymentFacade {
  private api = inject(SellerOrderApiService);
  private toast = inject(ToastService);
  private context = inject(ShopContextService);

  pendingPayments = signal<PaymentDetail[]>([]);
  loading = signal<boolean>(false);
  processingId = signal<string | null>(null);

  loadPendingPayments() {
    const shopId = this.context.currentShopId();
    if (!shopId) return;

    this.loading.set(true);
    this.api.getShopPayments(shopId).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => this.pendingPayments.set(res),
      error: () => this.toast.error('Failed to load pending payments')
    });
  }

  approve(orderId: string) {
    const shopId = this.context.currentShopId();
    if (!shopId) return;

    this.processingId.set(orderId);
    this.api.approvePayment(shopId, orderId).pipe(
      finalize(() => this.processingId.set(null))
    ).subscribe({
      next: () => {
        this.toast.success('Payment approved successfully');
        this.pendingPayments.update(list => list.filter(o => o.orderId !== orderId));
      },
      error: () => this.toast.error('Failed to approve payment')
    });
  }

  reject(orderId: string) {
    const shopId = this.context.currentShopId();
    if (!shopId) return;

    this.processingId.set(orderId);
    this.api.rejectPayment(shopId, orderId).pipe(
      finalize(() => this.processingId.set(null))
    ).subscribe({
      next: () => {
        this.toast.success('Payment rejected');
        this.pendingPayments.update(list => list.filter(o => o.orderId !== orderId));
      },
      error: () => this.toast.error('Failed to reject payment')
    });
  }
}
