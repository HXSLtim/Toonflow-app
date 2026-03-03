# 监控与告警系统实施指南

## 系统架构

### 核心组件

1. **指标收集器** (src/monitoring/metrics.ts)
   - 零依赖的 Prometheus 兼容指标收集
   - 支持 Counter、Gauge、Histogram 三种指标类型
   - 内存存储，轻量高效

2. **健康检查** (src/routes/monitoring/health.ts)
   - 数据库连接检查
   - 内存使用检查
   - 磁盘使用检查
   - 整体健康状态评估

3. **AI 调用监控** (src/monitoring/aiMonitor.ts)
   - AI 调用次数统计
   - AI 调用延迟监控
   - Token 消耗统计
   - 错误率追踪

4. **性能监控中间件** (src/middleware/performance.ts)
   - HTTP 请求计数
   - 响应时间统计
   - 按路由和状态码分类

5. **告警管理器** (src/monitoring/alerting.ts)
   - 规则引擎
   - 多渠道通知（企业微信/钉钉/邮件）
   - 告警冷却期
   - 告警历史记录

## 监控指标

### HTTP 指标

```
http_requests_total{method="POST",route="/api/project/add",status="200"} 1234
http_request_duration_seconds{method="POST",route="/api/project/add",le="0.5"} 450
```

### AI 调用指标

```
ai_calls_total{provider="openai",model="gpt-4",status="success"} 567
ai_call_duration_seconds{provider="openai",model="gpt-4",le="2"} 123
ai_tokens_total{provider="openai",model="gpt-4",type="prompt"} 45678
ai_tokens_total{provider="openai",model="gpt-4",type="completion"} 12345
```

### 系统指标

```
process_cpu_usage 45.23
process_memory_usage_bytes 134217728
nodejs_heap_size_bytes 89478485
```

## 集成步骤

### 1. 更新 src/app.ts

```typescript
import { performanceMonitoring } from "@/middleware/performance";
import alertManager from "@/monitoring/alerting";

// 添加性能监控中间件（在 requestLogger 之后）
app.use(performanceMonitoring);

// 启动告警监控（在服务启动后）
if (process.env.NODE_ENV === "prod") {
  alertManager.startMonitoring(60000); // 每分钟检查一次
}
```

### 2. 添加监控路由

在 src/router.ts 中添加：

```typescript
import healthCheck from "@/routes/monitoring/health";
import metricsEndpoint from "@/routes/monitoring/metrics";

// 健康检查接口（无需认证）
app.get("/health", healthCheck);

// 指标接口（无需认证，但建议在生产环境限制访问）
app.get("/metrics", metricsEndpoint);
```

### 3. 在 AI 调用中使用监控

```typescript
import { monitorAICall } from "@/monitoring/aiMonitor";

// 包装 AI 调用
const result = await monitorAICall(
  {
    provider: "openai",
    model: "gpt-4",
    operation: "generateScript",
  },
  async () => {
    return await generateText({
      model: openai("gpt-4"),
      prompt: "生成剧本",
    });
  }
);
```

## API 端点

### GET /health

健康检查接口，返回系统健康状态。

**响应示例：**

```json
{
  "status": "healthy",
  "timestamp": "2026-03-03T10:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "latency": 5
    },
    "memory": {
      "status": "healthy",
      "usage": 62.3
    },
    "disk": {
      "status": "healthy",
      "usage": 45.2
    }
  }
}
```

**状态码：**
- 200: healthy 或 degraded
- 503: unhealthy

### GET /metrics

Prometheus 指标接口，返回所有监控指标。

**响应格式：** Prometheus text format

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="POST",route="/api/project/add",status="200"} 1234

# HELP http_request_duration_seconds HTTP request latency
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="POST",route="/api/project/add",le="0.1"} 100
http_request_duration_seconds_bucket{method="POST",route="/api/project/add",le="0.5"} 450
```

## 告警配置

### 环境变量

```bash
# 启用告警
ALERT_ENABLED=true

# 企业微信 Webhook
ALERT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx

# 钉钉 Webhook
# ALERT_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send?access_token=xxx

# 邮件通知
ALERT_EMAIL=admin@example.com
```

### 自定义告警规则

```typescript
import alertManager from "@/monitoring/alerting";
import metrics from "@/monitoring/metrics";

// 注册自定义告警规则
alertManager.registerRule({
  name: "API 响应时间过长",
  condition: async () => {
    // 检查 P95 响应时间是否超过阈值
    // 这里需要实现具体的检查逻辑
    return false;
  },
  message: "API P95 响应时间超过 3 秒",
  severity: "warning",
});
```

## Prometheus 集成

### 1. 安装 Prometheus

```bash
# Docker 方式
docker run -d -p 9090:9090 \
  -v ./prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### 2. 配置 prometheus.yml

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'toonflow'
    static_configs:
      - targets: ['localhost:60000']
    metrics_path: '/metrics'
```

### 3. 访问 Prometheus

打开 http://localhost:9090，可以查询和可视化指标。

## Grafana 可视化

### 1. 安装 Grafana

```bash
docker run -d -p 3000:3000 grafana/grafana
```

### 2. 添加数据源

- 打开 http://localhost:3000
- 添加 Prometheus 数据源
- URL: http://localhost:9090

### 3. 导入仪表盘

创建仪表盘，添加以下面板：

**HTTP 请求面板：**
```promql
rate(http_requests_total[5m])
```

**API 响应时间面板：**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**AI 调用成功率面板：**
```promql
rate(ai_calls_total{status="success"}[5m]) / rate(ai_calls_total[5m])
```

**系统资源面板：**
```promql
process_cpu_usage
process_memory_usage_bytes
```

## 监控最佳实践

### 1. 指标命名

- 使用小写字母和下划线
- 使用有意义的前缀（http_, ai_, process_）
- 包含单位后缀（_seconds, _bytes, _total）

### 2. 标签使用

- 保持标签基数可控（避免使用 userId 等高基数标签）
- 使用有限的标签值（method, status, provider）
- 避免在标签中包含时间戳或随机值

### 3. 告警规则

- 设置合理的阈值
- 使用冷却期避免告警风暴
- 区分告警严重程度（info/warning/critical）
- 提供清晰的告警消息

### 4. 性能优化

- 定期清理过期指标
- 使用采样减少高频指标的开销
- 在生产环境限制 /metrics 接口访问

## 故障排查

### 健康检查失败

```bash
# 检查健康状态
curl http://localhost:60000/health

# 查看日志
tail -f logs/$(date +%Y-%m-%d)-error.log
```

### 指标未更新

```bash
# 检查指标接口
curl http://localhost:60000/metrics

# 验证中间件是否正确注册
# 检查 app.ts 中的中间件顺序
```

### 告警未触发

```bash
# 检查告警配置
echo $ALERT_ENABLED
echo $ALERT_WEBHOOK_URL

# 查看告警日志
grep "告警" logs/$(date +%Y-%m-%d)-info.log
```

## 性能影响

- **指标收集**: < 1ms per request
- **健康检查**: < 50ms per check
- **告警检查**: < 100ms per minute
- **内存占用**: < 10MB for metrics storage

## 后续优化

1. **分布式追踪**: 集成 OpenTelemetry
2. **日志聚合**: 对接 ELK/Loki
3. **自定义仪表盘**: 开发内置监控页面
4. **智能告警**: 基于机器学习的异常检测
5. **SLA 监控**: 服务等级协议监控

---

**监控系统已就绪，可以开始使用！**
