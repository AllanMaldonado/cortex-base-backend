import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env.ts'

const gemini = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
})

const model = 'gemini-2.5-flash'

export async function transcribeAudio(
    audioAsBase64: string,
    mimeType: string
) {
    const response = await gemini.models.generateContent({
        model,
        contents: [
            {
                text: ` Transcreva o áudio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado.
                `,
            },
            {
                inlineData: {
                    mimeType,
                    data: audioAsBase64,
                },
            },
        ],
    })

    if (!response.text) {
        throw new Error('Não foi possível transcrever o áudio')
    }

    return response.text
}

export async function summarizeAudio(transcription:string){
    const prompt = `
        Com base no texto fornecido, faça um resumo que mantenha todas as informações essenciais para compreensão completa do conteúdo.

        TEXTO:
        ${transcription}

        INSTRUÇÕES:
        - Preserve todos os pontos principais, dados relevantes e conclusões importantes
        - Elimine apenas redundâncias, repetições desnecessárias e trechos que não agregam valor ao entendimento
        - Mantenha a estrutura lógica e sequência de ideias do texto original
        - Use exclusivamente as informações contidas no texto fornecido
        - O resumo deve permitir compreensão completa do assunto sem necessidade de consultar o texto original
        - Conserve termos técnicos, números específicos e citações quando relevantes para o contexto
    `.trim()

    const response = await gemini.models.generateContent({
        model,
        contents:[
            {
                text: prompt
            }
        ]
    })

    if(!response.text){
        throw new Error('Falha ao resumir a transcricao')
    }

    return response.text
}