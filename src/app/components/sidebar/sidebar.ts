import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { icon: '🏠', label: 'Home', route: '/dashboard', active: true },
    { icon: '📊', label: 'Analytics', route: '/analytics' },
    { icon: '🔍', label: 'Explore', route: '/explore' },
    { icon: '🛒', label: 'Shop', route: '/shop' },
    { icon: '💬', label: 'Chat', route: '/chat' }
  ];

  toolItems: NavItem[] = [
    { icon: '⚙️', label: 'Settings', route: '/settings' },
    { icon: '❓', label: 'Help', route: '/help' },
    { icon: '👤', label: 'Manage user', route: '/user' }
  ];
}