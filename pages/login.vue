<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ isLogin ? '登录' : '注册' }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <button
            type="button"
            class="font-medium text-primary-600 hover:text-primary-500"
            @click="toggleMode"
          >
            {{ isLogin ? '立即注册' : '立即登录' }}
          </button>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">邮箱</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field mt-1"
              placeholder="your@email.com"
            />
          </div>

          <div v-if="!isLogin">
            <label for="name" class="block text-sm font-medium text-gray-700">昵称（可选）</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="input-field mt-1"
              placeholder="你的名字"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="input-field mt-1"
              placeholder="******"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn-primary w-full flex justify-center"
        >
          <span v-if="isLoading">处理中...</span>
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
