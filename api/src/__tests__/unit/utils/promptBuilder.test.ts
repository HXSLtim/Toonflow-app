import { describe, it, expect } from 'vitest';
import {
  buildAssetPrompt,
  getAssetPromptCode,
  getAssetTypeName,
  buildAssetImagePath,
  AssetType,
} from '@/utils/promptBuilder';

describe('Prompt Builder', () => {
  describe('buildAssetPrompt', () => {
    it('应该为角色类型生成正确的 prompt', () => {
      const config = {
        artStyle: '写实风格',
        name: '主角',
        prompt: '年轻男性，黑色短发',
      };

      const result = buildAssetPrompt('role', config);

      expect(result).toContain('角色');
      expect(result).toContain('写实风格');
      expect(result).toContain('主角');
      expect(result).toContain('年轻男性，黑色短发');
      expect(result).toContain('四视图');
    });

    it('应该为场景类型生成正确的 prompt', () => {
      const config = {
        artStyle: '卡通风格',
        name: '城市街道',
        prompt: '繁华的商业街',
      };

      const result = buildAssetPrompt('scene', config);

      expect(result).toContain('场景');
      expect(result).toContain('卡通风格');
      expect(result).toContain('城市街道');
      expect(result).toContain('繁华的商业街');
      expect(result).toContain('场景图');
    });

    it('应该为道具类型生成正确的 prompt', () => {
      const config = {
        artStyle: '科幻风格',
        name: '激光剑',
        prompt: '蓝色光剑',
      };

      const result = buildAssetPrompt('props', config);

      expect(result).toContain('道具');
      expect(result).toContain('科幻风格');
      expect(result).toContain('激光剑');
      expect(result).toContain('蓝色光剑');
      expect(result).toContain('道具图');
    });

    it('应该为分镜类型生成正确的 prompt', () => {
      const config = {
        artStyle: '漫画风格',
        name: '开场镜头',
        prompt: '远景，城市全景',
      };

      const result = buildAssetPrompt('storyboard', config);

      expect(result).toContain('分镜');
      expect(result).toContain('漫画风格');
      expect(result).toContain('开场镜头');
      expect(result).toContain('远景，城市全景');
      expect(result).toContain('分镜图');
    });

    it('应该处理未指定画风的情况', () => {
      const config = {
        name: '测试角色',
        prompt: '测试描述',
      };

      const result = buildAssetPrompt('role', config);

      expect(result).toContain('未指定');
    });
  });

  describe('getAssetPromptCode', () => {
    it('应该返回角色的 prompt code', () => {
      expect(getAssetPromptCode('role')).toBe('role-generateImage');
    });

    it('应该返回场景的 prompt code', () => {
      expect(getAssetPromptCode('scene')).toBe('scene-generateImage');
    });

    it('应该返回道具的 prompt code', () => {
      expect(getAssetPromptCode('props')).toBe('tool-generateImage');
    });

    it('应该返回分镜的 prompt code', () => {
      expect(getAssetPromptCode('storyboard')).toBe('storyboard-generateImage');
    });
  });

  describe('getAssetTypeName', () => {
    it('应该返回角色的中文名称', () => {
      expect(getAssetTypeName('role')).toBe('角色');
    });

    it('应该返回场景的中文名称', () => {
      expect(getAssetTypeName('scene')).toBe('场景');
    });

    it('应该返回道具的中文名称', () => {
      expect(getAssetTypeName('props')).toBe('道具');
    });

    it('应该返回分镜的中文名称', () => {
      expect(getAssetTypeName('storyboard')).toBe('分镜');
    });
  });

  describe('buildAssetImagePath', () => {
    it('应该生成正确的图片路径', () => {
      const result = buildAssetImagePath(123, 'role', 'avatar.png');
      expect(result).toBe('/123/role/avatar.png');
    });

    it('应该处理不同的资产类型', () => {
      const types: AssetType[] = ['role', 'scene', 'props', 'storyboard'];

      types.forEach(type => {
        const result = buildAssetImagePath(456, type, 'test.jpg');
        expect(result).toBe(`/456/${type}/test.jpg`);
      });
    });

    it('应该处理不同的文件扩展名', () => {
      const extensions = ['png', 'jpg', 'jpeg', 'webp'];

      extensions.forEach(ext => {
        const result = buildAssetImagePath(789, 'scene', `image.${ext}`);
        expect(result).toBe(`/789/scene/image.${ext}`);
      });
    });

    it('应该处理不同的项目 ID', () => {
      const projectIds = [1, 100, 9999];

      projectIds.forEach(id => {
        const result = buildAssetImagePath(id, 'props', 'item.png');
        expect(result).toBe(`/${id}/props/item.png`);
      });
    });
  });

  describe('集成测试', () => {
    it('应该为完整的资产生成流程提供一致的数据', () => {
      const type: AssetType = 'role';
      const projectId = 123;
      const filename = 'character.png';

      const promptCode = getAssetPromptCode(type);
      const typeName = getAssetTypeName(type);
      const imagePath = buildAssetImagePath(projectId, type, filename);
      const prompt = buildAssetPrompt(type, {
        artStyle: '动漫风格',
        name: '主角',
        prompt: '年轻勇者',
      });

      expect(promptCode).toBe('role-generateImage');
      expect(typeName).toBe('角色');
      expect(imagePath).toBe('/123/role/character.png');
      expect(prompt).toContain('角色');
      expect(prompt).toContain('动漫风格');
    });
  });
});
