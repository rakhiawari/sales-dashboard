import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SettingsSection {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent {
  // Active section
  readonly activeSection = signal('profile');

  // Settings sections
  readonly settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: '👤',
      description: 'Personal information and avatar'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: '🔔',
      description: 'Manage notification preferences'
    },
    {
      id: 'security',
      title: 'Security',
      icon: '🔒',
      description: 'Password and security settings'
    },
    {
      id: 'billing',
      title: 'Billing',
      icon: '💳',
      description: 'Subscription and payment info'
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: '⚙️',
      description: 'App settings and preferences'
    }
  ];

  // Profile data
  firstName = 'Zac';
  lastName = 'Hudson';
  email = 'zac.hudson@xenith.com';
  bio = 'Administrator at Xenith Dashboard';
  readonly profilePicture = signal('assets/images/avatars/user-avatar.svg');

  // Security data
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  readonly twoFactorEnabled = signal(false);
  
  readonly activeSessions = signal([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, NY',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, NY',
      lastActive: '1 hour ago',
      current: false
    }
  ]);

  // Billing data
  readonly currentPlan = signal({
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    price: 49,
    period: 'month'
  });

  readonly billingHistory = signal([
    {
      id: 'inv-001',
      date: 'June 1, 2024',
      amount: 49,
      status: 'paid'
    },
    {
      id: 'inv-002',
      date: 'May 1, 2024',
      amount: 49,
      status: 'paid'
    }
  ]);

  // Preferences
  selectedTheme = 'auto';
  selectedLanguage = 'en';
  showWelcomeMessage = true;
  autoRefreshData = true;
  refreshInterval = '60';

  // Notification settings
  readonly notificationSettings = signal<NotificationSetting[]>([
    {
      id: 'new-orders',
      title: 'New Orders',
      description: 'Get notified when new orders are placed',
      enabled: true,
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'low-stock',
      title: 'Low Stock Alerts',
      description: 'Alerts when product inventory is running low',
      enabled: true,
      email: true,
      push: false,
      sms: true
    },
    {
      id: 'customer-reviews',
      title: 'Customer Reviews',
      description: 'Notifications for new customer reviews',
      enabled: false,
      email: false,
      push: false,
      sms: false
    },
    {
      id: 'system-updates',
      title: 'System Updates',
      description: 'Important system and security updates',
      enabled: true,
      email: true,
      push: true,
      sms: false
    }
  ]);

  setActiveSection(sectionId: string): void {
    this.activeSection.set(sectionId);
  }

  // Profile methods
  uploadProfilePicture(): void {
    console.log('Uploading profile picture...');
    // Implement file upload logic
  }

  saveProfile(): void {
    console.log('Saving profile...', {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      bio: this.bio
    });
  }

  // Notification methods
  updateNotificationSetting(id: string, field: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const settings = this.notificationSettings();
    const updated = settings.map(setting => 
      setting.id === id 
        ? { ...setting, [field]: target.checked }
        : setting
    );
    this.notificationSettings.set(updated);
  }

  saveNotificationSettings(): void {
    console.log('Saving notification settings...', this.notificationSettings());
  }

  // Security methods
  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Changing password...');
  }

  toggleTwoFactor(): void {
    this.twoFactorEnabled.update(enabled => !enabled);
    console.log('Two-factor authentication:', this.twoFactorEnabled() ? 'enabled' : 'disabled');
  }

  terminateSession(sessionId: string): void {
    const sessions = this.activeSessions();
    const updated = sessions.filter(session => session.id !== sessionId);
    this.activeSessions.set(updated);
    console.log('Session terminated:', sessionId);
  }

  // Billing methods
  upgradePlan(): void {
    console.log('Upgrading plan...');
  }

  downloadInvoice(invoiceId: string): void {
    console.log('Downloading invoice:', invoiceId);
  }

  // Preferences methods
  changeTheme(theme: string): void {
    console.log('Changing theme to:', theme);
    // Implement theme change logic
  }

  changeLanguage(language: string): void {
    console.log('Changing language to:', language);
    // Implement language change logic
  }

  savePreferences(): void {
    console.log('Saving preferences...', {
      theme: this.selectedTheme,
      language: this.selectedLanguage,
      showWelcomeMessage: this.showWelcomeMessage,
      autoRefreshData: this.autoRefreshData,
      refreshInterval: this.refreshInterval
    });
  }
}