import { Component, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { AiChatService, ChatMessage } from '../../../core/services/ai-chat.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [FormsModule, NgClass, DatePipe],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.css'],
})
export class AiChat implements OnInit, AfterViewInit {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: ChatMessage[] = [];
  inputMessage = '';
  isLoading = false;

  // Suggested quick prompts
  suggestions = [
    'What should I eat after a workout?',
    'How much protein do I need daily?',
    'Suggest a push day workout',
    'How many calories should I burn per session?',
  ];

  constructor(
    private aiChat: AiChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Add initial welcome message
    this.messages.push({
      role: 'assistant',
      content: 'Hey, I\u2019m your Wolverine Stack AI coach. Ask me anything about fitness, nutrition, workouts, or goals. I\u2019m here to help!',
      timestamp: new Date(),
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  /**
   * Scroll chat container to the bottom.
   * Forces change detection first so the DOM reflects latest messages before measuring scroll height.
   */
  private scrollToBottom(): void {
    try {
      this.cdr.detectChanges(); // ensure DOM is up-to-date before measuring
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (_) {}
  }

  sendMessage(text?: string) {
    const message = text || this.inputMessage;
    if (!message?.trim() || this.isLoading) return;

    // Add user message
    this.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    });
    this.inputMessage = '';
    this.isLoading = true;

    // Scroll to show user message after DOM updates
    this.scrollToBottom();

    // Call the AI chat endpoint
    this.aiChat.sendMessage(message.trim()).subscribe({
      next: (reply) => {
        this.messages.push({
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        this.messages.push({
          role: 'assistant',
          content: err.error?.message || err.message || 'Sorry, I couldn\u2019t reach the AI. Please try again.',
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
