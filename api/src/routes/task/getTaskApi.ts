import express from "express";
import u from "@/utils";
import { success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { number, z } from "zod";
const router = express.Router();

export default router.get(
  "/",
  validateFields({
    projectName: z.string(),
    taskName: z.string(),
    state: z.string(),
    page: z.number(),
    limit: z.number(),
  }),
  async (req, res) => {
    const { projectName, taskName, state, page = 1, limit = 10 }: any = req.query;

    // 输入验证：防止 SQL 注入，只允许安全字符
    const safeStringPattern = /^[a-zA-Z0-9_\u4e00-\u9fa5\s-]*$/;

    if (projectName && !safeStringPattern.test(projectName)) {
      return res.status(400).send({ success: false, message: "项目名称包含非法字符" });
    }
    if (taskName && !safeStringPattern.test(taskName)) {
      return res.status(400).send({ success: false, message: "任务名称包含非法字符" });
    }
    if (state && !safeStringPattern.test(state)) {
      return res.status(400).send({ success: false, message: "状态包含非法字符" });
    }

    const offset = (page - 1) * limit;
    const data = await u
      .db("t_taskList")
      .andWhere((qb) => {
        if (projectName) {
          qb.andWhere("t_taskList.projectName", projectName);
        }
        if (taskName) {
          qb.andWhere("t_taskList.name", taskName);
        }
        if (state) {
          qb.andWhere("t_taskList.state", state);
        }
      })
      .select("*")
      .offset(offset)
      .limit(limit);
    const totalQuery = (await u
      .db("t_taskList")
      .andWhere((qb) => {
        if (projectName) {
          qb.andWhere("t_taskList.projectName", projectName);
        }
        if (taskName) {
          qb.andWhere("t_taskList.name", taskName);
        }
        if (state) {
          qb.andWhere("t_taskList.state", state);
        }
      })
      .count("* as total")
      .first()) as any;
    res.status(200).send(success({ data, total: totalQuery?.total }));
  }
);
