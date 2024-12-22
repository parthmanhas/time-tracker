import * as React from 'react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Clock, BarChart2, Settings, ChevronLeft, ChevronRight, Tag, LogOut, BookOpen, Target } from "lucide-react"
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ className, onCollapsedChange }: SidebarProps) {
  const location = useLocation()
  const [collapsed, setCollapsed] = React.useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  
  const handleCollapse = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    onCollapsedChange?.(newCollapsed)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const routes = [
    {
      label: "Timers",
      icon: Clock,
      href: "/",
      active: location.pathname === "/",
    },
    {
      label: "Stats",
      icon: BarChart2,
      href: "/stats",
      active: location.pathname === "/stats",
    },
    {
      label: "Tags",
      icon: Tag,
      href: "/tags",
      active: location.pathname === "/tags",
    },
    {
      label: "Journal",
      icon: BookOpen,
      href: "/journal",
      active: location.pathname === "/journal",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: location.pathname === "/settings",
    },
    {
      label: "Goals",
      icon: Target,
      href: "/goals",
      active: location.pathname === "/goals",
    },
  ]

  return (
    <div 
      className={cn(
        "relative pb-12 min-h-screen border-r transition-all duration-300 ease-in-out", 
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background z-50"
        onClick={handleCollapse}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 
            className={cn(
              "mb-2 px-4 text-lg font-semibold transition-all duration-300",
              collapsed && "opacity-0"
            )}
          >
            Dashboard
          </h2>
          <div className='flex flex-col gap-2'>
            {routes.map((route) => (
              <Link key={route.href} to={route.href}>
                <Button
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full transition-all duration-300",
                    collapsed ? "justify-center px-2" : "justify-start px-4"
                  )}
                  title={collapsed ? route.label : undefined}
                >
                  <route.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && route.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full transition-all duration-300",
            collapsed ? "justify-center px-2" : "justify-start px-4"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  )
} 