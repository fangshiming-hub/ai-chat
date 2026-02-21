import { ref, computed } from 'vue'

export interface User {
  id: string
  email: string
  name: string | null
}

const user = ref<User | null>(null)
const token = ref<string | null>(null)
const isLoading = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  // 从 localStorage 恢复登录状态
  function initAuth() {
    if (process.client) {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      }
    }
  }

  // 设置认证信息
  function setAuth(newToken: string, newUser: User) {
    token.value = newToken
    user.value = newUser
    if (process.client) {
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
    }
  }

  // 清除认证信息
  function clearAuth() {
    token.value = null
    user.value = null
    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // 登录
  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true
    try {
      const data = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      setAuth(data.token, data.user)
    } catch (error: any) {
      clearAuth()
      throw new Error(error.message || '登录失败')
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  async function register(email: string, password: string, name?: string): Promise<void> {
    isLoading.value = true
    try {
      const data = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { email, password, name }
      })
      setAuth(data.token, data.user)
    } catch (error: any) {
      clearAuth()
      throw new Error(error.message || '注册失败')
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  function logout() {
    clearAuth()
    navigateTo('/login')
  }

  // 获取请求头
  function getAuthHeader(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  // 检查登录状态
  async function checkAuth(): Promise<boolean> {
    if (!token.value) return false

    try {
      const data = await $fetch('/api/auth/me', {
        headers: getAuthHeader()
      })
      user.value = data.user
      return true
    } catch {
      clearAuth()
      return false
    }
  }

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    login,
    register,
    logout,
    initAuth,
    checkAuth,
    getAuthHeader
  }
}
