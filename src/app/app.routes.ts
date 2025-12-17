import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'accounts',
    loadComponent: () => import('./pages/accounts/accounts').then((m) => m.Accounts),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'deals',
    loadComponent: () => import('./pages/deals/deals').then((m) => m.DealsComponent),
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories').then((m) => m.CategoriesComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.CartComponent),
  },
];
