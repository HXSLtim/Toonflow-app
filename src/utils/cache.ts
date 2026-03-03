/**
 * 简单的 LRU 缓存实现
 * 用于缓存热点数据，减少数据库查询
 */
export class LRUCache<K, V> {
  private cache: Map<K, { value: V; expiry: number }>;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);

    if (!item) {
      return undefined;
    }

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    // LRU: 将访问的项移到最后
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  set(key: K, value: V, ttl?: number): void {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 如果超过最大容量，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiry });
  }

  has(key: K): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // 清理过期项
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// 全局缓存实例
export const authCache = new LRUCache<string, any>(10, 5 * 60 * 1000); // 认证缓存，5分钟
export const configCache = new LRUCache<string, any>(50, 10 * 60 * 1000); // 配置缓存，10分钟
export const modelCache = new LRUCache<string, any>(100, 30 * 60 * 1000); // 模型缓存，30分钟

// 定期清理过期缓存
setInterval(() => {
  authCache.cleanup();
  configCache.cleanup();
  modelCache.cleanup();
}, 60 * 1000); // 每分钟清理一次
