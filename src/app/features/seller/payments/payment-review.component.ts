import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { SellerPaymentFacade } from './seller-payment.facade';
import { TableWrapperComponent } from '../shared/table/table-wrapper.component';
import { Button } from '../../../shared/ui/button/button';

import { LoadingSpinnerComponent } from '../../../shared/ui/spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-seller-payment-review',
  standalone: true,
  imports: [CommonModule, TableWrapperComponent, LoadingSpinnerComponent, EmptyStateComponent],
  providers: [CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">Payment Review</h1>
          <p class="text-gray-500">Review proofs, approve, or reject pending customer payments.</p>
        </div>
      </div>

      <app-table-wrapper>
        <thead>
          <tr>
            <th scope="col">Order & Date</th>
            <th scope="col">Customer</th>
            <th scope="col">Amount Due</th>
            <th scope="col">Status</th>
            <th scope="col" class="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          @if (facade.loading()) {
            <tr>
              <td colspan="5">
                <app-loading-spinner></app-loading-spinner>
              </td>
            </tr>
          } @else if (facade.pendingPayments().length === 0) {
            <tr>
              <td colspan="5">
                <app-empty-state 
                  title="All caught up!" 
                  description="No pending payments require your review at this time.">
                  <svg icon class="w-12 h-12 relative z-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </app-empty-state>
              </td>
            </tr>
          } @else {
            @for (payment of facade.pendingPayments(); track payment.orderId) {
              <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="whitespace-nowrap">
                   <div class="font-bold text-gray-900">#{{ payment.orderNumber }}</div>
                   <div class="text-xs text-gray-500">{{ payment.submittedAt | date:'short' }}</div>
                </td>
                <td class="whitespace-nowrap">
                   <div class="text-sm font-medium text-gray-900">{{ payment.payerName || payment.customerName || 'Guest' }}</div>
                   @if (payment.payerName) {
                      <div class="text-[10px] text-gray-400 uppercase tracking-tighter">Payer: {{ payment.payerName }}</div>
                   }
                </td>
                <td class="whitespace-nowrap">
                   <div class="font-bold text-gray-900">{{ payment.transferAmount | currency:'RUB':'symbol-narrow':'1.0-0' }}</div>
                   <div class="text-[10px] text-gray-400">Total: {{ payment.orderTotal | currency:'RUB':'symbol-narrow':'1.0-0' }}</div>
                </td>
                <td class="whitespace-nowrap">
                   @if (payment.receiptImageUrl) {
                      <a [href]="payment.receiptImageUrl" target="_blank" class="block w-10 h-10 rounded border border-gray-200 overflow-hidden hover:border-purple-500 transition-colors">
                         <img [src]="payment.receiptImageUrl" class="w-full h-full object-cover" alt="Receipt">
                      </a>
                   } @else {
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-tight uppercase tracking-widest bg-yellow-100 text-yellow-800 border-yellow-200 border">
                        {{ payment.paymentStatus }}
                      </span>
                   }
                </td>
                <td class="whitespace-nowrap text-right space-x-2">
                   <button 
                     [disabled]="facade.processingId() === payment.orderId"
                     (click)="reject(payment.orderId)" 
                     class="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                     Reject
                   </button>
                   <button 
                     [disabled]="facade.processingId() === payment.orderId"
                     (click)="approve(payment.orderId)" 
                     class="text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                     Approve
                   </button>
                </td>
              </tr>
            }
          }
        </tbody>
      </app-table-wrapper>
    </div>
  `
})
export class PaymentReviewComponent implements OnInit {
  facade = inject(SellerPaymentFacade);

  ngOnInit() {
    this.facade.loadPendingPayments();
  }

  approve(orderId: string) {
    if (confirm('Are you sure you want to approve this payment? The order will proceed to fulfillment.')) {
      this.facade.approve(orderId);
    }
  }

  reject(orderId: string) {
    if (confirm('Are you sure you want to reject this payment? The customer will be requested to pay again.')) {
      this.facade.reject(orderId);
    }
  }
}
