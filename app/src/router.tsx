import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/components/AppLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Projects from '@/pages/Projects'
import ProjectDetail from '@/pages/ProjectDetail'
import Scripts from '@/pages/Scripts'
import Storyboards from '@/pages/Storyboards'
import Videos from '@/pages/Videos'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Projects />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:id',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ProjectDetail />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:id/scripts',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Scripts />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:id/storyboards',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Storyboards />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:id/videos',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Videos />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Settings />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/404',
    element: <NotFound />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
])
