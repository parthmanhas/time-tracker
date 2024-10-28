import './App.css'
import TimerDashboard from './components/time-dashboard'
import { Toaster } from "@/components/ui/toaster"

function App() {

  // return (
  //   <SidebarProvider>
  //     <AppSidebar />
  //     <main>
  //       <SidebarTrigger />
  //       {/* <TimerDashboard /> */}
  //     </main>
  //   </SidebarProvider>
  // )

  return (
    <>
      <TimerDashboard />
      <Toaster />
    </>
  )
}

export default App
