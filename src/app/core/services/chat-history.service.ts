import { Injectable } from '@angular/core';

export interface SavedConversation {
  id: string;
  title: string;
  messages: { role: 'user' | 'assistant'; content: string; timestamp: Date }[];
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
  messageCount: number;
  tags?: ConversationTag[];
}

export type ConversationTag = 'pr' | 'stall' | 'nutrition';

const STORAGE_KEY = 'wolverine_chat_history';

/** Keyword patterns for auto-detecting conversation topics in AI replies. */
const TAG_PATTERNS: Record<ConversationTag, RegExp[]> = {
  pr: [
    /personal\s*record/i,
    /\bnew\s+pr\b/i,
    /all[-\s]time\s+best/i,
    /estimated\s+1rm/i,
    /beat\s+your\s+previous/i,
    /estimated\s+one[\s-]rep\s+max/i,
    /congratulations.*(?:pr|record)/i,
    /\byou['']ve\s+improved\b/i,
    /\bbest\s+set\s+(?:yet|ever)\b/i,
  ],
  stall: [
    /\bstalled\b/i,
    /\bplateau\b/i,
    /\bstuck\s+(?:at|on)\b/i,
    /(?:hasn['']t|haven['']t)\s+improved/i,
    /break\s+through/i,
    /haven['']t\s+progressed/i,
    /not\s+(?:seen|made)\s+(?:progress|improvement)/i,
    /swap\s+(?:to|for)\s+(?:a|an)\s+(?:variation|exercise)/i,
    /stalling\s*point/i,
    /stagnant/i,
  ],
  nutrition: [
    /\bmeal\b/i,
    /\bprotein\b/i,
    /\bcalories?\b/i,
    /\bdiet\b/i,
    /\bmacros?\b/i,
    /\bnutrition\b/i,
    /carbs?\b/i,
    /\bfat\s+(?:loss|burn|intake)\b/i,
    /\bfoods?\b/i,
    /\brecipe\b/i,
    /\bhydrat\w+\b/i,
  ],
};

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
      all[idx] = { ...conv, tags: conv.tags ?? all[idx].tags, updatedAt: Date.now() };
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

  /** Scan messages and detect tags based on keyword patterns in AI replies. */
  static detectTags(
    messages: { role: string; content: string }[]
  ): ConversationTag[] {
    const detected = new Set<ConversationTag>();
    const aiReplies = messages.filter((m) => m.role === 'assistant');
    for (const reply of aiReplies) {
      for (const [tag, patterns] of Object.entries(TAG_PATTERNS)) {
        if (detected.has(tag as ConversationTag)) continue;
        for (const regex of patterns) {
          if (regex.test(reply.content)) {
            detected.add(tag as ConversationTag);
            break;
          }
        }
      }
    }
    return Array.from(detected);
  }

  /** Human-readable label for a tag. */
  static tagLabel(tag: ConversationTag): string {
    switch (tag) {
      case 'pr': return 'PR';
      case 'stall': return 'Stall';
      case 'nutrition': return 'Nutrition';
    }
  }

  /** Material Symbols icon for a tag. */
  static tagIcon(tag: ConversationTag): string {
    switch (tag) {
      case 'pr': return 'military_tech';
      case 'stall': return 'trending_flat';
      case 'nutrition': return 'restaurant';
    }
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
