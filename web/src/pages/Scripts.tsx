import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore, useScriptStore } from '@/stores'
import { ArrowLeft, FileText, Save } from 'lucide-react'

export default function Scripts() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ? Number(id) : NaN

  const currentProject = useProjectStore((state) => state.currentProject)
  const fetchProject = useProjectStore((state) => state.fetchProject)

  const scripts = useScriptStore((state) => state.scripts)
  const isLoading = useScriptStore((state) => state.isLoading)
  const error = useScriptStore((state) => state.error)
  const fetchScripts = useScriptStore((state) => state.fetchScripts)
  const updateScript = useScriptStore((state) => state.updateScript)
  const clearError = useScriptStore((state) => state.clearError)

  const [editingScriptId, setEditingScriptId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')

  useEffect(() => {
    if (Number.isFinite(projectId)) {
      if (currentProject?.id !== projectId) {
        fetchProject(projectId)
      }
      fetchScripts(projectId)
    }
  }, [projectId, currentProject?.id, fetchProject, fetchScripts])

  const editingScript = useMemo(
    () => scripts.find((script) => script.id === editingScriptId) ?? null,
    [scripts, editingScriptId]
  )

  const startEditing = (scriptId: number, content?: string | null) => {
    setEditingScriptId(scriptId)
    setEditingContent(content ?? '')
  }

  const handleSave = async () => {
    if (!editingScriptId) {
      return
    }

    try {
      await updateScript(editingScriptId, { content: editingContent })
      setEditingScriptId(null)
      setEditingContent('')
    } catch (err) {
      console.error('保存脚本失败:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回项目
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">脚本</h1>
          <p className="text-muted-foreground">管理 {currentProject?.name || '项目'} 的脚本</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                clearError()
                if (Number.isFinite(projectId)) {
                  fetchScripts(projectId)
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
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : scripts.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">暂无脚本，请先在后端生成脚本后再编辑。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scripts.map((script, index) => (
            <div key={script.id ?? `script-${index}`} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">{script.name || `脚本 ${index + 1}`}</h2>
                {script.id != null && (
                  <button
                    onClick={() => startEditing(script.id as number, script.content)}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
                  >
                    编辑
                  </button>
                )}
              </div>

              {editingScriptId === script.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    className="min-h-[220px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingScriptId(null)
                        setEditingContent('')
                      }}
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Save className="h-4 w-4" />
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                  {script.content || '暂无脚本内容'}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {editingScript && (
        <p className="text-xs text-muted-foreground">当前编辑：{editingScript.name || `脚本 ${editingScript.id}`}</p>
      )}
    </div>
  )
}
