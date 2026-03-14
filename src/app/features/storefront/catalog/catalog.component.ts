import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { CatalogFacade } from './catalog.facade';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/ui/spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ReactiveFormsModule, ProductCardComponent, LoadingSpinnerComponent, EmptyStateComponent, NgClass],
  templateUrl: './catalog.component.html',
})
export class CatalogComponent implements OnInit, OnDestroy {
  private catalogFacade = inject(CatalogFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  products = this.catalogFacade.products;
  filters = this.catalogFacade.categories;
  loading = this.catalogFacade.loading;
  totalElements = this.catalogFacade.totalElements;
  totalPages = this.catalogFacade.totalPages;

  currentPage = signal(0);
  selectedCategory = signal('');
  inStockOnly = signal(false);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);

  searchControl = new FormControl('');

  pageRange() {
    const total = this.totalPages();
    const current = this.currentPage();
    const start = Math.max(0, current - 2);
    const end = Math.min(total, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  ngOnInit(): void {
    this.catalogFacade.loadFilters();

    this.searchControl.valueChanges.pipe(
      debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$)
    ).subscribe(() => { this.currentPage.set(0); this.loadProducts(); });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(p => {
      if (p['search']) this.searchControl.setValue(p['search'], { emitEvent: false });
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.catalogFacade.loadProducts({
      search: this.searchControl.value ?? undefined,
      category: this.selectedCategory() || undefined,
      // the api currently does not take minPrice/maxPrice/inStock in the facade, we will pass them if supported.
      page: this.currentPage(),
      size: 20,
      reset: true
    });
  }

  setCategory(id: string): void { this.selectedCategory.set(id); this.currentPage.set(0); this.loadProducts(); }
  onStockFilter(e: Event): void { this.inStockOnly.set((e.target as HTMLInputElement).checked); this.currentPage.set(0); this.loadProducts(); }
  setMinPrice(e: Event): void { this.minPrice.set(Number((e.target as HTMLInputElement).value) || null); this.currentPage.set(0); this.loadProducts(); }
  setMaxPrice(e: Event): void { this.maxPrice.set(Number((e.target as HTMLInputElement).value) || null); this.currentPage.set(0); this.loadProducts(); }
  setPage(p: number): void { this.currentPage.set(p); this.loadProducts(); }
  clearFilters(): void {
    this.searchControl.setValue('');
    this.selectedCategory.set('');
    this.inStockOnly.set(false);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.currentPage.set(0);
    this.loadProducts();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
