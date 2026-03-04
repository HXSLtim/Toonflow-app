/**
 * 异步路由处理器包装器
 *
 * 自动捕获异步路由中的错误并传递给错误处理中间件
 *
 * @example
 * ```typescript
 * import { asyncHandler } from "@/middleware/asyncHandler";
 * import { AppError } from "@/types/AppError";
 * import { ErrorCode } from "@/types/monitoring";
 *
 * export default asyncHandler(async (req, res) => {
 *   if (!req.body.name) {
 *     throw new AppError(ErrorCode.VALIDATION_ERROR, "参数验证失败");
 *   }
 *
 *   const result = await someOperation();
 *   res.json({ success: true, data: result });
 * });
 * ```
 */

import { Request, Response, NextFunction } from "express";

/**
 * 异步路由处理器类型
 */
export type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * 包装异步路由处理器，自动捕获错误
 *
 * @param fn 异步路由处理函数
 * @returns Express 路由处理器
 */
export function asyncHandler(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next))
      .catch((error) => {
        // 将错误传递给错误处理中间件
        next(error);
      });
  };
}

/**
 * 默认导出
 */
export default asyncHandler;
