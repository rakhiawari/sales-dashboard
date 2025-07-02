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
  {
    path: 'user',
    loadComponent: () => import('./components/manage-user/manage-user.js').then(m => m.ManageUserComponent)
  },
  {
    path: 'explore',
    loadComponent: () => import('./components/explore/explore.js').then(m => m.ExploreComponent)
  },
  {
    path: 'shop',
    loadComponent: () => import('./components/shop/shop.js').then(m => m.ShopComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat/chat.js').then(m => m.ChatComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings.js').then(m => m.SettingsComponent)
  },
  {
    path: 'help',
    loadComponent: () => import('./components/help/help.js').then(m => m.HelpComponent)
  },
  // {
  //   path: 'profile',
  //   loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  // },
  { path: '**', redirectTo: '/dashboard' }
];