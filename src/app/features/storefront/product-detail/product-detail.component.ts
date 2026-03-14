import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { CatalogFacade } from '../catalog/catalog.facade';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/ui/spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ProductVariantVm } from '../../../core/models/product-vm.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgClass, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogFacade = inject(CatalogFacade);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  product = this.catalogFacade.productDetail;
  loading = this.catalogFacade.loading;
  
  selectedVariant = signal<ProductVariantVm | null>(null);
  activeImage = signal<string | null>(null);
  addingToCart = signal(false);

  allImages() {
    const p = this.product();
    if (!p) return [];
    return p.images || [];
  }

  constructor() {
    effect(() => {
      const p = this.product();
      if (p) {
        const firstActive = p.variants?.find(v => v.inStock) ?? p.variants?.[0] ?? null;
        this.selectedVariant.set(firstActive);
        
        const imgs = p.images || [];
        this.activeImage.set(imgs[0] ?? null);
      }
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.catalogFacade.loadProductDetail(slug);
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const v = this.selectedVariant();
    if (!v) return;
    
    this.addingToCart.set(true);
    // Passing amount=1
    this.cartService.addItem(v.id, 1).subscribe({
      next: () => {
        this.toast.success('Added to bag!');
        this.addingToCart.set(false);
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Failed to add to bag');
        this.addingToCart.set(false);
      }
    });
  }
}
