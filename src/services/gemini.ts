import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env.ts'

const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
})

const model = 'gemini-2.5-flash'

// Regex for parsing Gemini response format
const TITLE_SUMMARY_REGEX = /Título:\s*(.+)\nResumo:\s*([\s\S]+)/i

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string) {
  const prompt =
    'Transcreva o áudio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado.'.trim()

  const audioBlob = new Blob([audioBuffer], { type: mimeType })

  const uploadAudio = await gemini.files.upload({
    file: audioBlob,
    config: {
      mimeType,
    },
  })

  if (!uploadAudio.name) {
    throw new Error('Failed to get file name from upload result')
  }

  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: prompt,
      },
      {
        fileData: {
          mimeType: uploadAudio.mimeType,
          fileUri: uploadAudio.uri,
        },
      },
    ],
  })

  if (!response.text) {
    throw new Error('Empty response from Gemini API')
  }

  return response.text
}

export async function summarizeTranscription(transcription: string) {
  const prompt = `
        Com base no texto fornecido, gere um resumo e um título, respondendo apenas em texto puro, sem formatação, sem blocos de código, sem JSON, apenas assim:
        \nTítulo: <título aqui>\nResumo: <resumo detalhado aqui>\n\nTEXTO:\n${transcription}`.trim()

  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: prompt,
      },
    ],
  })

  if (!response.text) {
    throw new Error('Failed to process transcription')
  }

  const match = response.text.match(TITLE_SUMMARY_REGEX)
  if (!match) {
    throw new Error(
      `Resposta inesperada do Gemini. Esperado formato:\nTítulo: ...\nResumo: ...\nRecebido:\n${response.text}`
    )
  }
  const title = match[1].trim()
  const summary = match[2].trim()

  return { summary, title }
}
