import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsCardComponent } from '../metrics-card/metrics-card.js';
import { EarningsChartComponent } from '../earnings-chart/earnings-chart.js';
import { CountryListComponent } from '../country-list/country-list.js';
import { CustomerListComponent } from '../customer-list/customer-list.js';
import { ProductTableComponent } from '../product-table/product-table.js';
import { RecentOrdersComponent } from '../recent-orders/recent-orders.js';
import { DataService } from '../../services/data.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MetricsCardComponent,
    EarningsChartComponent,
    CountryListComponent,
    CustomerListComponent,
    ProductTableComponent,
    RecentOrdersComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {
  readonly dataService = inject(DataService);
  
  // Component state
  readonly isRefreshing = signal(false);
  readonly hasUpdates = signal(false);
  readonly updateCount = signal(0);
  
  // Data from service
  readonly metrics = this.dataService.metrics;

  // Simulate real-time updates
  constructor() {
    // Simulate periodic updates
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of update
        this.hasUpdates.set(true);
        this.updateCount.update(count => count + 1);
      }
    }, 30000); // Every 30 seconds
  }

  formatChange(change: number): string {
    return `${change >= 0 ? '+' : ''}${change}%`;
  }

  onMetricClick(metric: 'customers' | 'revenue' | 'orders'): void {
    console.log(`Clicked ${metric} metric`);
    this.dataService.addNotification({
      type: 'info',
      title: 'Metric Details',
      message: `Viewing detailed ${metric} analytics`,
      read: false
    });
  }

  addOrder(): void {
    this.dataService.addNotification({
      type: 'success',
      title: 'New Order',
      message: 'Order creation form opened',
      read: false
    });
  }

  addCustomer(): void {
    this.dataService.addNotification({
      type: 'info',
      title: 'Add Customer',
      message: 'Customer registration form opened',
      read: false
    });
  }

  generateReport(): void {
    this.dataService.addNotification({
      type: 'info',
      title: 'Report Generation',
      message: 'Starting report generation...',
      read: false
    });
  }

  refreshData(): void {
    this.isRefreshing.set(true);
    this.dataService.refreshData().subscribe(() => {
      this.isRefreshing.set(false);
      this.dataService.addNotification({
        type: 'success',
        title: 'Data Refreshed',
        message: 'All dashboard data has been updated',
        read: false
      });
    });
  }

  applyUpdates(): void {
    this.hasUpdates.set(false);
    this.updateCount.set(0);
    this.dataService.addNotification({
      type: 'success',
      title: 'Updates Applied',
      message: 'All pending updates have been applied',
      read: false
    });
  }

  dismissUpdates(): void {
    this.hasUpdates.set(false);
    this.updateCount.set(0);
  }
}