// Logika proxy ke Google Gemini. Murni fungsi (tanpa framework) supaya dipakai bersama oleh:
//  - api/chat.js        -> Vercel Serverless Function (produksi)
//  - vite.config.js     -> middleware saat `npm run dev`
// API key hanya dibaca dari env di server, tidak pernah masuk ke bundle browser.
import { SYSTEM_PROMPT } from './persona.js'

const DEFAULT_MODEL = 'gemini-3.6-flash'
const MAX_HISTORY = 12      // jumlah pesan terakhir yang dikirim ke Gemini
const MAX_CHARS = 600       // batas panjang tiap pesan
const LIMIT = 15            // maks permintaan per IP per menit (best-effort, in-memory)
const hits = new Map()

const fail = (status, error) => ({ status, json: { error } })

function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < 60_000)
  list.push(now); hits.set(ip, list)
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some(t => now - t < 60_000)) hits.delete(k)
  return list.length > LIMIT
}

// Rapikan riwayat dari klien: validasi, potong, gabung peran berurutan, pastikan diawali & diakhiri 'user'
function clean(messages) {
  if (!Array.isArray(messages)) return null
  const out = []
  for (const m of messages.slice(-MAX_HISTORY)) {
    if (!m || (m.role !== 'user' && m.role !== 'model') || typeof m.text !== 'string') continue
    const text = m.text.trim().slice(0, MAX_CHARS); if (!text) continue
    const last = out[out.length - 1]
    if (last && last.role === m.role) last.text += '\n' + text; else out.push({ role: m.role, text })
  }
  while (out.length && out[0].role !== 'user') out.shift()
  return out.length && out[out.length - 1].role === 'user' ? out : null
}

export async function chatCore({ method, body, env, ip = 'unknown', origin = '' }) {
  if (method !== 'POST') return fail(405, 'Metode tidak diizinkan.')
  const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)
  if (allowed.length && origin && !allowed.includes(origin)) return fail(403, 'Asal permintaan tidak diizinkan.')
  const key = env.GEMINI_API_KEY
  if (!key) return fail(500, 'Layanan AI belum dikonfigurasi (GEMINI_API_KEY belum diisi di server).')
  if (limited(ip)) return fail(429, 'Terlalu banyak pesan. Tunggu sebentar lalu coba lagi.')
  const msgs = clean(body?.messages)
  if (!msgs) return fail(400, 'Pesan tidak valid.')

  const model = env.GEMINI_MODEL || DEFAULT_MODEL
  let r
  try {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: msgs.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
      signal: AbortSignal.timeout(25_000),
    })
  } catch (e) {
    return fail(504, e?.name === 'TimeoutError' ? 'AI terlalu lama menjawab. Coba lagi.' : 'Tidak bisa menghubungi layanan AI.')
  }

  const data = await r.json().catch(() => null)
  if (!r.ok) {
    console.error(`[chat] Gemini ${r.status} (model: ${model}):`, data?.error?.message || '(tanpa detail)')   // detail hanya di log server
    if (r.status === 429) return fail(429, 'Kuota AI sedang penuh. Coba lagi beberapa saat lagi.')
    return fail(502, 'Layanan AI sedang bermasalah. Coba lagi nanti.')
  }
  const text = (data?.candidates?.[0]?.content?.parts || []).filter(p => p.text && !p.thought).map(p => p.text).join('').trim()
  if (!text) return fail(502, data?.promptFeedback?.blockReason ? 'Pertanyaan ini tidak bisa kujawab.' : 'Jawaban kosong. Coba tanyakan dengan cara lain.')
  return { status: 200, json: { text } }
}
