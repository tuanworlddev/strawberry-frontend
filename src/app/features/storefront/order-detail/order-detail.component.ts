import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { LoadingSpinnerComponent } from '../../../shared/ui/spinner/loading-spinner.component';
import { Order, OrderStatus, PaymentStatus, Tracking } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgClass, DatePipe, LoadingSpinnerComponent],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  tracking = signal<Tracking | null>(null);
  loading = signal(true);
  trackingLoading = signal(false);

  itemsTotal() {
    return this.order()?.items.reduce((acc, i) => acc + i.priceAtPurchase * i.quantity, 0) ?? 0;
  }

  formatAttrs(attrs: string | undefined) {
    return attrs ?? '';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderService.getOrder(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
        if (o.status === 'SHIPPING' || o.status === 'DELIVERED') {
          this.loadTracking(o.id);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  loadTracking(orderId: string): void {
    this.trackingLoading.set(true);
    this.orderService.getTracking(orderId).subscribe({
      next: (t) => { this.tracking.set(t); this.trackingLoading.set(false); },
      error: () => this.trackingLoading.set(false)
    });
  }

  orderStatusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      NEW: 'badge-purple', ASSEMBLING: 'badge-yellow',
      SHIPPING: 'badge-yellow', DELIVERED: 'badge-green', CANCELLED: 'badge-red'
    };
    return map[status] ?? 'badge-gray';
  }

  paymentStatusClass(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      PENDING: 'badge-gray', WAITING_CONFIRMATION: 'badge-yellow',
      APPROVED: 'badge-green', REJECTED: 'badge-red', REFUNDED: 'badge-gray'
    };
    return map[status] ?? 'badge-gray';
  }

  trackingBadge(status?: string): string {
    if (!status) return 'badge-gray';
    if (status === 'DELIVERED') return 'badge-green';
    if (status === 'IN_TRANSIT' || status === 'PICKED_UP') return 'badge-yellow';
    return 'badge-purple';
  }
}
