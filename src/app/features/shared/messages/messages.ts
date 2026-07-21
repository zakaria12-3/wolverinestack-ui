import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService, Conversation, Message } from '../../../core/services/messaging.service';

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
  isLoading = true;
  isSending = false;
  error = '';

  constructor(private messagingService: MessagingService) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.isLoading = true;
    this.messagingService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations || [];
        this.isLoading = false;
        if (this.conversations.length) {
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
    return this.selectedConversation?.participantName || 'New message';
  }

  formatTime(value?: string): string {
    if (!value) return '';
    return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
}
