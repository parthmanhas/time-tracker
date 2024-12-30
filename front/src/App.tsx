import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import CountdownTimerDashboard from './components/time-dashboard'
import { Stats } from './components/stats'
import { TagStats } from './components/tag-stats'
import { Settings } from './components/settings'
import { Login } from './components/auth/login'
import { Signup } from './components/auth/signup'
import { ForgotPassword } from './components/auth/forgot-password'
import { AuthProvider } from './context/auth-context'
import { ProtectedRoute } from './components/auth/protected-route'
import { JournalDashboard } from './components/journal-dashboard'
import { Goals } from './components/goals'
import { Toaster } from './components/ui/toaster'
import { SidebarProvider } from './components/ui/sidebar'
import { AppSidebar } from './components/app-sidebar'
import { LandingPage } from './components/landing-page'
import { SubscriptionProvider } from '@/context/subscription-context';
import { WelcomePage } from './components/welcome'
import { RoutineProvider } from '@/context/routine-context';
import { RoutineDashboard } from '@/components/routines/routine-dashboard';

export default function App() {

  return (
    <AuthProvider>
      <SubscriptionProvider>

        <RoutineProvider>
          <SidebarProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <AppSidebar />
                      <div className="flex h-screen w-screen">
                        <div className='w-full h-full'>
                          <Routes>
                            <Route path="/welcome" element={<WelcomePage />} />
                            <Route path="/timers" element={<CountdownTimerDashboard />} />
                            <Route path="/stats" element={<Stats />} />
                            <Route path="/tags" element={<TagStats />} />
                            <Route path="/journal" element={<JournalDashboard />} />
                            <Route path="/goals" element={<Goals />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/routines" element={<RoutineDashboard />} />
                          </Routes>
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Toaster />
            </BrowserRouter>
          </SidebarProvider>
        </RoutineProvider>
      </SubscriptionProvider>
    </AuthProvider>
  )
}
