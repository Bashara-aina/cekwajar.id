/// <reference lib="webworker" />
/**
 * cekwajar.id — Service Worker for wajar-slip offline support
 *
 * NOTE: This is a minimal implementation. To activate:
 * 1. Install @ducanh2912/next-pwa and configure it in next.config.ts, OR
 * 2. Copy this file to public/sw.js and register it manually
 *
 * What this does:
 * - Pre-caches the form page shell on install
 * - Shows a minimal offline page when the user is offline and tries to navigate
 * - Sends an OFFLINE_SUBMISSION_BLOCKED message to all clients when a POST
 *   request fails due to being offline (for toast/UI integration)
 */

declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = 'cekwajar-slip-v1'
const PRECACHE_URLS = ['/', '/wajar-slip']

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          fetch(url, { cache: 'reload' })
            .then((res) => {
              if (res.ok) return cache.put(url, res)
            })
            .catch(() => {/* precache optional — don't fail install */})
        )
  )
  )
  )
  ;(self as unknown as ServiceWorkerGlobalScope & { skipWaiting: () => void }).skipWaiting?.()
})

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  ;(self as ServiceWorkerGlobalScope & { clients: Clients }).clients.claim?.()
})

// ─── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          return res
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached
            return new Response(
              `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"/>
                <title>cekwajar.id — Offline</title>
                <style>
                  body{min-height:100vh;display:flex;align-items:center;justify-content:center;
                    font-family:system-ui,sans-serif;background:#f8f9fa;color:#0f172a;
                    flex-direction:column;gap:16px;text-align:center;padding:24px}
                  h1{font-size:1.5rem;margin:0}p{color:#475569;margin:0}
                  a{display:inline-block;margin-top:8px;color:#1B65A6}
                </style>
              </head><body>
                <h1>Koneksi terputus</h1>
                <p>Cek slip gaji membutuhkan koneksi internet.<br/>Silakan coba lagi setelah koneksi pulih.</p>
                <a href="/wajar-slip">Coba Lagi</a>
              </body></html>`,
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            )
          })
        )
    )
    return
  }

  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(js|css|woff2?|png|jpg|svg|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          return res
        })
      })
    )
  }
})

// ─── Offline POST notification ──────────────────────────────────────────────────
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'POST') return
  const url = new URL(event.request.url)
  if (!url.pathname.includes('/api/')) return

  event.respondWith(
    fetch(event.request.clone()).catch(() => {
      self.clients.matchAll().then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'OFFLINE_SUBMISSION_BLOCKED',
            message:
              'Kamu sedang offline. Data tidak tersimpan. Silakan hubungi kembali setelah koneksi pulih.',
          })
        })
      })
      return new Response(
        JSON.stringify({ success: false, error: 'OFFLINE', message: 'Koneksi terputus.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    })
  )
})

// ─── Message handler ─────────────────────────────────────────────────────────────
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') {
    ;(self as ServiceWorkerGlobalScope & { skipWaiting: () => void }).skipWaiting?.()
  }
})

export {}