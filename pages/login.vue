<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 to-gray-100 dark:from-surface-950 dark:to-surface-900 transition-colors duration-300">
    <div class="max-w-md w-full space-y-8 p-8 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl rounded-2xl shadow-soft border border-gray-200/50 dark:border-surface-800/50">
      <div>
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto shadow-glow">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ isLogin ? '欢迎回来' : '创建账号' }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <button
            type="button"
            class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
            @click="toggleMode"
          >
            {{ isLogin ? '立即注册' : '立即登录' }}
          </button>
        </p>
      </div>

      <form class="mt-8 space-y-5" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">邮箱</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field"
              placeholder="your@email.com"
            />
          </div>

          <div v-if="!isLogin">
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">昵称（可选）</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="input-field"
              placeholder="你的名字"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="input-field"
              placeholder="••••••"
            />
          </div>
        </div>

        <div v-if="error" class="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn-primary w-full flex justify-center"
        >
          <span v-if="isLoading">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
          <span v-else>{{ isLogin ? '登录' : '注册' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const router = useRouter()
const { login, register, isAuthenticated } = useAuth()

const isLogin = ref(true)
const isLoading = ref(false)
const error = ref('')
const form = ref({
  email: '',
  password: '',
  name: ''
})

// 如果已登录，跳转到首页
onMounted(() => {
  if (isAuthenticated.value) {
    router.push('/')
  }
})

function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = ''
}

async function handleSubmit() {
  isLoading.value = true
  error.value = ''

  try {
    if (isLogin.value) {
      await login(form.value.email, form.value.password)
    } else {
      await register(form.value.email, form.value.password, form.value.name)
    }
    router.push('/')
  } catch (err: any) {
    error.value = err.message || '操作失败，请重试'
  } finally {
    isLoading.value = false
  }
}
</script>
