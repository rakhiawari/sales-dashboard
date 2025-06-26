import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.js';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss'
})
export class CustomerListComponent {
  private readonly dataService = inject(DataService);
  readonly customers = this.dataService.customers;

  onCustomerClick(customer: any): void {
    console.log('Customer clicked:', customer);
    this.dataService.addNotification({
      type: 'info',
      title: 'Customer Profile',
      message: `Viewing profile for ${customer.name}`,
      read: false
    });
  }

  viewAllCustomers(event: Event): void {
    event.preventDefault();
    this.dataService.addNotification({
      type: 'info',
      title: 'All Customers',
      message: 'Opening customer management page',
      read: false
    });
  }

  contactCustomer(event: Event, customer: any): void {
    event.stopPropagation();
    this.dataService.addNotification({
      type: 'success',
      title: 'Contact Customer',
      message: `Starting conversation with ${customer.name}`,
      read: false
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/avatars/default.svg'; // Fallback image
  }
}