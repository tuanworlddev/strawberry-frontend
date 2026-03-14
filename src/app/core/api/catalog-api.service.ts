import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FilterSuggestions, PageResponse, ProductDetailResponseDto, ProductResponseDto } from '../models/product-dto.model';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/public/catalog`;

  getProducts(params: {
    search?: string;
    categoryId?: number;
    shopSlug?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
    page?: number;
    size?: number;
  }): Observable<PageResponse<ProductResponseDto>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<PageResponse<ProductResponseDto>>(`${this.base}/products`, { params: httpParams });
  }

  getProductBySlug(slug: string): Observable<ProductDetailResponseDto> {
    return this.http.get<ProductDetailResponseDto>(`${this.base}/products/${slug}`);
  }

  getFilters(): Observable<FilterSuggestions> {
    return this.http.get<FilterSuggestions>(`${this.base}/filters`);
  }
}
