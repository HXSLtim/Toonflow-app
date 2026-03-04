import express from "express";
import u from "@/utils";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { z } from "zod";
import { fileProcessingLimit } from "@/utils/concurrency";
const router = express.Router();

// 删除视频配置
export default router.post(
  "/",
  validateFields({
    id: z.number(),
  }),
  async (req, res) => {
    const { id } = req.body;

    // 查询配置是否存在
    const config = await u.db("t_videoConfig").where({ id }).first();
    if (!config) {
      return res.status(404).send(error("视频配置不存在"));
    }

    // 获取关联的视频生成结果（通过scriptId和配置关联）
    const videoResults = await u.db("t_video").where("configId", id).select("*");

    // 收集需要删除的文件路径
    const filesToDelete: string[] = [];

    // 删除视频结果的文件
    for (const result of videoResults) {
      if (result.filePath) {
        filesToDelete.push(result.filePath);
      }
      // if (result.firstFrame) {
      //   filesToDelete.push(result.firstFrame);
      // }
    }

    const deleteResults = await Promise.allSettled(
      filesToDelete.map(async (filePath) => {
        await fileProcessingLimit(async () => {
          await u.oss.deleteFile(filePath);
          console.log("[删除视频配置] 删除文件:", filePath);
        });
      })
    );

    const deletedFilesCount = deleteResults.filter((result) => result.status === "fulfilled").length;

    deleteResults.forEach((result, index) => {
      if (result.status === "rejected") {
        const reason = result.reason as NodeJS.ErrnoException;
        if (reason?.code !== "ENOENT") {
          console.error("[删除视频配置] 删除文件失败:", filesToDelete[index], result.reason);
        }
      }
    });

    // 删除数据库中的视频结果记录
    await u.db("t_video").where("configId", id).delete();

    // 删除配置记录
    await u.db("t_videoConfig").where({ id }).delete();

    res.status(200).send(
      success({
        message: "删除视频配置成功",
        data: {
          deletedConfigId: id,
          deletedResultsCount: videoResults.length,
          deletedFilesCount,
        },
      }),
    );
  },
);
