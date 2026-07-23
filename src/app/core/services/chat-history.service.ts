import { Injectable } from '@angular/core';

export interface SavedConversation {
  id: string;
  title: string;
  messages: { role: 'user' | 'assistant'; content: string; timestamp: Date }[];
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
  messageCount: number;
}

const STORAGE_KEY = 'wolverine_chat_history';

@Injectable({ providedIn: 'root' })
export class ChatHistoryService {
  /** Load all saved conversations, sorted by most-recently-updated first. */
  getAll(): SavedConversation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return (JSON.parse(raw) as SavedConversation[]).sort(
        (a, b) => b.updatedAt - a.updatedAt
      );
    } catch {
      return [];
    }
  }

  /** Save (create or update) a conversation. */
  save(conv: SavedConversation): void {
    const all = this.getAll();
    const idx = all.findIndex((c) => c.id === conv.id);
    if (idx >= 0) {
      all[idx] = { ...conv, updatedAt: Date.now() };
    } else {
      all.unshift({ ...conv, createdAt: Date.now(), updatedAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  /** Remove a conversation by id. */
  delete(id: string): void {
    const all = this.getAll().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  /** Load a single conversation by id, or null. */
  getById(id: string): SavedConversation | null {
    return this.getAll().find((c) => c.id === id) ?? null;
  }

  /** Generate a unique conversation id. */
  static generateId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /** Derive a short title from the first user message or fall back to date. */
  static deriveTitle(messages: { role: string; content: string }[]): string {
    const firstUser = messages.find((m) => m.role === 'user');
    if (firstUser) {
      const t = firstUser.content.trim();
      return t.length > 50 ? t.slice(0, 47) + '…' : t;
    }
    return `Chat — ${new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`;
  }
}
