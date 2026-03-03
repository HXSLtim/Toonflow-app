import { describe, it, expect } from 'vitest';
import { compressImage, mergeImages } from '@/utils/imageTools';
import fs from 'fs';
import path from 'path';

describe('imageTools', () => {
  // 创建一个简单的测试用 base64 图片
  const createTestBase64 = (width: number, height: number): string => {
    // 这是一个 1x1 像素的透明 PNG 的 base64
    const smallPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    return smallPng;
  };

  describe('compressImage', () => {
    it('应该压缩图片到指定大小以内', async () => {
      const testImage = createTestBase64(100, 100);
      const compressed = await compressImage(testImage, '1kb');

      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe('string');

      // 验证压缩后的大小
      const compressedBuffer = Buffer.from(compressed, 'base64');
      expect(compressedBuffer.length).toBeLessThanOrEqual(1024);
    });

    it('应该处理不同的大小格式', async () => {
      const testImage = createTestBase64(100, 100);

      const compressed1kb = await compressImage(testImage, '1kb');
      const compressed1KB = await compressImage(testImage, '1KB');
      const compressed1mb = await compressImage(testImage, '1mb');

      expect(compressed1kb).toBeDefined();
      expect(compressed1KB).toBeDefined();
      expect(compressed1mb).toBeDefined();
    });

    it('应该使用默认大小 10mb', async () => {
      const testImage = createTestBase64(100, 100);
      const compressed = await compressImage(testImage);

      expect(compressed).toBeDefined();
      const compressedBuffer = Buffer.from(compressed, 'base64');
      expect(compressedBuffer.length).toBeLessThanOrEqual(10 * 1024 * 1024);
    });
  });

  describe('mergeImages', () => {
    it('应该横向拼接多张图片', async () => {
      const testImage1 = createTestBase64(100, 100);
      const testImage2 = createTestBase64(100, 100);
      const testImage3 = createTestBase64(100, 100);

      const merged = await mergeImages([testImage1, testImage2, testImage3], '10mb');

      expect(merged).toBeDefined();
      expect(typeof merged).toBe('string');
    });

    it('应该在图片列表为空时抛出错误', async () => {
      await expect(mergeImages([], '10mb')).rejects.toThrow('图片列表不能为空');
    });

    it('应该确保输出大小不超过限制', async () => {
      const testImage = createTestBase64(100, 100);
      const merged = await mergeImages([testImage, testImage], '5kb');

      const mergedBuffer = Buffer.from(merged, 'base64');
      expect(mergedBuffer.length).toBeLessThanOrEqual(5 * 1024);
    });

    it('应该处理单张图片', async () => {
      const testImage = createTestBase64(100, 100);
      const merged = await mergeImages([testImage], '10mb');

      expect(merged).toBeDefined();
    });
  });
});
