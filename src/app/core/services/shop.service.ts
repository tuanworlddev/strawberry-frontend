import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Shop {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  description?: string;
  contactInfo?: string;
  bankName?: string;
  accountNumber?: string;
  bankBranch?: string;
  accountHolderName?: string;
  bik?: string;
  correspondentAccount?: string;
  paymentInstructions?: string;
  productCount?: number;
  orderCount?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ShopService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/seller/shops`;

  getSellerShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(this.baseUrl);
  }

  getShopDetail(shopId: string): Observable<Shop> {
    return this.http.get<Shop>(`${this.baseUrl}/${shopId}`);
  }

  createShop(data: Partial<Shop>): Observable<Shop> {
    return this.http.post<Shop>(this.baseUrl, data);
  }

  updateShop(shopId: string, data: Partial<Shop>): Observable<Shop> {
    return this.http.put<Shop>(`${this.baseUrl}/${shopId}`, data);
  }
}
