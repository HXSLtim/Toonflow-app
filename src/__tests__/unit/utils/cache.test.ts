import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LRUCache } from '@/utils/cache';

describe('LRUCache', () => {
  let cache: LRUCache<string, any>;

  beforeEach(() => {
    cache = new LRUCache<string, any>(3, 1000); // 最大3项，1秒过期
  });

  describe('基本操作', () => {
    it('应该能够设置和获取值', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('应该在键不存在时返回 undefined', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('应该能够检查键是否存在', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('应该能够删除键', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);

      const deleted = cache.delete('key1');
      expect(deleted).toBe(true);
      expect(cache.has('key1')).toBe(false);
    });

    it('应该能够清空缓存', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);

      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('应该返回正确的缓存大小', () => {
      expect(cache.size()).toBe(0);
      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });
  });

  describe('LRU 淘汰策略', () => {
    it('应该在超过最大容量时删除最旧的项', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      expect(cache.size()).toBe(3);

      // 添加第4项，应该删除 key1
      cache.set('key4', 'value4');
      expect(cache.size()).toBe(3);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });

    it('应该在访问时更新项的位置', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // 访问 key1，使其成为最新的
      cache.get('key1');

      // 添加 key4，应该删除 key2（最旧的）
      cache.set('key4', 'value4');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });

    it('应该在更新已存在的键时不增加大小', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);

      cache.set('key1', 'new-value1');
      expect(cache.size()).toBe(2);
      expect(cache.get('key1')).toBe('new-value1');
    });
  });

  describe('TTL 过期机制', () => {
    it('应该在 TTL 过期后返回 undefined', async () => {
      cache.set('key1', 'value1', 100); // 100ms 过期
      expect(cache.get('key1')).toBe('value1');

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.get('key1')).toBeUndefined();
    });

    it('应该在检查过期键时返回 false', async () => {
      cache.set('key1', 'value1', 100);
      expect(cache.has('key1')).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(cache.has('key1')).toBe(false);
    });

    it('应该支持自定义 TTL', () => {
      cache.set('key1', 'value1', 5000); // 5秒
      cache.set('key2', 'value2', 100);  // 100ms

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
    });

    it('应该使用默认 TTL 当未指定时', () => {
      cache.set('key1', 'value1'); // 使用默认 1000ms
      expect(cache.get('key1')).toBe('value1');
    });
  });

  describe('cleanup 方法', () => {
    it('应该清理所有过期的项', async () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 5000);
      cache.set('key3', 'value3', 100);

      expect(cache.size()).toBe(3);

      await new Promise(resolve => setTimeout(resolve, 150));
      cache.cleanup();

      expect(cache.size()).toBe(1);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(false);
    });

    it('应该在没有过期项时不改变缓存', () => {
      cache.set('key1', 'value1', 5000);
      cache.set('key2', 'value2', 5000);

      expect(cache.size()).toBe(2);
      cache.cleanup();
      expect(cache.size()).toBe(2);
    });
  });

  describe('边界情况', () => {
    it('应该处理空缓存的操作', () => {
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.has('key1')).toBe(false);
      expect(cache.delete('key1')).toBe(false);
      expect(cache.size()).toBe(0);
      cache.cleanup();
      expect(cache.size()).toBe(0);
    });

    it('应该处理相同键的多次设置', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      cache.set('key1', 'value3');

      expect(cache.size()).toBe(1);
      expect(cache.get('key1')).toBe('value3');
    });

    it('应该处理不同类型的值', () => {
      // 使用更大的缓存避免 LRU 淘汰
      const largeCache = new LRUCache<string, any>(10, 5000);

      largeCache.set('string', 'value');
      largeCache.set('number', 123);
      largeCache.set('object', { a: 1 });
      largeCache.set('array', [1, 2, 3]);
      largeCache.set('null', null);

      expect(largeCache.get('string')).toBe('value');
      expect(largeCache.get('number')).toBe(123);
      expect(largeCache.get('object')).toEqual({ a: 1 });
      expect(largeCache.get('array')).toEqual([1, 2, 3]);
      expect(largeCache.get('null')).toBe(null);
    });
  });
});
