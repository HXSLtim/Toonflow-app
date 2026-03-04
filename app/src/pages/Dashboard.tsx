import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore, useProjectStore } from '@/stores'
import { Plus, FolderOpen } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const projects = useProjectStore((state) => state.projects)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'User'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Total Projects</h3>
          <p className="mt-2 text-3xl font-bold">{totalProjects}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Typed Projects</h3>
          <p className="mt-2 text-3xl font-bold">{typedProjects}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">With Description</h3>
          <p className="mt-2 text-3xl font-bold">{withIntroProjects}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link
            to="/projects"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No projects yet. Create your first project to get started.
            </p>
            <Link
              to="/projects"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Project
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
                <div className="flex items-center justify-between">
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
