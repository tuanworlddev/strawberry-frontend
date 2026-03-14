import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { SellerOrderFacade } from './seller-order.facade';
import { TableWrapperComponent } from '../shared/table/table-wrapper.component';
import { FilterBarComponent } from '../shared/table/filter-bar.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge';

import { LoadingSpinnerComponent } from '../../../shared/ui/spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-seller-orders-list',
  standalone: true,
  imports: [CommonModule, TableWrapperComponent, FilterBarComponent, BadgeComponent, LoadingSpinnerComponent, EmptyStateComponent],
  providers: [CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">Orders Fulfillments</h1>
          <p class="text-gray-500">Track and update customer order fulfillment statuses.</p>
        </div>
      </div>

      <app-filter-bar placeholder="Search by order number (coming soon)...">
        <select class="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-xl bg-white focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          (change)="onStatusFilterChange($event)">
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="ASSEMBLING">Assembling</option>
          <option value="SHIPPING">Shipping</option>
          <option value="DELIVERED">Delivered</option>
          <option value="RETURNED">Returned</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </app-filter-bar>

      <app-table-wrapper>
        <thead>
          <tr>
            <th scope="col">Order & Date</th>
            <th scope="col">Items</th>
            <th scope="col">Amount</th>
            <th scope="col">Fulfillment State</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          @if (facade.loading()) {
            <tr>
              <td colspan="5">
                <app-loading-spinner></app-loading-spinner>
              </td>
            </tr>
          } @else if (facade.orders().length === 0) {
            <tr>
              <td colspan="5">
                <app-empty-state 
                  title="No orders found" 
                  description="Enjoy your break! No fulfillment tasks require your attention right now.">
                </app-empty-state>
              </td>
            </tr>
          } @else {
            @for (order of facade.orders(); track order.id) {
              <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="whitespace-nowrap">
                   <div class="font-bold text-gray-900">#{{ order.orderNumber }}</div>
                   <div class="text-xs text-gray-500">{{ order.createdAt | date:'mediumDate' }}</div>
                </td>
                <td class="whitespace-nowrap">
                   <div class="text-sm font-medium text-gray-900">{{ order.items.length }} Items</div>
                   <div class="text-xs text-gray-500 max-w-[200px] truncate">
                     {{ order.items[0]?.productTitleSnapshot }} <span *ngIf="order.items.length > 1">and more...</span>
                   </div>
                </td>
                <td class="whitespace-nowrap font-bold text-gray-900">
                   {{ order.totalAmount | currency:'RUB':'symbol-narrow':'1.0-0' }}
                </td>
                <td class="whitespace-nowrap">
                  <app-badge [variant]="getStatusVariant(order.status)">
                    {{ order.status }}
                  </app-badge>
                  <div *ngIf="order.paymentStatus !== 'APPROVED'" class="text-[10px] text-yellow-600 mt-1">
                    (Payment: {{ order.paymentStatus }})
                  </div>
                </td>
                 <td class="whitespace-nowrap">
                   <!-- Only seller-owned transitions allowed here.
                        SHIPPING is set automatically by shipment creation.
                        DELIVERED is set automatically when shipment status becomes DELIVERED.
                        The seller must use the Shipments page to progress those states. -->
                   @if (order.status === 'NEW') {
                     <select
                       class="block w-full border border-gray-200 rounded-md py-1.5 px-2 text-sm bg-gray-50 focus:bg-white"
                       [disabled]="facade.updatingStatusId() === order.id"
                       (change)="onStatusChange(order.id, $event)"
                     >
                       <option value="" disabled selected>Update...</option>
                       <option value="ASSEMBLING">Start Assembling</option>
                       <option value="CANCELLED">Cancel Order</option>
                     </select>
                   } @else if (order.status === 'ASSEMBLING') {
                     <div class="space-y-1">
                       <span class="text-xs text-gray-400 block">Go to <strong>Shipments</strong> to dispatch</span>
                       <button (click)="cancelFromAssembling(order.id)"
                         [disabled]="facade.updatingStatusId() === order.id"
                         class="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50">
                         Cancel Order
                       </button>
                     </div>
                   } @else if (order.status === 'SHIPPING') {
                     <span class="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-md">
                       <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                       </svg>
                       In transit — update via Shipments
                     </span>
                   } @else {
                     <span class="text-xs text-gray-400">—</span>
                   }
                 </td>
              </tr>
            }
          }
        </tbody>
      </app-table-wrapper>
    </div>
  `
})
export class OrdersListComponent implements OnInit {
  facade = inject(SellerOrderFacade);

  ngOnInit() {
    this.facade.loadOrders();
  }

  onStatusFilterChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.facade.setFilterStatus(val || undefined);
  }

  onStatusChange(orderId: string, event: Event) {
    const el = event.target as HTMLSelectElement;
    const newStatus = el.value;
    if (newStatus) {
      if (confirm(`Are you sure you want to change order status to ${newStatus}?`)) {
        this.facade.updateStatus(orderId, newStatus);
      } else {
        el.value = ""; // Reset visually
      }
    }
  }

  cancelFromAssembling(orderId: string) {
    if (confirm('Cancel this order while it is assembling? This cannot be undone.')) {
      this.facade.updateStatus(orderId, 'CANCELLED');
    }
  }

  getStatusVariant(status: string) {
    switch (status) {
      case 'NEW': return 'gray';
      case 'ASSEMBLING': return 'yellow';
      case 'SHIPPING': return 'purple';
      case 'DELIVERED': return 'green';
      case 'RETURNED': 
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  }
}
