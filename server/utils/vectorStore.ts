import { createEmbedding } from './embeddings'

interface VectorDocument {
  id: string
  content: string
  embedding: number[]
  metadata: Record<string, any>
}

// 内存向量存储（生产环境建议使用 Pinecone/Supabase Vector）
class MemoryVectorStore {
  private stores: Map<string, VectorDocument[]> = new Map()

  /**
   * 获取知识库的存储
   */
  private getStore(kbId: string): VectorDocument[] {
    if (!this.stores.has(kbId)) {
      this.stores.set(kbId, [])
    }
    return this.stores.get(kbId)!
  }

  /**
   * 添加文档到向量库
   */
  async addDocuments(
    kbId: string,
    documents: Array<{ id: string; content: string; metadata?: Record<string, any> }>
  ): Promise<void> {
    const store = this.getStore(kbId)

    for (const doc of documents) {
      const embedding = await createEmbedding(doc.content)
      store.push({
        id: doc.id,
        content: doc.content,
        embedding,
        metadata: doc.metadata || {}
      })
    }
  }

  /**
   * 从知识库删除文档
   */
  async deleteDocuments(kbId: string, documentIds: string[]): Promise<void> {
    const store = this.getStore(kbId)
    const filtered = store.filter(doc => !documentIds.includes(doc.id))
    this.stores.set(kbId, filtered)
  }

  /**
   * 清空知识库
   */
  async clearKnowledgeBase(kbId: string): Promise<void> {
    this.stores.delete(kbId)
  }

  /**
   * 相似度搜索
   * @param kbId 知识库 ID
   * @param query 查询文本
   * @param topK 返回结果数量
   * @returns 相似文档列表
   */
  async similaritySearch(
    kbId: string,
    query: string,
    topK: number = 5
  ): Promise<Array<{ content: string; similarity: number; metadata: Record<string, any> }>> {
    const store = this.getStore(kbId)
    if (store.length === 0) return []

    const queryEmbedding = await createEmbedding(query)

    // 计算余弦相似度
    const results = store.map(doc => ({
      content: doc.content,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding),
      metadata: doc.metadata
    }))

    // 排序并返回 Top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .filter(r => r.similarity > 0.7) // 相似度阈值
  }

  /**
   * 获取知识库文档数量
   */
  getDocumentCount(kbId: string): number {
    return this.getStore(kbId).length
  }
}

/**
 * 计算余弦相似度
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// 导出单例
export const vectorStore = new MemoryVectorStore()
