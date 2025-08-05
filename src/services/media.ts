import { fileTypeFromBuffer } from 'file-type'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { PassThrough } from 'node:stream'

ffmpeg.setFfmpegPath(ffmpegStatic as unknown as string)

const VIDEO_MIME_TYPES = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mkv',
    'video/quicktime'
]

export interface MediaProcessingResult {
    audioBuffer: Buffer
    mimeType: string
    wasConverted: boolean
    originalType?: string
}


export async function isVideoFile(buffer: Buffer): Promise<boolean> {
    const fileType = await fileTypeFromBuffer(buffer)
    return fileType?.mime ? VIDEO_MIME_TYPES.includes(fileType.mime) : false
}


export function convertVideoToMp3(videoBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const inputStream = new PassThrough()
        const outputStream = new PassThrough()
        const chunks: Buffer[] = []

        outputStream.on('data', (chunk) => chunks.push(chunk))
        outputStream.on('end', () => resolve(Buffer.concat(chunks)))
        outputStream.on('error', reject)

        ffmpeg(inputStream)
            .toFormat('mp3')
            .audioCodec('libmp3lame')
            .audioBitrate('32k') 
            .audioChannels(1)
            .outputOptions([
                '-ar', '16000',   // Frequência de amostragem reduzida
                '-q:a', '9',      // Qualidade mais baixa do MP3
                '-ac', '1'        // Força mono
            ])
            .on('end', () => outputStream.end())
            .on('error', (error) => {
                reject(new Error(`Erro na conversão: ${error.message}`))
            })
            .pipe(outputStream, { end: false })

        inputStream.end(videoBuffer)
    })
}

export async function processMediaFile(
    buffer: Buffer,
    originalMimeType: string
): Promise<MediaProcessingResult> {
    const fileType = await fileTypeFromBuffer(buffer)
    const actualMimeType = fileType?.mime || originalMimeType

    if (VIDEO_MIME_TYPES.includes(actualMimeType)) {
        const startTime = Date.now()
        const audioBuffer = await convertVideoToMp3(buffer)
        const duration = Date.now() - startTime

        // biome-ignore lint/suspicious/noConsole: <Verificar tempo de conversao>
        console.log(`✅ Conversão concluída em ${duration}ms`)

        return {
            audioBuffer,
            mimeType: 'audio/mpeg',
            wasConverted: true,
            originalType: actualMimeType
        }
    }

    // Se já for áudio, não converte
    return {
        audioBuffer: buffer,
        mimeType: actualMimeType,
        wasConverted: false
    }
}
