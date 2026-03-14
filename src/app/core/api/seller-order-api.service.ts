import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';

export interface PaymentDetail {
  orderId: string;
  orderNumber: string;
  customerName: string;
  paymentStatus: string;
  transferAmount: number;
  transferTime: string;
  receiptImageUrl: string;
  submittedAt: string;
  orderTotal: number;
  payerName: string;
}

@Injectable({ providedIn: 'root' })
export class SellerOrderApiService {
  private http = inject(HttpClient);
  private getBaseUrl(shopId: string) {
    return `${environment.apiUrl}/api/v1/seller/shops/${shopId}`;
  }

  getShopOrders(shopId: string, status?: string, paymentStatus?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (paymentStatus) params = params.set('paymentStatus', paymentStatus);

    return this.http.get<Order[]>(`${this.getBaseUrl(shopId)}/orders`, { params });
  }

  getShopPayments(shopId: string): Observable<PaymentDetail[]> {
    return this.http.get<PaymentDetail[]>(`${this.getBaseUrl(shopId)}/payments`);
  }

  getOrderDetails(shopId: string, orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.getBaseUrl(shopId)}/${orderId}`);
  }

  approvePayment(shopId: string, orderId: string): Observable<Order> {
    return this.http.post<Order>(`${this.getBaseUrl(shopId)}/${orderId}/payment/approve`, {});
  }

  rejectPayment(shopId: string, orderId: string): Observable<Order> {
    return this.http.post<Order>(`${this.getBaseUrl(shopId)}/${orderId}/payment/reject`, {});
  }

  updateFulfillmentStatus(shopId: string, orderId: string, newStatus: string): Observable<Order> {
    let params = new HttpParams().set('newStatus', newStatus);
    return this.http.put<Order>(`${this.getBaseUrl(shopId)}/${orderId}/status`, null, { params });
  }
}
