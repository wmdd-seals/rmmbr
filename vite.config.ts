/// <reference types="vitest" />
import { defineConfig } from 'vite'
import BasicSSL from '@vitejs/plugin-basic-ssl'
import TSConfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig({
    server: {
        open: true,
        https: {}
    },
    // for github, we build it in /rmmbr directory, so that it was accessible
    // under *.github.io/rmmbr/
    base: process.env.VITE_DESTINATION === 'github' ? '/rmmbr/' : '/',
    root: resolve(__dirname, 'src/pages'),
    envDir: __dirname,
    publicDir: resolve(__dirname, 'public'),
    plugins: [BasicSSL(), TSConfigPaths()],
    build: {
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/pages/index.html'),
                memory: resolve(__dirname, 'src/pages/memory/index.html'),
                signIn: resolve(__dirname, 'src/pages/sign-in/index.html'),
                signUp: resolve(__dirname, 'src/pages/sign-up/index.html'),
                account: resolve(__dirname, 'src/pages/account/index.html'),
                fallback: resolve(__dirname, 'src/pages/fallback.html'),
                'service-worker': resolve(__dirname, 'src/pages/service-worker.ts'),
                'offline-fallback': resolve(__dirname, 'src/pages/offline-fallback.ts')
            },
            output: {
                entryFileNames: assetInfo => {
                    if (assetInfo.name === 'service-worker' || assetInfo.name === 'offline-fallback') return '[name].js'
                    return 'assets/[name]-[hash].js'
                }
            }
        }
    },
    test: {
        globals: true,
        dir: __dirname,
        environment: 'happy-dom'
    }
})
