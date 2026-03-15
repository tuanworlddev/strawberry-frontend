import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SellerShipmentFacade } from './seller-shipment.facade';
import { TableWrapperComponent } from '../shared/table/table-wrapper.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ToastService } from '../../../core/services/toast.service';
import { DeliveryIssueStatus, ShipmentStatus } from '../../../core/models/shipping.model';

@Component({
  selector: 'app-seller-shipment-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableWrapperComponent, BadgeComponent],
  providers: [DatePipe],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Shipment Manager</h1>
        <p class="text-gray-500">Create tracking numbers and update shipment delivery statuses.</p>
      </div>

      <!-- Create Shipment Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Create New Shipment</h2>
        <form [formGroup]="shipForm" (ngSubmit)="createShipment()" class="flex flex-col sm:flex-row gap-4 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
            <input formControlName="orderId" type="text" placeholder="Paste the order UUID..."
              class="block w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Carrier *</label>
            <input formControlName="carrier" type="text" placeholder="e.g., CDEK, Russian Post..."
              class="block w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
            <input formControlName="trackingNumber" type="text" placeholder="Optional tracking ID"
              class="block w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <button type="submit" [disabled]="shipForm.invalid"
            class="px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors">
            Ship Order
          </button>
        </form>
      </div>

      <!-- Shipments Table -->
      <app-table-wrapper>
        <thead>
          <tr>
            <th scope="col">Shipment ID</th>
            <th scope="col">Order ID</th>
            <th scope="col">Carrier & Tracking</th>
            <th scope="col">Status</th>
            <th scope="col">Created</th>
            <th scope="col">Update Status</th>
          </tr>
        </thead>
        <tbody>
          @if (facade.loading()) {
            <tr>
              <td colspan="6" class="text-center py-12">
                <span class="w-8 h-8 rounded-full border-4 border-gray-200 border-t-purple-600 animate-spin inline-block"></span>
              </td>
            </tr>
          } @else if (facade.shipments().length === 0) {
            <tr>
              <td colspan="6" class="text-center py-16 text-gray-500">
                <p class="text-lg font-medium text-gray-900">No shipments yet</p>
                <p>Create a shipment above for an order in "Assembling" status.</p>
              </td>
            </tr>
          } @else {
            @for (ship of facade.shipments(); track ship.id) {
              <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="whitespace-nowrap text-xs font-mono text-gray-500">{{ ship.id | slice:0:8 }}...</td>
                <td class="whitespace-nowrap text-xs font-mono text-gray-500">{{ ship.orderId | slice:0:8 }}...</td>
                <td class="whitespace-nowrap">
                  <div class="font-medium text-gray-900">{{ ship.carrier }}</div>
                  <div class="text-xs text-gray-500">{{ ship.trackingNumber || 'No tracking #' }}</div>
                </td>
                <td class="whitespace-nowrap">
                  <app-badge [variant]="getStatusVariant(ship.shipmentStatus)">{{ ship.shipmentStatus }}</app-badge>
                </td>
                <td class="whitespace-nowrap text-sm text-gray-500">{{ ship.createdAt | date:'shortDate' }}</td>
                <td class="whitespace-nowrap">
                  <select (change)="onUpdateStatus(ship.id, $event)"
                    [disabled]="facade.updatingShipmentId() === ship.id"
                    class="block w-full border border-gray-200 rounded-md py-1.5 px-2 text-sm bg-gray-50 focus:bg-white">
                    <option value="" disabled selected>Update...</option>
                    <option *ngIf="ship.shipmentStatus === 'CREATED'" value="PICKED_UP">Mark Picked Up</option>
                    <option *ngIf="ship.shipmentStatus === 'PICKED_UP'" value="IN_TRANSIT">Mark In Transit</option>
                    <option *ngIf="ship.shipmentStatus === 'IN_TRANSIT'" value="DELIVERED">Mark Delivered</option>
                    <option value="FAILED">Mark Failed</option>
                  </select>
                </td>
              </tr>
            }
          }
        </tbody>
      </app-table-wrapper>
    </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Customer Delivery Issues</h2>
            <p class="text-sm text-gray-500">Cases where customers reported that a delivered order was not actually received.</p>
          </div>
          <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
            {{ facade.deliveryIssues().length }} cases
          </span>
        </div>

        @if (facade.deliveryIssues().length === 0) {
          <div class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
            No delivery issues have been reported by customers yet.
          </div>
        } @else {
          <div class="space-y-3">
            @for (issue of facade.deliveryIssues(); track issue.id) {
              <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div class="space-y-1">
                    <p class="font-bold text-gray-900">{{ issue.orderNumber }} · {{ issue.customerName }}</p>
                    <p class="text-sm text-gray-500">
                      {{ issue.customerEmail || 'No email' }} · {{ issue.customerPhone || 'No phone' }}
                    </p>
                    <p class="text-sm text-gray-500">
                      Reported {{ issue.createdAt | date:'medium' }}
                    </p>
                    <p class="text-sm text-gray-600">
                      Shipment: {{ issue.carrier || '—' }} / {{ issue.trackingNumber || 'No tracking number' }}
                    </p>
                    @if (issue.customerNote) {
                      <p class="mt-2 text-sm text-gray-700">Customer note: {{ issue.customerNote }}</p>
                    }
                  </div>

                  <div class="flex flex-col gap-2 lg:items-end">
                    <app-badge [variant]="getIssueVariant(issue.status)">{{ issue.status }}</app-badge>
                    <select
                      (change)="onUpdateIssueStatus(issue.id, $event)"
                      [disabled]="facade.updatingIssueId() === issue.id"
                      class="block w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm"
                    >
                      <option value="" disabled selected>Update issue...</option>
                      <option *ngIf="issue.status === 'OPEN'" value="IN_REVIEW">Mark In Review</option>
                      <option *ngIf="issue.status !== 'RESOLVED'" value="RESOLVED">Mark Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
  `
})
export class ShipmentManagerComponent implements OnInit {
  facade = inject(SellerShipmentFacade);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  shipForm = this.fb.group({
    orderId: ['', Validators.required],
    carrier: ['', Validators.required],
    trackingNumber: ['']
  });

  ngOnInit() {
    this.facade.loadShipments();
  }

  createShipment() {
    if (this.shipForm.invalid) return;
    const { orderId, carrier, trackingNumber } = this.shipForm.value;
    this.facade.createShipment(orderId!, { carrier: carrier!, trackingNumber: trackingNumber || undefined }).subscribe({
      next: () => {
        this.toast.success('Shipment created and order marked as SHIPPING.');
        this.shipForm.reset();
        this.facade.loadShipments();
      },
      error: () => this.toast.error('Failed to create shipment. Check the Order ID and status.')
    });
  }

  onUpdateStatus(shipmentId: string, event: Event) {
    const val = (event.target as HTMLSelectElement).value as ShipmentStatus;
    if (val) this.facade.updateShipmentStatus(shipmentId, val);
  }

  onUpdateIssueStatus(issueId: string, event: Event) {
    const val = (event.target as HTMLSelectElement).value as DeliveryIssueStatus;
    if (val) this.facade.updateDeliveryIssueStatus(issueId, val);
  }

  getStatusVariant(status: string) {
    switch (status) {
      case 'CREATED': return 'gray' as const;
      case 'PICKED_UP': return 'yellow' as const;
      case 'IN_TRANSIT': return 'purple' as const;
      case 'DELIVERED': return 'green' as const;
      case 'FAILED': return 'red' as const;
      default: return 'gray' as const;
    }
  }

  getIssueVariant(status: DeliveryIssueStatus) {
    switch (status) {
      case 'OPEN': return 'red' as const;
      case 'IN_REVIEW': return 'yellow' as const;
      case 'RESOLVED': return 'green' as const;
      default: return 'gray' as const;
    }
  }
}
