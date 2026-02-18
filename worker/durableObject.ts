import { DurableObject } from "cloudflare:workers";
import type { DemoItem, HistoryItem, Bookmark } from '@shared/types';
import { MOCK_ITEMS } from '@shared/mock-data';
export class GlobalDurableObject extends DurableObject {
    async getCounterValue(): Promise<number> {
      const value = (await this.ctx.storage.get("counter_value")) || 0;
      return value as number;
    }
    async getDemoItems(): Promise<DemoItem[]> {
      const items = await this.ctx.storage.get("demo_items");
      if (items) {
        return items as DemoItem[];
      }
      await this.ctx.storage.put("demo_items", MOCK_ITEMS);
      return MOCK_ITEMS;
    }
    // --- History Implementation ---
    async getHistory(): Promise<HistoryItem[]> {
      const history = await this.ctx.storage.get<HistoryItem[]>("browsing_history") || [];
      return history;
    }
    async addHistoryItem(item: HistoryItem): Promise<HistoryItem[]> {
      let history = await this.getHistory();
      history = history.filter(h => h.url !== item.url);
      history.unshift(item);
      const limitedHistory = history.slice(0, 20);
      await this.ctx.storage.put("browsing_history", limitedHistory);
      return limitedHistory;
    }
    async clearHistory(): Promise<void> {
      await this.ctx.storage.delete("browsing_history");
    }
    // --- Bookmarks Implementation ---
    async getBookmarks(): Promise<Bookmark[]> {
      return await this.ctx.storage.get<Bookmark[]>("user_bookmarks") || [];
    }
    async toggleBookmark(item: Bookmark): Promise<Bookmark[]> {
      let bookmarks = await this.getBookmarks();
      const exists = bookmarks.find(b => b.url === item.url);
      if (exists) {
        bookmarks = bookmarks.filter(b => b.url !== item.url);
      } else {
        bookmarks.unshift(item);
      }
      await this.ctx.storage.put("user_bookmarks", bookmarks);
      return bookmarks;
    }
    async removeBookmark(url: string): Promise<Bookmark[]> {
      let bookmarks = await this.getBookmarks();
      bookmarks = bookmarks.filter(b => b.url !== url);
      await this.ctx.storage.put("user_bookmarks", bookmarks);
      return bookmarks;
    }
}