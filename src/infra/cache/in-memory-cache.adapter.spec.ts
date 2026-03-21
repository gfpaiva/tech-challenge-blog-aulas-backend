import { InMemoryCacheAdapter } from './in-memory-cache.adapter';

describe('InMemoryCacheAdapter', () => {
  let adapter: InMemoryCacheAdapter;

  beforeEach(() => {
    adapter = new InMemoryCacheAdapter();
  });

  describe('get', () => {
    it('should return null for a missing key', async () => {
      expect(await adapter.get('missing')).toBeNull();
    });

    it('should return the stored value', async () => {
      await adapter.set('key', 'value');
      expect(await adapter.get('key')).toBe('value');
    });

    it('should return null for an expired key', async () => {
      await adapter.set('key', 'value', -1);
      expect(await adapter.get('key')).toBeNull();
    });

    it('should return the value when TTL has not yet expired', async () => {
      await adapter.set('key', 'value', 60);
      expect(await adapter.get('key')).toBe('value');
    });
  });

  describe('set', () => {
    it('should overwrite an existing key', async () => {
      await adapter.set('key', 'first');
      await adapter.set('key', 'second');
      expect(await adapter.get('key')).toBe('second');
    });

    it('should store a value without TTL that never expires', async () => {
      await adapter.set('key', 'persistent');
      expect(await adapter.get('key')).toBe('persistent');
    });
  });

  describe('del', () => {
    it('should remove an existing key', async () => {
      await adapter.set('key', 'value');
      await adapter.del('key');
      expect(await adapter.get('key')).toBeNull();
    });

    it('should not throw when deleting a non-existent key', async () => {
      await expect(adapter.del('missing')).resolves.not.toThrow();
    });
  });

  describe('delMatch', () => {
    beforeEach(async () => {
      await adapter.set('posts:list:page:1:limit:10', 'a');
      await adapter.set('posts:list:page:2:limit:10', 'b');
      await adapter.set('posts:detail:1', 'c');
    });

    it('should delete all keys matching a wildcard pattern', async () => {
      await adapter.delMatch('posts:list:*');
      expect(await adapter.get('posts:list:page:1:limit:10')).toBeNull();
      expect(await adapter.get('posts:list:page:2:limit:10')).toBeNull();
    });

    it('should not delete keys that do not match the pattern', async () => {
      await adapter.delMatch('posts:list:*');
      expect(await adapter.get('posts:detail:1')).toBe('c');
    });

    it('should delete a single key with an exact-match pattern', async () => {
      await adapter.delMatch('posts:detail:1');
      expect(await adapter.get('posts:detail:1')).toBeNull();
    });

    it('should match a single character with a ? wildcard', async () => {
      await adapter.set('key:a', '1');
      await adapter.set('key:b', '2');
      await adapter.set('key:ab', '3');

      await adapter.delMatch('key:?');
      expect(await adapter.get('key:a')).toBeNull();
      expect(await adapter.get('key:b')).toBeNull();
      expect(await adapter.get('key:ab')).toBe('3');
    });

    it('should not throw when no keys match the pattern', async () => {
      await expect(adapter.delMatch('nonexistent:*')).resolves.not.toThrow();
    });
  });
});
