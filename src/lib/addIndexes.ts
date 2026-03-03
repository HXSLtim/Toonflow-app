import { Knex } from "knex";

/**
 * 数据库索引优化脚本
 * 为高频查询字段添加索引，提升查询性能
 *
 * 执行时机：在 fixDB 之后自动执行
 * 幂等性：重复执行不会报错
 */
export default async (knex: Knex): Promise<void> => {
  console.log("开始添加数据库索引...");

  // 检查索引是否存在的辅助函数
  const hasIndex = async (tableName: string, indexName: string): Promise<boolean> => {
    const result = await knex.raw(
      `SELECT name FROM sqlite_master WHERE type='index' AND name=? AND tbl_name=?`,
      [indexName, tableName]
    );
    return result.length > 0;
  };

  // 安全创建索引的辅助函数
  const createIndexSafe = async (tableName: string, indexName: string, columns: string | string[]) => {
    if (await hasIndex(tableName, indexName)) {
      console.log(`索引 ${indexName} 已存在，跳过`);
      return;
    }

    const columnStr = Array.isArray(columns) ? columns.join(", ") : columns;
    await knex.raw(`CREATE INDEX ${indexName} ON ${tableName}(${columnStr})`);
    console.log(`✓ 创建索引: ${indexName} on ${tableName}(${columnStr})`);
  };

  try {
    // ==================== 外键索引（高频关联查询） ====================

    // t_assets 表索引
    await createIndexSafe("t_assets", "idx_assets_projectId", "projectId");
    await createIndexSafe("t_assets", "idx_assets_scriptId", "scriptId");
    await createIndexSafe("t_assets", "idx_assets_segmentId", "segmentId");

    // t_script 表索引
    await createIndexSafe("t_script", "idx_script_projectId", "projectId");
    await createIndexSafe("t_script", "idx_script_outlineId", "outlineId");

    // t_video 表索引
    await createIndexSafe("t_video", "idx_video_scriptId", "scriptId");
    await createIndexSafe("t_video", "idx_video_configId", "configId");

    // t_videoConfig 表索引
    await createIndexSafe("t_videoConfig", "idx_videoConfig_scriptId", "scriptId");
    await createIndexSafe("t_videoConfig", "idx_videoConfig_projectId", "projectId");

    // t_outline 表索引
    await createIndexSafe("t_outline", "idx_outline_projectId", "projectId");

    // t_novel 表索引
    await createIndexSafe("t_novel", "idx_novel_projectId", "projectId");

    // t_storyline 表索引
    await createIndexSafe("t_storyline", "idx_storyline_projectId", "projectId");

    // t_image 表索引
    await createIndexSafe("t_image", "idx_image_projectId", "projectId");
    await createIndexSafe("t_image", "idx_image_scriptId", "scriptId");
    await createIndexSafe("t_image", "idx_image_assetsId", "assetsId");
    await createIndexSafe("t_image", "idx_image_videoId", "videoId");

    // t_chatHistory 表索引
    await createIndexSafe("t_chatHistory", "idx_chatHistory_projectId", "projectId");

    // t_config 表索引
    await createIndexSafe("t_config", "idx_config_userId", "userId");
    await createIndexSafe("t_config", "idx_config_type", "type");

    // t_aiModelMap 表索引
    await createIndexSafe("t_aiModelMap", "idx_aiModelMap_configId", "configId");
    await createIndexSafe("t_aiModelMap", "idx_aiModelMap_key", "key");

    // ==================== 状态查询索引 ====================

    await createIndexSafe("t_video", "idx_video_state", "state");
    await createIndexSafe("t_assets", "idx_assets_state", "state");
    await createIndexSafe("t_image", "idx_image_state", "state");

    // ==================== 复合索引（多条件查询优化） ====================

    // t_assets 复合索引
    await createIndexSafe("t_assets", "idx_assets_project_type", ["projectId", "type"]);
    await createIndexSafe("t_assets", "idx_assets_project_name", ["projectId", "name"]);
    await createIndexSafe("t_assets", "idx_assets_project_state", ["projectId", "state"]);

    // t_video 复合索引
    await createIndexSafe("t_video", "idx_video_script_state", ["scriptId", "state"]);

    // t_outline 复合索引（按集数排序）
    await createIndexSafe("t_outline", "idx_outline_project_episode", ["projectId", "episode"]);

    // t_novel 复合索引（按章节排序）
    await createIndexSafe("t_novel", "idx_novel_project_chapter", ["projectId", "chapterIndex"]);

    // t_config 复合索引
    await createIndexSafe("t_config", "idx_config_user_type", ["userId", "type"]);

    // ==================== 时间戳索引（用于排序和范围查询） ====================

    await createIndexSafe("t_project", "idx_project_createTime", "createTime");
    await createIndexSafe("t_novel", "idx_novel_createTime", "createTime");
    await createIndexSafe("t_config", "idx_config_createTime", "createTime");
    await createIndexSafe("t_videoConfig", "idx_videoConfig_createTime", "createTime");
    await createIndexSafe("t_videoConfig", "idx_videoConfig_updateTime", "updateTime");

    // ==================== 唯一性约束索引 ====================

    // t_prompts 代码唯一性
    await createIndexSafe("t_prompts", "idx_prompts_code", "code");

    // t_setting 用户唯一性
    await createIndexSafe("t_setting", "idx_setting_userId", "userId");

    console.log("✓ 数据库索引添加完成");
  } catch (error) {
    console.error("添加索引时出错:", error);
    throw error;
  }
};
