import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { chatCore } from './lib/chat-core.js'

// Saat `npm run dev`, /api/chat dilayani di sini (kode yang sama dengan api/chat.js di Vercel).
// GEMINI_API_KEY dibaca dari .env.local di sisi server dan tidak ikut ke bundle browser.
const devChatApi = () => {
  let env = {}
  return {
    name: 'dev-chat-api',
    apply: 'serve',
    configResolved(c) { env = loadEnv(c.mode, c.root, '') },
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res) => {
        let raw = ''
        req.on('data', c => { raw += c; if (raw.length > 50_000) req.destroy() })
        req.on('end', async () => {
          let body = null; try { body = raw ? JSON.parse(raw) : {} } catch {}
          const { status, json } = await chatCore({ method: req.method, body, env, ip: 'dev' })
          res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(json))
        })
      })
    },
  }
}

export default defineConfig({ plugins: [react(), devChatApi()] })
