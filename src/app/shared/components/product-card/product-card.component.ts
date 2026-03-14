import { Component, Input, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductCardVm } from '../../../core/models/product-vm.model';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductCardVm;

  private toast = inject(ToastService);
  private router = inject(Router);

  adding = false;

  get discountPct(): number {
    if (!this.product.hasDiscount || !this.product.originalPrice) return 0;
    return Math.round(((this.product.originalPrice - this.product.finalPrice) / this.product.originalPrice) * 100);
  }

  addToCart(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.router.navigate([this.product.productUrl]);
  }
}
