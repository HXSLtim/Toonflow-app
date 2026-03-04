import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore } from '@/stores'
import { scriptService, videoService } from '@/services'
import type { Script, Video } from '@/services/types'
import { ArrowLeft, Video as VideoIcon } from 'lucide-react'

export default function Videos() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ? Number(id) : NaN

  const currentProject = useProjectStore((state) => state.currentProject)
  const fetchProject = useProjectStore((state) => state.fetchProject)

  const [scripts, setScripts] = useState<Script[]>([])
  const [selectedScriptId, setSelectedScriptId] = useState<number | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (Number.isFinite(projectId) && currentProject?.id !== projectId) {
      fetchProject(projectId)
    }
  }, [projectId, currentProject?.id, fetchProject])

  useEffect(() => {
    const loadScripts = async () => {
      if (!Number.isFinite(projectId)) {
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const data = await scriptService.getScripts(projectId)
        setScripts(data)

        const firstScriptId = data.find((script) => typeof script.id === 'number')?.id
        setSelectedScriptId(typeof firstScriptId === 'number' ? firstScriptId : null)
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取脚本失败'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadScripts()
  }, [projectId])

  useEffect(() => {
    const loadVideos = async () => {
      if (!selectedScriptId) {
        setVideos([])
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const data = await videoService.getVideosByScript(selectedScriptId)
        setVideos(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取视频失败'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadVideos()
  }, [selectedScriptId])

  const selectedScriptName = useMemo(() => {
    if (!selectedScriptId) {
      return '未选择脚本'
    }
    return scripts.find((script) => script.id === selectedScriptId)?.name || `脚本 ${selectedScriptId}`
  }, [scripts, selectedScriptId])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回项目
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">视频</h1>
        <p className="text-muted-foreground">查看 {currentProject?.name || '项目'} 的视频生成结果</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={async () => {
                if (!selectedScriptId) {
                  return
                }
                setError(null)
                setIsLoading(true)
                try {
                  const data = await videoService.getVideosByScript(selectedScriptId)
                  setVideos(data)
                } catch (err) {
                  const message = err instanceof Error ? err.message : '获取视频失败'
                  setError(message)
                } finally {
                  setIsLoading(false)
                }
              }}
              className="rounded-md border border-destructive px-3 py-1 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              重试加载
            </button>
            <button
              onClick={() => setError(null)}
              className="text-sm font-medium text-destructive hover:underline"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {scripts.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <label htmlFor="script-select" className="mb-2 block text-sm font-medium">
            选择脚本
          </label>
          <select
            id="script-select"
            value={selectedScriptId ?? ''}
            onChange={(event) => setSelectedScriptId(Number(event.target.value))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {scripts
              .filter((script) => typeof script.id === 'number')
              .map((script, index) => (
                <option key={script.id ?? index} value={script.id ?? ''}>
                  {script.name || `脚本 ${index + 1}`}
                </option>
              ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <VideoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {selectedScriptId ? `脚本「${selectedScriptName}」暂无视频结果` : '暂无可用脚本，请先生成脚本'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, index) => (
            <div key={video.id ?? `video-${index}`} className="rounded-lg border bg-card p-4">
              <h2 className="mb-2 font-semibold">视频 {index + 1}</h2>

              {(video.filePath ?? '').trim() ? (
                <video src={video.filePath ?? ''} controls className="h-48 w-full rounded-md border bg-black" />
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                  暂无视频文件
                </div>
              )}

              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>状态：{video.state ?? 0}</p>
                <p>时长：{video.time ?? '-'} 秒</p>
                <p>分辨率：{video.resolution || '-'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
