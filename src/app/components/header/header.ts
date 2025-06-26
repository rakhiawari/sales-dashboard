import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.js';
import { DataService } from '../../services/data.js';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  private readonly dataService = inject(DataService);

  // Component state
  readonly showSearch = signal(false);
  readonly showNotifications = signal(false);
  readonly showUserMenu = signal(false);
  readonly searchQuery = signal('');

  // Data from service
  readonly notifications = this.dataService.notifications;
  readonly unreadCount = this.dataService.unreadNotifications;

  toggleSearch(): void {
    this.showSearch.update(show => !show);
    this.showNotifications.set(false);
    this.showUserMenu.set(false);
  }

  hideSearch(): void {
    setTimeout(() => this.showSearch.set(false), 150);
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    this.searchQuery.set(query);
    this.dataService.updateSearch(query);
  }

  toggleNotifications(): void {
    this.showNotifications.update(show => !show);
    this.showSearch.set(false);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(show => !show);
    this.showSearch.set(false);
    this.showNotifications.set(false);
  }

  markAsRead(id: string): void {
    this.dataService.markNotificationAsRead(id);
  }

  markAllAsRead(): void {
    this.dataService.markAllNotificationsAsRead();
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
}