import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface ExploreCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  itemCount: number;
  trending: boolean;
}

interface TrendingItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  views: number;
  likes: number;
  author: string;
  publishedDate: Date;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.html',
  styleUrls: ['./explore.scss']
})
export class ExploreComponent {
  private readonly router = inject(Router);

  // State
  searchQuery = '';
  categoryView = signal<'grid' | 'list'>('grid');
  trendingFilter = signal<'all' | 'today' | 'week' | 'month'>('all');

  // Mock data
  readonly categories = signal<ExploreCategory[]>([
    {
      id: 'products',
      name: 'Products',
      icon: '📦',
      description: 'Browse our product catalog',
      itemCount: 1250,
      trending: true
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: '👥',
      description: 'Customer insights and analytics',
      itemCount: 3200,
      trending: false
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: '🛒',
      description: 'Order management and tracking',
      itemCount: 5670,
      trending: true
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: '📊',
      description: 'Business intelligence reports',
      itemCount: 180,
      trending: false
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: '📢',
      description: 'Marketing campaigns and tools',
      itemCount: 450,
      trending: true
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: '📋',
      description: 'Stock management and tracking',
      itemCount: 890,
      trending: false
    }
  ]);

  readonly trendingItems = signal<TrendingItem[]>([
    {
      id: 'trend-1',
      title: 'AI-Powered Customer Insights',
      description: 'Revolutionary analytics for understanding customer behavior',
      image: 'assets/images/trending/ai-insights.svg',
      category: 'Analytics',
      views: 15420,
      likes: 892,
      author: 'Sarah Chen',
      publishedDate: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      id: 'trend-2',
      title: 'Sustainable Packaging Solutions',
      description: 'Eco-friendly packaging options for modern businesses',
      image: 'assets/images/trending/packaging.svg',
      category: 'Sustainability',
      views: 12300,
      likes: 654,
      author: 'Mike Johnson',
      publishedDate: new Date(Date.now() - 172800000) // 2 days ago
    },
    {
      id: 'trend-3',
      title: 'Mobile Commerce Trends 2024',
      description: 'Latest trends in mobile shopping experiences',
      image: 'assets/images/trending/mobile-commerce.svg',
      category: 'E-commerce',
      views: 9800,
      likes: 523,
      author: 'Lisa Wang',
      publishedDate: new Date(Date.now() - 259200000) // 3 days ago
    }
  ]);

  // Computed values
  readonly filteredCategories = computed(() => {
    const query = this.searchQuery.toLowerCase();
    return this.categories().filter(category =>
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query)
    );
  });

  readonly filteredTrendingItems = computed(() => {
    // Apply trending filter logic here
    return this.trendingItems();
  });

  readonly totalItems = computed(() => 
    this.categories().reduce((sum, cat) => sum + cat.itemCount, 0)
  );

  readonly activeCategories = computed(() => this.categories().length);

  readonly trendingCount = computed(() => 
    this.categories().filter(cat => cat.trending).length
  );

  onSearch(): void {
    // Search functionality is handled by computed values
  }

  setCategoryView(view: 'grid' | 'list'): void {
    this.categoryView.set(view);
  }

  setTrendingFilter(filter: 'all' | 'today' | 'week' | 'month'): void {
    this.trendingFilter.set(filter);
  }

  exploreCategory(category: ExploreCategory): void {
    console.log('Exploring category:', category);
    // Navigate to category-specific page
    this.router.navigate(['/explore', category.id]);
  }

  viewTrendingItem(item: TrendingItem): void {
    console.log('Viewing trending item:', item);
  }

  createNew(): void {
    console.log('Create new item');
  }

  viewAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  importData(): void {
    console.log('Import data');
  }

  exportReport(): void {
    console.log('Export report');
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}