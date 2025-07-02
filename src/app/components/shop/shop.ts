import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Enhanced interfaces for shop functionality
interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images: string[];
  category: string;
  subcategory?: string;
  rating: number;
  reviewCount: number;
  stockCount: number;
  tags: string[];
  features: string[];
  sizes?: string[];
  colors?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  isSale?: boolean;
}

interface CartItem {
  product: ShopProduct;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  addedAt: Date;
}

interface ShopCategory {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  isActive?: boolean;
}

interface ProductFilter {
  category: string;
  priceRange: { min: number; max: number };
  rating: number;
  inStock: boolean;
  onSale: boolean;
  sizes: string[];
  colors: string[];
}

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: 'credit' | 'paypal' | 'apple-pay';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './shop.html',
  styleUrls: ['./shop.scss']
})
export class ShopComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // State management with signals
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('all');
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly sortBy = signal('featured');
  readonly sidebarCollapsed = signal(false);
  readonly showCart = signal(false);
  readonly showCheckout = signal(false);
  readonly isLoading = signal(false);
  readonly isProcessingOrder = signal(false);

  // Product and cart state
  readonly selectedProduct = signal<ShopProduct | null>(null);
  readonly selectedSize = signal<string>('');
  readonly selectedColor = signal<string>('');
  readonly selectedQuantity = signal(1);
  readonly cartItems = signal<CartItem[]>([]);
  readonly wishlistItems = signal<Set<string>>(new Set());

  // Filter state
  readonly priceFilter = signal({ min: 0, max: 1000 });
  readonly ratingFilter = signal(0);
  readonly showInStockOnly = signal(false);
  readonly showSaleOnly = signal(false);

  // Pagination
  readonly currentPage = signal(0);
  readonly itemsPerPage = 12;
  readonly loadedProducts = signal<ShopProduct[]>([]);

  // Checkout form
  checkoutForm: FormGroup;

  // Mock data
  readonly categories = signal<ShopCategory[]>([
    { id: 'all', name: 'All Products', icon: '🏪', productCount: 156 },
    { id: 'electronics', name: 'Electronics', icon: '📱', productCount: 45 },
    { id: 'clothing', name: 'Clothing', icon: '👕', productCount: 67 },
    { id: 'shoes', name: 'Shoes', icon: '👟', productCount: 23 },
    { id: 'accessories', name: 'Accessories', icon: '⌚', productCount: 21 }
  ]);

  readonly allProducts = signal<ShopProduct[]>([
    {
      id: '1',
      name: 'Premium Denim Jacket',
      description: 'High-quality denim jacket with vintage styling and modern comfort. Perfect for any season.',
      price: 89.99,
      originalPrice: 119.99,
      discount: 25,
      image: 'assets/images/products/denim-jacket.webp',
      images: ['assets/images/products/denim-jacket.webp'],
      category: 'clothing',
      rating: 4.5,
      reviewCount: 127,
      stockCount: 45,
      tags: ['denim', 'jacket', 'vintage'],
      features: ['100% Cotton', 'Machine Washable', 'Classic Fit'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Blue', 'Black', 'Gray'],
      isNew: false,
      isFeatured: true,
      isSale: true
    },
    {
      id: '2',
      name: 'Nike Air Max 97',
      description: 'Iconic running shoes with full-length Air Max unit for superior comfort and style.',
      price: 159.99,
      image: 'assets/images/products/nike-air-max.webp',
      images: ['assets/images/products/nike-air-max.webp'],
      category: 'shoes',
      rating: 4.8,
      reviewCount: 89,
      stockCount: 3,
      tags: ['nike', 'running', 'air-max'],
      features: ['Air Max Technology', 'Rubber Outsole', 'Textile Upper'],
      sizes: ['7', '8', '9', '10', '11', '12'],
      colors: ['White', 'Black', 'Red'],
      isNew: false,
      isFeatured: true,
      isSale: false
    },
    {
      id: '3',
      name: 'Jordan Air T-Shirt',
      description: 'Comfortable cotton t-shirt featuring the iconic Jordan logo. Perfect for casual wear.',
      price: 45.99,
      image: 'assets/images/products/jordan-air.webp',
      images: ['assets/images/products/jordan-air.webp'],
      category: 'clothing',
      rating: 4.2,
      reviewCount: 203,
      stockCount: 28,
      tags: ['jordan', 't-shirt', 'cotton'],
      features: ['100% Cotton', 'Screen Printed Logo', 'Regular Fit'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Black', 'Red', 'Blue'],
      isNew: true,
      isFeatured: false,
      isSale: false
    },
    {
      id: '4',
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
      price: 199.99,
      originalPrice: 249.99,
      discount: 20,
      image: 'assets/images/products/headphones.webp',
      images: ['assets/images/products/headphones.webp'],
      category: 'electronics',
      rating: 4.7,
      reviewCount: 156,
      stockCount: 15,
      tags: ['headphones', 'wireless', 'bluetooth'],
      features: ['Noise Cancellation', '30hr Battery', 'Quick Charge'],
      colors: ['Black', 'White', 'Silver'],
      isNew: true,
      isFeatured: true,
      isSale: true
    },
    {
      id: '5',
      name: 'Smartwatch Series 5',
      description: 'Advanced smartwatch with fitness tracking, GPS, and cellular connectivity.',
      price: 299.99,
      image: 'assets/images/products/smartwatch.webp',
      images: ['assets/images/products/smartwatch.webp'],
      category: 'electronics',
      rating: 4.6,
      reviewCount: 234,
      stockCount: 8,
      tags: ['smartwatch', 'fitness', 'gps'],
      features: ['GPS Tracking', 'Heart Rate Monitor', 'Water Resistant'],
      sizes: ['38mm', '42mm'],
      colors: ['Space Gray', 'Silver', 'Gold'],
      isNew: false,
      isFeatured: true,
      isSale: false
    },
    {
      id: '6',
      name: 'Leather Crossbody Bag',
      description: 'Elegant leather crossbody bag perfect for daily use. Handcrafted with premium materials.',
      price: 79.99,
      image: 'assets/images/products/leather-bag.webp',
      images: ['assets/images/products/leather-bag.webp'],
      category: 'accessories',
      rating: 4.4,
      reviewCount: 67,
      stockCount: 12,
      tags: ['leather', 'bag', 'crossbody'],
      features: ['Genuine Leather', 'Adjustable Strap', 'Multiple Pockets'],
      colors: ['Brown', 'Black', 'Tan'],
      isNew: false,
      isFeatured: false,
      isSale: false
    }
  ]);

  constructor() {
    this.checkoutForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      paymentMethod: ['credit', Validators.required],
      cardNumber: [''],
      expiryDate: [''],
      cvv: ['']
    });

    // Load initial products
    this.loadInitialProducts();
    this.loadCartFromStorage();
    this.loadWishlistFromStorage();
  }

  ngOnInit(): void {
    // Any additional initialization
  }

  // Computed properties
  readonly filteredProducts = computed(() => {
    let products = this.loadedProducts();
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();
    const priceRange = this.priceFilter();
    const minRating = this.ratingFilter();

    // Filter by search
    if (query) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    // Filter by price range
    products = products.filter(p => 
      p.price >= priceRange.min && p.price <= priceRange.max
    );

    // Filter by rating
    if (minRating > 0) {
      products = products.filter(p => p.rating >= minRating);
    }

    // Filter by stock status
    if (this.showInStockOnly()) {
      products = products.filter(p => p.stockCount > 0);
    }

    // Filter by sale status
    if (this.showSaleOnly()) {
      products = products.filter(p => p.isSale);
    }

    // Sort products
    const sortBy = this.sortBy();
    products.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default: // featured
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });

    return products;
  });

  readonly cartItemCount = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  readonly cartSubtotal = computed(() => {
    return parseFloat(
      this.cartItems()
        .reduce((total, item) => total + (item.product.price * item.quantity), 0)
        .toFixed(2)
    );
  });

  readonly cartTotal = computed(() => {
    const subtotal = this.cartSubtotal();
    const shipping = subtotal > 100 ? 0 : 9.99;
    return parseFloat((subtotal + shipping).toFixed(2));
  });

  readonly hasMoreProducts = computed(() => {
    return this.loadedProducts().length < this.allProducts().length;
  });

  // Methods
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  setSortBy(sortBy: string): void {
    this.sortBy.set(sortBy);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  toggleCart(): void {
    this.showCart.update(show => !show);
  }

  updatePriceFilter(type: 'min' | 'max', event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value) || 0;
    const current = this.priceFilter();
    
    if (type === 'min') {
      this.priceFilter.set({ ...current, min: value });
    } else {
      this.priceFilter.set({ ...current, max: value });
    }
  }

  setRatingFilter(rating: number): void {
    this.ratingFilter.set(this.ratingFilter() === rating ? 0 : rating);
  }

  toggleInStockFilter(): void {
    this.showInStockOnly.update(show => !show);
  }

  toggleSaleFilter(): void {
    this.showSaleOnly.update(show => !show);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    this.priceFilter.set({ min: 0, max: 1000 });
    this.ratingFilter.set(0);
    this.showInStockOnly.set(false);
    this.showSaleOnly.set(false);
  }

  addToCart(product: ShopProduct, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const existingItem = this.cartItems().find(item => 
      item.product.id === product.id
    );

    if (existingItem) {
      this.updateCartItemQuantity(existingItem, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        addedAt: new Date()
      };
      this.cartItems.update(items => [...items, newItem]);
    }

    this.saveCartToStorage();
    // Show success message or animation
  }

  updateCartItemQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(item);
      return;
    }

    this.cartItems.update(items => 
      items.map(cartItem => 
        cartItem === item 
          ? { ...cartItem, quantity: Math.min(newQuantity, item.product.stockCount) }
          : cartItem
      )
    );
    this.saveCartToStorage();
  }

  removeFromCart(item: CartItem): void {
    this.cartItems.update(items => items.filter(cartItem => cartItem !== item));
    this.saveCartToStorage();
  }

  toggleWishlist(product: ShopProduct, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const wishlist = this.wishlistItems();
    if (wishlist.has(product.id)) {
      wishlist.delete(product.id);
    } else {
      wishlist.add(product.id);
    }
    this.wishlistItems.set(new Set(wishlist));
    this.saveWishlistToStorage();
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItems().has(productId);
  }

  openProductDetail(product: ShopProduct, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedProduct.set(product);
    this.selectedSize.set('');
    this.selectedColor.set('');
    this.selectedQuantity.set(1);
  }

  closeProductDetail(): void {
    this.selectedProduct.set(null);
  }

  selectProductImage(imageUrl: string): void {
    const product = this.selectedProduct();
    if (product) {
      this.selectedProduct.set({ ...product, image: imageUrl });
    }
  }

  selectSize(size: string): void {
    this.selectedSize.set(size);
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  incrementQuantity(): void {
    const product = this.selectedProduct();
    if (product && this.selectedQuantity() < product.stockCount) {
      this.selectedQuantity.update(q => q + 1);
    }
  }

  decrementQuantity(): void {
    if (this.selectedQuantity() > 1) {
      this.selectedQuantity.update(q => q - 1);
    }
  }

  addSelectedToCart(): void {
    const product = this.selectedProduct();
    if (!product) return;

    const existingItem = this.cartItems().find(item => 
      item.product.id === product.id &&
      item.selectedSize === this.selectedSize() &&
      item.selectedColor === this.selectedColor()
    );

    if (existingItem) {
      this.updateCartItemQuantity(
        existingItem, 
        existingItem.quantity + this.selectedQuantity()
      );
    } else {
      const newItem: CartItem = {
        product,
        quantity: this.selectedQuantity(),
        selectedSize: this.selectedSize() || undefined,
        selectedColor: this.selectedColor() || undefined,
        addedAt: new Date()
      };
      this.cartItems.update(items => [...items, newItem]);
    }

    this.saveCartToStorage();
    this.closeProductDetail();
  }

  loadMoreProducts(): void {
    this.isLoading.set(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const currentCount = this.loadedProducts().length;
      const allProducts = this.allProducts();
      const nextBatch = allProducts.slice(currentCount, currentCount + this.itemsPerPage);
      
      this.loadedProducts.update(products => [...products, ...nextBatch]);
      this.isLoading.set(false);
    }, 1000);
  }

  viewCart(): void {
    this.showCart.set(false);
    // Navigate to dedicated cart page if you have one
    // this.router.navigate(['/cart']);
  }

  startCheckout(): void {
    this.showCart.set(false);
    this.showCheckout.set(true);
  }

  closeCheckout(): void {
    this.showCheckout.set(false);
  }

  processCheckout(): void {
    if (this.checkoutForm.valid) {
      this.isProcessingOrder.set(true);
      
      // Simulate order processing
      setTimeout(() => {
        this.isProcessingOrder.set(false);
        this.showCheckout.set(false);
        this.cartItems.set([]);
        this.saveCartToStorage();
        
        // Show success message
        alert('Order placed successfully! You will receive a confirmation email shortly.');
        
        // Reset form
        this.checkoutForm.reset();
      }, 3000);
    } else {
      this.markFormGroupTouched();
    }
  }

  // Utility methods
  getProductStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    
    if (hasHalfStar) {
      stars.push('☆');
    }
    
    while (stars.length < 5) {
      stars.push('☆');
    }
    
    return stars;
  }

  getStarArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  getStockStatusClass(stockCount: number): string {
    if (stockCount === 0) return 'out-of-stock';
    if (stockCount <= 5) return 'low-stock';
    return 'in-stock';
  }

  getStockStatusText(stockCount: number): string {
    if (stockCount === 0) return 'Out of Stock';
    if (stockCount <= 5) return 'Low Stock';
    return 'In Stock';
  }

  getColorHex(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'Black': '#000000',
      'White': '#FFFFFF',
      'Red': '#FF0000',
      'Blue': '#0000FF',
      'Gray': '#808080',
      'Brown': '#A52A2A',
      'Tan': '#D2B48C',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Space Gray': '#4A4A4A'
    };
    return colorMap[colorName] || '#CCCCCC';
  }

  trackByProductId(index: number, product: ShopProduct): string {
    return product.id;
  }

  trackByCartItem(index: number, item: CartItem): string {
    return `${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private loadInitialProducts(): void {
    const initialProducts = this.allProducts().slice(0, this.itemsPerPage);
    this.loadedProducts.set(initialProducts);
  }

  private saveCartToStorage(): void {
    localStorage.setItem('xenith_cart', JSON.stringify(this.cartItems()));
  }

  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('xenith_cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        this.cartItems.set(cartData);
      } catch (e) {
        console.error('Error loading cart from storage:', e);
      }
    }
  }

  private saveWishlistToStorage(): void {
    localStorage.setItem('xenith_wishlist', JSON.stringify(Array.from(this.wishlistItems())));
  }

  private loadWishlistFromStorage(): void {
    const savedWishlist = localStorage.getItem('xenith_wishlist');
    if (savedWishlist) {
      try {
        const wishlistData = JSON.parse(savedWishlist);
        this.wishlistItems.set(new Set(wishlistData));
      } catch (e) {
        console.error('Error loading wishlist from storage:', e);
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
    });
  }
}