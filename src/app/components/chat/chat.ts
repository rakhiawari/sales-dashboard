import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  // State
  searchQuery = '';
  newMessage = '';
  currentUserId = 'user-1';
  
  // Signals
  readonly selectedContact = signal<ChatContact | null>(null);
  readonly isTyping = signal(false);
  readonly isSending = signal(false);
  readonly showAttachments = signal(false);
  
  // Mock data
  readonly contacts = signal<ChatContact[]>([
    {
      id: 'contact-1',
      name: 'Sarah Wilson',
      avatar: 'assets/images/avatars/sarah.svg',
      status: 'online',
      lastMessage: 'Thanks for the quick response!',
      lastMessageTime: new Date(Date.now() - 300000), // 5 minutes ago
      unreadCount: 2
    },
    {
      id: 'contact-2',
      name: 'Mike Johnson',
      avatar: 'assets/images/avatars/mike.svg',
      status: 'away',
      lastMessage: 'Can we schedule a meeting?',
      lastMessageTime: new Date(Date.now() - 3600000), // 1 hour ago
      unreadCount: 0
    },
    {
      id: 'contact-3',
      name: 'Customer Support',
      avatar: 'assets/images/avatars/support.svg',
      status: 'online',
      lastMessage: 'How can we help you today?',
      lastMessageTime: new Date(Date.now() - 7200000), // 2 hours ago
      unreadCount: 1
    }
  ]);

  readonly messages = signal<Record<string, ChatMessage[]>>({
    'contact-1': [
      {
        id: 'msg-1',
        senderId: 'contact-1',
        senderName: 'Sarah Wilson',
        senderAvatar: 'assets/images/avatars/sarah.svg',
        content: 'Hi! I wanted to follow up on our order.',
        timestamp: new Date(Date.now() - 1800000),
        type: 'text',
        isRead: true
      },
      {
        id: 'msg-2',
        senderId: 'user-1',
        senderName: 'You',
        senderAvatar: 'assets/images/avatars/user-avatar.svg',
        content: 'Of course! Let me check the status for you.',
        timestamp: new Date(Date.now() - 1200000),
        type: 'text',
        isRead: true
      },
      {
        id: 'msg-3',
        senderId: 'contact-1',
        senderName: 'Sarah Wilson',
        senderAvatar: 'assets/images/avatars/sarah.svg',
        content: 'Thanks for the quick response!',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        isRead: false
      }
    ]
  });

  readonly filteredContacts = signal<ChatContact[]>([]);

  // Computed
  readonly currentMessages = signal<ChatMessage[]>([]);

  constructor() {
    this.filteredContacts.set(this.contacts());
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  selectContact(contact: ChatContact): void {
    this.selectedContact.set(contact);
    const contactMessages = this.messages()[contact.id] || [];
    this.currentMessages.set(contactMessages);
    
    // Mark messages as read
    this.markMessagesAsRead(contact.id);
  }

  filterContacts(): void {
    const query = this.searchQuery.toLowerCase();
    const filtered = this.contacts().filter(contact =>
      contact.name.toLowerCase().includes(query)
    );
    this.filteredContacts.set(filtered);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedContact()) return;

    this.isSending.set(true);

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: this.currentUserId,
      senderName: 'You',
      senderAvatar: 'assets/images/avatars/user-avatar.svg',
      content: this.newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
      isRead: true
    };

    // Add message to current conversation
    const contactId = this.selectedContact()!.id;
    const currentMessages = this.messages();
    const contactMessages = currentMessages[contactId] || [];
    
    this.messages.set({
      ...currentMessages,
      [contactId]: [...contactMessages, message]
    });
    
    this.currentMessages.set([...this.currentMessages(), message]);

    // Update contact's last message
    const contacts = this.contacts();
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, lastMessage: message.content, lastMessageTime: message.timestamp }
        : contact
    );
    this.contacts.set(updatedContacts);
    this.filteredContacts.set(updatedContacts);

    this.newMessage = '';
    this.isSending.set(false);

    // Simulate response after a delay
    setTimeout(() => this.simulateResponse(), 2000);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onTyping(): void {
    // Simulate typing indicator logic
  }

  simulateResponse(): void {
    if (!this.selectedContact()) return;

    this.isTyping.set(true);

    setTimeout(() => {
      const responses = [
        "That sounds great!",
        "I'll get back to you on that.",
        "Thanks for letting me know.",
        "Perfect, I'll take care of it.",
        "Got it, thanks!"
      ];

      const response: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: this.selectedContact()!.id,
        senderName: this.selectedContact()!.name,
        senderAvatar: this.selectedContact()!.avatar,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text',
        isRead: false
      };

      const contactId = this.selectedContact()!.id;
      const currentMessages = this.messages();
      const contactMessages = currentMessages[contactId] || [];
      
      this.messages.set({
        ...currentMessages,
        [contactId]: [...contactMessages, response]
      });
      
      this.currentMessages.set([...this.currentMessages(), response]);
      this.isTyping.set(false);
    }, 1500);
  }

  markMessagesAsRead(contactId: string): void {
    const contacts = this.contacts();
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId ? { ...contact, unreadCount: 0 } : contact
    );
    this.contacts.set(updatedContacts);
    this.filteredContacts.set(updatedContacts);
  }

  startNewChat(): void {
    console.log('Starting new chat...');
  }

  initiateCall(): void {
    console.log('Initiating call...');
  }

  initiateVideoCall(): void {
    console.log('Initiating video call...');
  }

  showContactInfo(): void {
    console.log('Showing contact info...');
  }

  showAttachmentOptions(): void {
    this.showAttachments.set(true);
  }

  closeAttachmentOptions(): void {
    this.showAttachments.set(false);
  }

  selectFile(type: string): void {
    console.log('Selecting file type:', type);
    this.closeAttachmentOptions();
  }

  selectLocation(): void {
    console.log('Selecting location...');
    this.closeAttachmentOptions();
  }

  showEmojiPicker(): void {
    console.log('Showing emoji picker...');
  }

  viewImage(url: string): void {
    console.log('Viewing image:', url);
  }

  getMessageSenderAvatar(message: ChatMessage): string {
    return message.senderAvatar;
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  }

  formatMessageTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
