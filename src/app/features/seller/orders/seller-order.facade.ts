import { Injectable, inject, signal } from '@angular/core';
import { SellerOrderApiService } from '../../../core/api/seller-order-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ShopContextService } from '../../../core/services/shop-context.service';
import { Order } from '../../../core/models/order.model';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SellerOrderFacade {
  private api = inject(SellerOrderApiService);
  private toast = inject(ToastService);
  private context = inject(ShopContextService);

  orders = signal<Order[]>([]);
  loading = signal<boolean>(false);
  updatingStatusId = signal<string | null>(null);

  filterStatus = signal<string | undefined>(undefined);

  loadOrders() {
    const shopId = this.context.currentShopId();
    if (!shopId) return;

    this.loading.set(true);
    this.api.getShopOrders(shopId, this.filterStatus(), undefined).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => this.orders.set(res),
      error: () => this.toast.error('Failed to load seller orders')
    });
  }

  setFilterStatus(status: string | undefined) {
    this.filterStatus.set(status);
    this.loadOrders();
  }

  updateStatus(orderId: string, newStatus: string) {
    const shopId = this.context.currentShopId();
    if (!shopId) return;

    this.updatingStatusId.set(orderId);
    this.api.updateFulfillmentStatus(shopId, orderId, newStatus).pipe(
      finalize(() => this.updatingStatusId.set(null))
    ).subscribe({
      next: (updatedOrder) => {
        this.toast.success(`Order ${updatedOrder.orderNumber} status updated to ${newStatus}`);
        this.orders.update(orders => 
          orders.map(o => o.id === orderId ? updatedOrder : o)
        );
      },
      error: () => this.toast.error('Failed to update order status')
    });
  }
}
