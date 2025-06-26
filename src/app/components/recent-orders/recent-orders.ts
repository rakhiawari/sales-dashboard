import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.js';

@Component({
  selector: 'app-recent-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-orders.html',
  styleUrls: ['./recent-orders.scss']
})
export class RecentOrdersComponent {
  private readonly dataService = inject(DataService);
  readonly orders = this.dataService.orders;

  onOrderClick(order: any): void {
    console.log('Order clicked:', order);
    this.dataService.addNotification({
      type: 'info',
      title: 'Order Details',
      message: `Viewing order ${order.id}`,
      read: false
    });
  }

  viewAllOrders(event: Event): void {
    event.preventDefault();
    this.dataService.addNotification({
      type: 'info',
      title: 'All Orders',
      message: 'Opening orders management page',
      read: false
    });
  }

  updateOrderStatus(event: Event, order: any): void {
    event.stopPropagation();
    
    const newStatus = order.status === 'pending' ? 'completed' : 'pending';
    
    this.dataService.updateOrderStatus(order.id, newStatus).subscribe(() => {
      this.dataService.addNotification({
        type: 'success',
        title: 'Order Updated',
        message: `Order ${order.id} status changed to ${newStatus}`,
        read: false
      });
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/products/default.svg'; // Fallback image
  }
}