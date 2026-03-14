import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/layout/navbar/navbar.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/auth/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  ngOnInit(): void {
    // Pre-load cart if authenticated
    if (this.authService.isLoggedIn()) {
      this.cartService.load().subscribe({ error: () => {} });
    }
  }
}
