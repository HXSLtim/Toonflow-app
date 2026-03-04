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
          Back to Projects
        </button>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm font-medium text-destructive hover:underline"
          >
            Dismiss
          </button>
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
          Back to Projects
        </button>
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>
          <h1 className="text-3xl font-bold tracking-tight">{currentProject.name}</h1>
          {currentProject.intro && (
            <p className="text-muted-foreground">{currentProject.intro}</p>
          )}
        </div>
        <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
          <Settings className="inline h-4 w-4 mr-2" />
          Settings
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          to={`/projects/${id}/scripts`}
          className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-primary">Scripts</h3>
              <p className="text-sm text-muted-foreground">Manage project scripts</p>
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
              <h3 className="font-semibold group-hover:text-primary">Storyboards</h3>
              <p className="text-sm text-muted-foreground">Create storyboards</p>
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
              <h3 className="font-semibold group-hover:text-primary">Videos</h3>
              <p className="text-sm text-muted-foreground">Generate videos</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Project Information</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Type:</dt>
            <dd className="font-medium">{currentProject.type || 'Default'}</dd>
          </div>
          {currentProject.createTime && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Created:</dt>
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
