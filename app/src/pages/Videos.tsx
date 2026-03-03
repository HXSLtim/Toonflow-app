import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore } from '@/stores'
import { ArrowLeft, Plus, Video as VideoIcon } from 'lucide-react'

export default function Videos() {
  const { id } = useParams<{ id: string }>()
  const { currentProject, fetchProject } = useProjectStore()

  useEffect(() => {
    if (id) {
      fetchProject(Number(id))
    }
  }, [id, fetchProject])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Videos</h1>
          <p className="text-muted-foreground">
            Generate videos for {currentProject?.name || 'project'}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Generate Video
        </button>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <VideoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          No videos yet. Generate your first video to get started.
        </p>
      </div>
    </div>
  )
}
