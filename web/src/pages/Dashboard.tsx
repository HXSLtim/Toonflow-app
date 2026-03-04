import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore, useProjectStore } from '@/stores'
import { Plus, FolderOpen } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const projects = useProjectStore((state) => state.projects)
  const isLoading = useProjectStore((state) => state.isLoading)
  const error = useProjectStore((state) => state.error)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)
  const clearError = useProjectStore((state) => state.clearError)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const { totalProjects, typedProjects, withIntroProjects, recentProjects } = useMemo(() => {
    const total = projects.length
    const typed = projects.filter((project) => Boolean(project.type)).length
    const withIntro = projects.filter((project) => Boolean(project.intro)).length
    const recent = projects.slice(0, 5)

    return {
      totalProjects: total,
      typedProjects: typed,
      withIntroProjects: withIntro,
      recentProjects: recent,
    }
  }, [projects])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
          <p className="text-muted-foreground">
            欢迎回来，{user?.name || '用户'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground md:w-auto"
        >
          退出登录
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">项目总数</h3>
          <p className="mt-2 text-3xl font-bold">{totalProjects}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">已分类项目</h3>
          <p className="mt-2 text-3xl font-bold">{typedProjects}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">含简介项目</h3>
          <p className="mt-2 text-3xl font-bold">{withIntroProjects}</p>
        </div>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  clearError()
                  fetchProjects()
                }}
                className="rounded-md border border-destructive px-3 py-1 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                重试加载
              </button>
              <button
                onClick={clearError}
                className="rounded-md px-3 py-1 text-sm font-medium text-destructive hover:underline"
              >
                关闭
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">最近项目</h2>
          <Link
            to="/projects"
            className="text-sm font-medium text-primary hover:underline"
          >
            查看全部
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              暂无项目，创建你的第一个项目开始吧。
            </p>
            <Link
              to="/projects"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              创建项目
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    {project.intro && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {project.intro}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {project.createTime && (
                      <span>{new Date(project.createTime).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
