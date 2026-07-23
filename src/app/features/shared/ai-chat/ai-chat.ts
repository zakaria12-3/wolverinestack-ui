import { Component, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { AiChatService, ChatMessage } from '../../../core/services/ai-chat.service';
import { ChatHistoryService, SavedConversation } from '../../../core/services/chat-history.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [FormsModule, NgClass, DatePipe],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.css'],
})
export class AiChat implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: ChatMessage[] = [];
  inputMessage = '';
  isLoading = false;

  // -- Chat History Sidebar --
  conversations: SavedConversation[] = [];
  filteredConversations: SavedConversation[] = [];
  searchQuery = '';
  currentConversationId = ChatHistoryService.generateId();
  showHistory = false;
  editingTitleId: string | null = null;
  editingTitleValue = '';
  deleteConfirmId: string | null = null;

  // Suggested quick prompts
  suggestions = [
    'What should I eat after a workout?',
    'How much protein do I need daily?',
    'Suggest a push day workout',
    'How many calories should I burn per session?',
  ];

  constructor(
    private aiChat: AiChatService,
    private chatHistory: ChatHistoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadConversationList();

    // Check if user navigated here with a conversation id in URL hash
    const hashConvId = window.location.hash.replace('#conv-', '');
    if (hashConvId) {
      this.loadConversation(hashConvId);
    } else {
      // Add initial welcome message
      this.messages.push({
        role: 'assistant',
        content: 'Hey, I\u2019m your Wolverine Stack AI coach. Ask me anything about fitness, nutrition, workouts, or goals. I\u2019m here to help!',
        timestamp: new Date(),
      });
    }
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  /** Auto-save current conversation when the user navigates away. */
  ngOnDestroy() {
    this.autoSaveCurrent();
  }

  // ─── Chat History Sidebar ─────────────────────────────────

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory) {
      this.loadConversationList();
    } else {
      // Reset transient UI state when closing sidebar
      this.deleteConfirmId = null;
      this.editingTitleId = null;
      this.clearSearch();
    }
  }

  private loadConversationList(): void {
    this.conversations = this.chatHistory.getAll();
    this.applyFilter();
  }

  /** Filter conversations by search query (matches title + message content). */
  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredConversations = this.conversations;
      return;
    }
    this.filteredConversations = this.conversations.filter((conv) => {
      if (conv.title.toLowerCase().includes(q)) return true;
      return conv.messages.some((m) =>
        m.content.toLowerCase().includes(q)
      );
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilter();
  }

  /** Start a brand-new conversation. */
  newConversation(): void {
    this.autoSaveCurrent(); // save whatever we had
    this.currentConversationId = ChatHistoryService.generateId();
    this.messages = [
      {
        role: 'assistant',
        content: 'Hey, I\u2019m your Wolverine Stack AI coach. Ask me anything about fitness, nutrition, workouts, or goals. I\u2019m here to help!',
        timestamp: new Date(),
      },
    ];
    this.showHistory = false;
    this.scrollToBottom();
  }

  /** Load a saved conversation into the active view. */
  loadConversation(id: string): void {
    const saved = this.chatHistory.getById(id);
    if (!saved) return;
    this.autoSaveCurrent(); // save current before switching
    this.currentConversationId = id;
    this.messages = saved.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: new Date(m.timestamp),
    }));
    this.showHistory = false;
    this.scrollToBottom();
  }

  /** Delete a conversation from history. */
  deleteConversation(id: string): void {
    this.chatHistory.delete(id);
    this.loadConversationList();
    this.deleteConfirmId = null;

    // If we just deleted the active conversation, start a new one
    if (this.currentConversationId === id) {
      this.newConversation();
    }
  }

  /** Start renaming a conversation title inline. */
  startRename(id: string): void {
    this.editingTitleId = id;
    const conv = this.conversations.find((c) => c.id === id);
    this.editingTitleValue = conv?.title ?? '';
  }

  /** Save the renamed title. */
  saveRename(id: string): void {
    const conv = this.conversations.find((c) => c.id === id);
    if (conv && this.editingTitleValue.trim()) {
      conv.title = this.editingTitleValue.trim();
      this.chatHistory.save(conv);
      this.loadConversationList();
    }
    this.editingTitleId = null;
    this.editingTitleValue = '';
  }

  /** Cancel rename. */
  cancelRename(): void {
    this.editingTitleId = null;
    this.editingTitleValue = '';
  }

  /** Auto-save the current messages to localStorage. */
  private autoSaveCurrent(): void {
    if (this.messages.length <= 1) return; // don't save empty or welcome-only chats
    try {
      this.chatHistory.save({
        id: this.currentConversationId,
        title: ChatHistoryService.deriveTitle(this.messages),
        messages: this.messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messageCount: this.messages.filter((m) => m.role === 'user').length,
      });
    } catch (_) {
      // localStorage may be full or unavailable — silently ignore
    }
  }

  /** Format the date for display in the sidebar list. */
  formatSidebarDate(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // ─── Messaging ────────────────────────────────────────────

  private scrollToBottom(): void {
    try {
      this.cdr.detectChanges();
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (_) {}
  }

  sendMessage(text?: string) {
    const message = text || this.inputMessage;
    if (!message?.trim() || this.isLoading) return;

    this.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    });
    this.inputMessage = '';
    this.isLoading = true;
    this.scrollToBottom();

    this.aiChat.sendMessage(message.trim()).subscribe({
      next: (reply) => {
        this.messages.push({
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        });
        this.isLoading = false;
        // Auto-save after each AI reply
        this.autoSaveCurrent();
        this.scrollToBottom();
      },
      error: (err) => {
        this.messages.push({
          role: 'assistant',
          content:
            err.error?.message ||
            err.message ||
            'Sorry, I couldn\u2019t reach the AI. Please try again.',
          timestamp: new Date(),
        });
        this.isLoading = false;
        this.scrollToBottom();
      },
    });
  }

  useSuggestion(text: string) {
    this.sendMessage(text);
  }

  trackByTimestamp(_index: number, msg: ChatMessage): number {
    return msg.timestamp.getTime();
  }
}
