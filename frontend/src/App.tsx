import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AuthCallback } from './pages/AuthCallback'
import { DashboardPage } from './pages/DashboardPage'
import { QuestsPage } from './pages/QuestsPage'
import { CharacterPage } from './pages/CharacterPage'
import { TerminalPage } from './pages/TerminalPage'
import { SkillsPage } from './pages/SkillsPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { InventoryPage } from './pages/InventoryPage'
import { ShopPage } from './pages/ShopPage'
import { RankingsPage } from './pages/RankingsPage'
import { SettingsPage } from './pages/SettingsPage'
import { LevelUpOverlay } from './components/animations/LevelUpOverlay'
import { SystemNotification } from './components/animations/SystemNotification'
import { LoadingScreen } from './components/ui/LoadingScreen'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const { checkAuth, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) return <LoadingScreen />

  return (
    <>
      <LevelUpOverlay />
      <SystemNotification />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected — wrap in AppShell */}
        <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="quests" element={<QuestsPage />} />
          <Route path="character" element={<CharacterPage />} />
          <Route path="terminal" element={<TerminalPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="rankings" element={<RankingsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}
