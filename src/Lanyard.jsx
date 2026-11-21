import { useEffect, useRef } from 'react'

// Tali + kartu ID dengan fisika verlet: bisa ditarik, dilepas, lalu memantul dan berayun.
const SEG = 26, CW = 232, CH = 330, ROD = CH * 0.9, DAMP = 0.993, G = 0.55, STEP = 1000 / 60
const INV = [0, 1, 1, 1, 1, 1, 0.5, 0.3]            // 0 = jangkar, 1-5 = tali, 6 = klip kartu, 7 = dasar kartu
const LINKS = [[0, 1, SEG], [1, 2, SEG], [2, 3, SEG], [3, 4, SEG], [4, 5, SEG], [5, 6, SEG], [6, 7, ROD]]

export default function Lanyard({ photo, photo2, name, role, sub, status }) {
  const box = useRef(), card = useRef(), rope = useRef(), rope2 = useRef(), sim = useRef({})

  useEffect(() => {
    const el = box.current
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = el.clientWidth, run = false, raf = 0, last = 0, acc = 0
    const ax = () => W / 2
    const cum = [0, SEG, SEG * 2, SEG * 3, SEG * 4, SEG * 5, SEG * 6, SEG * 6 + ROD], k = 0.5   // mulai miring 30°, lalu berayun masuk
    const P = cum.map(c => { const x = ax() + Math.sin(k) * c, y = -12 + Math.cos(k) * c; return { x, y, px: x, py: y } })
    const s = sim.current; s.drag = null; s.ptr = { x: 0, y: 0 }; s.P = P

    const step = () => {
      for (let i = 1; i < P.length; i++) {
        const p = P[i], vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP
        p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + G
      }
      if (s.drag) {
        const T = P[6], B = P[7], t = s.drag.t
        const dx = s.ptr.x - (T.x + (B.x - T.x) * t), dy = s.ptr.y - (T.y + (B.y - T.y) * t)
        T.x += dx * (1 - t) * 0.45; T.y += dy * (1 - t) * 0.45
        B.x += dx * (0.2 + t * 0.5); B.y += dy * (0.2 + t * 0.5)
      }
      for (let k = 0; k < 10; k++) {
        P[0].x = ax(); P[0].y = -12
        for (const [a, b, len] of LINKS) {
          const A = P[a], C = P[b], dx = C.x - A.x, dy = C.y - A.y, d = Math.hypot(dx, dy) || 1
          const f = (d - len) / d, w = INV[a] + INV[b]
          A.x += dx * f * INV[a] / w; A.y += dy * f * INV[a] / w
          C.x -= dx * f * INV[b] / w; C.y -= dy * f * INV[b] / w
        }
      }
      for (const p of P) p.x = Math.max(CW / 2 + 6, Math.min(W - CW / 2 - 6, p.x))
    }

    const render = () => {
      let d = `M${P[0].x},${P[0].y}`
      for (let i = 1; i < 6; i++) d += `Q${P[i].x},${P[i].y} ${(P[i].x + P[i + 1].x) / 2},${(P[i].y + P[i + 1].y) / 2}`
      d += `L${P[6].x},${P[6].y}`
      rope.current?.setAttribute('d', d); rope2.current?.setAttribute('d', d)
      const T = P[6], B = P[7], ang = -Math.atan2(B.x - T.x, B.y - T.y) * 180 / Math.PI
      const c = card.current
      if (c) { c.style.transform = `translate3d(${T.x - CW / 2}px,${T.y}px,0) rotate(${ang}deg)`; c.style.setProperty('--a', ang.toFixed(1)) }
    }

    const loop = t => {
      if (!run) return
      acc = Math.min(acc + (t - (last || t)), 60); last = t
      while (acc >= STEP) { step(); acc -= STEP }
      render(); raf = requestAnimationFrame(loop)
    }
    const start = () => { if (!run && !reduce) { run = true; last = 0; raf = requestAnimationFrame(loop) } }
    const stop = () => { run = false; cancelAnimationFrame(raf) }

    if (reduce) { for (let i = 0; i < 500; i++) step(); render() }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.05 })
    io.observe(el)
    const ro = new ResizeObserver(() => { W = el.clientWidth; if (reduce) { for (let i = 0; i < 300; i++) step(); render() } })
    ro.observe(el)
    return () => { stop(); io.disconnect(); ro.disconnect() }
  }, [])

  const pos = e => { const r = box.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
  const down = e => {
    const s = sim.current, T = s.P[6], B = s.P[7]; s.ptr = pos(e)
    const vx = B.x - T.x, vy = B.y - T.y
    const t = Math.max(0, Math.min(1, ((s.ptr.x - T.x) * vx + (s.ptr.y - T.y) * vy) / (vx * vx + vy * vy || 1)))
    s.drag = { t }; e.currentTarget.setPointerCapture(e.pointerId); card.current.classList.add('grab')
  }
  const move = e => { if (sim.current.drag) sim.current.ptr = pos(e) }
  const up = () => { sim.current.drag = null; card.current.classList.remove('grab') }
  const key = e => {
    const B = sim.current.P[7], k = { ArrowLeft: -1, ArrowRight: 1 }[e.key]
    if (k) { B.px -= k * 16; e.preventDefault() }
  }

  return (
    <div className="lanyard-stage" ref={box}>
      <svg className="lanyard-rope" aria-hidden="true">
        <path ref={rope} className="strap" />
        <path ref={rope2} className="strap-line" />
      </svg>
      <div className="id-card" ref={card} tabIndex={0} aria-label={`Kartu identitas ${name}. Tarik dengan kursor, atau geser dengan tombol panah.`}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}>
        <span className="id-clip" aria-hidden="true" />
        <div className="id-photo">
          <img src={photo} alt={`Foto ${name}`} draggable="false" />
          <img className="p2" src={photo2} alt="" draggable="false" onError={e => (e.currentTarget.style.display = 'none')} />
        </div>
        <div className="id-info"><strong>{name}</strong><span>{role}</span><small>{sub}</small></div>
        <div className="id-status"><i />{status}</div>
      </div>
      <p className="id-hint">Tarik kartunya, lalu lepas.</p>
    </div>
  )
}
