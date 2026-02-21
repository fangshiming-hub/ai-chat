import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { ModelConfig } from '~/types'

/**
 * 根据配置创建 AI 模型
 */
export function createModel(config: ModelConfig) {
  switch (config.provider) {
    case 'openai':
      const openai = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl
      })
      return openai(config.model)

    case 'anthropic':
      const anthropic = createAnthropic({
        apiKey: config.apiKey,
        baseURL: config.baseUrl
      })
      return anthropic(config.model)

    case 'google':
      const google = createGoogleGenerativeAI({
        apiKey: config.apiKey
      })
      return google(config.model)

    case 'custom':
      // 自定义 OpenAI 兼容 API
      const custom = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl
      })
      return custom(config.model)

    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
