# Router Configuration

## 路由结构

```
/ - 首页（公开）
/login - 登录页（公开）
/dashboard - 仪表板（需要认证）
/projects - 项目列表（需要认证）
/404 - 404 页面
* - 重定向到 404
```

## 路由守卫

使用 `ProtectedRoute` 组件保护需要认证的路由：
- 未认证用户访问受保护路由会被重定向到 `/login`
- 认证状态将在状态管理集成后从 store 获取

## 使用方式

```tsx
import { Link, useNavigate } from 'react-router-dom'

// 声明式导航
<Link to="/dashboard">Dashboard</Link>

// 编程式导航
const navigate = useNavigate()
navigate('/projects')
```

## 布局组件

- `AppLayout` - 应用主布局（带导航栏）
- `Layout` - 简单布局（已废弃，保留用于兼容）
