import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  articleCount: number;
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: Date;
  helpful: number;
  views: number;
  isExpanded?: boolean;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  isExpanded?: boolean;
}

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './help.html',
  styleUrls: ['./help.scss']
})
export class HelpComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // State management
  readonly searchQuery = signal('');
  readonly selectedCategory = signal<string>('all');
  readonly activeView = signal<'overview' | 'articles' | 'faq' | 'contact'>('overview');
  readonly chatStatus = signal<'online' | 'offline'>('online');
  readonly isSubmitting = signal(false);
  readonly showSuccessMessage = signal(false);
  readonly votedItems = signal<Set<string>>(new Set());

  // Contact form
  contactForm: FormGroup;

  // Mock data
  readonly categories = signal<HelpCategory[]>([
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      description: 'Learn the basics of using Xenith dashboard',
      articleCount: 12
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊',
      description: 'Understanding your dashboard and analytics',
      articleCount: 8
    },
    {
      id: 'orders',
      title: 'Order Management',
      icon: '🛒',
      description: 'Managing orders, tracking, and fulfillment',
      articleCount: 15
    },
    {
      id: 'customers',
      title: 'Customer Management',
      icon: '👥',
      description: 'Customer insights, profiles, and support',
      articleCount: 10
    },
    {
      id: 'products',
      title: 'Product Catalog',
      icon: '📦',
      description: 'Adding and managing your product inventory',
      articleCount: 18
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: '📈',
      description: 'Generate reports and analyze business data',
      articleCount: 9
    },
    {
      id: 'settings',
      title: 'Settings & Account',
      icon: '⚙️',
      description: 'Configure your account and preferences',
      articleCount: 6
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: '🔗',
      description: 'Connect with third-party services',
      articleCount: 7
    }
  ]);

  readonly articles = signal<HelpArticle[]>([
    {
      id: '1',
      title: 'How to Create Your First Order',
      content: 'Creating orders in Xenith is simple and intuitive. Start by navigating to the Orders section in your dashboard. Click the "New Order" button and follow the step-by-step wizard. You can add products, set customer information, apply discounts, and configure shipping options. Once completed, the order will appear in your order management system where you can track its progress from creation to fulfillment.',
      category: 'getting-started',
      tags: ['orders', 'tutorial', 'basics'],
      lastUpdated: new Date('2024-01-15'),
      helpful: 45,
      views: 234,
      isExpanded: false
    },
    {
      id: '2',
      title: 'Understanding Dashboard Metrics',
      content: 'Your Xenith dashboard provides real-time insights into your business performance. The main metrics include Total Customers, Total Revenue, and Total Orders. Each metric shows current values and percentage changes from the previous period. The earnings chart displays monthly trends, while the country breakdown shows your global reach. Use these metrics to identify trends, spot opportunities, and make data-driven decisions.',
      category: 'dashboard',
      tags: ['analytics', 'metrics', 'overview'],
      lastUpdated: new Date('2024-01-10'),
      helpful: 38,
      views: 187,
      isExpanded: false
    },
    {
      id: '3',
      title: 'Setting Up Customer Profiles',
      content: 'Customer profiles in Xenith help you maintain detailed records of your clientele. Navigate to the Customers section and click "Add Customer" to create new profiles. Include contact information, purchase history, preferences, and notes. This information helps personalize customer interactions and enables targeted marketing campaigns. You can also import customer data from CSV files for bulk operations.',
      category: 'customers',
      tags: ['customers', 'profiles', 'management'],
      lastUpdated: new Date('2024-01-08'),
      helpful: 29,
      views: 156,
      isExpanded: false
    },
    {
      id: '4',
      title: 'Product Catalog Management',
      content: 'Efficiently manage your product inventory through the Products section. Add new products with detailed descriptions, images, pricing, and inventory levels. Organize products into categories and set up variants for different sizes, colors, or configurations. Enable inventory tracking to monitor stock levels and receive low-stock alerts. Use bulk editing features to update multiple products simultaneously.',
      category: 'products',
      tags: ['products', 'inventory', 'catalog'],
      lastUpdated: new Date('2024-01-05'),
      helpful: 52,
      views: 298,
      isExpanded: false
    },
    {
      id: '5',
      title: 'Generating Sales Reports',
      content: 'Create comprehensive sales reports to analyze your business performance. Access the Reports section and choose from pre-built templates or create custom reports. Filter data by date range, product categories, customer segments, or geographic regions. Export reports in PDF or CSV format for further analysis or sharing with stakeholders. Schedule automated reports to be delivered to your email regularly.',
      category: 'reports',
      tags: ['reports', 'analytics', 'sales'],
      lastUpdated: new Date('2024-01-03'),
      helpful: 41,
      views: 203,
      isExpanded: false
    }
  ]);

  readonly faqs = signal<FAQ[]>([
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page, or by going to Settings > Account > Change Password. Enter your current password and set a new one. For security, choose a strong password with at least 8 characters including letters, numbers, and symbols.',
      category: 'account',
      helpful: 156,
      isExpanded: false
    },
    {
      id: '2',
      question: 'Can I export my sales data?',
      answer: 'Yes! You can export your sales data from the Reports section. Choose your date range and click the Export button to download your data as CSV or PDF. You can also schedule automatic exports to be sent to your email daily, weekly, or monthly.',
      category: 'reports',
      helpful: 134,
      isExpanded: false
    },
    {
      id: '3',
      question: 'How do I add team members?',
      answer: 'Go to Settings > Team Management and click "Invite Member". Enter their email address and select their role permissions (Admin, Manager, or Viewer). They will receive an invitation email with setup instructions. You can modify permissions or remove team members at any time.',
      category: 'account',
      helpful: 98,
      isExpanded: false
    },
    {
      id: '4',
      question: 'Is there a mobile app available?',
      answer: 'Currently, Xenith is optimized for web browsers on desktop and mobile devices. Our responsive design ensures a great experience on smartphones and tablets. A dedicated mobile app is in development and will be available in Q2 2024.',
      category: 'general',
      helpful: 87,
      isExpanded: false
    },
    {
      id: '5',
      question: 'How do I set up payment processing?',
      answer: 'Navigate to Settings > Payment Methods to configure your payment gateways. We support Stripe, PayPal, Square, and other major providers. Follow the setup wizard for each provider, which includes API key configuration and webhook setup. Test transactions are recommended before going live.',
      category: 'payments',
      helpful: 112,
      isExpanded: false
    },
    {
      id: '6',
      question: 'Can I customize my dashboard?',
      answer: 'Yes! You can customize your dashboard by clicking the "Customize" button in the top-right corner. Add, remove, or rearrange widgets to match your workflow. Save multiple dashboard layouts and switch between them as needed. Custom widgets are available for premium accounts.',
      category: 'dashboard',
      helpful: 73,
      isExpanded: false
    }
  ]);

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Simulate chat status changes
    this.simulateChatStatus();
  }

  ngOnInit(): void {
    // Load voted items from localStorage (in a real app, this would come from a service)
    const savedVotes = localStorage.getItem('xenith_help_votes');
    if (savedVotes) {
      this.votedItems.set(new Set(JSON.parse(savedVotes)));
    }
  }

  // Computed properties
  readonly filteredArticles = computed(() => {
    const articles = this.articles();
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();

    return articles.filter(article => {
      const matchesSearch = !query || 
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query));
      
      const matchesCategory = category === 'all' || article.category === category;
      
      return matchesSearch && matchesCategory;
    });
  });

  readonly filteredFAQs = computed(() => {
    const faqs = this.faqs();
    const query = this.searchQuery().toLowerCase();

    return faqs.filter(faq => 
      !query ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  });

  readonly popularArticles = computed(() => {
    return this.articles()
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  });

  readonly searchResults = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return [];

    const results: any[] = [];

    // Search articles
    this.articles().forEach(article => {
      if (article.title.toLowerCase().includes(query) || 
          article.content.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query))) {
        results.push({
          type: 'article',
          id: article.id,
          title: article.title,
          snippet: article.content.substring(0, 150) + '...',
          relevance: this.calculateRelevance(query, article.title + ' ' + article.content)
        });
      }
    });

    // Search FAQs
    this.faqs().forEach(faq => {
      if (faq.question.toLowerCase().includes(query) || 
          faq.answer.toLowerCase().includes(query)) {
        results.push({
          type: 'faq',
          id: faq.id,
          title: faq.question,
          snippet: faq.answer.substring(0, 150) + '...',
          relevance: this.calculateRelevance(query, faq.question + ' ' + faq.answer)
        });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance);
  });

  // Methods
  setActiveView(view: 'overview' | 'articles' | 'faq' | 'contact'): void {
    this.activeView.set(view);
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
    this.activeView.set('articles');
  }

  setSelectedCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
  }

  toggleArticle(article: HelpArticle): void {
    article.isExpanded = !article.isExpanded;
    if (article.isExpanded) {
      this.incrementViews(article.id);
    }
  }

  toggleFAQ(faqId: string): void {
    const faqs = this.faqs();
    const faq = faqs.find(f => f.id === faqId);
    if (faq) {
      faq.isExpanded = !faq.isExpanded;
    }
  }

  markHelpful(itemId: string, type: 'article' | 'faq'): void {
    if (this.hasVoted(itemId)) return;

    const voted = this.votedItems();
    voted.add(itemId);
    this.votedItems.set(new Set(voted));

    // Save to localStorage
    localStorage.setItem('xenith_help_votes', JSON.stringify(Array.from(voted)));

    // Update the helpful count
    if (type === 'article') {
      const articles = this.articles();
      const article = articles.find(a => a.id === itemId);
      if (article) {
        article.helpful++;
        this.articles.set([...articles]);
      }
    } else {
      const faqs = this.faqs();
      const faq = faqs.find(f => f.id === itemId);
      if (faq) {
        faq.helpful++;
        this.faqs.set([...faqs]);
      }
    }

    // Show thank you message (could be a toast notification)
    console.log('Thank you for your feedback!');
  }

  hasVoted(itemId: string): boolean {
    return this.votedItems().has(itemId);
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  searchByTag(tag: string): void {
    this.searchQuery.set(tag);
    this.setActiveView('articles');
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.searchQuery.set('');
  }

  openChat(): void {
    if (this.chatStatus() === 'online') {
      // In a real app, this would open a chat widget or redirect to chat
      this.router.navigate(['/chat']);
    } else {
      alert('Chat is currently offline. Please try again during business hours or send us an email.');
    }
  }

  sendEmail(): void {
    window.location.href = 'mailto:support@xenith.com?subject=Support Request from Xenith Dashboard';
  }

  callPhone(): void {
    window.location.href = 'tel:+15551234567';
  }

  openArticle(article: HelpArticle): void {
    this.setActiveView('articles');
    this.toggleArticle(article);
  }

  openSearchResult(result: any): void {
    if (result.type === 'article') {
      this.setActiveView('articles');
      const article = this.articles().find(a => a.id === result.id);
      if (article) {
        this.openArticle(article);
      }
    } else if (result.type === 'faq') {
      this.setActiveView('faq');
      this.toggleFAQ(result.id);
    }
  }

  shareArticle(article: HelpArticle): void {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.content.substring(0, 100) + '...',
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Article link copied to clipboard!');
      });
    }
  }

  submitContactForm(): void {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.showSuccessMessage.set(true);
        this.resetContactForm();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.showSuccessMessage.set(false);
        }, 5000);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  resetContactForm(): void {
    this.contactForm.reset();
    this.showSuccessMessage.set(false);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getEmailErrorMessage(): string {
    const emailField = this.contactForm.get('email');
    if (emailField?.errors?.['required']) {
      return 'Email is required';
    }
    if (emailField?.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  // Utility methods
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getCategoryTitle(categoryId: string): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category?.title || 'Unknown Category';
  }

  trackByArticleId(index: number, article: HelpArticle): string {
    return article.id;
  }

  trackByFAQId(index: number, faq: FAQ): string {
    return faq.id;
  }

  private calculateRelevance(query: string, content: string): number {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    
    let score = 0;
    
    // Title match gets higher score
    if (contentLower.includes(queryLower)) {
      score += queryLower.length / contentLower.length * 100;
    }
    
    // Count word matches
    const queryWords = queryLower.split(' ');
    queryWords.forEach(word => {
      if (contentLower.includes(word)) {
        score += 10;
      }
    });
    
    return score;
  }

  private incrementViews(articleId: string): void {
    const articles = this.articles();
    const article = articles.find(a => a.id === articleId);
    if (article) {
      article.views++;
      this.articles.set([...articles]);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  private simulateChatStatus(): void {
    // Simulate realistic chat availability
    const now = new Date();
    const hour = now.getHours();
    const isBusinessHours = hour >= 9 && hour < 18; // 9 AM to 6 PM
    
    this.chatStatus.set(isBusinessHours ? 'online' : 'offline');
    
    // Update status every minute
    setInterval(() => {
      const currentHour = new Date().getHours();
      const isOnline = currentHour >= 9 && currentHour < 18;
      this.chatStatus.set(isOnline ? 'online' : 'offline');
    }, 60000);
  }
}