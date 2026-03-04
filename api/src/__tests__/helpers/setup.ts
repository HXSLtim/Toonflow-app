import { beforeAll, afterAll, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';

// 测试数据库路径
export const TEST_DB_PATH = path.join(__dirname, '../../../test.db');

// 清理测试数据库
export function cleanupTestDb() {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
}

// 全局测试钩子
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.DB_PATH = TEST_DB_PATH;
});

afterAll(() => {
  cleanupTestDb();
});

afterEach(() => {
  // 每个测试后清理
});
