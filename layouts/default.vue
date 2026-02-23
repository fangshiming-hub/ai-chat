<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
    <!-- 现代化导航栏 -->
    <nav class="sticky top-0 z-50 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-surface-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-14">
          <div class="flex items-center gap-8">
            <!-- Logo -->
            <NuxtLink to="/" class="flex items-center gap-2 group">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span class="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">AI Chat</span>
            </NuxtLink>

            <!-- 导航链接 -->
            <div v-if="isAuthenticated" class="hidden sm:flex items-center gap-1">
              <NuxtLink to="/" :class="['nav-link', $route.path === '/' ? 'nav-link-active' : '']">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                对话
              </NuxtLink>
              <NuxtLink to="/kb" :class="['nav-link', $route.path === '/kb' ? 'nav-link-active' : '']">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                知识库
              </NuxtLink>
              <NuxtLink to="/settings/models" :class="['nav-link', $route.path === '/settings/models' ? 'nav-link-active' : '']">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                模型设置
              </NuxtLink>
            </div>
          </div>

          <!-- 右侧操作区 -->
          <div class="flex items-center gap-3">
            <!-- 主题切换按钮 -->
            <button
              type="button"
              class="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors"
              @click="toggleTheme"
            >
              <!-- 太阳图标（暗色模式时显示） -->
              <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <!-- 月亮图标（浅色模式时显示） -->
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <!-- 用户信息 -->
            <template v-if="isAuthenticated">
              <div class="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-surface-700">
                <div class="hidden sm:flex items-center gap-2">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                    {{ user?.email?.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm text-gray-600 dark:text-gray-300">{{ user?.email }}</span>
                </div>
                <button
                  class="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors"
                  @click="logout"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="btn-primary text-sm">
                登录
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="h-[calc(100vh-3.6rem)]">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, initAuth, logout, checkAuth } = useAuth()
const { isDark, toggleTheme } = useTheme()
const router = useRouter()

// 初始化认证状态
onMounted(() => {
  initAuth()
  // 检查是否需要跳转到登录页
  checkAuth().then((isValid) => {
    if (!isValid && router.currentRoute.value.path !== '/login') {
      router.push('/login')
    }
  })
})
</script>
