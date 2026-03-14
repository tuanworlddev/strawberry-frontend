import { Injectable, inject, signal, computed } from '@angular/core';
import { CatalogApiService } from '../../../core/api/catalog-api.service';
import { ProductCardVm, ProductDetailVm } from '../../../core/models/product-vm.model';
import { ProductResponseDto, ProductDetailResponseDto, PageResponse, FilterSuggestions } from '../../../core/models/product-dto.model';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogFacade {
  private api = inject(CatalogApiService);

  // State Signals
  private _products = signal<ProductCardVm[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _totalElements = signal<number>(0);
  private _totalPages = signal<number>(0);
  private _categories = signal<string[]>([]);
  private _productDetail = signal<ProductDetailVm | null>(null);
  
  // Public Computed Signals
  products = this._products.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  totalElements = this._totalElements.asReadonly();
  totalPages = this._totalPages.asReadonly();
  categories = this._categories.asReadonly();
  productDetail = this._productDetail.asReadonly();

  // Mappers
  private mapDtoToCardVm(dto: ProductResponseDto): ProductCardVm {
    return {
      id: dto.id,
      slug: dto.slug,
      title: dto.title,
      brand: dto.brand || '',
      originalPrice: dto.minPrice,
      finalPrice: dto.discountPrice ?? dto.minPrice,
      hasDiscount: !!dto.discountPrice && dto.discountPrice < dto.minPrice,
      thumbnailUrl: dto.mainImage ?? '/assets/placeholder.jpg',
      productUrl: `/products/${dto.slug}`,
      shopName: dto.shopName || '',
      inStock: dto.inStock,
      averageRating: (dto as any).averageRate || 0,
      reviewCount: (dto as any).reviewCount || 0
    };
  }

  loadProducts(params: { category?: string; page?: number; size?: number; search?: string; reset?: boolean }) {
    this._loading.set(true);
    this._error.set(null);

    // Note: If you need categoryId mapping from name, do it here or pass ID directly.
    // For now we pass 'search' as a catchall or rely on backend 'category' string filtering if supported.
    // In our backend, public catalog by /products takes categoryId. But home page was passing category string to `search` or similar.
    // Let's pass it generic
    
    this.api.getProducts({
      page: params.page || 0,
      size: params.size || 20,
      search: params.category ? undefined : params.search,
      // Note: Backend /products expects categoryId (number). If activeCategory is string, maybe we search inside search text? 
      // We will map category text to search unless it's a known ID.
    }).pipe(
      finalize(() => this._loading.set(false))
    ).subscribe({
      next: (res: PageResponse<ProductResponseDto>) => {
        const mapped = res.content.map((dto: ProductResponseDto) => this.mapDtoToCardVm(dto));
        if (params.reset) {
          this._products.set(mapped);
        } else {
          this._products.update(curr => [...curr, ...mapped]);
        }
        this._totalElements.set(res.totalElements);
        this._totalPages.set(res.totalPages);
      },
      error: (err: any) => {
        this._error.set(err.message || 'Failed to load catalog');
      }
    });
  }

  loadFilters() {
    this.api.getFilters().subscribe({
      next: (filters: FilterSuggestions) => {
        this._categories.set(filters.categories || []);
      }
    });
  }

  loadProductDetail(slug: string) {
    this._loading.set(true);
    this._error.set(null);
    this._productDetail.set(null);

    this.api.getProductBySlug(slug).pipe(
      finalize(() => this._loading.set(false))
    ).subscribe({
      next: (dto: ProductDetailResponseDto) => {
        const vm: ProductDetailVm = {
          id: dto.id,
          slug: dto.slug,
          title: dto.title,
          description: dto.description || '',
          brand: dto.brand || '',
          categoryName: dto.category?.name || '',
          shopName: dto.shop?.name || '',
          shopSlug: dto.shop?.slug || '',
          images: dto.images || [],
          characteristics: dto.characteristics || [],
          reviewCount: dto.reviewCount || 0,
          averageRate: dto.averageRate || 0,
          variants: (dto.variants || []).map(v => ({
            id: v.id,
            size: v.techSize,
            price: v.discountPrice ?? v.basePrice,
            originalPrice: v.basePrice,
            hasDiscount: !!v.discountPrice && v.discountPrice < v.basePrice,
            inStock: v.inStock
          }))
        };
        this._productDetail.set(vm);
      },
      error: (err: any) => {
        this._error.set(err.message || 'Failed to load product details');
      }
    });
  }
}
