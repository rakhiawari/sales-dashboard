import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.js';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-table.html',
  styleUrls: ['./product-table.scss']
})
export class ProductTableComponent {
  readonly dataService = inject(DataService);
  readonly products = this.dataService.products;
  
  readonly editingProduct = signal<string | null>(null);
  readonly isExporting = signal(false);

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.dataService.updateCategory(target.value);
  }

  sort(column: 'name' | 'sales' | 'stock' | 'price'): void {
    this.dataService.updateSort(column);
  }

  getSortIcon(column: string): string {
    if (this.dataService.sortBy() !== column) return '↕️';
    return this.dataService.sortDirection() === 'asc' ? '↑' : '↓';
  }

  editProduct(id: string): void {
    this.editingProduct.set(id);
  }

  saveEdit(id: string, field: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    // Simulate API call to update product
    this.dataService.updateProduct(id, { [field]: value }).subscribe(() => {
      this.editingProduct.set(null);
      this.dataService.addNotification({
        type: 'success',
        title: 'Product Updated',
        message: `Product ${field} has been updated successfully`,
        read: false
      });
    });
  }

  viewProduct(id: string): void {
    // Navigate to product details or open modal
    console.log('Viewing product:', id);
    this.dataService.addNotification({
      type: 'info',
      title: 'Product Viewed',
      message: `Opened product details for ID: ${id}`,
      read: false
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.dataService.deleteProduct(id).subscribe(() => {
        this.dataService.addNotification({
          type: 'warning',
          title: 'Product Deleted',
          message: 'Product has been removed from inventory',
          read: false
        });
      });
    }
  }

  addProduct(): void {
    console.log('Adding new product');
    this.dataService.addNotification({
      type: 'info',
      title: 'Add Product',
      message: 'Opening add product form...',
      read: false
    });
  }

  exportData(): void {
    this.isExporting.set(true);
    this.dataService.exportData('csv').subscribe((filename) => {
      this.isExporting.set(false);
      this.dataService.addNotification({
        type: 'success',
        title: 'Export Complete',
        message: `Data exported as ${filename}`,
        read: false
      });
    });
  }

  getStars(rating: number): ('full' | 'empty')[] {
    const stars: ('full' | 'empty')[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'full' : 'empty');
    }
    return stars;
  }
}