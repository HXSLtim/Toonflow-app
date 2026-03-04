import express from "express";
import u from "@/utils";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { z } from "zod";
const router = express.Router();

// 修复 3: 登录接口严格速率限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 15分钟内最多5次登录尝试
  message: { message: '登录尝试次数过多，请15分钟后再试' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功的请求不计入限制
});

export function setToken(payload: string | object, expiresIn: string | number, secret: string): string {
  if (!payload || typeof secret !== "string" || !secret) {
    throw new Error("参数不合法");
  }
  return (jwt.sign as any)(payload, secret, { expiresIn });
}

// 登录
export default router.post(
  "/",
  loginLimiter,
  validateFields({
    username: z.string(),
    password: z.string(),
  }),
  async (req, res) => {
    const { username, password } = req.body;

    const data = await u.db("t_user").where("name", "=", username).first();
    if (!data) return res.status(400).send(error("用户不存在"));

    if (typeof data.password !== "string" || data.password.length === 0) {
      return res.status(400).send(error("用户密码配置异常"));
    }

    // 使用 bcrypt 验证密码
    const isPasswordValid = await bcrypt.compare(password, data.password);
    if (!isPasswordValid) {
      return res.status(400).send(error("密码错误"));
    }

    // 修复 2: 使用环境变量中的 JWT_SECRET，Token 有效期改为 7 天
    const token = setToken(
      {
        id: data!.id,
        name: data!.name,
      },
      "7d",
      process.env.JWT_SECRET!,
    );

    return res.status(200).send(success({ token: "Bearer " + token, name: data!.name, id: data!.id }, "登录成功"));
  },
);
