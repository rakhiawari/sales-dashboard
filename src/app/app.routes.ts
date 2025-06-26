// import { Routes } from '@angular/router';
// import { DashboardComponent } from './components/dashboard/dashboard.js';

// export const routes: Routes = [
//   { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
//   { path: 'dashboard', component: DashboardComponent },
//   { path: '**', redirectTo: '/dashboard' }
// ];


import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.js').then(m => m.DashboardComponent)
  },
  // {
  //   path: 'analytics',
  //   loadComponent: () => import('./components/analytics/analytics.js').then(m => m.AnalyticsComponent)
  // },
  {
    path: 'explore',
    loadComponent: () => import('./components/explore/explore.js').then(m => m.ExploreComponent)
  },
  // {
  //   path: 'shop',
  //   loadChildren: () => import('./components/shop/shop.routes').then(m => m.shopRoutes)
  // },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat/chat.js').then(m => m.ChatComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings.js').then(m => m.SettingsComponent)
  },
  // {
  //   path: 'help',
  //   loadComponent: () => import('./pages/help/help.component').then(m => m.HelpComponent)
  // },
  // {
  //   path: 'profile',
  //   loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  // },
  { path: '**', redirectTo: '/dashboard' }
];