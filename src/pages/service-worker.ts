/// <reference lib="WebWorker"/>

const CACHE_NAME = 'offline'
const offlineURL = '/fallback.html'

export type {}
declare const self: ServiceWorkerGlobalScope

self.addEventListener('install', event => {
    event.waitUntil(
        (async (): Promise<void> => {
            const cache = await caches.open(CACHE_NAME)
            await cache.addAll([
                new Request(offlineURL, { cache: 'reload' }),
                new Request('/illustrations/offline.svg', { cache: 'reload' }),
                new Request('/wifi-off.svg', { cache: 'reload' }),
                new Request('/white-logo.svg', { cache: 'reload' }),
                new Request('/sign-bg.jpg', { cache: 'reload' }),
                new Request('/favicon.svg', { cache: 'reload' })
            ])
        })()
    )
    void self.skipWaiting()
})

self.addEventListener('activate', event => {
    event.waitUntil(
        (async (): Promise<void> => {
            const cacheNames = await caches.keys()
            await Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName)
                    }
                })
            )
            if ('navigationPreload' in self.registration) {
                await self.registration.navigationPreload.enable()
            }
        })()
    )
    void self.clients.claim()
})

self.addEventListener('fetch', event => {
    event.respondWith(
        (async (): Promise<Response> => {
            try {
                const cache = await caches.open(CACHE_NAME)
                const cachedResponse = await cache.match(event.request)

                if (cachedResponse) {
                    return cachedResponse
                }

                const networkResponse = await fetch(event.request)

                return networkResponse
            } catch {
                const cache = await caches.open(CACHE_NAME)
                const cachedResponse = await cache.match(offlineURL)
                return cachedResponse || Response.error()
            }
        })()
    )
})
