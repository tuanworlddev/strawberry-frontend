import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FilterSuggestions, PageResponse, ProductDetail, ProductSummary } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/public/catalog`;

  search(params: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    size?: number;
  }) {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.minPrice != null) httpParams = httpParams.set('minPrice', params.minPrice);
    if (params.maxPrice != null) httpParams = httpParams.set('maxPrice', params.maxPrice);
    if (params.inStock != null) httpParams = httpParams.set('inStock', String(params.inStock));
    if (params.page != null) httpParams = httpParams.set('page', params.page);
    if (params.size != null) httpParams = httpParams.set('size', params.size);
    return this.http.get<PageResponse<ProductSummary>>(`${this.base}/search`, { params: httpParams });
  }

  getBySlug(slug: string) {
    return this.http.get<ProductDetail>(`${this.base}/products/${slug}`);
  }

  getFilters() {
    return this.http.get<FilterSuggestions>(`${this.base}/filters`);
  }
}
