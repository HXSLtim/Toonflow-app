import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();

// 更新服化道信息
export default router.post(
  "/",
  validateFields({
    costumeId: z.number(),
    name: z.string().optional(),
    description: z.string().optional(),
    episodes: z.array(z.number()).optional(),
    tags: z.array(z.string()).optional(),
  }),
  async (req, res) => {
    const { costumeId, name, description, episodes, tags } = req.body;

    try {
      const costume = await u.db("t_assets").where("id", costumeId).first();

      if (!costume) {
        return res.status(404).send(error("服化道不存在"));
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.intro = description;

      if (episodes || tags) {
        const remark = JSON.parse(costume.remark || "{}");
        if (episodes) remark.episodes = episodes;
        if (tags) remark.tags = tags;
        updateData.remark = JSON.stringify(remark);
      }

      await u.db("t_assets").where("id", costumeId).update(updateData);

      return res.status(200).send(success({ message: "更新成功" }));
    } catch (e) {
      const msg = u.error(e).message || "更新服化道失败";
      return res.status(400).send(error(msg));
    }
  }
);
