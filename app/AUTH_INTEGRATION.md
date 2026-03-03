# 认证系统集成测试指南

## 已完成的集成

### 1. ProtectedRoute 组件
**文件**: `src/components/ProtectedRoute.tsx`

**功能**:
- ✅ 使用 `useAuthStore` 获取认证状态
- ✅ 自动验证 token 有效性
- ✅ 显示加载状态（loading spinner）
- ✅ 未认证自动重定向到 `/login`

### 2. Login 页面
**文件**: `src/pages/Login.tsx`

**功能**:
- ✅ 完整的登录表单（用户名 + 密码）
- ✅ 表单验证（必填 + 密码最小长度 6）
- ✅ 调用 `useAuthStore().login()`
- ✅ 登录成功自动跳转到 `/dashboard`
- ✅ 错误提示显示
- ✅ 加载状态（按钮禁用 + 文本变化）
- ✅ 已登录用户自动跳转

### 3. Dashboard 页面
**文件**: `src/pages/Dashboard.tsx`

**功能**:
- ✅ 显示当前用户名
- ✅ 登出按钮
- ✅ 登出后跳转到登录页

## 测试流程

### 测试 1: 未登录访问保护路由
1. 确保未登录状态（清除 localStorage）
2. 访问 `http://localhost:5173/dashboard`
3. **预期结果**: 自动重定向到 `/login`

### 测试 2: 登录流程
1. 访问 `http://localhost:5173/login`
2. 输入用户名和密码（密码至少 6 位）
3. 点击 "Sign in" 按钮
4. **预期结果**:
   - 按钮显示 "Signing in..."
   - 登录成功后跳转到 `/dashboard`
   - Dashboard 显示用户名

### 测试 3: 表单验证
1. 访问登录页
2. 不填写任何内容，直接点击 "Sign in"
3. **预期结果**: 显示验证错误
   - "Username is required"
   - "Password is required"

4. 输入用户名，密码少于 6 位
5. **预期结果**: 显示 "Password must be at least 6 characters"

### 测试 4: 登录错误处理
1. 输入错误的用户名/密码
2. 点击 "Sign in"
3. **预期结果**: 显示错误提示（红色背景）

### 测试 5: 登出流程
1. 登录成功后在 Dashboard
2. 点击右上角 "Logout" 按钮
3. **预期结果**:
   - 跳转到 `/login`
   - 再次访问 `/dashboard` 会重定向到登录页

### 测试 6: 持久化登录
1. 登录成功
2. 刷新页面
3. **预期结果**:
   - 仍然保持登录状态
   - 不会跳转到登录页
   - Dashboard 显示用户信息

### 测试 7: 已登录访问登录页
1. 已登录状态
2. 访问 `http://localhost:5173/login`
3. **预期结果**: 自动重定向到 `/dashboard`

## 技术实现细节

### Auth Store 集成
```typescript
// ProtectedRoute.tsx
const { isAuthenticated, isLoading, getCurrentUser } = useAuthStore();

// Login.tsx
const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();

// Dashboard.tsx
const { user, logout } = useAuthStore();
```

### 状态管理
- **认证状态**: 存储在 Zustand store + localStorage
- **Token 管理**: 自动存储和注入到 API 请求
- **错误处理**: 统一在 store 中处理
- **加载状态**: 防止重复提交

### 安全特性
- ✅ JWT Token 自动管理
- ✅ Token 验证（getCurrentUser）
- ✅ 401 自动登出
- ✅ 持久化存储（刷新页面保持登录）
- ✅ 路由守卫（保护所有需要认证的页面）

## 启动测试

```bash
cd app
npm install  # 安装依赖（包括 zustand）
npm run dev  # 启动开发服务器
```

访问: `http://localhost:5173`

## 注意事项

1. **后端 API**: 确保后端服务运行在 `http://localhost:60000`
2. **测试账号**: 使用后端数据库中的真实账号
3. **CORS**: 确保后端配置了正确的 CORS 设置
4. **Token 过期**: 如果 token 过期，会自动跳转到登录页

## 下一步

认证系统已完全集成，可以开始：
1. 实现核心业务页面（任务 #3）
2. 集成项目管理功能
3. 添加更多受保护的路由
