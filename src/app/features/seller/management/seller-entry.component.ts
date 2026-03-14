import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ShopService } from '../../../core/services/shop.service';

@Component({
  selector: 'app-seller-entry',
  standalone: true,
  template: `
    <div class="flex items-center justify-center min-h-screen bg-slate-50">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  `
})
export class SellerEntryComponent implements OnInit {
  private shopService = inject(ShopService);
  private router = inject(Router);

  ngOnInit() {
    this.shopService.getSellerShops().subscribe({
      next: (shops) => {
        if (shops.length === 0) {
          this.router.navigate(['/seller/shops/create']);
        } else if (shops.length === 1) {
          this.router.navigate(['/seller/shops', shops[0].id, 'dashboard']);
        } else {
          this.router.navigate(['/seller/shops']);
        }
      },
      error: () => {
        // Fallback to shops list or login
        this.router.navigate(['/seller/shops']);
      }
    });
  }
}
