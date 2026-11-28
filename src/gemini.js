// Klien chat: hanya bicara ke endpoint milik sendiri (/api/chat). Tidak ada API key di sini.
const ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT || '/api/chat'

export async function askGemini(history, signal) {
  let res
  try {
    res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-12) }), signal })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new Error('Tidak bisa terhubung ke server. Periksa koneksi internetmu.')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `Terjadi kesalahan (${res.status}).`)
  if (!data?.text) throw new Error('Jawaban kosong. Coba lagi.')
  return data.text
}
