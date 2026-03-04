import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores'
import { ArrowLeft, FileText, Image, Video, Settings } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentProject = useProjectStore((state) => state.currentProject)
  const isLoading = useProjectStore((state) => state.isLoading)
  const error = useProjectStore((state) => state.error)
  const fetchProject = useProjectStore((state) => state.fetchProject)
  const clearError = useProjectStore((state) => state.clearError)

  const projectId = id ? Number(id) : NaN

  useEffect(() => {
    if (Number.isFinite(projectId) && currentProject?.id !== projectId) {
      fetchProject(projectId)
    }
  }, [projectId, currentProject?.id, fetchProject])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回项目列表
        </button>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                clearError()
                if (Number.isFinite(projectId)) {
                  fetchProject(projectId)
                }
              }}
              className="rounded-md border border-destructive px-3 py-1 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              重试加载
            </button>
            <button
              onClick={clearError}
              className="text-sm font-medium text-destructive hover:underline"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回项目列表
        </button>
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">未找到项目</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回项目列表
          </button>
          <h1 className="text-3xl font-bold tracking-tight">{currentProject.name}</h1>
          {currentProject.intro && (
            <p className="text-muted-foreground">{currentProject.intro}</p>
          )}
        </div>
        <button className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground md:w-auto">
          <Settings className="inline h-4 w-4 mr-2" />
          设置
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to={`/projects/${id}/scripts`}
          className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-primary">脚本</h3>
              <p className="text-sm text-muted-foreground">管理项目脚本</p>
            </div>
          </div>
        </Link>

        <Link
          to={`/projects/${id}/storyboards`}
          className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Image className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-primary">分镜</h3>
              <p className="text-sm text-muted-foreground">创建分镜</p>
            </div>
          </div>
        </Link>

        <Link
          to={`/projects/${id}/videos`}
          className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-primary">视频</h3>
              <p className="text-sm text-muted-foreground">生成视频</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">项目信息</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-muted-foreground">类型：</dt>
            <dd className="font-medium">{currentProject.type || '默认'}</dd>
          </div>
          {currentProject.createTime && (
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-muted-foreground">创建时间：</dt>
              <dd className="font-medium">
                {new Date(currentProject.createTime).toLocaleString()}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}
