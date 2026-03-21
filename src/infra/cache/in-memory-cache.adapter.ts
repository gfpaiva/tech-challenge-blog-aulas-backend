/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { ICachePort } from '@common/ports/cache.port';

interface CacheEntry {
  value: string;
  expiresAt?: number;
}

@Injectable()
export class InMemoryCacheAdapter implements ICachePort {
  private readonly store = new Map<string, CacheEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);

    if (!entry) return null;

    if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const entry: CacheEntry = {
      value,
      ...(ttlSeconds !== undefined
        ? { expiresAt: Date.now() + ttlSeconds * 1000 }
        : {}),
    };

    this.store.set(key, entry);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delMatch(pattern: string): Promise<void> {
    const regex = new RegExp(
      '^' +
        pattern
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.') +
        '$',
    );

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }
}
