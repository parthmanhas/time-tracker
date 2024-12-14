import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import CountdownTimerDashboard from './components/time-dashboard'
import { Sidebar } from './components/sidebar'
import { Stats } from './components/stats'
import { TagStats } from './components/tag-stats'
import { cn } from './lib/utils'
import { useState } from 'react'
import { Settings } from './components/settings'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <Sidebar 
          className="fixed left-0 top-0" 
          onCollapsedChange={setSidebarCollapsed}
        />
        <div className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}>
          <Routes>
            <Route path="/" element={<CountdownTimerDashboard />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/tags" element={<TagStats />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
