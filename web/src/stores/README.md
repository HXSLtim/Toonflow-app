# State Management with Zustand

完整的全局状态管理解决方案，使用 Zustand 实现。

## 安装

Zustand 已添加到 `package.json`，运行 `npm install` 安装。

## Store 结构

### 1. Auth Store (`stores/auth.ts`)

管理用户认证状态，支持持久化存储。

```typescript
import { useAuthStore } from '@/stores';

function LoginPage() {
  const { login, isLoading, error, isAuthenticated } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login('username', 'password');
      // 登录成功，自动保存到 localStorage
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Already logged in</p>
      ) : (
        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

**可用方法**：
- `login(name, password)` - 登录
- `register(name, password)` - 注册
- `logout()` - 登出
- `getCurrentUser()` - 获取当前用户信息
- `clearError()` - 清除错误

**状态**：
- `user` - 当前用户对象
- `token` - JWT Token
- `isAuthenticated` - 是否已认证
- `isLoading` - 加载状态
- `error` - 错误信息

### 2. Project Store (`stores/project.ts`)

管理项目数据和 CRUD 操作。

```typescript
import { useProjectStore } from '@/stores';

function ProjectList() {
  const { projects, isLoading, fetchProjects, createProject, deleteProject } = useProjectStore();

  useEffect(() => {
    fetchProjects(1, 10); // page, pageSize
  }, []);

  const handleCreate = async () => {
    try {
      const project = await createProject({
        name: '新项目',
        type: 'animation',
        intro: '项目简介',
        artStyle: '动漫风格',
        videoRatio: '16:9',
      });
      console.log('Created:', project);
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              {project.name}
              <button onClick={() => deleteProject(project.id!)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleCreate}>Create Project</button>
    </div>
  );
}
```

**可用方法**：
- `fetchProjects(page?, pageSize?)` - 获取项目列表（分页）
- `fetchProject(id)` - 获取单个项目
- `createProject(data)` - 创建项目
- `updateProject(id, data)` - 更新项目
- `deleteProject(id)` - 删除项目
- `setCurrentProject(project)` - 设置当前项目
- `clearError()` - 清除错误

**状态**：
- `projects` - 项目列表
- `currentProject` - 当前选中的项目
- `isLoading` - 加载状态
- `error` - 错误信息
- `pagination` - 分页信息 `{ page, pageSize, total }`

### 3. Script Store (`stores/script.ts`)

管理剧本、大纲、小说、故事线。

```typescript
import { useScriptStore } from '@/stores';

function ScriptEditor() {
  const {
    scripts,
    currentScript,
    fetchScripts,
    createScript,
    updateScript,
    setCurrentScript,
  } = useScriptStore();

  useEffect(() => {
    fetchScripts(projectId);
  }, [projectId]);

  const handleSave = async () => {
    if (currentScript) {
      await updateScript(currentScript.id!, { content: '更新的内容' });
    }
  };

  return (
    <div>
      <select onChange={(e) => {
        const script = scripts.find(s => s.id === Number(e.target.value));
        setCurrentScript(script || null);
      }}>
        {scripts.map((script) => (
          <option key={script.id} value={script.id}>
            {script.name}
          </option>
        ))}
      </select>

      {currentScript && (
        <div>
          <textarea value={currentScript.content || ''} />
          <button onClick={handleSave}>Save</button>
        </div>
      )}
    </div>
  );
}
```

**可用方法**：

**Scripts**:
- `fetchScripts(projectId)` - 获取剧本列表
- `fetchScript(id)` - 获取单个剧本
- `createScript(data)` - 创建剧本
- `updateScript(id, data)` - 更新剧本
- `deleteScript(id)` - 删除剧本
- `setCurrentScript(script)` - 设置当前剧本

**Outlines**:
- `fetchOutlines(projectId)` - 获取大纲列表
- `createOutline(data)` - 创建大纲
- `updateOutline(id, data)` - 更新大纲
- `deleteOutline(id)` - 删除大纲

**Novels**:
- `fetchNovels(projectId)` - 获取小说列表
- `createNovel(data)` - 创建小说
- `updateNovel(id, data)` - 更新小说
- `deleteNovel(id)` - 删除小说

**Storylines**:
- `fetchStorylines(projectId)` - 获取故事线列表
- `createStoryline(data)` - 创建故事线
- `updateStoryline(id, data)` - 更新故事线
- `deleteStoryline(id)` - 删除故事线

**状态**：
- `scripts` - 剧本列表
- `currentScript` - 当前剧本
- `outlines` - 大纲列表
- `novels` - 小说列表
- `storylines` - 故事线列表
- `isLoading` - 加载状态
- `error` - 错误信息

### 4. UI Store (`stores/ui.ts`)

管理 UI 状态和通知，支持持久化。

```typescript
import { useUIStore } from '@/stores';

function Layout() {
  const { sidebarOpen, toggleSidebar, theme, setTheme, addNotification } = useUIStore();

  const showSuccess = () => {
    addNotification({
      type: 'success',
      title: '操作成功',
      message: '项目已创建',
      duration: 3000, // 3秒后自动消失
    });
  };

  return (
    <div>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle Theme
      </button>
      <button onClick={showSuccess}>Show Notification</button>

      {sidebarOpen && <Sidebar />}
    </div>
  );
}

function NotificationList() {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="notifications">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          <h4>{notification.title}</h4>
          {notification.message && <p>{notification.message}</p>}
          <button onClick={() => removeNotification(notification.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
```

**可用方法**：
- `toggleSidebar()` - 切换侧边栏
- `setSidebarOpen(open)` - 设置侧边栏状态
- `setTheme(theme)` - 设置主题 ('light' | 'dark' | 'system')
- `addNotification(notification)` - 添加通知
- `removeNotification(id)` - 移除通知
- `clearNotifications()` - 清除所有通知

**状态**：
- `sidebarOpen` - 侧边栏是否打开
- `theme` - 当前主题
- `notifications` - 通知列表

## 高级用法

### 选择性订阅（性能优化）

只订阅需要的状态，避免不必要的重渲染：

```typescript
// ❌ 不推荐：订阅整个 store
const store = useProjectStore();

// ✅ 推荐：只订阅需要的状态
const projects = useProjectStore((state) => state.projects);
const isLoading = useProjectStore((state) => state.isLoading);
const fetchProjects = useProjectStore((state) => state.fetchProjects);
```

### 在非 React 组件中使用

```typescript
import { useAuthStore } from '@/stores';

// 获取当前状态
const isAuthenticated = useAuthStore.getState().isAuthenticated;

// 调用 action
useAuthStore.getState().logout();

// 订阅状态变化
const unsubscribe = useAuthStore.subscribe((state) => {
  console.log('Auth state changed:', state.isAuthenticated);
});

// 取消订阅
unsubscribe();
```

### 组合多个 Store

```typescript
function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const projects = useProjectStore((state) => state.projects);
  const addNotification = useUIStore((state) => state.addNotification);

  const handleAction = async () => {
    try {
      // 执行操作
      addNotification({
        type: 'success',
        title: '成功',
        message: `欢迎 ${user?.name}`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: '错误',
        message: error.message,
      });
    }
  };

  return <div>...</div>;
}
```

## 持久化存储

Auth Store 和 UI Store 使用 `persist` 中间件自动保存到 localStorage：

- **Auth Store**: 保存 `user`, `token`, `isAuthenticated`
- **UI Store**: 保存 `sidebarOpen`, `theme`

数据会在页面刷新后自动恢复。

## 错误处理

所有 store 都包含统一的错误处理：

```typescript
const { error, clearError } = useProjectStore();

useEffect(() => {
  if (error) {
    // 显示错误提示
    console.error(error);
    // 清除错误
    clearError();
  }
}, [error]);
```

## 最佳实践

1. **使用选择性订阅**：只订阅需要的状态
2. **错误处理**：始终处理 async action 的错误
3. **加载状态**：使用 `isLoading` 显示加载指示器
4. **清理**：组件卸载时清除错误状态
5. **类型安全**：充分利用 TypeScript 类型推断
