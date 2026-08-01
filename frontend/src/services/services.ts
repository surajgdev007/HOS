import api from './api'
import type { User, AuthResponse, ApiResponse } from '../types'

export const authService = {
  async register(data: { email: string; password: string; username: string; displayName?: string }) {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    const { accessToken, user } = res.data.data!
    localStorage.setItem('accessToken', accessToken)
    return user
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
    const { accessToken, user } = res.data.data!
    localStorage.setItem('accessToken', accessToken)
    return user
  },

  async logout() {
    await api.post('/auth/logout')
    localStorage.removeItem('accessToken')
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me')
    return res.data.data!.user
  },

  googleLogin() {
    window.location.href = '/api/auth/google'
  },

  githubLogin() {
    window.location.href = '/api/auth/github'
  },
}

export const userService = {
  async getDashboard() {
    const res = await api.get('/users/dashboard')
    return res.data.data
  },

  async getProfile() {
    const res = await api.get<ApiResponse<{ user: User }>>('/users/profile')
    return res.data.data!.user
  },

  async updateProfile(data: Partial<User>) {
    const res = await api.patch<ApiResponse<{ user: User }>>('/users/profile', data)
    return res.data.data!.user
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    await api.patch('/users/change-password', data)
  },

  async getHistory(params?: { page?: number; limit?: number; event?: string }) {
    const res = await api.get('/users/history', { params })
    return res.data.data
  },

  async exportData() {
    const res = await api.get('/users/export', { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'system-export.json'
    a.click()
    URL.revokeObjectURL(url)
  },
}

export const questService = {
  async getQuests(params?: { type?: string; status?: string }) {
    const res = await api.get('/quests', { params })
    return res.data.data!.quests
  },

  async getHistory(params?: { page?: number; limit?: number }) {
    const res = await api.get('/quests/history', { params })
    return res.data.data!.quests
  },

  async createQuest(data: {
    title: string
    description?: string
    category?: string
    type?: string
    difficulty?: string
    xpReward?: number
    coinReward?: number
    xpPenalty?: number
    icon?: string
  }) {
    const res = await api.post('/quests', data)
    return res.data.data!.quest
  },

  async acceptQuest(id: string) {
    const res = await api.patch(`/quests/${id}/accept`)
    return res.data
  },

  async completeQuest(id: string) {
    const res = await api.patch(`/quests/${id}/complete`)
    return res.data
  },

  async failQuest(id: string) {
    const res = await api.patch(`/quests/${id}/fail`)
    return res.data
  },

  async deleteQuest(id: string) {
    await api.delete(`/quests/${id}`)
  },
}

export const statService = {
  async getStats() {
    const res = await api.get('/stats')
    return res.data.data!.stats
  },

  async getStat(name: string) {
    const res = await api.get(`/stats/${name}`)
    return res.data.data!.stat
  },
}

export const terminalService = {
  async sendCommand(command: string) {
    const res = await api.post('/terminal/command', { command })
    return res.data.data
  },

  async getHistory(limit = 50) {
    const res = await api.get('/terminal/history', { params: { limit } })
    return res.data.data!.logs
  },

  async generateQuests() {
    const res = await api.post('/terminal/generate-quests')
    return res.data
  },
}

export const achievementService = {
  async getAchievements() {
    const res = await api.get('/achievements')
    return res.data.data
  },
}

export const inventoryService = {
  async getInventory() {
    const res = await api.get('/inventory')
    return res.data.data!.items
  },

  async equipItem(id: string) {
    const res = await api.patch(`/inventory/${id}/equip`)
    return res.data
  },
}

export const skillService = {
  async getSkills() {
    const res = await api.get('/skills')
    return res.data.data!.nodes
  },

  async unlockSkill(skillId: string) {
    const res = await api.post(`/skills/${skillId}/unlock`)
    return res.data
  },
}

export const shopService = {
  async getItems(type?: string) {
    const res = await api.get('/shop', { params: { type } })
    return res.data.data
  },

  async purchaseItem(itemId: string) {
    const res = await api.post(`/shop/${itemId}/purchase`)
    return res.data
  },
}

export const rankingService = {
  async getRankings(params?: { limit?: number; page?: number }) {
    const res = await api.get('/rankings', { params })
    return res.data.data
  },
}

export const bossService = {
  async getCurrentBoss() {
    const res = await api.get('/bosses/current')
    return res.data.data
  },

  async getBosses() {
    const res = await api.get('/bosses')
    return res.data.data!.bosses
  },

  async updateProgress(bossId: string, objectiveIndex: number, value: number) {
    const res = await api.post(`/bosses/${bossId}/progress`, { objectiveIndex, value })
    return res.data
  },
}
