import express from "express";
import { success } from "@/lib/responseFormat";
import { performanceMonitor } from "@/utils/performance";

const router = express.Router();

/**
 * 获取性能指标
 * GET /performance/metrics?minutes=5
 */
export default router.get("/", async (req, res) => {
  const minutes = parseInt(req.query.minutes as string) || 5;

  const report = performanceMonitor.getReport(minutes);

  res.status(200).send(success(report));
});
