import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { useUIStore } from '../../store'
import { cn } from '../../utils/cn'

export function AppShell() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 scanlines opacity-30" />
      
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none bg-system-grid opacity-50" />
      
      {/* Radial accent top */}
      <div className="fixed top-0 left-0 right-0 h-96 pointer-events-none bg-radial-accent" />

      <Sidebar />

      <div className={cn(
        'flex flex-col flex-1 min-w-0 transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-16'
      )}>
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
