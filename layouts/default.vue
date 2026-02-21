<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <NuxtLink to="/" class="flex items-center">
              <span class="text-xl font-bold text-primary-600">AI Chat</span>
            </NuxtLink>
            <div v-if="isAuthenticated" class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink
                to="/"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="$route.path === '/' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
              >
                对话
              </NuxtLink>
              <NuxtLink
                to="/kb"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="$route.path === '/kb' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
              >
                知识库
              </NuxtLink>
              <NuxtLink
                to="/settings/models"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="$route.path === '/settings/models' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
              >
                模型设置
              </NuxtLink>
            </div>
          </div>

          <!-- 用户信息 -->
          <div class="flex items-center">
            <template v-if="isAuthenticated">
              <span class="text-sm text-gray-600 mr-4">{{ user?.email }}</span>
              <button
                class="text-sm text-gray-500 hover:text-gray-700"
                @click="logout"
              >
                退出
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/login"
                class="btn-primary text-sm"
              >
                登录
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, initAuth, logout, checkAuth } = useAuth()
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
