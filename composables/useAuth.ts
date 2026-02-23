import { ref, computed } from 'vue'

export interface User {
  id: string
  email: string
  name: string | null
}

export interface ApiResponse<T = any> {
  statusCode: number
  msg: string
  data: T
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
      if (savedToken && savedUser && savedUser !== 'undefined') {
        try {
          token.value = savedToken
          user.value = JSON.parse(savedUser)
        } catch {
          clearAuth()
        }
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
      const response = await $fetch<ApiResponse<{ user: User; token: string }>>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      if (response.statusCode !== 0) {
        throw new Error(response.msg || '登录失败')
      }

      setAuth(response.data.token, response.data.user)
    } catch (error: any) {
      clearAuth()
      // 如果是 HTTP 错误，使用 response 中的 msg
      if (error.response?._data) {
        const data = error.response._data as ApiResponse
        throw new Error(data.msg || '登录失败')
      }
      throw new Error(error.message || '登录失败')
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  async function register(email: string, password: string, name?: string): Promise<void> {
    isLoading.value = true
    try {
      const response = await $fetch<ApiResponse<{ user: User; token: string }>>('/api/auth/register', {
        method: 'POST',
        body: { email, password, name }
      })

      if (response.statusCode !== 0) {
        throw new Error(response.msg || '注册失败')
      }

      setAuth(response.data.token, response.data.user)
    } catch (error: any) {
      clearAuth()
      if (error.response?._data) {
        const data = error.response._data as ApiResponse
        throw new Error(data.msg || '注册失败')
      }
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
    // 如果 token 为空，先尝试从 localStorage 恢复
    if (!token.value) {
      initAuth()
    }
    if (!token.value) return false

    try {
      const response = await $fetch<ApiResponse<User>>('/api/auth/me', {
        headers: getAuthHeader()
      })

      if (response.statusCode === 0) {
        user.value = response.data
        return true
      }
      clearAuth()
      return false
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
