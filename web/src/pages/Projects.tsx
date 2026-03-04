import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '@/stores'
import { Plus, Trash2, Edit, FolderOpen } from 'lucide-react'

export default function Projects() {
  const projects = useProjectStore((state) => state.projects)
  const isLoading = useProjectStore((state) => state.isLoading)
  const error = useProjectStore((state) => state.error)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)
  const createProject = useProjectStore((state) => state.createProject)
  const updateProject = useProjectStore((state) => state.updateProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const clearError = useProjectStore((state) => state.clearError)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    type: '漫画',
    intro: '',
    artStyle: '二次元',
    videoRatio: '16:9',
  })

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleDelete = useCallback(
    async (id: number) => {
      if (confirm('确定要删除这个项目吗？')) {
        try {
          await deleteProject(id)
        } catch (err) {
          console.error('删除项目失败:', err)
        }
      }
    },
    [deleteProject]
  )

  const handleEdit = useCallback(
    async (id: number, currentIntro?: string | null) => {
      const intro = window.prompt('请输入新的项目简介', currentIntro ?? '')
      if (intro == null) {
        return
      }

      try {
        await updateProject(id, { intro: intro.trim() })
      } catch (err) {
        console.error('更新项目失败:', err)
      }
    },
    [updateProject]
  )

  const handleCreateSubmit = useCallback(async () => {
    if (!createForm.name.trim()) {
      alert('项目名称不能为空')
      return
    }

    try {
      await createProject({
        name: createForm.name.trim(),
        type: createForm.type || '漫画',
        intro: createForm.intro,
        artStyle: createForm.artStyle || '二次元',
        videoRatio: createForm.videoRatio || '16:9',
      })

      setCreateForm({
        name: '',
        type: '漫画',
        intro: '',
        artStyle: '二次元',
        videoRatio: '16:9',
      })
      setShowCreateDialog(false)
    } catch (err) {
      console.error('创建项目失败:', err)
    }
  }, [createForm, createProject])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">项目</h1>
          <p className="text-muted-foreground">创建并管理你的漫画项目</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 md:w-auto"
        >
          <Plus className="h-4 w-4" />
          新建项目
        </button>
      </div>

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
              className="text-sm font-medium text-destructive hover:underline"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {showCreateDialog && (
        <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h2 className="text-base font-semibold">新建项目</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="项目名称"
              className="rounded-md border bg-background px-3 py-2 text-sm"
            />
            <input
              value={createForm.type}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, type: e.target.value }))}
              placeholder="项目类型"
              className="rounded-md border bg-background px-3 py-2 text-sm"
            />
            <input
              value={createForm.artStyle}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, artStyle: e.target.value }))}
              placeholder="美术风格"
              className="rounded-md border bg-background px-3 py-2 text-sm"
            />
            <input
              value={createForm.videoRatio}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, videoRatio: e.target.value }))}
              placeholder="画幅比例（如 16:9）"
              className="rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <textarea
            value={createForm.intro}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, intro: e.target.value }))}
            placeholder="项目简介"
            className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreateDialog(false)}
              className="rounded-md border px-3 py-2 text-sm"
            >
              取消
            </button>
            <button
              onClick={handleCreateSubmit}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              创建
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">暂无项目，创建你的第一个项目开始吧。</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Link to={`/projects/${project.id}`} className="block">
                <h3 className="font-semibold">{project.name}</h3>
                {project.intro && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.intro}</p>
                )}
                <div className="mt-4 flex flex-col items-start gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                  <span>类型：{project.type || '默认'}</span>
                  {project.createTime && (
                    <span>创建时间：{new Date(project.createTime).toLocaleDateString()}</span>
                  )}
                </div>
              </Link>

              <div className="absolute right-4 top-4 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if (project.id != null) {
                      handleEdit(project.id, project.intro)
                    }
                  }}
                  className="rounded-md p-2 hover:bg-accent"
                  title="编辑"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if (project.id != null) {
                      handleDelete(project.id)
                    }
                  }}
                  className="rounded-md p-2 hover:bg-destructive/10 hover:text-destructive"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
