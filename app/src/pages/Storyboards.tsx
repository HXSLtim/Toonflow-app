import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore } from '@/stores'
import { ArrowLeft, Plus, Image as ImageIcon } from 'lucide-react'

export default function Storyboards() {
  const { id } = useParams<{ id: string }>()
  const currentProject = useProjectStore((state) => state.currentProject)
  const fetchProject = useProjectStore((state) => state.fetchProject)
  const projectId = id ? Number(id) : NaN

  useEffect(() => {
    if (Number.isFinite(projectId) && currentProject?.id !== projectId) {
      fetchProject(projectId)
    }
  }, [projectId, currentProject?.id, fetchProject])

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
          <h1 className="text-3xl font-bold tracking-tight">Storyboards</h1>
          <p className="text-muted-foreground">
            Create storyboards for {currentProject?.name || 'project'}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          New Storyboard
        </button>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          No storyboards yet. Create your first storyboard to get started.
        </p>
      </div>
    </div>
  )
}
