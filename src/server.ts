import { app } from './app.ts'
import { env } from './config/env.ts'

const start = () => {
  try {
    app.listen({ port: env.PORT || 3333 }, () => {
      // biome-ignore lint/suspicious/noConsole: <running log>
      console.log(`Server running on port: ${env.PORT || 3333}`)
    })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
