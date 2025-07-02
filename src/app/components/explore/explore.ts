import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
  color: string;
  bgColor: string;
  growth?: number;
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
  authorAvatar: string;
  publishedDate: Date;
  tags: string[];
  rating: number;
  price?: number;
}

interface SearchResult {
  type: 'category' | 'item';
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.html',
  styleUrls: ['./explore.scss']
})
export class ExploreComponent implements OnInit {
  private readonly router = inject(Router);

  // State management using Angular signals
  searchQuery = signal('');
  categoryView = signal<'grid' | 'list'>('grid');
  trendingFilter = signal<'all' | 'today' | 'week' | 'month'>('all');
  selectedCategory = signal<string | null>(null);
  isLoading = signal(false);
  searchFocused = signal(false);

  // Enhanced mock data with more realistic content
  readonly categories = signal<ExploreCategory[]>([
    {
      id: 'products',
      name: 'Products',
      icon: '📦',
      description: 'Browse our comprehensive product catalog with detailed analytics',
      itemCount: 1250,
      trending: true,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      growth: 15.2
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: '👥',
      description: 'Customer insights, analytics, and relationship management tools',
      itemCount: 3200,
      trending: false,
      color: '#10b981',
      bgColor: '#ecfdf5',
      growth: 8.7
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: '🛒',
      description: 'Order management, tracking, and fulfillment analytics',
      itemCount: 5670,
      trending: true,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      growth: 23.1
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: '📊',
      description: 'Business intelligence reports and data visualization tools',
      itemCount: 180,
      trending: false,
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
      growth: 12.5
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: '📋',
      description: 'Stock management and inventory tracking solutions',
      itemCount: 2450,
      trending: true,
      color: '#ef4444',
      bgColor: '#fef2f2',
      growth: 18.9
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: '📢',
      description: 'Marketing campaigns, analytics, and customer acquisition',
      itemCount: 890,
      trending: false,
      color: '#06b6d4',
      bgColor: '#cffafe',
      growth: 6.3
    }
  ]);

  readonly trendingItems = signal<TrendingItem[]>([
    {
      id: '1',
      title: 'Q4 Sales Performance Report',
      description: 'Comprehensive analysis of Q4 sales metrics and performance indicators',
      image: '/api/placeholder/300/180',
      category: 'Reports',
      views: 1250,
      likes: 89,
      author: 'Sarah Johnson',
      authorAvatar: '/api/placeholder/40/40',
      publishedDate: new Date('2024-12-15'),
      tags: ['analytics', 'sales', 'quarterly'],
      rating: 4.8,
      price: 0
    },
    {
      id: '2',
      title: 'Customer Behavior Analytics Dashboard',
      description: 'Real-time insights into customer behavior patterns and preferences',
      image: '/api/placeholder/300/180',
      category: 'Customers',
      views: 2340,
      likes: 156,
      author: 'Mike Chen',
      authorAvatar: '/api/placeholder/40/40',
      publishedDate: new Date('2024-12-14'),
      tags: ['customers', 'behavior', 'analytics'],
      rating: 4.9,
      price: 29.99
    },
    {
      id: '3',
      title: 'Inventory Optimization Tool',
      description: 'AI-powered tool to optimize inventory levels and reduce costs',
      image: '/api/placeholder/300/180',
      category: 'Inventory',
      views: 1890,
      likes: 134,
      author: 'Emma Davis',
      authorAvatar: '/api/placeholder/40/40',
      publishedDate: new Date('2024-12-13'),
      tags: ['inventory', 'ai', 'optimization'],
      rating: 4.7,
      price: 49.99
    },
    {
      id: '4',
      title: 'Marketing ROI Calculator',
      description: 'Calculate and track return on investment for marketing campaigns',
      image: '/api/placeholder/300/180',
      category: 'Marketing',
      views: 1567,
      likes: 98,
      author: 'David Wilson',
      authorAvatar: '/api/placeholder/40/40',
      publishedDate: new Date('2024-12-12'),
      tags: ['marketing', 'roi', 'calculator'],
      rating: 4.6,
      price: 19.99
    }
  ]);

  readonly quickActions = signal<QuickAction[]>([
    {
      id: 'new-product',
      title: 'Add New Product',
      description: 'Create a new product entry',
      icon: '➕',
      color: 'var(--success-color)',
      action: () => this.createNew('product')
    },
    {
      id: 'import-data',
      title: 'Import Data',
      description: 'Import bulk data from CSV or Excel',
      icon: '📥',
      color: 'var(--primary-color)',
      action: () => this.importData()
    },
    {
      id: 'export-report',
      title: 'Export Report',
      description: 'Generate and download reports',
      icon: '📤',
      color: 'var(--warning-color)',
      action: () => this.exportReport()
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Advanced analytics dashboard',
      icon: '📈',
      color: 'var(--info-color)',
      action: () => this.viewAnalytics()
    }
  ]);

  // Computed values for dynamic content
  readonly filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.categories();
    
    return this.categories().filter(category => 
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query)
    );
  });

  readonly filteredTrendingItems = computed(() => {
    const filter = this.trendingFilter();
    const items = this.trendingItems();
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return items.filter(item => {
          const diffTime = Math.abs(now.getTime() - item.publishedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 1;
        });
      case 'week':
        return items.filter(item => {
          const diffTime = Math.abs(now.getTime() - item.publishedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        });
      case 'month':
        return items.filter(item => {
          const diffTime = Math.abs(now.getTime() - item.publishedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30;
        });
      default:
        return items;
    }
  });

  readonly totalItems = computed(() => 
    this.categories().reduce((sum, cat) => sum + cat.itemCount, 0)
  );

  readonly activeCategories = computed(() => this.categories().length);

  readonly trendingCount = computed(() => 
    this.categories().filter(cat => cat.trending).length
  );

  readonly searchResults = computed((): SearchResult[] => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return [];
    
    const categoryMatches: SearchResult[] = this.filteredCategories().map(cat => ({
      type: 'category' as const,
      id: cat.id,
      title: cat.name,
      description: cat.description,
      icon: cat.icon
    }));
    
    const itemMatches: SearchResult[] = this.trendingItems()
      .filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
      .map(item => ({
        type: 'item' as const,
        id: item.id,
        title: item.title,
        description: item.description,
        icon: '📄'
      }));
    
    return [...categoryMatches, ...itemMatches].slice(0, 8);
  });

  ngOnInit(): void {
    // Initialize any required data or subscriptions
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.isLoading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }

  // Event handlers
  onSearch(): void {
    // Search functionality is handled by computed values
    console.log('Search query:', this.searchQuery());
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.searchQuery.set(target.value);
      this.onSearch();
    }
  }

  onSearchFocus(): void {
    this.searchFocused.set(true);
  }

  onSearchBlur(): void {
    setTimeout(() => this.searchFocused.set(false), 200);
  }

  setCategoryView(view: 'grid' | 'list'): void {
    this.categoryView.set(view);
  }

  setTrendingFilter(filter: 'all' | 'today' | 'week' | 'month'): void {
    this.trendingFilter.set(filter);
  }

  exploreCategory(category: ExploreCategory): void {
    console.log('Exploring category:', category);
    this.selectedCategory.set(category.id);
    // Navigate to category-specific page
    this.router.navigate(['/explore', category.id]);
  }

  viewTrendingItem(item: TrendingItem): void {
    console.log('Viewing trending item:', item);
    // Open item details or navigate to item page
  }

  selectSearchResult(result: SearchResult): void {
    if (!result) return;
    
    if (result.type === 'category') {
      const category = this.categories().find(cat => cat.id === result.id);
      if (category) this.exploreCategory(category);
    } else if (result.type === 'item') {
      const item = this.trendingItems().find(item => item.id === result.id);
      if (item) this.viewTrendingItem(item);
    }
    this.searchQuery.set('');
    this.searchFocused.set(false);
  }

  // Quick action handlers
  createNew(type: string = 'general'): void {
    console.log('Creating new item:', type);
    // Navigate to create page or show modal
    // Example: this.router.navigate(['/create', type]);
  }

  viewAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  importData(): void {
    console.log('Import data functionality');
    // Show import modal or navigate to import page
  }

  exportReport(): void {
    console.log('Export report functionality');
    // Generate and download report
  }

  // Utility methods
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

  generateStars(rating: number): string[] {
    if (!rating || rating < 0 || rating > 5) return Array(5).fill('☆');
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return [
      ...Array(fullStars).fill('★'),
      ...(hasHalfStar ? ['☆'] : []),
      ...Array(Math.max(0, emptyStars)).fill('☆')
    ];
  }
}