import express from "express";
import u from "@/utils";
import bcrypt from "bcrypt";
import { z } from "zod";
import { success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

// 获取用户
export default router.post(
  "/",
  validateFields({
    name: z.string(),
    password: z.string(),
    id: z.number(),
  }),
  async (req, res) => {
    const { name, password, id } = req.body;

    // 使用 bcrypt 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    await u.db("t_user").where("id", id).update({
      name,
      password: hashedPassword,
    });
    res.status(200).send(success("保存设置成功"));
  },
);
