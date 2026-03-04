import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import {
  isElectronEnvironment,
  getUserDataDir,
  getSubDir,
  getDbPath,
  getUploadsDir,
  getLogsDir,
  getEnvDir,
} from '@/utils/pathResolver';

describe('Path Resolver', () => {
  const originalProcess = process;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isElectronEnvironment', () => {
    it('应该在非 Electron 环境中返回 false', () => {
      expect(isElectronEnvironment()).toBe(false);
    });

    it('即使存在 Electron 标识也返回 false（纯 Web 模式）', () => {
      const mockProcess = {
        ...process,
        versions: {
          ...process.versions,
          electron: '1.0.0',
        },
      };
      vi.stubGlobal('process', mockProcess);

      expect(isElectronEnvironment()).toBe(false);

      vi.unstubAllGlobals();
    });
  });

  describe('getUserDataDir', () => {
    it('应该在非 Electron 环境中返回当前工作目录', () => {
      const result = getUserDataDir();
      expect(result).toBe(process.cwd());
    });
  });

  describe('getSubDir', () => {
    it('应该返回子目录的完整路径', () => {
      const subDir = 'uploads';
      const result = getSubDir(subDir);
      const expected = path.join(process.cwd(), subDir);
      expect(result).toBe(expected);
    });

    it('应该处理不同的子目录名称', () => {
      const subDirs = ['uploads', 'logs', 'env', 'temp'];
      subDirs.forEach(subDir => {
        const result = getSubDir(subDir);
        expect(result).toContain(subDir);
        expect(path.isAbsolute(result)).toBe(true);
      });
    });
  });

  describe('getDbPath', () => {
    it('应该返回数据库文件的完整路径', () => {
      const result = getDbPath();
      const expected = path.join(process.cwd(), 'db.sqlite');
      expect(result).toBe(expected);
      expect(result).toContain('db.sqlite');
    });
  });

  describe('getUploadsDir', () => {
    it('应该返回上传目录的完整路径', () => {
      const result = getUploadsDir();
      const expected = path.join(process.cwd(), 'uploads');
      expect(result).toBe(expected);
      expect(result).toContain('uploads');
    });
  });

  describe('getLogsDir', () => {
    it('应该返回日志目录的完整路径', () => {
      const result = getLogsDir();
      const expected = path.join(process.cwd(), 'logs');
      expect(result).toBe(expected);
      expect(result).toContain('logs');
    });
  });

  describe('getEnvDir', () => {
    it('应该返回环境变量目录的完整路径', () => {
      const result = getEnvDir();
      const expected = path.join(process.cwd(), 'env');
      expect(result).toBe(expected);
      expect(result).toContain('env');
    });
  });

  describe('路径一致性', () => {
    it('所有路径应该基于相同的根目录', () => {
      const baseDir = getUserDataDir();

      expect(getDbPath()).toContain(baseDir);
      expect(getUploadsDir()).toContain(baseDir);
      expect(getLogsDir()).toContain(baseDir);
      expect(getEnvDir()).toContain(baseDir);
    });

    it('所有路径应该是绝对路径', () => {
      expect(path.isAbsolute(getUserDataDir())).toBe(true);
      expect(path.isAbsolute(getDbPath())).toBe(true);
      expect(path.isAbsolute(getUploadsDir())).toBe(true);
      expect(path.isAbsolute(getLogsDir())).toBe(true);
      expect(path.isAbsolute(getEnvDir())).toBe(true);
    });
  });
});
