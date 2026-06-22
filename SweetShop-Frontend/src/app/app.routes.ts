import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list').then(m => m.ProductList)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-details/product-details').then(m => m.ProductDetails)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart/cart').then(m => m.Cart),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'addresses',
    loadComponent: () => import('./features/orders/addresses/addresses').then(m => m.Addresses),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout/checkout').then(m => m.Checkout),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)]
  },
     {
  path: 'checkout/pay/:id',
  loadComponent: () => import('./features/checkout/pay-order/pay-order').then(m => m.PayOrder),
  canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)]
},
  {
    path: 'orders/my',
    loadComponent: () => import('./features/orders/my-orders/my-orders').then(m => m.MyOrders),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [() => import('./core/guards/admin.guard').then(m => m.adminGuard)],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/admin-products/admin-products').then(m => m.AdminProducts)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/admin-categories/admin-categories').then(m => m.AdminCategories)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/admin-orders/admin-orders').then(m => m.AdminOrders)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./features/admin/admin-reviews/admin-reviews').then(m => m.AdminReviews)
      },
   
      {
  path: 'vouchers',
  loadComponent: () => import('./features/admin/admin-vouchers/admin-vouchers').then(m => m.AdminVouchers)
}
    ]
  },
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/products'
  }
];