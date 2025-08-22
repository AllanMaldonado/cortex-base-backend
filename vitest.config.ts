// vite.config.ts

import dotenv from 'dotenv'
import { defineConfig } from 'vite'

dotenv.config({ path: '.env' })

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})
