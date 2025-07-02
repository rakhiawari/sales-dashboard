import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Enhanced interfaces for user management
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: UserRole;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: Date;
  lastLogin: Date;
  permissions: UserPermission[];
  phone?: string;
  location?: string;
  bio?: string;
  isOnline: boolean;
  totalOrders?: number;
  totalRevenue?: number;
}

interface UserRole {
  id: string;
  name: string;
  level: number;
  color: string;
  description: string;
}

interface UserPermission {
  id: string;
  name: string;
  category: string;
  description: string;
  granted: boolean;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: Date;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
}

interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

interface BulkAction {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresConfirmation: boolean;
}

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-user.html',
  styleUrls: ['./manage-user.scss']
})
export class ManageUserComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // State management with signals
  readonly activeTab = signal<'users' | 'roles' | 'invitations' | 'activity'>('users');
  readonly searchQuery = signal('');
  readonly roleFilter = signal('all');
  readonly statusFilter = signal('all');
  readonly departmentFilter = signal('all');
  readonly activityFilter = signal('all');
  readonly sortBy = signal('name');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly selectedUsers = signal<Set<string>>(new Set());
  readonly selectedUserDetail = signal<User | null>(null);
  readonly showInviteModal = signal(false);
  readonly showConfirmModal = signal(false);
  readonly isLoading = signal(false);
  readonly loadingMessage = signal('');
  readonly isSendingInvite = signal(false);
  readonly currentUserId = signal('current-user-1');

  // Forms
  inviteForm: FormGroup;

  // Confirmation modal data
  readonly confirmModalData = signal<{
    title: string;
    message: string;
    confirmText: string;
    isDestructive: boolean;
    action: () => void;
  }>({
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
    action: () => {}
  });

  // Mock data
  readonly userRoles = signal<UserRole[]>([
    {
      id: 'admin',
      name: 'Administrator',
      level: 5,
      color: '#ef4444',
      description: 'Full system access and user management'
    },
    {
      id: 'manager',
      name: 'Manager',
      level: 4,
      color: '#f59e0b',
      description: 'Team management and reporting access'
    },
    {
      id: 'sales',
      name: 'Sales Rep',
      level: 3,
      color: '#10b981',
      description: 'Sales tools and customer management'
    },
    {
      id: 'support',
      name: 'Support Agent',
      level: 2,
      color: '#3b82f6',
      description: 'Customer support and ticket management'
    },
    {
      id: 'viewer',
      name: 'Viewer',
      level: 1,
      color: '#6b7280',
      description: 'Read-only access to reports and data'
    }
  ]);

  readonly allUsers = signal<User[]>([
    {
      id: 'user-1',
      firstName: 'Zac',
      lastName: 'Hudson',
      email: 'zac.hudson@xenith.com',
      avatar: 'assets/images/avatars/zac.svg',
      role: this.userRoles()[0], // Admin
      department: 'Admin',
      status: 'active',
      joinDate: new Date('2023-01-15'),
      lastLogin: new Date(),
      isOnline: true,
      totalOrders: 156,
      totalRevenue: 85420,
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      bio: 'Product Manager focused on user experience and team leadership.',
      permissions: [
        { id: 'user_management', name: 'User Management', category: 'Admin', description: 'Manage users and permissions', granted: true },
        { id: 'system_settings', name: 'System Settings', category: 'Admin', description: 'Configure system settings', granted: true },
        { id: 'view_reports', name: 'View Reports', category: 'Analytics', description: 'Access all reports', granted: true },
        { id: 'manage_products', name: 'Manage Products', category: 'Sales', description: 'Add and edit products', granted: true }
      ]
    },
    {
      id: 'user-2',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@xenith.com',
      avatar: 'assets/images/avatars/sarah.svg',
      role: this.userRoles()[1], // Manager
      department: 'Sales',
      status: 'active',
      joinDate: new Date('2023-02-20'),
      lastLogin: new Date(Date.now() - 3600000),
      isOnline: false,
      totalOrders: 89,
      totalRevenue: 42180,
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      bio: 'Sales Manager with 5+ years of experience in customer relations.',
      permissions: [
        { id: 'view_reports', name: 'View Reports', category: 'Analytics', description: 'Access sales reports', granted: true },
        { id: 'manage_products', name: 'Manage Products', category: 'Sales', description: 'Add and edit products', granted: true },
        { id: 'customer_support', name: 'Customer Support', category: 'Support', description: 'Handle customer inquiries', granted: true }
      ]
    },
    {
      id: 'user-3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@xenith.com',
      avatar: 'assets/images/avatars/mike.svg',
      role: this.userRoles()[2], // Sales Rep
      department: 'Sales',
      status: 'active',
      joinDate: new Date('2023-03-10'),
      lastLogin: new Date(Date.now() - 7200000),
      isOnline: true,
      totalOrders: 234,
      totalRevenue: 128450,
      phone: '+1 (555) 345-6789',
      location: 'Chicago, IL',
      permissions: [
        { id: 'manage_products', name: 'Manage Products', category: 'Sales', description: 'Add and edit products', granted: true },
        { id: 'customer_support', name: 'Customer Support', category: 'Support', description: 'Handle customer inquiries', granted: true }
      ]
    },
    {
      id: 'user-4',
      firstName: 'Lisa',
      lastName: 'Chen',
      email: 'lisa.chen@xenith.com',
      avatar: 'assets/images/avatars/lisa.svg',
      role: this.userRoles()[3], // Support Agent
      department: 'Support',
      status: 'active',
      joinDate: new Date('2023-04-05'),
      lastLogin: new Date(Date.now() - 1800000),
      isOnline: false,
      phone: '+1 (555) 456-7890',
      location: 'Austin, TX',
      permissions: [
        { id: 'customer_support', name: 'Customer Support', category: 'Support', description: 'Handle customer inquiries', granted: true },
        { id: 'view_reports', name: 'View Reports', category: 'Analytics', description: 'Access support reports', granted: true }
      ]
    },
    {
      id: 'user-5',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@xenith.com',
      avatar: 'assets/images/avatars/david.svg',
      role: this.userRoles()[4], // Viewer
      department: 'Marketing',
      status: 'pending',
      joinDate: new Date('2023-06-15'),
      lastLogin: new Date(Date.now() - 86400000),
      isOnline: false,
      permissions: [
        { id: 'view_reports', name: 'View Reports', category: 'Analytics', description: 'Access marketing reports', granted: true }
      ]
    }
  ]);

  readonly teamInvitations = signal<TeamInvitation[]>([
    {
      id: 'inv-1',
      email: 'alice@company.com',
      role: this.userRoles()[2],
      invitedBy: 'Zac Hudson',
      invitedAt: new Date(Date.now() - 86400000),
      status: 'pending',
      expiresAt: new Date(Date.now() + 6 * 86400000)
    },
    {
      id: 'inv-2',
      email: 'bob@company.com',
      role: this.userRoles()[3],
      invitedBy: 'Sarah Wilson',
      invitedAt: new Date(Date.now() - 172800000),
      status: 'pending',
      expiresAt: new Date(Date.now() + 5 * 86400000)
    }
  ]);

  readonly userActivity = signal<UserActivity[]>([
    {
      id: 'act-1',
      userId: 'user-1',
      action: 'User Login',
      details: 'Zac Hudson logged in successfully',
      timestamp: new Date(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: 'act-2',
      userId: 'user-2',
      action: 'Profile Updated',
      details: 'Sarah Wilson updated her profile information',
      timestamp: new Date(Date.now() - 3600000),
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'act-3',
      userId: 'user-3',
      action: 'User Created',
      details: 'New user Mike Johnson was created by admin',
      timestamp: new Date(Date.now() - 7200000),
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
    }
  ]);

  readonly bulkActions = signal<BulkAction[]>([
    {
      id: 'activate',
      name: 'Activate',
      icon: '✅',
      description: 'Activate selected users',
      requiresConfirmation: false
    },
    {
      id: 'deactivate',
      name: 'Deactivate',
      icon: '❌',
      description: 'Deactivate selected users',
      requiresConfirmation: true
    },
    {
      id: 'delete',
      name: 'Delete',
      icon: '🗑️',
      description: 'Delete selected users',
      requiresConfirmation: true
    },
    {
      id: 'export',
      name: 'Export',
      icon: '📊',
      description: 'Export selected users',
      requiresConfirmation: false
    }
  ]);

  constructor() {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      roleId: ['', Validators.required],
      department: [''],
      message: ['']
    });
  }

  ngOnInit(): void {
    // Any initialization logic
  }

  // Computed properties
  readonly filteredUsers = computed(() => {
    let users = this.allUsers();
    const query = this.searchQuery().toLowerCase();
    const roleFilter = this.roleFilter();
    const statusFilter = this.statusFilter();
    const departmentFilter = this.departmentFilter();

    // Apply filters
    if (query) {
      users = users.filter(user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    if (roleFilter !== 'all') {
      users = users.filter(user => user.role.id === roleFilter);
    }

    if (statusFilter !== 'all') {
      users = users.filter(user => user.status === statusFilter);
    }

    if (departmentFilter !== 'all') {
      users = users.filter(user => user.department.toLowerCase() === departmentFilter);
    }

    // Apply sorting
    const sortBy = this.sortBy();
    const direction = this.sortDirection();

    users.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortBy) {
        case 'name':
          aVal = `${a.firstName} ${a.lastName}`;
          bVal = `${b.firstName} ${b.lastName}`;
          break;
        case 'role':
          aVal = a.role.name;
          bVal = b.role.name;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'lastLogin':
          aVal = a.lastLogin.getTime();
          bVal = b.lastLogin.getTime();
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

    return users;
  });

  readonly pendingInvitations = computed(() => {
    return this.teamInvitations().filter(inv => inv.status === 'pending');
  });

  readonly filteredActivity = computed(() => {
    const filter = this.activityFilter();
    if (filter === 'all') return this.userActivity();

    return this.userActivity().filter(activity =>
      activity.action.toLowerCase().includes(filter)
    );
  });

  readonly hasActiveFilters = computed(() => {
    return this.searchQuery() !== '' ||
           this.roleFilter() !== 'all' ||
           this.statusFilter() !== 'all' ||
           this.departmentFilter() !== 'all';
  });

  readonly isAllSelected = computed(() => {
    const users = this.filteredUsers();
    return users.length > 0 && users.every(user => this.selectedUsers().has(user.id));
  });

  readonly isPartiallySelected = computed(() => {
    const users = this.filteredUsers();
    const selected = this.selectedUsers();
    return users.some(user => selected.has(user.id)) && !this.isAllSelected();
  });

  // Methods
  setActiveTab(tab: 'users' | 'roles' | 'invitations' | 'activity'): void {
    this.activeTab.set(tab);
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  setRoleFilter(roleId: string): void {
    this.roleFilter.set(roleId);
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
  }

  setDepartmentFilter(department: string): void {
    this.departmentFilter.set(department);
  }

  setActivityFilter(filter: string): void {
    this.activityFilter.set(filter);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.roleFilter.set('all');
    this.statusFilter.set('all');
    this.departmentFilter.set('all');
  }

  setSortBy(field: string): void {
    if (this.sortBy() === field) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(field: string): string {
    if (this.sortBy() !== field) return '↕️';
    return this.sortDirection() === 'asc' ? '⬆️' : '⬇️';
  }

  toggleUserSelection(userId: string): void {
    const selected = this.selectedUsers();
    if (selected.has(userId)) {
      selected.delete(userId);
    } else {
      selected.add(userId);
    }
    this.selectedUsers.set(new Set(selected));
  }

  toggleSelectAll(): void {
    const users = this.filteredUsers();
    const selected = this.selectedUsers();

    if (this.isAllSelected()) {
      // Unselect all
      users.forEach(user => selected.delete(user.id));
    } else {
      // Select all
      users.forEach(user => selected.add(user.id));
    }

    this.selectedUsers.set(new Set(selected));
  }

  executeBulkAction(action: BulkAction): void {
    const selectedCount = this.selectedUsers().size;

    if (action.requiresConfirmation) {
      this.confirmModalData.set({
        title: `${action.name} Users`,
        message: `Are you sure you want to ${action.name.toLowerCase()} ${selectedCount} user(s)?`,
        confirmText: action.name,
        isDestructive: action.id === 'delete',
        action: () => this.performBulkAction(action.id)
      });
      this.showConfirmModal.set(true);
    } else {
      this.performBulkAction(action.id);
    }
  }

  performBulkAction(actionId: string): void {
    const selectedUsers = Array.from(this.selectedUsers());
    this.isLoading.set(true);
    this.loadingMessage.set(`Processing ${actionId}...`);

    // Simulate API call
    setTimeout(() => {
      switch (actionId) {
        case 'activate':
          this.updateUsersStatus(selectedUsers, 'active');
          break;
        case 'deactivate':
          this.updateUsersStatus(selectedUsers, 'inactive');
          break;
        case 'delete':
          this.deleteUsers(selectedUsers);
          break;
        case 'export':
          this.exportUsers(selectedUsers);
          break;
      }

      this.selectedUsers.set(new Set());
      this.isLoading.set(false);
      this.showConfirmModal.set(false);
    }, 1500);
  }

  updateUsersStatus(userIds: string[], status: 'active' | 'inactive'): void {
    const users = this.allUsers();
    const updated = users.map(user =>
      userIds.includes(user.id) ? { ...user, status } : user
    );
    this.allUsers.set(updated);
  }

  deleteUsers(userIds: string[]): void {
    const users = this.allUsers();
    const filtered = users.filter(user => !userIds.includes(user.id));
    this.allUsers.set(filtered);
  }

  exportUsers(userIds?: string[]): void {
    const usersToExport = userIds ?
      this.allUsers().filter(user => userIds.includes(user.id)) :
      this.allUsers();

    // Create CSV content
    const headers = ['Name', 'Email', 'Role', 'Department', 'Status', 'Join Date'];
    const csvContent = [
      headers.join(','),
      ...usersToExport.map(user => [
        `"${user.firstName} ${user.lastName}"`,
        user.email,
        user.role.name,
        user.department,
        user.status,
        user.joinDate.toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  viewUser(user: User): void {
    this.selectedUserDetail.set(user);
  }

  closeUserDetail(): void {
    this.selectedUserDetail.set(null);
  }

  editUser(user: User): void {
    // Navigate to edit user page or open edit modal
    console.log('Edit user:', user);
  }

  confirmDeleteUser(user: User): void {
    this.confirmModalData.set({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      confirmText: 'Delete',
      isDestructive: true,
      action: () => this.deleteUser(user.id)
    });
    this.showConfirmModal.set(true);
  }

  deleteUser(userId: string): void {
    const users = this.allUsers();
    const filtered = users.filter(user => user.id !== userId);
    this.allUsers.set(filtered);
    this.showConfirmModal.set(false);
  }

  openInviteModal(): void {
    this.showInviteModal.set(true);
    this.inviteForm.reset();
  }

  closeInviteModal(): void {
    this.showInviteModal.set(false);
  }

  sendInvitation(): void {
    if (this.inviteForm.valid) {
      this.isSendingInvite.set(true);

      // Simulate API call
      setTimeout(() => {
        const formValue = this.inviteForm.value;
        const role = this.userRoles().find(r => r.id === formValue.roleId)!;

        const newInvitation: TeamInvitation = {
          id: `inv-${Date.now()}`,
          email: formValue.email,
          role: role,
          invitedBy: 'Current User',
          invitedAt: new Date(),
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 86400000) // 7 days
        };

        this.teamInvitations.update(invitations => [...invitations, newInvitation]);
        this.isSendingInvite.set(false);
        this.showInviteModal.set(false);
      }, 2000);
    } else {
      this.markInviteFormGroupTouched();
    }
  }

  resendInvitation(invitation: TeamInvitation): void {
    console.log('Resending invitation to:', invitation.email);
    // Implement resend logic
  }

  cancelInvitation(invitation: TeamInvitation): void {
    const invitations = this.teamInvitations();
    const filtered = invitations.filter(inv => inv.id !== invitation.id);
    this.teamInvitations.set(filtered);
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
  }

  confirmAction(): void {
    this.confirmModalData().action();
  }

  createRole(): void {
    console.log('Creating new role...');
    // Implement role creation
  }

  editRole(role: UserRole): void {
    console.log('Editing role:', role);
    // Implement role editing
  }

  deleteRole(role: UserRole): void {
    console.log('Deleting role:', role);
    // Implement role deletion
  }

  getUsersInRole(roleId: string): number {
    return this.allUsers().filter(user => user.role.id === roleId).length;
  }

  getPermissionsCount(roleId: string): number {
    // This would typically come from role permissions data
    return 5; // Mock value
  }

  getKeyPermissions(roleId: string): UserPermission[] {
    // Return key permissions for the role
    return [
      { id: '1', name: 'View Reports', category: 'Analytics', description: '', granted: true },
      { id: '2', name: 'Manage Users', category: 'Admin', description: '', granted: true }
    ];
  }

  // Utility methods
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  formatActivityTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getDeviceInfo(userAgent: string): string {
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('Macintosh')) return 'macOS';
    if (userAgent.includes('Windows')) return 'Windows';
    return 'Unknown Device';
  }

  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  isInviteFieldInvalid(fieldName: string): boolean {
    const field = this.inviteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markInviteFormGroupTouched(): void {
    Object.keys(this.inviteForm.controls).forEach(key => {
      const control = this.inviteForm.get(key);
      control?.markAsTouched();
    });
  }
}