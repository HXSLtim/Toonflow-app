import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore } from '@/stores'
import { storyboardService } from '@/services'
import type { Image } from '@/services/types'
import { ArrowLeft, Image as ImageIcon, Trash2 } from 'lucide-react'

export default function Storyboards() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ? Number(id) : NaN

  const currentProject = useProjectStore((state) => state.currentProject)
  const fetchProject = useProjectStore((state) => state.fetchProject)

  const [images, setImages] = useState<Image[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (Number.isFinite(projectId) && currentProject?.id !== projectId) {
      fetchProject(projectId)
    }
  }, [projectId, currentProject?.id, fetchProject])

  useEffect(() => {
    const loadStoryboards = async () => {
      if (!Number.isFinite(projectId)) {
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const data = await storyboardService.getImages(projectId)
        setImages(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取分镜失败'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadStoryboards()
  }, [projectId])

  const handleDelete = async (imageId?: number) => {
    if (!imageId) {
      return
    }

    if (!window.confirm('确定要删除这个分镜吗？')) {
      return
    }

    try {
      await storyboardService.deleteImage(imageId)
      setImages((prev) => prev.filter((item) => item.id !== imageId))
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除分镜失败'
      setError(message)
    }
  }

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
        <h1 className="text-3xl font-bold tracking-tight">分镜</h1>
        <p className="text-muted-foreground">管理 {currentProject?.name || '项目'} 的分镜素材</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={async () => {
                if (!Number.isFinite(projectId)) {
                  return
                }
                setError(null)
                setIsLoading(true)
                try {
                  const data = await storyboardService.getImages(projectId)
                  setImages(data)
                } catch (err) {
                  const message = err instanceof Error ? err.message : '获取分镜失败'
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">暂无分镜数据，请先在分镜流程中生成内容。</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div key={image.id ?? `storyboard-${index}`} className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{(image as { name?: string }).name || `分镜 ${index + 1}`}</h2>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="rounded-md p-1 hover:bg-destructive/10 hover:text-destructive"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {(image.filePath ?? '').trim() ? (
                <img
                  src={image.filePath ?? ''}
                  alt={(image as { name?: string }).name || '分镜图'}
                  className="h-48 w-full rounded-md border object-cover"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                  暂无图片
                </div>
              )}

              {(image as { prompt?: string }).prompt && (
                <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                  {(image as { prompt?: string }).prompt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
