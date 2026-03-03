import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Toonflow
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          AI-powered comic creation platform
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/login"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            to="/dashboard"
            className="rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
