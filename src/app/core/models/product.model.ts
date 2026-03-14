/**
 * Mirrors backend ProductResponseDto (catalog list endpoint).
 * Used for product grids, search results, and catalog pages.
 */
export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  brand?: string;
  categoryId?: number;
  categoryName?: string;
  minPrice: number;
  /** discountPrice — the lowest discounted price across variants (nullable if no discount) */
  discountPrice?: number;
  mainImage?: string;
  inStock: boolean;
  shopName?: string;
  shopSlug?: string;
  wbNmId?: number;
}

/**
 * Mirrors backend ProductDetailResponseDto nested VariantDto.
 */
export interface ProductVariant {
  id: string;
  techSize: string;
  wbSize: string;
  basePrice: number;
  discountPrice?: number;
  stockQuantity: number;
  inStock: boolean;
}

/**
 * Mirrors backend ProductDetailResponseDto nested CategoryDto.
 */
export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

/**
 * Mirrors backend ProductDetailResponseDto nested ShopDto.
 */
export interface ProductShop {
  id: string;
  name: string;
  slug: string;
}

/**
 * Mirrors backend ProductDetailResponseDto (product detail page).
 */
export interface ProductDetail {
  id: string;
  slug: string;
  title: string;
  description?: string;
  brand?: string;
  category?: ProductCategory;
  shop?: ProductShop;
  images?: string[];
  characteristics?: { name: string; value: string }[];
  variants: ProductVariant[];
  wbNmId?: number;
  reviewCount?: number;
  averageRate?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface FilterSuggestions {
  categories: string[];
  brands: string[];
}
