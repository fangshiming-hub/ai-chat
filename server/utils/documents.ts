import * as mammoth from 'mammoth'
import * as pdfParse from 'pdf-parse'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  return data.text
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export function extractTextFromTXT(buffer: Buffer): Promise<string> {
  return Promise.resolve(buffer.toString('utf-8'))
}

export async function extractText(buffer: Buffer, fileType: string): Promise<string> {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return extractTextFromPDF(buffer)
    case 'docx':
    case 'doc':
      return extractTextFromDOCX(buffer)
    case 'txt':
    case 'md':
      return extractTextFromTXT(buffer)
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

// 文本分块 - 使用简单的字符数分块，可优化为语义分块
export function splitTextIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = []
  let i = 0

  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length)
    // 尽量在句子边界截断
    let chunkEnd = end
    if (end < text.length) {
      const nextPeriod = text.indexOf('.', end - overlap)
      const nextNewline = text.indexOf('\n', end - overlap)
      const nextBreak = Math.min(
        nextPeriod > 0 ? nextPeriod : end,
        nextNewline > 0 ? nextNewline : end
      )
      if (nextBreak > i && nextBreak < end + overlap) {
        chunkEnd = nextBreak + 1
      }
    }

    chunks.push(text.slice(i, chunkEnd).trim())
    i = chunkEnd - overlap
  }

  return chunks.filter(chunk => chunk.length > 0)
}
