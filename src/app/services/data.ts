import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, tap } from 'rxjs';

export interface DashboardMetrics {
  totalCustomers: string;
  totalCustomersRaw: number;
  totalRevenue: string;
  totalRevenueRaw: number;
  totalOrders: string;
  totalOrdersRaw: number;
  customerChange: number;
  revenueChange: number;
  ordersChange: number;
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  value: string;
  rawValue: number;
  trend: 'up' | 'down';
  changePercent: number;
}

export interface Customer {
  id: string;
  name: string;
  avatar: string;
  orders: number;
  value: string;
  rawValue: number;
  email: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  image: string;
  name: string;
  category: string;
  stock: string;
  stockCount: number;
  stockStatus: 'in-stock' | 'out-of-stock' | 'low-stock';
  totalSales: string;
  rawSales: number;
  price: number;
  rating: number;
}

export interface Order {
  id: string;
  productName: string;
  productImage: string;
  category: string;
  value: string;
  rawValue: number;
  customer: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface ChartData {
  month: string;
  firstHalf: number;
  topGross: number;
  orders: number;
  customers: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Loading states
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Search and filters
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('all');
  readonly sortBy = signal<'name' | 'sales' | 'stock' | 'price'>('sales');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');

  // Notifications
  readonly notifications = signal<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'New Order',
      message: 'Order #12345 has been completed',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Low Stock',
      message: 'Nike Air Max 97 is running low on stock',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'System Update',
      message: 'Dashboard analytics have been updated',
      timestamp: new Date(Date.now() - 7200000),
      read: true
    }
  ]);

  // Raw data
  private readonly rawMetrics = signal<DashboardMetrics>({
    totalCustomers: '307.48K',
    totalCustomersRaw: 307480,
    totalRevenue: '$30.58K',
    totalRevenueRaw: 30580,
    totalOrders: '2.48K',
    totalOrdersRaw: 2480,
    customerChange: 30,
    revenueChange: -15,
    ordersChange: 23
  });

  private readonly rawCountries = signal<Country[]>([
    {
      id: '1',
      name: 'Australia',
      flag: 'src/assets/images/flags/australia.svg',
      value: '7.12K',
      rawValue: 7120,
      trend: 'up',
      changePercent: 12.5
    },
    {
      id: '2',
      name: 'Belgium',
      flag: 'assets/images/flags/belgium.svg',
      value: '4.18K',
      rawValue: 4180,
      trend: 'up',
      changePercent: 8.3
    },
    {
      id: '3',
      name: 'Canada',
      flag: 'assets/images/flags/canada.svg',
      value: '6.45K',
      rawValue: 6450,
      trend: 'up',
      changePercent: 15.2
    },
    {
      id: '4',
      name: 'Costa Rica',
      flag: 'assets/images/flags/costa-rica.svg',
      value: '3.88K',
      rawValue: 3880,
      trend: 'down',
      changePercent: -5.7
    },
    {
      id: '5',
      name: 'Austria',
      flag: 'assets/images/flags/austria.svg',
      value: '6.98K',
      rawValue: 6980,
      trend: 'up',
      changePercent: 9.8
    }
  ]);

  private readonly rawCustomers = signal<Customer[]>([
    {
      id: '1',
      name: 'Robert Lewis',
      avatar: 'assets/images/avatars/robert.svg',
      orders: 40,
      value: '$4.19K',
      rawValue: 4190,
      email: 'robert.lewis@email.com',
      joinDate: '2023-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Tom Barnett',
      avatar: 'assets/images/avatars/tom.svg',
      orders: 31,
      value: '$3.56K',
      rawValue: 3560,
      email: 'tom.barnett@email.com',
      joinDate: '2023-02-20',
      status: 'active'
    },
    {
      id: '3',
      name: 'Jenson Doyle',
      avatar: 'assets/images/avatars/jenson.svg',
      orders: 17,
      value: '$3.12K',
      rawValue: 3120,
      email: 'jenson.doyle@email.com',
      joinDate: '2023-03-10',
      status: 'active'
    },
    {
      id: '4',
      name: 'Donald Cortez',
      avatar: 'assets/images/avatars/donald.svg',
      orders: 7,
      value: '$2.14K',
      rawValue: 2140,
      email: 'donald.cortez@email.com',
      joinDate: '2023-04-05',
      status: 'inactive'
    }
  ]);

  private readonly rawProducts = signal<Product[]>([
    {
      id: '1',
      image: 'assets/images/products/denim-jacket.webp',
      name: 'Denim Jacket',
      category: "Men's Tops",
      stock: 'In Stock',
      stockCount: 45,
      stockStatus: 'in-stock',
      totalSales: '1.43k',
      rawSales: 1430,
      price: 89.99,
      rating: 4.5
    },
    {
      id: '2',
      image: 'assets/images/products/nike-air-max.webp',
      name: 'Nike Air Max 97',
      category: "Men's Shoes",
      stock: 'Low Stock',
      stockCount: 3,
      stockStatus: 'low-stock',
      totalSales: '2.68k',
      rawSales: 2680,
      price: 159.99,
      rating: 4.8
    },
    {
      id: '3',
      image: 'assets/images/products/jordan-air.webp',
      name: 'Jordan Air',
      category: "Men's T-Shirt",
      stock: 'In Stock',
      stockCount: 28,
      stockStatus: 'in-stock',
      totalSales: '1.43k',
      rawSales: 1430,
      price: 45.99,
      rating: 4.2
    }
  ]);

  private readonly rawOrders = signal<Order[]>([
    {
      id: '1',
      productName: 'Nike Air Force 1',
      productImage: 'assets/images/products/nike-air-force.webp',
      category: 'Sports',
      value: '$110.96',
      rawValue: 110.96,
      customer: 'Robert Lewis',
      date: '2024-06-19',
      status: 'completed'
    },
    {
      id: '2',
      productName: "Men's Dri-FIT 7",
      productImage: 'assets/images/products/mens-drifit.webp',
      category: 'Sports',
      value: '$38.97',
      rawValue: 38.97,
      customer: 'Tom Barnett',
      date: '2024-06-18',
      status: 'pending'
    },
    {
      id: '3',
      productName: 'Jordan Dri-FIT Sport',
      productImage: 'assets/images/products/jordan-drifit.webp',
      category: 'Sports',
      value: '$35.60',
      rawValue: 35.60,
      customer: 'Jenson Doyle',
      date: '2024-06-17',
      status: 'completed'
    }
  ]);

  private readonly rawChartData = signal<ChartData[]>([
    { month: 'JAN', firstHalf: 80, topGross: 100, orders: 145, customers: 1200 },
    { month: 'FEB', firstHalf: 95, topGross: 115, orders: 167, customers: 1350 },
    { month: 'MAR', firstHalf: 75, topGross: 95, orders: 134, customers: 1100 },
    { month: 'APR', firstHalf: 110, topGross: 130, orders: 189, customers: 1580 },
    { month: 'MAY', firstHalf: 90, topGross: 110, orders: 156, customers: 1420 },
    { month: 'JUN', firstHalf: 180, topGross: 200, orders: 245, customers: 2100 },
    { month: 'JUL', firstHalf: 120, topGross: 140, orders: 198, customers: 1680 },
    { month: 'AUG', firstHalf: 85, topGross: 105, orders: 143, customers: 1320 },
    { month: 'SEP', firstHalf: 95, topGross: 115, orders: 167, customers: 1450 },
    { month: 'OCT', firstHalf: 75, topGross: 95, orders: 134, customers: 1250 },
    { month: 'NOV', firstHalf: 90, topGross: 110, orders: 156, customers: 1380 },
    { month: 'DEC', firstHalf: 85, topGross: 105, orders: 143, customers: 1290 }
  ]);

  // Computed filtered data
  readonly metrics = computed(() => this.rawMetrics());
  
  readonly countries = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.rawCountries().filter(country => 
      country.name.toLowerCase().includes(query)
    );
  });

  readonly customers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.rawCustomers().filter(customer => 
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query)
    );
  });

  readonly products = computed(() => {
    let filtered = this.rawProducts();
    
    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    const category = this.selectedCategory();
    if (category !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Sort
    const sortBy = this.sortBy();
    const direction = this.sortDirection();
    
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'sales':
          aVal = a.rawSales;
          bVal = b.rawSales;
          break;
        case 'stock':
          aVal = a.stockCount;
          bVal = b.stockCount;
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  });

  readonly orders = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.rawOrders().filter(order => 
      order.productName.toLowerCase().includes(query) ||
      order.customer.toLowerCase().includes(query)
    );
  });

  readonly chartData = computed(() => this.rawChartData());

  readonly unreadNotifications = computed(() => 
    this.notifications().filter(n => !n.read).length
  );

  // Methods for interactivity
  updateSearch(query: string): void {
    this.searchQuery.set(query);
  }

  updateCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  updateSort(sortBy: 'name' | 'sales' | 'stock' | 'price', direction?: 'asc' | 'desc'): void {
    this.sortBy.set(sortBy);
    if (direction) {
      this.sortDirection.set(direction);
    } else {
      // Toggle direction if same column
      const current = this.sortDirection();
      this.sortDirection.set(current === 'asc' ? 'desc' : 'asc');
    }
  }

  markNotificationAsRead(id: string): void {
    const notifications = this.notifications();
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications.set(updatedNotifications);
  }

  markAllNotificationsAsRead(): void {
    const notifications = this.notifications();
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    this.notifications.set(updatedNotifications);
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    const current = this.notifications();
    this.notifications.set([newNotification, ...current]);
  }

  removeNotification(id: string): void {
    const notifications = this.notifications();
    const filtered = notifications.filter(n => n.id !== id);
    this.notifications.set(filtered);
  }

  clearAllNotifications(): void {
    this.notifications.set([]);
  }

  // Data manipulation methods
  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    this.isLoading.set(true);
    
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };

    return of(newProduct).pipe(
      delay(800),
      tap(() => {
        const current = this.rawProducts();
        this.rawProducts.set([...current, newProduct]);
        this.isLoading.set(false);
      })
    );
  }

  addCustomer(customer: Omit<Customer, 'id'>): Observable<Customer> {
    this.isLoading.set(true);
    
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString()
    };

    return of(newCustomer).pipe(
      delay(600),
      tap(() => {
        const current = this.rawCustomers();
        this.rawCustomers.set([...current, newCustomer]);
        this.isLoading.set(false);
      })
    );
  }

  addOrder(order: Omit<Order, 'id'>): Observable<Order> {
    this.isLoading.set(true);
    
    const newOrder: Order = {
      ...order,
      id: Date.now().toString()
    };

    return of(newOrder).pipe(
      delay(500),
      tap(() => {
        const current = this.rawOrders();
        this.rawOrders.set([newOrder, ...current]);
        this.isLoading.set(false);
      })
    );
  }

  updateCustomer(id: string, updates: Partial<Customer>): Observable<boolean> {
    this.isLoading.set(true);
    
    return of(true).pipe(
      delay(600),
      tap(() => {
        const customers = this.rawCustomers();
        const updated = customers.map(c => 
          c.id === id ? { ...c, ...updates } : c
        );
        this.rawCustomers.set(updated);
        this.isLoading.set(false);
      })
    );
  }

  // Simulate API calls with loading states
  refreshData(): Observable<boolean> {
    this.isLoading.set(true);
    this.error.set(null);
    
    return of(true).pipe(
      delay(1500),
      tap(() => this.isLoading.set(false))
    );
  }

  updateProduct(id: string, updates: Partial<Product>): Observable<boolean> {
    this.isLoading.set(true);
    
    return of(true).pipe(
      delay(800),
      tap(() => {
        const products = this.rawProducts();
        const updated = products.map(p => 
          p.id === id ? { ...p, ...updates } : p
        );
        this.rawProducts.set(updated);
        this.isLoading.set(false);
      })
    );
  }

  deleteProduct(id: string): Observable<boolean> {
    this.isLoading.set(true);
    
    return of(true).pipe(
      delay(600),
      tap(() => {
        const products = this.rawProducts();
        const filtered = products.filter(p => p.id !== id);
        this.rawProducts.set(filtered);
        this.isLoading.set(false);
      })
    );
  }

  deleteCustomer(id: string): Observable<boolean> {
    this.isLoading.set(true);
    
    return of(true).pipe(
      delay(500),
      tap(() => {
        const customers = this.rawCustomers();
        const filtered = customers.filter(c => c.id !== id);
        this.rawCustomers.set(filtered);
        this.isLoading.set(false);
      })
    );
  }

  updateOrderStatus(id: string, status: Order['status']): Observable<boolean> {
    this.isLoading.set(true);
    
    return of(true).pipe(
      delay(400),
      tap(() => {
        const orders = this.rawOrders();
        const updated = orders.map(o => 
          o.id === id ? { ...o, status } : o
        );
        this.rawOrders.set(updated);
        this.isLoading.set(false);
      })
    );
  }

  exportData(type: 'csv' | 'excel' | 'pdf'): Observable<string> {
    this.isLoading.set(true);
    
    // Simulate export process
    return of(`data-export-${Date.now()}.${type}`).pipe(
      delay(2000),
      tap(() => this.isLoading.set(false))
    );
  }

  generateReport(reportType: 'sales' | 'customers' | 'inventory'): Observable<string> {
    this.isLoading.set(true);
    
    return of(`${reportType}-report-${Date.now()}.pdf`).pipe(
      delay(3000),
      tap(() => this.isLoading.set(false))
    );
  }

  // Analytics methods
  getMetricsTrend(period: '7d' | '30d' | '90d' = '30d'): Observable<any[]> {
    this.isLoading.set(true);
    
    // Simulate trend data
    const trendData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customers: Math.floor(Math.random() * 100) + 200,
      revenue: Math.floor(Math.random() * 5000) + 10000,
      orders: Math.floor(Math.random() * 50) + 80
    }));

    return of(trendData).pipe(
      delay(1000),
      tap(() => this.isLoading.set(false))
    );
  }

  // Search methods with debouncing
  searchProducts(query: string): Observable<Product[]> {
    if (!query.trim()) {
      return of(this.rawProducts());
    }

    const filtered = this.rawProducts().filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );

    return of(filtered).pipe(delay(300));
  }

  searchCustomers(query: string): Observable<Customer[]> {
    if (!query.trim()) {
      return of(this.rawCustomers());
    }

    const filtered = this.rawCustomers().filter(customer =>
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase())
    );

    return of(filtered).pipe(delay(300));
  }

  // Bulk operations
  bulkUpdateProducts(ids: string[], updates: Partial<Product>): Observable<boolean> {
    this.isLoading.set(true);
    
    return of(true).pipe(
      delay(1200),
      tap(() => {
        const products = this.rawProducts();
        const updated = products.map(p => 
          ids.includes(p.id) ? { ...p, ...updates } : p
        );
        this.rawProducts.set(updated);
        this.isLoading.set(false);
      })
    );
  }

  bulkDeleteProducts(ids: string[]): Observable<boolean> {
    this.isLoading.set(true);
    
    return of(true).pipe(
      delay(800),
      tap(() => {
        const products = this.rawProducts();
        const filtered = products.filter(p => !ids.includes(p.id));
        this.rawProducts.set(filtered);
        this.isLoading.set(false);
      })
    );
  }
}