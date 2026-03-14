import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ShopService, Shop } from '../../../core/services/shop.service';
import { ShopContextService } from '../../../core/services/shop-context.service';

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './seller-layout.component.html',
})
export class SellerLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private shopService = inject(ShopService);
  private contextService = inject(ShopContextService);

  shop = this.contextService.currentShop;
  shopId = this.contextService.currentShopId;
  allShops = signal<Shop[]>([]);
  
  sidebarOpen = signal(false);
  switcherOpen = signal(false);

  ngOnInit() {
    this.shopService.getSellerShops().subscribe({
      next: (shops) => this.allShops.set(shops)
    });
  }

  switchShop(id: string) {
    this.switcherOpen.set(false);
    this.contextService.navigateToShop(id, 'dashboard');
  }

  logout() {
    this.authService.logout();
  }
}
