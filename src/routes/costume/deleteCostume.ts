import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();

// 删除服化道
export default router.post(
  "/",
  validateFields({
    costumeId: z.number(),
  }),
  async (req, res) => {
    const { costumeId } = req.body;

    try {
      const costume = await u.db("t_assets").where("id", costumeId).first();

      if (!costume) {
        return res.status(404).send(error("服化道不存在"));
      }

      // 删除图片文件
      if (costume.filePath) {
        try {
          await u.oss.deleteFile(costume.filePath);
        } catch (err) {
          console.error("删除图片文件失败:", err);
        }
      }

      // 删除数据库记录
      await u.db("t_assets").where("id", costumeId).delete();

      return res.status(200).send(success({ message: "删除成功" }));
    } catch (e) {
      const msg = u.error(e).message || "删除服化道失败";
      return res.status(400).send(error(msg));
    }
  }
);
