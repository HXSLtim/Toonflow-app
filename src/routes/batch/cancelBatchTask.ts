import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();

// 取消批量任务
export default router.post(
  "/",
  validateFields({
    batchTaskId: z.number(),
  }),
  async (req, res) => {
    const { batchTaskId } = req.body;

    try {
      const task = await u.db("t_taskList").where("id", batchTaskId).first();

      if (!task) {
        return res.status(404).send(error("任务不存在"));
      }

      if (task.state === "completed") {
        return res.status(400).send(error("任务已完成，无法取消"));
      }

      await u.db("t_taskList").where("id", batchTaskId).update({
        state: "cancelled",
        endTime: new Date().toISOString(),
      });

      return res.status(200).send(success({ message: "任务已取消" }));
    } catch (e) {
      const msg = u.error(e).message || "取消任务失败";
      return res.status(400).send(error(msg));
    }
  }
);
