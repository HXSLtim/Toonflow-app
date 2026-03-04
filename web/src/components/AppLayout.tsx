import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Menu, Settings, X } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: '仪表盘', href: '/dashboard' },
  { name: '项目', href: '/projects' },
]

export default function AppLayout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    navigate('/login', { replace: true })
  }

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="打开导航菜单"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link to="/" className="text-xl font-bold">
              Toonflow
            </Link>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="md:hidden">
              <ModeToggle compact />
            </div>

            <div className="hidden md:block">
              <ModeToggle />
            </div>

            <Link
              to="/settings"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
              aria-label="打开设置"
            >
              <Settings className="h-5 w-5" />
            </Link>

            <button
              onClick={handleLogout}
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="关闭菜单遮罩"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 w-72 max-w-[86vw] border-r bg-background p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">导航菜单</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="关闭导航菜单"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-4 rounded-md border bg-card p-3">
              <ModeToggle />
            </div>

            <nav className="mt-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                    isActive(item.href) ? 'bg-accent text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-6 space-y-2 border-t pt-4">
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
              >
                <Settings className="h-4 w-4" />
                设置
              </Link>

              <Button variant="outline" className="w-full" onClick={handleLogout}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6 md:py-8">{children}</main>
    </div>
  )
}
