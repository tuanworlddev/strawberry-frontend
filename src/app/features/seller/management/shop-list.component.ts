import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/shop.service';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Your Shops</h1>
            <p class="mt-2 text-slate-600">Select a shop to manage its products and orders</p>
          </div>
          <a routerLink="create" 
             class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Shop
          </a>
        </div>

        <div *ngIf="isLoading()" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <div *ngIf="!isLoading()" class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div *ngFor="let shop of shops()" 
               class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
               [routerLink]="[shop.id, 'dashboard']">
            <div class="p-6">
              <div class="flex items-center space-x-4">
                <div class="h-16 w-16 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <span *ngIf="!shop.logo" class="text-2xl font-bold">{{ shop.name.charAt(0).toUpperCase() }}</span>
                  <img *ngIf="shop.logo" [src]="shop.logo" class="h-full w-full object-cover rounded-lg" [alt]="shop.name">
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">{{ shop.name }}</h3>
                  <p class="text-sm text-slate-500">{{ shop.slug }}.strawberry.com</p>
                </div>
              </div>
              
              <div class="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div class="text-center">
                  <p class="text-2xl font-bold text-slate-900">{{ shop.productCount || 0 }}</p>
                  <p class="text-xs text-slate-500 uppercase tracking-wider uppercase font-medium">Products</p>
                </div>
                <div class="text-center border-l border-slate-100">
                  <p class="text-2xl font-bold text-slate-900">{{ shop.orderCount || 0 }}</p>
                  <p class="text-xs text-slate-500 uppercase tracking-wider uppercase font-medium">Orders</p>
                </div>
              </div>
            </div>
            <div class="bg-slate-50 px-6 py-3 flex justify-between items-center group-hover:bg-indigo-50 transition-colors">
              <span class="text-sm font-medium text-slate-600 group-hover:text-indigo-600">Manage Shop</span>
              <svg class="w-5 h-5 text-slate-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <div *ngIf="!isLoading() && shops().length === 0" class="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-slate-900">No shops found</h3>
          <p class="mt-1 text-sm text-slate-500">Get started by creating your first shop.</p>
          <div class="mt-6">
            <a routerLink="create" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Create New Shop
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ShopListComponent implements OnInit {
  private shopService = inject(ShopService);
  
  shops = signal<Shop[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.shopService.getSellerShops().subscribe({
      next: (data) => {
        this.shops.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
