import { useEffect, useRef, useState } from 'react'
import { askGemini } from './gemini.js'

const KEY = 'chat-ai-v1', MAX = 500
const HELLO = 'Halo! Aku asisten AI portofolio Badrus. Tanyakan soal **karya**, **skill**, **prestasi**, atau cara berkolaborasi dengannya.'
const SUGGEST = ['Apa saja karya yang pernah dibuat?', 'Skill apa yang dikuasai?', 'Apa prestasi lombanya?', 'Bagaimana cara berkolaborasi?']
const D = {
  spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z',
  send: 'M5 12h14M13 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
}
const Ic = ({ d }) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>

/* markdown ringan (tebal, kode, daftar) dirender sebagai elemen React, bukan HTML mentah, jadi aman dari XSS */
const inline = s => s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((p, i) =>
  p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <strong key={i}>{p.slice(2, -2)}</strong>
    : p.startsWith('`') && p.endsWith('`') && p.length > 2 ? <code key={i}>{p.slice(1, -1)}</code> : p)

function Md({ text }) {
  const blocks = []; let list = null
  text.split('\n').forEach(line => {
    const li = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)/)
    if (li) {
      const ord = /^\s*\d/.test(line)
      if (!list || list.ord !== ord) { list = { ord, items: [] }; blocks.push(list) }
      list.items.push(li[1])
    } else { list = null; if (line.trim()) blocks.push(line) }
  })
  return blocks.map((b, i) => typeof b === 'string' ? <p key={i}>{inline(b)}</p>
    : b.ord ? <ol key={i}>{b.items.map((x, j) => <li key={j}>{inline(x)}</li>)}</ol>
      : <ul key={i}>{b.items.map((x, j) => <li key={j}>{inline(x)}</li>)}</ul>)
}

export default function Chat() {
  const [open, setOpen] = useState(false), [text, setText] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const [msgs, setMsgs] = useState(() => {
    try { const v = JSON.parse(sessionStorage.getItem(KEY)); return Array.isArray(v) ? v.filter(m => m && typeof m.text === 'string') : [] } catch { return [] }
  })
  const log = useRef(), input = useRef(), fab = useRef(), abort = useRef()

  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-30))) } catch { } }, [msgs])
  useEffect(() => {
    if (!open) return
    const el = log.current; el?.scrollTo({ top: el.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [msgs, busy, err, open])
  useEffect(() => {
    if (!open) return
    if (matchMedia('(pointer: fine)').matches) input.current?.focus({ preventScroll: true })
    const k = e => e.key === 'Escape' && close(); addEventListener('keydown', k)
    const sheet = matchMedia('(max-width: 760px)').matches, prev = document.body.style.overflow
    if (sheet) document.body.style.overflow = 'hidden'
    return () => { removeEventListener('keydown', k); if (sheet) document.body.style.overflow = prev }
  }, [open])
  useEffect(() => () => abort.current?.abort(), [])

  const close = () => { setOpen(false); requestAnimationFrame(() => fab.current?.focus()) }
  const grow = () => { const t = input.current; if (t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px' } }

  const run = async hist => {
    abort.current?.abort(); const ac = abort.current = new AbortController()
    setErr(''); setBusy(true)
    try {
      const reply = await askGemini(hist.map(({ role, text }) => ({ role, text })), ac.signal)
      setMsgs(m => [...m, { role: 'model', text: reply }])
    } catch (e) { if (e.name !== 'AbortError') setErr(e.message) }
    finally { if (abort.current === ac) setBusy(false) }
  }
  const send = (raw = text) => {
    const t = raw.trim().slice(0, MAX); if (!t || busy) return
    const next = [...msgs, { role: 'user', text: t }]
    setMsgs(next); setText(''); requestAnimationFrame(grow); run(next)
  }
  const clear = () => { abort.current?.abort(); setMsgs([]); setErr(''); setBusy(false); input.current?.focus({ preventScroll: true }) }

  return (
    <>
      <button ref={fab} type="button" className="chat-fab" hidden={open} aria-expanded={open} aria-controls="chat-panel" onClick={() => setOpen(true)}>
        <Ic d={D.spark} /><span>Tanya AI</span>
      </button>
      {open && <div className="chat-scrim" onClick={close} />}
      {open && (
        <div id="chat-panel" className="chat-panel" role="dialog" aria-label="Asisten AI portofolio">
          <div className="chat-head">
            <span className="chat-avatar"><Ic d={D.spark} /></span>
            <div className="chat-title"><strong>Tanya AI</strong><small><i className="live-dot" /> Ditenagai Google Gemini</small></div>
            <button type="button" className="chat-ico" onClick={clear} disabled={!msgs.length && !busy} aria-label="Hapus percakapan" title="Hapus percakapan"><Ic d={D.trash} /></button>
            <button type="button" className="chat-ico" onClick={close} aria-label="Tutup chat"><Ic d={D.close} /></button>
          </div>
          <div className="chat-log" ref={log} role="log" aria-live="polite" aria-relevant="additions">
            <div className="msg bot"><Md text={HELLO} /></div>
            {msgs.map((m, i) => m.role === 'user'
              ? <div key={i} className="msg me">{m.text}</div>
              : <div key={i} className="msg bot"><Md text={m.text} /></div>)}
            {!msgs.length && <div className="chat-sugg">{SUGGEST.map(s => <button key={s} type="button" onClick={() => send(s)}>{s}</button>)}</div>}
            {busy && <div className="msg bot typing" role="status" aria-label="AI sedang mengetik"><i /><i /><i /></div>}
            {err && <div className="chat-err" role="alert"><span>{err}</span><button type="button" onClick={() => run(msgs)}>Coba lagi</button></div>}
          </div>
          <div className="chat-input">
            <textarea ref={input} rows={1} value={text} maxLength={MAX} placeholder="Tulis pertanyaanmu…" aria-label="Pesan untuk asisten AI"
              onChange={e => { setText(e.target.value); grow() }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send() } }} />
            <button type="button" className="chat-send" disabled={!text.trim() || busy} aria-label="Kirim pesan" onClick={() => send()}><Ic d={D.send} /></button>
          </div>
          <p className="chat-note">Dijawab oleh AI, bisa keliru. Jangan bagikan data pribadi.</p>
        </div>
      )}
    </>
  )
}
