import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/stores'
import { useTheme } from '@/components/theme-provider'
import { useToast } from '@/hooks/use-toast'
import { configService } from '@/services'
import type { Config } from '@/services/types'
import { User, Bell, Lock, Palette, Settings2, Plus, Save, Trash2, Pencil } from 'lucide-react'

type SettingsTab = 'profile' | 'security' | 'notifications' | 'appearance' | 'models'
type ModelType = 'text' | 'image' | 'video'

interface NotificationPrefs {
  email: boolean
  project: boolean
  security: boolean
}

const NOTIFICATION_KEY = 'toonflow-notification-prefs'
const DISPLAY_NAME_KEY = 'toonflow-display-name'

const defaultNotificationPrefs: NotificationPrefs = {
  email: true,
  project: true,
  security: true,
}

const defaultModelForm = {
  id: null as number | null,
  type: 'text' as ModelType,
  manufacturer: '',
  model: '',
  modelType: 'chat',
  baseUrl: '',
  apiKey: '',
}

export default function Settings() {
  const user = useAuthStore((state) => state.user)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [tab, setTab] = useState<SettingsTab>('profile')
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false)
  const [configs, setConfigs] = useState<Config[]>([])
  const [configError, setConfigError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(defaultNotificationPrefs)

  const [modelForm, setModelForm] = useState(defaultModelForm)
  const [modelFilter, setModelFilter] = useState<'all' | ModelType>('all')

  const visibleConfigs = useMemo(
    () =>
      modelFilter === 'all'
        ? configs
        : configs.filter((item) => item.type === modelFilter),
    [configs, modelFilter]
  )

  const loadConfigs = async () => {
    setIsLoadingConfigs(true)
    setConfigError(null)
    try {
      const data = await configService.getConfigs()
      setConfigs(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载模型配置失败'
      setConfigError(message)
    } finally {
      setIsLoadingConfigs(false)
    }
  }

  useEffect(() => {
    void loadConfigs()
  }, [])

  useEffect(() => {
    const savedName = localStorage.getItem(DISPLAY_NAME_KEY)
    setDisplayName(savedName ?? (user?.name ?? ''))

    const raw = localStorage.getItem(NOTIFICATION_KEY)
    if (!raw) {
      return
    }

    try {
      const parsed = JSON.parse(raw) as NotificationPrefs
      setNotificationPrefs({
        email: Boolean(parsed.email),
        project: Boolean(parsed.project),
        security: Boolean(parsed.security),
      })
    } catch {
      setNotificationPrefs(defaultNotificationPrefs)
    }
  }, [user?.name])

  const saveDisplayName = () => {
    localStorage.setItem(DISPLAY_NAME_KEY, displayName.trim())
    toast({
      title: '保存成功',
      description: '显示名称已更新',
    })
  }

  const toggleNotification = (key: keyof NotificationPrefs) => {
    setNotificationPrefs((prev) => {
      const next = {
        ...prev,
        [key]: !prev[key],
      }
      localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(next))
      return next
    })

    toast({
      title: '设置已更新',
      description: '通知偏好已保存',
    })
  }

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setTheme(value)
    toast({
      title: '主题已切换',
      description: `当前主题：${value === 'light' ? '浅色' : value === 'dark' ? '深色' : '跟随系统'}`,
    })
  }

  const handleSaveModel = async () => {
    if (!modelForm.manufacturer.trim() || !modelForm.model.trim() || !modelForm.baseUrl.trim() || !modelForm.apiKey.trim()) {
      setConfigError('厂商、模型、Base URL、API Key 不能为空')
      return
    }

    try {
      setConfigError(null)
      if (modelForm.id) {
        await configService.updateConfig(modelForm.id, {
          type: modelForm.type,
          manufacturer: modelForm.manufacturer.trim(),
          model: modelForm.model.trim(),
          modelType: modelForm.modelType.trim(),
          baseUrl: modelForm.baseUrl.trim(),
          apiKey: modelForm.apiKey.trim(),
        })
        toast({ title: '更新成功', description: '模型配置已更新' })
      } else {
        await configService.createConfig({
          type: modelForm.type,
          manufacturer: modelForm.manufacturer.trim(),
          model: modelForm.model.trim(),
          modelType: modelForm.modelType.trim(),
          baseUrl: modelForm.baseUrl.trim(),
          apiKey: modelForm.apiKey.trim(),
          userId: 1,
        })
        toast({ title: '创建成功', description: '模型配置已新增' })
      }

      setModelForm(defaultModelForm)
      await loadConfigs()
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存模型配置失败'
      setConfigError(message)
    }
  }

  const handleDeleteModel = async (id?: number) => {
    if (!id) {
      return
    }
    if (!window.confirm('确定要删除这个模型配置吗？')) {
      return
    }

    try {
      await configService.deleteConfig(id)
      toast({ title: '删除成功', description: '模型配置已删除' })
      await loadConfigs()
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除模型配置失败'
      setConfigError(message)
    }
  }

  const editModel = (config: Config) => {
    setModelForm({
      id: config.id ?? null,
      type: (config.type === 'image' || config.type === 'video' ? config.type : 'text') as ModelType,
      manufacturer: config.manufacturer ?? '',
      model: config.model ?? '',
      modelType: config.modelType ?? 'chat',
      baseUrl: config.baseUrl ?? '',
      apiKey: config.apiKey ?? '',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">设置</h1>
        <p className="text-muted-foreground">继续迁移并完善体验：账户、安全、通知、外观与模型配置</p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg border bg-card p-2 md:grid-cols-5">
        {[
          ['profile', '个人资料'],
          ['security', '安全'],
          ['notifications', '通知'],
          ['appearance', '外观'],
          ['models', '模型配置'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value as SettingsTab)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === value ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">个人资料</h3>
              <p className="text-sm text-muted-foreground">维护账号基础信息</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">登录用户名</label>
              <input
                disabled
                value={user?.name ?? ''}
                className="block w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">显示名称</label>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={saveDisplayName}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
              保存个人资料
            </button>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">安全与登录</h3>
              <p className="text-sm text-muted-foreground">管理密码和会话安全策略</p>
            </div>
          </div>

          <div className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
            当前后端尚未开放密码修改与会话管理接口，迁移阶段先保留入口。
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() =>
                toast({
                  title: '功能建设中',
                  description: '密码修改功能将在后续迁移中开放',
                })
              }
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              修改密码
            </button>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">通知偏好</h3>
              <p className="text-sm text-muted-foreground">调整本地通知偏好设置</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span>邮件通知</span>
              <input
                type="checkbox"
                checked={notificationPrefs.email}
                onChange={() => toggleNotification('email')}
                className="h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span>项目更新提醒</span>
              <input
                type="checkbox"
                checked={notificationPrefs.project}
                onChange={() => toggleNotification('project')}
                className="h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span>安全提醒（推荐开启）</span>
              <input
                type="checkbox"
                checked={notificationPrefs.security}
                onChange={() => toggleNotification('security')}
                className="h-4 w-4"
              />
            </label>
          </div>
        </div>
      )}

      {tab === 'appearance' && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">外观与主题</h3>
              <p className="text-sm text-muted-foreground">切换系统、浅色或深色模式</p>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            {[
              ['light', '浅色'],
              ['dark', '深色'],
              ['system', '跟随系统'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value as 'light' | 'dark' | 'system')}
                className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                  theme === value ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'models' && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">模型配置管理</h3>
                <p className="text-sm text-muted-foreground">对接后端 setting 路由，管理文本/图像/视频模型</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={modelForm.type}
                onChange={(event) =>
                  setModelForm((prev) => ({
                    ...prev,
                    type: event.target.value as ModelType,
                  }))
                }
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="text">文本模型</option>
                <option value="image">图像模型</option>
                <option value="video">视频模型</option>
              </select>
              <input
                value={modelForm.manufacturer}
                onChange={(event) => setModelForm((prev) => ({ ...prev, manufacturer: event.target.value }))}
                placeholder="模型厂商"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <input
                value={modelForm.model}
                onChange={(event) => setModelForm((prev) => ({ ...prev, model: event.target.value }))}
                placeholder="模型名称"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <input
                value={modelForm.modelType}
                onChange={(event) => setModelForm((prev) => ({ ...prev, modelType: event.target.value }))}
                placeholder="模型类型（如 chat）"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <input
                value={modelForm.baseUrl}
                onChange={(event) => setModelForm((prev) => ({ ...prev, baseUrl: event.target.value }))}
                placeholder="Base URL"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <input
                value={modelForm.apiKey}
                onChange={(event) => setModelForm((prev) => ({ ...prev, apiKey: event.target.value }))}
                placeholder="API Key"
                type="password"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              {modelForm.id && (
                <button
                  onClick={() => setModelForm(defaultModelForm)}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  取消编辑
                </button>
              )}
              <button
                onClick={handleSaveModel}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {modelForm.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {modelForm.id ? '保存修改' : '新增配置'}
              </button>
            </div>

            {configError && <p className="mt-3 text-sm text-destructive">{configError}</p>}
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold">现有配置</h4>
              <select
                value={modelFilter}
                onChange={(event) => setModelFilter(event.target.value as 'all' | ModelType)}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">全部类型</option>
                <option value="text">文本模型</option>
                <option value="image">图像模型</option>
                <option value="video">视频模型</option>
              </select>
            </div>

            {isLoadingConfigs ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : visibleConfigs.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无模型配置</p>
            ) : (
              <div className="space-y-3">
                {visibleConfigs.map((config) => (
                  <div key={config.id} className="rounded-md border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {config.manufacturer || '未知厂商'} / {config.model || '未知模型'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          类型：{config.type || '-'} · 模型类型：{config.modelType || '-'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground break-all">
                          Base URL：{config.baseUrl || '-'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editModel(config)}
                          className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteModel(config.id ?? undefined)}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
