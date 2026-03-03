import express, { Request, Response, NextFunction } from "express";
import u from "@/utils";
import { success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { z } from "zod";
import { v4 as uuid } from "uuid";
const router = express.Router();

// 修复 4: 文件上传验证中间件
function validateImageUpload(req: Request, res: Response, next: NextFunction) {
  const { base64Data } = req.body;

  // 验证 base64 格式
  const match = base64Data?.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return res.status(400).send({ message: '无效的图片格式，仅支持 jpeg/jpg/png/webp/gif' });
  }

  const [, mimeType, base64Content] = match;
  const buffer = Buffer.from(base64Content, 'base64');

  // 限制文件大小 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (buffer.length > maxSize) {
    return res.status(400).send({ message: '文件大小超过限制(10MB)' });
  }

  // 验证文件头（魔数）防止伪造文件类型
  const validHeaders: Record<string, number[]> = {
    'jpeg': [0xFF, 0xD8, 0xFF],
    'jpg': [0xFF, 0xD8, 0xFF],
    'png': [0x89, 0x50, 0x4E, 0x47],
    'gif': [0x47, 0x49, 0x46],
    'webp': [0x52, 0x49, 0x46, 0x46]
  };

  const header = validHeaders[mimeType];
  if (header && !header.every((byte, i) => buffer[i] === byte)) {
    return res.status(400).send({ message: '文件内容与声明类型不符' });
  }

  // 将验证后的数据附加到 req.body
  (req.body as any).validatedImage = { buffer, mimeType };
  next();
}

// 上传对话图片
export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
    base64Data: z.string(),
  }),
  validateImageUpload,
  async (req, res) => {
    const { projectId, validatedImage } = req.body as any;
    const ext = validatedImage.mimeType === 'jpeg' ? 'jpg' : validatedImage.mimeType;
    const savePath = `/${projectId}/chat/${uuid()}.${ext}`;
    await u.oss.writeFile(savePath, validatedImage.buffer);
    const url = await u.oss.getFileUrl(savePath);
    res.status(200).send(success(url));
  }
);
