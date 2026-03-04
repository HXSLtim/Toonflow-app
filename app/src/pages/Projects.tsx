import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '@/stores'
import { Plus, Trash2, Edit } from 'lucide-react'

export default function Projects() {
  const projects = useProjectStore((state) => state.projects)
  const isLoading = useProjectStore((state) => state.isLoading)
  const error = useProjectStore((state) => state.error)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const clearError = useProjectStore((state) => state.clearError)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleDelete = useCallback(async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id)
      } catch (err) {
        console.error('Failed to delete project:', err)
      }
    }
  }, [deleteProject])

  const handleNewProject = useCallback(() => {
    setShowCreateDialog(true)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Create and manage your comic projects
          </p>
        </div>
        <button
          onClick={handleNewProject}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm font-medium text-destructive hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {showCreateDialog && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
          Project creation dialog is not implemented yet.
          <button
            onClick={() => setShowCreateDialog(false)}
            className="ml-3 font-medium text-primary hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            No projects yet. Create your first project to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Link to={`/projects/${project.id}`} className="block">
                <h3 className="font-semibold">{project.name}</h3>
                {project.intro && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {project.intro}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Type: {project.type || 'Default'}</span>
                  {project.createTime && (
                    <span>
                      Created: {new Date(project.createTime).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
              <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Implement edit
                  }}
                  className="rounded-md p-1 hover:bg-accent"
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
                  className="rounded-md p-1 hover:bg-destructive/10 hover:text-destructive"
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
