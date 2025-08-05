import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env.ts'

const gemini = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
})

const model = 'gemini-2.5-flash'

export async function transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string
) {

    const prompt = 'Transcreva o áudio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado.'.trim()

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

export async function processTranscription(transcription: string) {
    const prompt = `
        Com base no texto fornecido, gere um JSON com resumo e título:

        TEXTO:
        ${transcription}

        INSTRUÇÕES PARA O RESUMO:
        - Preserve todos os pontos principais, dados relevantes e conclusões importantes
        - Elimine apenas redundâncias, repetições desnecessárias e trechos que não agregam valor ao entendimento
        - Mantenha a estrutura lógica e sequência de ideias do texto original
        - Use exclusivamente as informações contidas no texto fornecido
        - O resumo deve permitir compreensão completa do assunto sem necessidade de consultar o texto original
        - Conserve termos técnicos, números específicos e citações quando relevantes para o contexto

        INSTRUÇÕES PARA O TÍTULO:
        - Defina o título que mais combina com o conteúdo
        - Seja conciso e descritivo

        Retorne APENAS o JSON no formato:
        {
            "summary": "resumo detalhado aqui",
            "title": "título aqui"
        }
    `.trim()

    const response = await gemini.models.generateContent({
        model,
        contents: [
            {
                text: prompt
            }
        ]
    })

    if (!response.text) {
        throw new Error('Failed to process transcription')
    }

    try {
        const cleanText = response.text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

        const result = JSON.parse(cleanText)
        return {
            summary: result.summary,
            title: result.title
        }
    } catch {
        throw new Error(`Failed to parse Gemini response as JSON: ${response.text}`)
    }
}