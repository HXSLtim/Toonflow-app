import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();
type CostumeQueryType = "costume" | "makeup" | "prop" | "all";

// 获取角色服化道列表
export default router.get(
  "/",
  validateFields({
    projectId: z.number(),
    characterId: z.number().optional(),
    type: z.enum(["costume", "makeup", "prop", "all"]).default("all"),
    episode: z.number().optional(),
  }, "query"),
  async (req, res) => {
    const projectId = Number(req.query.projectId);
    const characterId = req.query.characterId ? Number(req.query.characterId) : undefined;
    const type = req.query.type;
    const episode = req.query.episode ? Number(req.query.episode) : undefined;

    if (!Number.isFinite(projectId)) {
      return res.status(400).send(error("projectId 参数无效"));
    }

    const isCostumeQueryType = (value: unknown): value is CostumeQueryType => {
      return typeof value === "string" && ["costume", "makeup", "prop", "all"].includes(value);
    };

    const queryType: CostumeQueryType = isCostumeQueryType(type) ? type : "all";

    try {
      let query = u.db("t_assets").where("projectId", projectId);

      // 筛选类型
      if (queryType !== "all") {
        const typeMap = {
          costume: "服装",
          makeup: "化妆",
          prop: "道具",
        };
        query = query.where("type", typeMap[queryType]);
      } else {
        query = query.whereIn("type", ["服装", "化妆", "道具"]);
      }

      const costumes = await query.select("*");

      // 过滤角色和剧集
      const filteredCostumes = costumes.filter((costume) => {
        if (!costume.remark) return false;

        try {
          const remark = JSON.parse(costume.remark);

          if (characterId && remark.characterId !== Number(characterId)) {
            return false;
          }

          if (episode && remark.episodes && !remark.episodes.includes(Number(episode))) {
            return false;
          }

          return true;
        } catch {
          return false;
        }
      });

      // 获取图片URL
      const result = await Promise.all(
        filteredCostumes.map(async (costume) => {
          const remark = JSON.parse(costume.remark || "{}");
          return {
            id: costume.id,
            name: costume.name,
            description: costume.intro,
            type: costume.type,
            imagePath: costume.filePath ? await u.oss.getFileUrl(costume.filePath) : null,
            characterId: remark.characterId,
            episodes: remark.episodes || [],
            tags: remark.tags || [],
          };
        })
      );

      return res.status(200).send(success(result));
    } catch (e) {
      const msg = u.error(e).message || "获取服化道列表失败";
      return res.status(400).send(error(msg));
    }
  }
);
