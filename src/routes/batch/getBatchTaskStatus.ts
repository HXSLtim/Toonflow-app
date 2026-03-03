import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();

// 获取批量任务状态
export default router.get(
  "/",
  validateFields({
    batchTaskId: z.number(),
  }),
  async (req, res) => {
    const { batchTaskId } = req.query;

    try {
      const task = await u.db("t_taskList").where("id", Number(batchTaskId)).first();

      if (!task) {
        return res.status(404).send(error("任务不存在"));
      }

      const promptData = JSON.parse(task.prompt || "{}");
      const progress = promptData.totalCount > 0
        ? Math.round((promptData.completedCount / promptData.totalCount) * 100)
        : 0;

      return res.status(200).send(
        success({
          taskId: task.id,
          name: task.name,
          state: task.state,
          startTime: task.startTime,
          endTime: task.endTime,
          progress,
          totalCount: promptData.totalCount,
          completedCount: promptData.completedCount,
          failedCount: promptData.failedCount,
          taskType: promptData.taskType,
        })
      );
    } catch (e) {
      const msg = u.error(e).message || "获取任务状态失败";
      return res.status(400).send(error(msg));
    }
  }
);
