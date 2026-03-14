import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckoutRequest, Order, Tracking } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/customer`;

  checkout(req: CheckoutRequest) {
    return this.http.post<Order[]>(`${this.base}/orders/checkout`, req);
  }

  getOrders() {
    return this.http.get<Order[]>(`${this.base}/orders`);
  }

  getOrder(id: string) {
    return this.http.get<Order>(`${this.base}/orders/${id}`);
  }

  uploadPaymentConfirmation(orderId: string, file: File) {
    const form = new FormData();
    form.append('receipt', file);
    return this.http.post<void>(`${this.base}/orders/${orderId}/payment-confirmation`, form);
  }

  getTracking(orderId: string) {
    return this.http.get<Tracking>(`${this.base}/orders/${orderId}/tracking`);
  }
}
