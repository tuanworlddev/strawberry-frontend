import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { CatalogFacade } from '../catalog/catalog.facade';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/ui/spinner/loading-spinner.component';

const BANNER_SLIDES = [
  {
    gradient: 'linear-gradient(135deg, #581c87 0%, #7e22ce 60%, #a21caf 100%)',
    tag: '🎉 Exclusive Deals',
    title: 'Up to 60% off',
    subtitle: 'Top picks from our synchronized marketplace catalog — fresh arrivals every day.',
    cta: 'Shop Deals',
    pattern: 'circles',
  },
  {
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
    tag: '🚀 New Arrivals',
    title: 'Just Landed',
    subtitle: 'Fresh products imported directly from Wildberries catalog, curated for you.',
    cta: 'Browse New',
    pattern: 'dots',
  },
  {
    gradient: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #c2410c 100%)',
    tag: '⚡ Flash Sale',
    title: 'Limited Time Offers',
    subtitle: 'Grab the best deals before they sell out. Updated hourly.',
    cta: 'View All',
    pattern: 'waves',
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, LoadingSpinnerComponent, NgClass],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private catalogFacade = inject(CatalogFacade);

  products = this.catalogFacade.products;
  loading = this.catalogFacade.loading;
  totalElements = this.catalogFacade.totalElements;
  categories = this.catalogFacade.categories;

  currentPage = signal(0);
  activeCategory = signal('');
  currentSlide = 0;

  slides = BANNER_SLIDES;
  features = [
    { icon: '✅', label: 'Real-time catalog sync' },
    { icon: '🔒', label: 'Secure payments' },
    { icon: '📦', label: 'Order tracking' },
    { icon: '🚚', label: 'Fast delivery' },
    { icon: '💬', label: '24h support' },
  ];

  private pageSize = 30;
  private slideInterval?: any;

  ngOnInit(): void {
    this.catalogFacade.loadFilters();
    this.loadProducts(true);

    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 6000);
  }

  loadProducts(reset = false): void {
    const page = reset ? 0 : this.currentPage();
    this.catalogFacade.loadProducts({
      category: this.activeCategory() || undefined,
      page,
      size: this.pageSize,
      reset
    });
    if (!reset) {
      this.currentPage.set(page);
    }
  }

  hasMore() {
    return this.products().length < this.totalElements();
  }

  loadMore(): void {
    if (this.loading()) return;
    this.currentPage.set(this.currentPage() + 1);
    this.loadProducts(false);
  }

  filterCategory(name: string): void {
    if (this.activeCategory() === name) return;
    this.activeCategory.set(name);
    this.currentPage.set(0);
    this.loadProducts(true);
  }

  ngOnDestroy(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }
}
