import { useEffect } from 'react'

// Objek 3D CSS melayang di latar: k=jenis, x/y=posisi %, s=ukuran px, z=kedalaman, d=kecepatan scroll, t=durasi animasi
const SHAPES = [
  { k: 'cube', x: 6, y: 18, s: 84, z: 120, d: 1, t: 26 },
  { k: 'ring', x: 86, y: 12, s: 150, z: -120, d: .6, t: 34 },
  { k: 'sphere', x: 78, y: 62, s: 110, z: 180, d: 1.1, t: 9 },
  { k: 'slab', x: 10, y: 68, s: 130, z: -40, d: .8, t: 8 },
  { k: 'cube', x: 92, y: 42, s: 56, z: -260, d: .4, t: 22 },
  { k: 'ring', x: 30, y: 86, s: 90, z: 60, d: .9, t: 28 },
  { k: 'sphere', x: 46, y: 6, s: 60, z: -200, d: .5, t: 12 },
  { k: 'slab', x: 64, y: 30, s: 90, z: -320, d: .3, t: 10 },
]
const FACES = ['f', 'b', 'r', 'l', 't', 'u']

export function Scene3D() {
  return (
    <div className="scene3d" aria-hidden="true">
      {SHAPES.map((o, i) => (
        <div key={i} className={`o3 ${o.k}`} style={{ '--x': o.x + '%', '--y': o.y + '%', '--s': o.s + 'px', '--z': o.z, '--d': o.d, '--t': o.t + 's' }}>
          <div className="o3-in">{o.k === 'cube' && FACES.map(f => <i key={f} className={'f-' + f} />)}</div>
        </div>
      ))}
    </div>
  )
}

const PAR = '.section-title,.hero-content,.card-thumb img,.about-text,.stat-list,.contact-info'
const TILT = '.card,.skill-card,.ach-item,.profile-meta div'
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

/* Satu loop rAF: kursor (--mx3/--my3), progres scroll (--sp), dan parallax per elemen (--p), plus tilt 3D kartu */
export function useDepth() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const roots = [...document.querySelectorAll('.scene3d,.hero,.blobs')]
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, dirty = true, cur = null
    const set = (k, v) => roots.forEach(r => r.style.setProperty(k, v))

    const frame = () => {
      raf = 0
      cx += (tx - cx) * .08; cy += (ty - cy) * .08
      set('--mx3', cx.toFixed(3)); set('--my3', cy.toFixed(3))
      if (dirty) {
        dirty = false
        const max = document.documentElement.scrollHeight - innerHeight, vh = innerHeight
        set('--sp', (max > 0 ? scrollY / max : 0).toFixed(4))
        document.querySelectorAll(PAR).forEach(el => {
          const r = (el.parentElement || el).getBoundingClientRect()
          el.style.setProperty('--p', clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1).toFixed(3))
        })
      }
      if (Math.abs(tx - cx) > .002 || Math.abs(ty - cy) > .002) kick()
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const dirt = () => { dirty = true; kick() }

    const clear = el => { if (!el) return; el.classList.remove('tilting'); ;['--rx', '--ry', '--ix', '--iy'].forEach(k => el.style.removeProperty(k)) }
    const onMove = e => {
      if (e.pointerType === 'touch') return
      tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; kick()
      if (!fine) return
      const el = e.target.closest?.(TILT)
      if (el !== cur) { clear(cur); cur = el }
      if (!el) return
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5
      const k = Math.min(1, 420 / Math.max(r.width, r.height))
      el.classList.add('tilting')
      el.style.setProperty('--rx', (-y * 14 * k).toFixed(2) + 'deg'); el.style.setProperty('--ry', (x * 16 * k).toFixed(2) + 'deg')
      el.style.setProperty('--ix', x.toFixed(3)); el.style.setProperty('--iy', y.toFixed(3))
    }
    const onLeave = () => { tx = ty = 0; kick(); clear(cur); cur = null }
    const onClick = () => setTimeout(dirt, 60)

    addEventListener('scroll', dirt, { passive: true }); addEventListener('resize', dirt)
    addEventListener('pointermove', onMove, { passive: true }); addEventListener('click', onClick)
    document.documentElement.addEventListener('pointerleave', onLeave)
    const t = setTimeout(dirt, 600); dirt()
    return () => {
      cancelAnimationFrame(raf); clearTimeout(t)
      removeEventListener('scroll', dirt); removeEventListener('resize', dirt)
      removeEventListener('pointermove', onMove); removeEventListener('click', onClick)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])
}
