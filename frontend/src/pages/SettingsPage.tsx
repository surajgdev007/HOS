import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store'
import { userService } from '../services/services'
import toast from 'react-hot-toast'
import { User, Lock, Bell, Download, Palette, Shield, Volume2, LogOut } from 'lucide-react'

function SettingsSection({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
        <Icon size={16} className="text-accent-blue" />
        <h3 className="font-display text-sm text-text-primary tracking-wider">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

export function SettingsPage() {
  const { user, setUser, logout } = useAuthStore()
  const queryClient = useQueryClient()

  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [soundEnabled, setSoundEnabled] = useState(user?.soundEnabled ?? true)
  const [notifications, setNotifications] = useState(user?.notificationsEnabled ?? true)

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<typeof user>) => userService.updateProfile(data as Parameters<typeof userService.updateProfile>[0]),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Profile updated.')
    },
    onError: () => toast.error('Failed to update profile.'),
  })

  const changePasswordMutation = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      toast.success('Password updated.')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update password.'
      toast.error(msg)
    },
  })

  const handlePasswordChange = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    changePasswordMutation.mutate({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    })
  }

  const handleExport = async () => {
    try {
      await userService.exportData()
      toast.success('Data exported successfully.')
    } catch {
      toast.error('Export failed.')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <SettingsSection title="PROFILE" icon={User}>
        <div className="space-y-4">
          <div>
            <label className="text-text-muted text-xs font-mono mb-1.5 block">DISPLAY NAME</label>
            <input
              value={profile.displayName}
              onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm focus:border-accent-blue focus:outline-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-text-muted text-xs font-mono mb-1.5 block">BIO</label>
            <textarea
              value={profile.bio}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              rows={3}
              maxLength={200}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm focus:border-accent-blue focus:outline-none resize-none"
              placeholder="Tell The System about yourself..."
            />
            <p className="text-text-muted text-2xs font-mono mt-1 text-right">{profile.bio.length}/200</p>
          </div>
          <button
            onClick={() => updateProfileMutation.mutate(profile)}
            disabled={updateProfileMutation.isPending}
            className="btn-primary text-sm w-full py-2.5"
          >
            {updateProfileMutation.isPending ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </SettingsSection>

      {/* Password */}
      {user?.password !== undefined && (
        <SettingsSection title="SECURITY" icon={Lock}>
          <div className="space-y-4">
            {['currentPassword', 'newPassword', 'confirmPassword'].map(field => (
              <div key={field}>
                <label className="text-text-muted text-xs font-mono mb-1.5 block capitalize">
                  {field.replace(/([A-Z])/g, ' $1').toUpperCase()}
                </label>
                <input
                  type="password"
                  value={passwords[field as keyof typeof passwords]}
                  onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm focus:border-accent-blue focus:outline-none"
                />
              </div>
            ))}
            <button
              onClick={handlePasswordChange}
              disabled={changePasswordMutation.isPending}
              className="btn-ghost w-full py-2.5 text-sm"
            >
              {changePasswordMutation.isPending ? 'UPDATING...' : 'CHANGE PASSWORD'}
            </button>
          </div>
        </SettingsSection>
      )}

      {/* Preferences */}
      <SettingsSection title="PREFERENCES" icon={Palette}>
        <div className="space-y-4">
          {[
            { label: 'SOUND EFFECTS', icon: Volume2, value: soundEnabled, setter: setSoundEnabled, key: 'soundEnabled' },
            { label: 'NOTIFICATIONS', icon: Bell, value: notifications, setter: setNotifications, key: 'notificationsEnabled' },
          ].map(({ label, icon: Icon, value, setter, key }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-bg rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-text-secondary" />
                <span className="text-text-primary text-sm font-mono">{label}</span>
              </div>
              <button
                onClick={() => {
                  setter(!value)
                  updateProfileMutation.mutate({ [key]: !value })
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-accent-blue' : 'bg-border'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Data */}
      <SettingsSection title="DATA & PRIVACY" icon={Shield}>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="btn-ghost w-full py-2.5 flex items-center justify-center gap-2 text-sm"
          >
            <Download size={14} /> Export My Data
          </button>
          <p className="text-text-muted text-xs font-mono text-center">
            Exports your complete progress as a JSON file.
          </p>
        </div>
      </SettingsSection>

      {/* Danger zone */}
      <div className="card p-6 border-danger/20">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-danger/10">
          <LogOut size={16} className="text-danger" />
          <h3 className="font-display text-sm text-danger tracking-wider">DANGER ZONE</h3>
        </div>
        <button
          onClick={() => logout()}
          className="btn-danger w-full py-2.5 text-sm font-display tracking-wider"
        >
          DISCONNECT FROM SYSTEM
        </button>
      </div>
    </div>
  )
}
