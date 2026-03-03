# Toonflow 文档中心

欢迎来到 Toonflow 文档中心！这里包含了使用和开发 Toonflow 所需的所有文档。

## 📚 文档导航

### 用户文档

适合 Toonflow 用户阅读，了解如何使用产品。

- **[快速入门指南](./user-guide/QUICK-START.md)** - 10 分钟快速上手 Toonflow
- **[功能详细说明](./user-guide/FEATURES.md)** - 完整的功能介绍和使用方法
- **[常见问题解答](./user-guide/FAQ.md)** - 使用过程中的常见问题及解决方案

### API 文档

适合需要集成 Toonflow API 的开发者。

- **[API 参考文档](./api/API-REFERENCE.md)** - 完整的 REST API 接口文档

### 开发者文档

适合想要参与 Toonflow 开发的贡献者。

- **[架构设计文档](./developer/ARCHITECTURE.md)** - 系统架构和技术栈介绍
- **[贡献指南](./developer/CONTRIBUTING.md)** - 如何为项目做出贡献
- **[开发环境搭建](./developer/DEVELOPMENT-SETUP.md)** - 从零开始搭建开发环境

### 项目规划

项目的设计文档和实施计划。

- **[审计报告](./audit-reports/)** - 代码审计和优化报告
- **[设计文档](./plans/)** - 功能设计和架构设计文档

## 🚀 快速开始

### 我是新用户

1. 阅读 [快速入门指南](./user-guide/QUICK-START.md)
2. 观看 [视频教程](https://www.bilibili.com/video/BV1na6wB6Ea2)
3. 查看 [功能详细说明](./user-guide/FEATURES.md)
4. 遇到问题查阅 [常见问题解答](./user-guide/FAQ.md)

### 我想集成 API

1. 阅读 [API 参考文档](./api/API-REFERENCE.md)
2. 了解认证和请求格式
3. 查看完整的 API 端点列表
4. 参考使用示例开始开发

### 我想参与开发

1. 阅读 [贡献指南](./developer/CONTRIBUTING.md)
2. 按照 [开发环境搭建](./developer/DEVELOPMENT-SETUP.md) 配置环境
3. 了解 [架构设计](./developer/ARCHITECTURE.md)
4. 提交你的第一个 Pull Request

## 📖 文档结构

```
docs/
├── README.md                          # 本文件
├── user-guide/                        # 用户文档
│   ├── QUICK-START.md                # 快速入门
│   ├── FEATURES.md                   # 功能说明
│   └── FAQ.md                        # 常见问题
├── api/                              # API 文档
│   └── API-REFERENCE.md              # API 参考
├── developer/                        # 开发者文档
│   ├── ARCHITECTURE.md               # 架构设计
│   ├── CONTRIBUTING.md               # 贡献指南
│   └── DEVELOPMENT-SETUP.md          # 环境搭建
├── audit-reports/                    # 审计报告
│   ├── backend-architecture-report.md
│   ├── frontend-ux-report.md
│   ├── performance-optimization-report.md
│   └── qa-testing-report.md
└── plans/                            # 设计文档
    ├── 2026-03-02-toonflow-audit-design.md
    ├── 2026-03-02-toonflow-audit-implementation.md
    └── 2026-03-03-electron-removal-shadcn-refactor-design.md
```

## 🔍 按主题查找

### 安装与部署

- [本机安装](../README.md#本机安装)
- [Docker 部署](../README.md#docker-部署)
- [云端部署](../README.md#云端部署)
- [开发环境搭建](./developer/DEVELOPMENT-SETUP.md)

### 功能使用

- [项目管理](./user-guide/FEATURES.md#项目管理)
- [小说管理](./user-guide/FEATURES.md#小说管理)
- [大纲生成](./user-guide/FEATURES.md#大纲生成)
- [剧本生成](./user-guide/FEATURES.md#剧本生成)
- [分镜制作](./user-guide/FEATURES.md#分镜制作)
- [视频合成](./user-guide/FEATURES.md#视频合成)

### AI 配置

- [配置 AI 模型](./user-guide/QUICK-START.md#配置-ai-模型)
- [模型选择建议](./user-guide/FAQ.md#不同任务应该用什么模型)
- [提示词管理](./user-guide/FEATURES.md#提示词管理)

### 开发相关

- [系统架构](./developer/ARCHITECTURE.md#系统架构)
- [核心模块](./developer/ARCHITECTURE.md#核心模块)
- [数据库设计](./developer/ARCHITECTURE.md#数据库层)
- [API 设计](./api/API-REFERENCE.md)
- [代码规范](./developer/CONTRIBUTING.md#代码规范)

### 问题排查

- [安装问题](./user-guide/FAQ.md#安装与部署)
- [配置问题](./user-guide/FAQ.md#ai-模型配置)
- [生成问题](./user-guide/FAQ.md#内容生成)
- [性能问题](./user-guide/FAQ.md#性能与优化)
- [错误处理](./user-guide/FAQ.md#错误处理)

## 💡 使用技巧

### 搜索文档

使用浏览器的搜索功能（Ctrl+F 或 Cmd+F）在文档中快速查找关键词。

### 查看示例

所有文档都包含实际的代码示例和使用案例，可以直接复制使用。

### 获取帮助

- 查看 [常见问题解答](./user-guide/FAQ.md)
- 搜索 [GitHub Issues](https://github.com/HBAI-Ltd/Toonflow-app/issues)
- 加入微信交流群（见主 README）
- 发送邮件：ltlctools@outlook.com

## 🔄 文档更新

文档会随着项目更新而持续完善。

**最近更新**：
- 2026-03-03: 新增完整的 API 文档
- 2026-03-03: 新增用户快速入门指南
- 2026-03-03: 新增开发者文档体系

**贡献文档**：

发现文档错误或有改进建议？欢迎：
1. 提交 Issue
2. 直接修改并提交 PR
3. 联系维护者

## 📝 文档规范

### Markdown 格式

所有文档使用 Markdown 格式编写，遵循 [CommonMark](https://commonmark.org/) 规范。

### 文档结构

- 使用清晰的标题层级
- 包含目录导航
- 提供代码示例
- 添加截图说明（如适用）
- 包含相关链接

### 命名规范

- 文件名使用大写字母和连字符：`QUICK-START.md`
- 目录名使用小写字母和连字符：`user-guide/`

## 🌐 多语言支持

目前文档提供：
- 中文（主要）
- [English](./README.en.md)（部分）

欢迎贡献其他语言的翻译！

## 📞 联系我们

- **GitHub**: https://github.com/HBAI-Ltd/Toonflow-app
- **Gitee**: https://gitee.com/HBAI-Ltd/Toonflow-app
- **Email**: ltlctools@outlook.com
- **微信群**: 见主 README 二维码

## 📄 许可证

文档采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可证。

---

**祝你使用愉快！如有问题，随时查阅文档或联系我们。**
