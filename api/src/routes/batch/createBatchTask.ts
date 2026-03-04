import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();

// 创建批量任务
export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
    taskType: z.enum(["script", "storyboard", "image", "video"]),
    items: z.array(z.number()).min(1), // 章节ID或其他资源ID数组
    priority: z.number().min(1).max(10).default(5),
    config: z.record(z.string(), z.any()).optional(),
  }),
  async (req, res) => {
    const { projectId, taskType, items, priority, config } = req.body;

    try {
      const project = await u.db("t_project").where("id", projectId).first();
      if (!project) {
        return res.status(404).send(error("项目不存在"));
      }

      // 创建批量任务记录
      const [batchTaskId] = await u.db("t_taskList").insert({
        name: `批量${taskType}生成`,
        projectName: projectId,
        prompt: JSON.stringify({
          taskType,
          items,
          priority,
          config,
          totalCount: items.length,
          completedCount: 0,
          failedCount: 0,
        }),
        state: "pending",
        startTime: new Date().toISOString(),
      });

      // 异步处理批量任务
      processBatchTask(batchTaskId, projectId, taskType, items, config).catch((err) => {
        console.error("批量任务处理失败:", err);
      });

      return res.status(200).send(
        success({
          batchTaskId,
          message: "批量任务已创建，正在后台处理",
        })
      );
    } catch (e) {
      const msg = u.error(e).message || "创建批量任务失败";
      return res.status(400).send(error(msg));
    }
  }
);

// 批量任务处理函数
async function processBatchTask(
  batchTaskId: number,
  projectId: number,
  taskType: string,
  items: number[],
  config?: Record<string, any>
) {
  let completedCount = 0;
  let failedCount = 0;

  // 更新任务状态为进行中
  await u.db("t_taskList").where("id", batchTaskId).update({
    state: "processing",
  });

  for (const itemId of items) {
    try {
      // 根据任务类型执行不同的处理逻辑
      switch (taskType) {
        case "script":
          await processScriptGeneration(projectId, itemId, config);
          break;
        case "storyboard":
          await processStoryboardGeneration(projectId, itemId, config);
          break;
        case "image":
          await processImageGeneration(projectId, itemId, config);
          break;
        case "video":
          await processVideoGeneration(projectId, itemId, config);
          break;
      }
      completedCount++;
    } catch (err) {
      console.error(`处理项目 ${itemId} 失败:`, err);
      failedCount++;
    }

    // 更新进度
    const taskData = await u.db("t_taskList").where("id", batchTaskId).first();
    if (taskData) {
      const prompt = JSON.parse(taskData.prompt || "{}");
      prompt.completedCount = completedCount;
      prompt.failedCount = failedCount;
      await u.db("t_taskList").where("id", batchTaskId).update({
        prompt: JSON.stringify(prompt),
      });
    }
  }

  // 任务完成
  await u.db("t_taskList").where("id", batchTaskId).update({
    state: "completed",
    endTime: new Date().toISOString(),
  });
}

// 各类型任务处理函数
async function processScriptGeneration(projectId: number, novelId: number, config?: Record<string, any>) {
  // 实现剧本生成逻辑
  console.log(`生成剧本: 项目${projectId}, 章节${novelId}`);
}

async function processStoryboardGeneration(projectId: number, scriptId: number, config?: Record<string, any>) {
  // 实现分镜生成逻辑
  console.log(`生成分镜: 项目${projectId}, 剧本${scriptId}`);
}

async function processImageGeneration(projectId: number, assetId: number, config?: Record<string, any>) {
  // 实现图片生成逻辑
  console.log(`生成图片: 项目${projectId}, 资产${assetId}`);
}

async function processVideoGeneration(projectId: number, storyboardId: number, config?: Record<string, any>) {
  // 实现视频生成逻辑
  console.log(`生成视频: 项目${projectId}, 分镜${storyboardId}`);
}
