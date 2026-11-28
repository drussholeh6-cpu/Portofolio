// Vercel Serverless Function -> POST /api/chat
// Set environment variable GEMINI_API_KEY di Vercel (Project Settings > Environment Variables).
import { chatCore } from '../lib/chat-core.js'

export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
  const { status, json } = await chatCore({ method: req.method, body: req.body, env: process.env, ip, origin: req.headers.origin || '' })
  res.setHeader('Cache-Control', 'no-store')
  res.status(status).json(json)
}
