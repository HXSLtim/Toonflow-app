import initDB from "@/lib/initDB";

import { db } from "@/utils/db";
import express from "express";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { z } from "zod";
const router = express.Router();

// 清空所有表 (sqlite)
export default router.post(
  "/",
  validateFields({
    confirmToken: z.string(),
  }),
  async (req, res) => {
    // 验证用户权限（这里简化处理，实际应该检查用户角色）
    const user = (req as any).user;
    if (!user || user.name !== "admin") {
      return res.status(403).send(error("权限不足，只有管理员可以执行此操作"));
    }

    // 验证确认令牌
    const { confirmToken } = req.body;
    const expectedToken = "CONFIRM_CLEAR_DATABASE";
    if (confirmToken !== expectedToken) {
      return res.status(400).send(error("确认令牌无效，请输入正确的确认令牌"));
    }

    await initDB(db, true);
    res.status(200).send(success("清空数据库成功"));
  },
);
