/// <reference types="vitest" />
import { defineConfig } from 'vite'
import BasicSSL from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    server: {
        open: true,
        https: {}
    },
    plugins: [BasicSSL()],
    test: {
        globals: true,
        environment: 'happy-dom'
    }
})
