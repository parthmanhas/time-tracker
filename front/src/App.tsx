import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import CountdownTimerDashboard from './components/time-dashboard'
import { Sidebar } from './components/sidebar'
import { Stats } from './components/stats'
import { TagStats } from './components/tag-stats'
import { cn } from './lib/utils'
import { useState } from 'react'
import { Settings } from './components/settings'
import { Login } from './components/auth/login'
import { Signup } from './components/auth/signup'
import { ForgotPassword } from './components/auth/forgot-password'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/protected-route'
import { JournalDashboard } from './components/journal-dashboard'
import { Goals } from './components/goals'
import { Toaster } from './components/ui/toaster'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen">
                  <Sidebar
                    className="fixed left-0 top-0"
                    onCollapsedChange={setSidebarCollapsed}
                  />
                  <div
                    className={cn(
                      "flex-1 transition-all duration-300",
                      sidebarCollapsed ? "ml-16" : "ml-64"
                    )}
                  >
                    <Routes>
                      <Route path="/" element={<CountdownTimerDashboard />} />
                      <Route path="/stats" element={<Stats />} />
                      <Route path="/tags" element={<TagStats />} />
                      <Route path="/journal" element={<JournalDashboard />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}
