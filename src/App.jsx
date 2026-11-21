import { useEffect, useRef, useState, useCallback } from 'react'
import Lanyard from './Lanyard.jsx'

const NAV = [
  ['top', 'Beranda', 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z'],
  ['tentang', 'Tentang', 'M12 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7ZM5 21a7 7 0 0 1 14 0'],
  ['karya', 'Karya', 'M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM3 16l5-5 4 4 3-3 6 5M8 8h.01'],
  ['skill', 'Skill', 'M5 7h14M5 12h9M5 17h14M17 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z'],
  ['prestasi', 'Prestasi', 'M7 4h10v5a5 5 0 0 1-10 0V4ZM5 5H3a3 3 0 0 0 3 3M19 5h2a3 3 0 0 1-3 3M12 14v4M8 21h8M9 18h6'],
  ['kontak', 'Kontak', 'M4 5h16v11H8l-4 4V5ZM8 9h8M8 12h5'],
]
const WORKS = [
  ['foto', 'Foto/Difani.JPG', 'Potret Makrab Phinix', 'Human Interest', 'Foto Portrait', 'Potret Makrab Phinix — Human Interest (2026)'],
  ['desain', 'Foto/STOP SCROLL.png', 'Infografis Stop Scroll', 'Poster & Media', 'Social Infographics', 'Infografis Stop Scroll — Poster & Media Edukasi (2026)'],
  ['foto', 'Foto/Kak Fai.JPG', 'Potret Kota Lama', 'Arsitektur', 'Street Architecture', 'Potret Kota Lama — Arsitektur & Street Photography (2026)'],
  ['desain', 'Foto/Portofolio.png', 'Desain Portofolio', 'Branding', 'Visual Identity', 'Visual Identitas Portofolio — Branding & Ilustrasi (2026)'],
  ['foto', 'Foto/Hanif.JPG', 'Potret Makrab Phinix', 'Momen', 'Night Portrait', 'Potret Malam Makrab Phinix — Momen & Lighting (2026)'],
  ['desain', 'Foto/Pamflet Ifest.png', 'Pamflet Integral Festival', 'Poster Acara', 'Event Promotion', 'Pamflet Integral Festival — Event & Media Promosi (2026)'],
]
const SKILLS = [
  ['Photoshop', 'Adobe-Photoshop-Logo.png', 'Retouch Poster Layout'], ['Canva', 'canva-transparent-icon-free-png.webp', 'Social Template Branding'],
  ['CapCut', 'CapCut-Symbol.png', 'Video Cut Reels'], ['VS Code', 'vscode-logo.png', 'Code Debug Web'],
  ['Google Colab', 'google colab.png', 'Notebook AI Python'], ['Gemini', 'gemini-color.png', 'AI Prompt Ide'],
  ['GitHub', 'GitHub-Logo.png', 'Repo Git Deploy'], ['Vercel', 'OIP (1).webp', 'Deploy Web App'],
  ['HTML', 'html-logo.png', 'Structure Semantik Page'], ['CSS', 'OIP.webp', 'Styling UI Responsive'],
  ['JavaScript', 'png-javascript-badge-picture-8.png', 'Logic DOM Interaksi'], ['Python', 'Python-logo-notext.svg.webp', 'Automation AI Data'],
]
const ACH = [
  ['2026', "Musabaqah Fahmil Qur'an HTQ Qur'anic Competition", "Hai'ah Tahfidz Al-Qur'an UIN Malang", 'Juara 1', 'Foto/MFQ_HTQ.jpg', "Dokumentasi kegiatan — HTQ Qur'anic Competition"],
  ['2025', 'Cerdas Cermat MSAA Fest', "Pusat Ma'had Al-Jami'ah UIN Malang", 'Juara 2', 'Foto/Cerdas cermat_MSAA.jpg', 'Dokumentasi kegiatan — Cerdas Cermat MSAA Fest'],
  ['2025', 'Integral Olympiad Number Integral Festival', 'HMPS Integral Matematika UIN Malang', 'Juara 3', 'Foto/ION_IFESt.jpg', 'Dokumentasi kegiatan — Integral Festival 2025'],
]
const EMAIL = 'sholehbadrus278@email.com'

/* muncul saat masuk layar, dengan pantulan pegas */
function R({ as: T = 'div', className = '', i = 0, ...p }) {
  const ref = useRef()
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { e.target.classList.add('in'); io.disconnect() } }, { threshold: 0.12 })
    io.observe(ref.current); return () => io.disconnect()
  }, [])
  return <T ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${(i % 4) * 80}ms` }} {...p} />
}

function Nav({ open, setOpen }) {
  const ref = useRef(), lock = useRef(false), [active, setActive] = useState('top')
  const place = useCallback(() => {
    const a = ref.current?.querySelector('a.active')
    if (a && innerWidth > 880) { ref.current.style.setProperty('--liquid-x', a.offsetLeft + 'px'); ref.current.style.setProperty('--liquid-width', a.offsetWidth + 'px') }
  }, [])
  useEffect(place, [active, place])
  useEffect(() => {
    const on = () => {
      if (lock.current) return
      let cur = 'top'; NAV.forEach(([id]) => { const s = document.getElementById(id); if (s && s.offsetTop <= scrollY + 190) cur = id }); setActive(cur)
    }
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', place); document.fonts?.ready.then(place)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', place) }
  }, [place])
  const go = (e, id) => {
    e.preventDefault(); lock.current = true; setActive(id); setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    history.pushState(null, '', '#' + id); setTimeout(() => (lock.current = false), 1000)
  }
  return (
    <nav className={`links${open ? ' open' : ''}`} ref={ref} aria-label="Navigasi utama">
      {NAV.map(([id, label, d]) => (
        <a key={id} href={'#' + id} className={active === id ? 'active' : ''} onClick={e => go(e, id)}>
          <span className="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg></span><span>{label}</span>
        </a>
      ))}
    </nav>
  )
}

function Skills() {
  const t = useRef(), [edge, setEdge] = useState([true, false]), drag = useRef(null)
  const upd = useCallback(() => { const e = t.current; setEdge([e.scrollLeft <= 2, e.scrollLeft >= e.scrollWidth - e.clientWidth - 2]) }, [])
  useEffect(() => { upd(); addEventListener('resize', upd); return () => removeEventListener('resize', upd) }, [upd])
  const by = n => t.current.scrollBy({ left: n * 420, behavior: 'smooth' })
  const arrow = d => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  return (
    <R className="skill-carousel-wrap">
      <button type="button" className="skill-nav" disabled={edge[0]} onClick={() => by(-1)} aria-label="Skill sebelumnya">{arrow('M15 5l-7 7 7 7')}</button>
      <div className="skill-grid" ref={t} onScroll={upd}
        onPointerDown={e => { if (e.pointerType !== 'touch') { drag.current = { x: e.clientX, s: t.current.scrollLeft, m: false }; t.current.classList.add('dragging') } }}
        onPointerMove={e => { const d = drag.current; if (d) { if (Math.abs(e.clientX - d.x) > 4) d.m = true; t.current.scrollLeft = d.s - (e.clientX - d.x) } }}
        onPointerUp={() => { drag.current = null; t.current.classList.remove('dragging') }} onPointerLeave={() => { drag.current = null; t.current.classList.remove('dragging') }}>
        {SKILLS.map(([n, img, tags]) => (
          <div className="skill-card" key={n}>
            <div className="skill-badge"><img src={`/Logo/${img}`} alt={`${n} logo`} loading="lazy" draggable="false" /></div>
            <h3>{n}</h3><div className="skill-tags">{tags.split(' ').map(x => <span key={x}>{x}</span>)}</div>
          </div>
        ))}
      </div>
      <button type="button" className="skill-nav" disabled={edge[1]} onClick={() => by(1)} aria-label="Skill berikutnya">{arrow('M9 5l7 7-7 7')}</button>
    </R>
  )
}

export default function App() {
  const [menu, setMenu] = useState(false), [scrolled, setScrolled] = useState(false)
  const [filter, setFilter] = useState('all'), [box, setBox] = useState(null), [sent, setSent] = useState(false)

  useEffect(() => {
    const sc = () => setScrolled(scrollY > 40); sc(); addEventListener('scroll', sc, { passive: true })
    const sel = '.card, .skill-card, .ach-item, .profile-meta div, .stat-list, form, .contact-info, .links, .id-card'
    const pm = e => { const g = e.target.closest?.(sel); if (g) { const r = g.getBoundingClientRect(); g.style.setProperty('--mx', e.clientX - r.left + 'px'); g.style.setProperty('--my', e.clientY - r.top + 'px') } }
    addEventListener('pointermove', pm, { passive: true })
    return () => { removeEventListener('scroll', sc); removeEventListener('pointermove', pm) }
  }, [])
  useEffect(() => {
    document.body.style.overflow = box ? 'hidden' : ''
    const k = e => e.key === 'Escape' && setBox(null); addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [box])

  const theme = () => { const r = document.documentElement, d = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; r.dataset.theme = d ? 'light' : 'dark' }
  const submit = e => {
    e.preventDefault(); const f = new FormData(e.currentTarget), n = f.get('n'), m = f.get('m'), em = f.get('e'); setSent(true)
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Pesan dari Portofolio — ' + n)}&body=${encodeURIComponent(`${m}\n\nDari: ${n} (${em})`)}`
  }

  return (
    <>
      <div className="blobs" aria-hidden="true"><i /><i /><i /></div>
      <header className={scrolled ? 'scrolled' : ''}>
        <a href="#top" className="logo">
          <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="17.5" strokeWidth=".8" /><circle cx="20" cy="20" r="13.5" strokeWidth=".45" opacity=".65" /><path d="M13 26V14l7 8 7-8v12" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Mukhamad Badrus Sholeh
        </a>
        <button className="theme" type="button" onClick={theme} aria-label="Ganti tema terang/gelap"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg></button>
        <button className="menu-toggle" type="button" aria-label="Buka menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
          <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="17.5" stroke="currentColor" strokeWidth=".8" /><path d="M13 26V14l7 8 7-8v12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </header>
      <Nav open={menu} setOpen={setMenu} />

      <section className="hero" id="top">
        <div className="profile-hero">
          <Lanyard photo="/Foto/Profile.JPG" photo2="/Foto/Badrus.JPG" name="Mukhamad Badrus Sholeh" role="Desainer Grafis & Fotografer" sub="Matematika UIN Malang, 2025" status="Terbuka berkolaborasi" />
          <div className="hero-content">
            <h1 className="name">Mukhamad Badrus Sholeh</h1>
            <div className="role-line"><span>Desainer Grafis</span><span>Fotografer</span><span>Mahasiswa Matematika</span></div>
            <p className="hero-desc">Saya merangkai ide menjadi karya visual yang bermakna, dengan memadukan ketelitian matematika, nilai Al-Qur'an, dan kepekaan dalam desain serta fotografi.</p>
            <div className="cta-row"><a href="#karya" className="btn btn-primary">Lihat Karya <span>↗</span></a><a href="#tentang" className="btn btn-ghost">Kenali Saya <span>↓</span></a></div>
          </div>
        </div>
        <div className="profile-meta">
          <div><span className="meta-label">Lokasi</span><strong>Malang, Indonesia</strong></div>
          <div><span className="meta-label">Pendidikan</span><strong>UIN Maulana Malik Ibrahim</strong></div>
          <div><span className="meta-label">Minat</span><strong>Qur'an-Visual-Angka</strong></div>
          <div><span className="meta-label">Status</span><strong><i /> Terbuka berkolaborasi</strong></div>
        </div>
      </section>

      <section id="tentang">
        <R className="section-head"><h2 className="section-title">Terus Melangkah Menggapai mimpi</h2></R>
        <div className="about-grid">
          <R className="about-text">
            <p>Saya <strong>Mukhamad Badrus Sholeh</strong>, mahasiswa <strong>Matematika angkatan 2025 UIN Maulana Malik Ibrahim Malang</strong>. Di luar kuliah, saya membangun identitas visual untuk berbagai brand dan komunitas sebagai <strong>desainer grafis</strong>, serta mengabadikan momen melalui <strong>fotografi</strong>.</p>
            <p>Saya juga aktif di ajang <strong>Musabaqah Fahmil Qur'an (MFQ)</strong> — cabang lomba yang menuntut ketepatan hafalan, kecepatan berpikir, dan kedalaman pemahaman terhadap Al-Qur'an. Bagi saya, ketiga dunia ini tidak terpisah: matematika mengajarkan struktur, desain mengajarkan rasa, dan Al-Qur'an mengajarkan ketelitian yang menaungi keduanya.</p>
          </R>
          <R className="stat-list">
            {[['Program Studi', 'Matematika'], ['Kampus', 'UIN Malang'], ['Angkatan', '2025'], ['Media Kreatif', 'Desain & Foto']].map(([l, v]) => <div className="stat-row" key={l}><span className="label">{l}</span><span className="value">{v}</span></div>)}
          </R>
        </div>
      </section>

      <section id="karya">
        <R className="section-head"><h2 className="section-title">Yang pernah saya buat</h2></R>
        <R className="filter-row">
          {[['all', 'Semua'], ['desain', 'Desain Grafis'], ['foto', 'Fotografi']].map(([k, l]) => <button key={k} className={`filter-btn${filter === k ? ' active' : ''}`} onClick={() => setFilter(k)}>{l}</button>)}
        </R>
        <div className="grid-portfolio">
          {WORKS.filter(w => filter === 'all' || w[0] === filter).map((w, i) => (
            <R key={filter + w[1]} i={i} className="card" onClick={() => setBox({ src: '/' + w[1], cap: w[5], alt: w[2] })}>
              <div className="card-thumb"><img src={'/' + w[1]} alt={w[2]} loading="lazy" /><span className="cat-pill">{w[0] === 'foto' ? 'Fotografi' : 'Desain Grafis'}</span><div className="card-overlay-btn"><span>{w[0] === 'foto' ? 'Lihat Foto' : 'Lihat Desain'} ↗</span></div></div>
              <div className="card-body"><span className="card-tag">{w[3]}</span><h3 className="card-title">{w[2]}</h3><div className="card-meta"><span>2026</span><span>{w[4]}</span></div></div>
            </R>
          ))}
        </div>
      </section>

      <section id="skill">
        <R className="section-head"><h2 className="section-title">Software & bahasa pemrograman</h2></R>
        <Skills />
      </section>

      <section id="prestasi">
        <R className="section-head"><h2 className="section-title">Jejak di atas panggung lomba</h2></R>
        <div className="ach-list">
          {ACH.map(([y, t, d, b, img, cap], i) => (
            <R className="ach-item" key={t} i={i}>
              <div className="ach-year">{y}</div><div className="ach-main"><div className="ach-title">{t}</div><div className="ach-desc">{d}</div></div><div className="ach-badge">{b}</div>
              <button className="ach-proof" type="button" aria-label={`Buka bukti foto ${t}`} onClick={() => setBox({ src: '/' + img, cap, alt: cap })}><img src={'/' + img} alt={`Dokumentasi ${t}`} /><span className="proof-label">Dokumentasi ↗</span></button>
            </R>
          ))}
        </div>
      </section>

      <section id="kontak">
        <R className="section-head"><h2 className="section-title">Mari berkolaborasi</h2></R>
        <div className="contact-wrap">
          <R className="contact-info">
            <p>Terbuka untuk proyek desain, sesi foto, kolaborasi konten keagamaan, atau sekadar berdiskusi tentang matematika dan Al-Qur'an. Silakan hubungi lewat kanal berikut.</p>
            <div className="contact-list">
              <a href={`mailto:${EMAIL}`}><span className="ic">✉</span> {EMAIL}</a>
              <a href="https://www.instagram.com/mukh.bad_rush?igsh=YXpwMDh2dXFsNHJ5" target="_blank" rel="noopener"><span className="ic">◈</span> @mukh.bad_rush — Instagram</a>
              <a href="https://www.tiktok.com/@mukh.bad_rush" target="_blank" rel="noopener"><span className="ic">♪</span> @mukh.bad_rush — TikTok</a>
            </div>
          </R>
          <R as="form" onSubmit={submit}>
            <div className="field"><label htmlFor="n">Nama</label><input id="n" name="n" required placeholder="Nama lengkap" /></div>
            <div className="field"><label htmlFor="e">Email</label><input id="e" name="e" type="email" required placeholder="email@contoh.com" /></div>
            <div className="field"><label htmlFor="m">Pesan</label><textarea id="m" name="m" required placeholder="Ceritakan proyekmu..." /></div>
            <button type="submit" className="send-btn">Kirim Pesan <span>↗</span></button>
            {sent && <p className="form-status" role="status">Terima kasih, pesan Anda sudah dikirim.</p>}
          </R>
        </div>
      </section>

      <footer><span>© 2026 Mukhamad Badrus Sholeh. Web Developer & Visual Artist</span></footer>

      {box && (
        <div className="proof-lightbox" role="dialog" aria-modal="true" aria-label="Pratinjau gambar" onClick={e => e.target === e.currentTarget && setBox(null)}>
          <button className="lightbox-close" type="button" aria-label="Tutup pratinjau" autoFocus onClick={() => setBox(null)}>×</button>
          <figure><img src={box.src} alt={box.alt} /><figcaption>{box.cap}</figcaption></figure>
        </div>
      )}
    </>
  )
}
