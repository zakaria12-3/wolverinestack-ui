import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessagingService, Conversation, Message } from '../../../core/services/messaging.service';
import { SearchService } from '../../../core/services/search.service';
import { UserProfile } from '../../../core/services/user.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css']
})
export class Messages implements OnInit {
  conversations: Conversation[] = [];
  messages: Message[] = [];
  selectedConversation: Conversation | null = null;
  draft = '';
  newReceiverId: number | null = null;
  usernameQuery = '';
  memberResults: UserProfile[] = [];
  selectedRecipientName = '';
  isSearching = false;
  isLoading = true;
  isSending = false;
  error = '';

  constructor(
    private messagingService: MessagingService,
    private searchService: SearchService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const username = this.route.snapshot.queryParamMap.get('username')?.trim();
    if (username) {
      this.usernameQuery = username;
      this.searchMembers();
    }
    this.loadConversations();
  }

  searchMembers(): void {
    const username = this.usernameQuery.trim();
    this.memberResults = [];
    this.newReceiverId = null;
    this.selectedRecipientName = '';
    if (username.length < 2) {
      this.error = 'Enter at least two characters of a username.';
      return;
    }

    this.error = '';
    this.isSearching = true;
    this.searchService.globalSearch(username, 'users').subscribe({
      next: (response) => {
        const normalized = username.toLowerCase();
        this.memberResults = (response.users || [])
          .filter(user => !!user.id && !!user.username)
          .sort((a, b) => {
            const aExact = a.username?.toLowerCase() === normalized ? 0 : 1;
            const bExact = b.username?.toLowerCase() === normalized ? 0 : 1;
            return aExact - bExact;
          });
        this.isSearching = false;
        if (!this.memberResults.length) {
          this.error = `No member found for “${username}”.`;
        }
      },
      error: () => {
        this.isSearching = false;
        this.error = 'Member search is unavailable right now.';
      }
    });
  }

  chooseMember(user: UserProfile): void {
    if (!user.id) return;
    const existing = this.conversations.find(conversation => conversation.participantId === user.id);
    this.newReceiverId = user.id;
    this.selectedRecipientName = user.username || user.email || 'Member';
    this.usernameQuery = this.selectedRecipientName;
    this.memberResults = [];
    this.error = '';
    if (existing) {
      this.selectConversation(existing);
    } else {
      this.selectedConversation = null;
      this.messages = [];
    }
  }

  loadConversations(): void {
    this.isLoading = true;
    this.messagingService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations || [];
        this.isLoading = false;
        if (this.conversations.length && !this.newReceiverId) {
          this.selectConversation(this.conversations[0]);
        }
      },
      error: () => {
        this.error = 'Messaging is ready in the app, but the server endpoint is not responding yet.';
        this.isLoading = false;
      }
    });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.messages = [];
    this.messagingService.getMessages(conversation.id).subscribe({
      next: (messages) => {
        this.messages = messages || [];
      },
      error: () => {
        this.messages = [];
      }
    });
  }

  send(): void {
    const content = this.draft.trim();
    const receiverId = this.selectedConversation?.participantId || this.newReceiverId;
    if (!content || !receiverId) return;

    this.isSending = true;
    const optimistic: Message = {
      content,
      receiverId,
      conversationId: this.selectedConversation?.id,
      createdAt: new Date().toISOString(),
      mine: true
    };
    this.messages = [...this.messages, optimistic];
    this.draft = '';

    this.messagingService.sendMessage(receiverId, content, this.selectedConversation?.id).subscribe({
      next: (message) => {
        this.messages = this.messages.map(item => item === optimistic ? { ...message, mine: true } : item);
        this.isSending = false;
        this.loadConversations();
      },
      error: () => {
        this.error = 'Message saved on screen, but the server could not deliver it yet.';
        this.isSending = false;
      }
    });
  }

  getConversationName(): string {
    return this.selectedConversation?.participantName || this.selectedRecipientName || 'New message';
  }

  formatTime(value?: string): string {
    if (!value) return '';
    return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
}
