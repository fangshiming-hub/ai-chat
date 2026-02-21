import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'

/**
 * 将文本转换为向量
 * @param text 输入文本
 * @returns 向量数组
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text.slice(0, 8000), // 限制长度
  })
  return embedding
}

/**
 * 批量创建向量
 * @param texts 文本数组
 * @returns 向量数组
 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = []
  for (const text of texts) {
    const embedding = await createEmbedding(text)
    embeddings.push(embedding)
  }
  return embeddings
}
