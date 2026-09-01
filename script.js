/* =========================================================
   LUXURY DUAL-ELEMENT CURSOR (ZERO-LAG LERP PHYSICS)
   ========================================================= */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (cursorDot && cursorRing && !window.matchMedia('(pointer: coarse)').matches) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let cursorVisible = false;

  const showCursor = () => {
    if (!cursorVisible) {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
      cursorVisible = true;
    }
  };

  const hideCursor = () => {
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
    cursorVisible = false;
  };

  window.addEventListener('pointermove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    // Instant dot movement
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
    showCursor();
  });

  document.addEventListener('pointerleave', hideCursor);
  document.addEventListener('pointerenter', showCursor);

  function renderCursorPhysics() {
    // Smooth lerp for trailing aura ring
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;

    requestAnimationFrame(renderCursorPhysics);
  }
  requestAnimationFrame(renderCursorPhysics);

  const interactiveSelectors = 'a, button, input, textarea, .profile-photo-frame, .ach-proof, .filter-btn, .skill-card, .card, .skill-nav';
  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.classList.add('active');
      cursorDot.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('active');
      cursorDot.classList.remove('active');
    });
  });
}

/* =========================================================
   ELEGANT CINEMATIC AUDIO ENGINE
   Pure Web Audio API — Musical · Harmonic · Zero-latency
   ========================================================= */
const SFX = (() => {
  let ctx = null;
  let ambientNode = null;

  /* ── Init AudioContext ── */
  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ── Simulated Reverb (feedback delay network) ── */
  function createReverb(c, decaySec = 2.2, mix = 0.38) {
    const wet  = c.createGain();
    const dry  = c.createGain();
    const out  = c.createGain();
    wet.gain.value = mix;
    dry.gain.value = 1 - mix * 0.4;

    // Two comb-filter style delay lines for shimmer
    const delays  = [0.029, 0.037, 0.049, 0.061].map(t => {
      const d = c.createDelay(0.2);
      const g = c.createGain();
      d.delayTime.value = t;
      g.gain.value = 0.35;
      d.connect(g); g.connect(d);   // feedback
      wet.connect(d);
      d.connect(out);
      return d;
    });

    dry.connect(out);
    const node = { input: dry, wet, out };
    return node;
  }

  /* ── Utility: play a pitched sine tone with soft envelope ── */
  function tone(c, dest, freq, vol, attack, hold, release, startOffset = 0) {
    const osc = c.createOscillator();
    const env = c.createGain();
    const t   = c.currentTime + startOffset;
    osc.type = 'sine';
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(vol, t + attack);
    env.gain.setValueAtTime(vol, t + attack + hold);
    env.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    osc.connect(env); env.connect(dest);
    osc.start(t); osc.stop(t + attack + hold + release + 0.05);
  }

  /* ══════════════════════════════════════════════════════════
     1. AMBIENT HUM — soft evolving pad, starts at opening load
     ══════════════════════════════════════════════════════════ */
  function startAmbientPad() {
    const c = getCtx(); if (!c) return;
    if (ambientNode) return; // already running

    const master = c.createGain();
    master.gain.setValueAtTime(0, c.currentTime);
    master.gain.linearRampToValueAtTime(0.045, c.currentTime + 3.5);
    master.connect(c.destination);

    // Root + fifth + octave chord = Dm ambient
    [[73.4, 0], [110, 0.3], [146.8, 0.7], [220, 1.2], [293.7, 2.0]].forEach(([freq, delay]) => {
      const osc = c.createOscillator();
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      // Subtle frequency vibrato for organic feel
      lfo.type = 'sine';
      lfo.frequency.value = 0.3 + Math.random() * 0.2;
      lfoGain.gain.value = freq * 0.003;
      lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
      osc.connect(master);
      osc.start(c.currentTime + delay);
      lfo.start(c.currentTime + delay);
    });

    ambientNode = master;
  }

  function stopAmbientPad(fadeSec = 1.8) {
    if (!ambientNode || !ctx) return;
    ambientNode.gain.setValueAtTime(ambientNode.gain.value, ctx.currentTime);
    ambientNode.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeSec);
    ambientNode = null;
  }

  /* ══════════════════════════════════════════════════════════
     2. CRYSTAL CHIME — ethereal bell tone (replaces radar ping)
        Plays a delicate D minor bell chord with long decay
     ══════════════════════════════════════════════════════════ */
  function crystalChime() {
    const c = getCtx(); if (!c) return;

    const rev = createReverb(c, 3.0, 0.45);
    rev.out.connect(c.destination);

    // Bell partials: fundamental + inharmonic overtones (like a real bell)
    const partials = [
      { f: 587.3, v: 0.22, a: 0.005, h: 0.02, r: 2.8 },   // D5
      { f: 880.0, v: 0.14, a: 0.003, h: 0.01, r: 2.2 },   // A5
      { f: 1174.6,v: 0.09, a: 0.002, h: 0.01, r: 1.6 },   // D6
      { f: 1479.9,v: 0.05, a: 0.001, h: 0.01, r: 1.1 },   // F#6 (inharmonic)
      { f: 2093.0,v: 0.03, a: 0.001, h: 0.01, r: 0.8 },   // C7 shimmer
    ];

    partials.forEach(({ f, v, a, h, r }) => {
      tone(c, rev.input, f, v, a, h, r);
    });
  }

  /* ══════════════════════════════════════════════════════════
     3. WHISPER SWEEP — gentle ambient movement (replaces scan blip)
        Soft pad swell suggesting the magnifier drifting
     ══════════════════════════════════════════════════════════ */
  function whisperSweep(stepIdx = 0) {
    const c = getCtx(); if (!c) return;

    // Each waypoint has a different root — a musical journey
    const rootFreqs = [293.7, 349.2, 392.0, 523.3]; // D4 → F4 → G4 → C5
    const root = rootFreqs[Math.min(stepIdx, rootFreqs.length - 1)];

    const master = c.createGain();
    const filt   = c.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(600,  c.currentTime);
    filt.frequency.linearRampToValueAtTime(2200, c.currentTime + 0.6);
    filt.frequency.exponentialRampToValueAtTime(400, c.currentTime + 1.8);
    filt.Q.value = 1.2;
    master.connect(filt); filt.connect(c.destination);

    // Soft fifth interval pad swell
    [[root, 0.12, 0, 0.55, 1.1], [root * 1.5, 0.07, 0.05, 0.4, 0.9]].forEach(([f, v, off, h, r]) => {
      tone(c, master, f, v, 0.08, h, r, off);
    });
  }

  /* ══════════════════════════════════════════════════════════
     4. GOLDEN LOCK — luxury chord swell (replaces lock-on)
        Rich orchestral moment: Dm maj7 chord bloom + deep bass
     ══════════════════════════════════════════════════════════ */
  function goldenLock() {
    const c = getCtx(); if (!c) return;

    const rev = createReverb(c, 3.5, 0.5);
    rev.out.connect(c.destination);

    // Majestic Dm maj7 chord bloom (D F A C#)
    const chordTones = [
      { f: 146.8, v: 0.28, a: 0.04, h: 0.8, r: 3.2, delay: 0.00 }, // D3 bass
      { f: 220.0, v: 0.20, a: 0.06, h: 0.7, r: 2.8, delay: 0.05 }, // A3
      { f: 293.7, v: 0.18, a: 0.08, h: 0.6, r: 2.5, delay: 0.10 }, // D4
      { f: 349.2, v: 0.14, a: 0.10, h: 0.5, r: 2.2, delay: 0.16 }, // F4
      { f: 440.0, v: 0.12, a: 0.12, h: 0.4, r: 2.0, delay: 0.22 }, // A4
      { f: 554.4, v: 0.08, a: 0.14, h: 0.3, r: 1.8, delay: 0.28 }, // C#5 — maj7 colour
      { f: 587.3, v: 0.06, a: 0.16, h: 0.2, r: 1.5, delay: 0.34 }, // D5 top shimmer
    ];

    chordTones.forEach(({ f, v, a, h, r, delay }) => {
      tone(c, rev.input, f, v, a, h, r, delay);
    });

    // Sub-bass pulse (cinema low-end)
    const sub = c.createOscillator();
    const subEnv = c.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(73.4, c.currentTime);    // D2
    sub.frequency.linearRampToValueAtTime(69.3, c.currentTime + 1.2); // slight drop
    subEnv.gain.setValueAtTime(0, c.currentTime);
    subEnv.gain.linearRampToValueAtTime(0.35, c.currentTime + 0.08);
    subEnv.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 2.5);
    sub.connect(subEnv); subEnv.connect(c.destination);
    sub.start(c.currentTime); sub.stop(c.currentTime + 2.6);
  }

  /* ══════════════════════════════════════════════════════════
     5. GRAND REVEAL — orchestral swell + angelic shimmer
        A full major chord rise as the site opens
     ══════════════════════════════════════════════════════════ */
  function grandReveal() {
    const c = getCtx(); if (!c) return;

    stopAmbientPad(0.9);

    const rev = createReverb(c, 4.0, 0.55);
    rev.out.connect(c.destination);

    // Rising D major resolution (D F# A D) — triumph
    const riseTones = [
      { f: 146.8, v: 0.30, a: 0.05, h: 1.2, r: 3.5, delay: 0.00 },
      { f: 220.0, v: 0.22, a: 0.08, h: 1.0, r: 3.2, delay: 0.06 },
      { f: 293.7, v: 0.18, a: 0.10, h: 0.9, r: 2.8, delay: 0.12 },
      { f: 369.9, v: 0.14, a: 0.13, h: 0.8, r: 2.6, delay: 0.18 }, // F#4
      { f: 440.0, v: 0.11, a: 0.16, h: 0.7, r: 2.4, delay: 0.24 },
      { f: 587.3, v: 0.08, a: 0.20, h: 0.5, r: 2.0, delay: 0.32 },
      { f: 880.0, v: 0.05, a: 0.25, h: 0.3, r: 1.6, delay: 0.40 }, // top shimmer
    ];
    riseTones.forEach(({ f, v, a, h, r, delay }) => {
      tone(c, rev.input, f, v, a, h, r, delay);
    });

    // Golden shimmer trail — cascading high sine arpegio
    [0, 0.12, 0.24, 0.36, 0.48, 0.60].forEach((offset, i) => {
      const shimmerFreqs = [1174.6, 1318.5, 1567.9, 1760.0, 2093.0, 2637.0];
      tone(c, rev.input, shimmerFreqs[i], 0.04 - i * 0.005, 0.01, 0.05, 1.2 - i * 0.12, offset);
    });

    // Sub bass final note
    const sub = c.createOscillator();
    const subEnv = c.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(73.4, c.currentTime);
    subEnv.gain.setValueAtTime(0, c.currentTime);
    subEnv.gain.linearRampToValueAtTime(0.4, c.currentTime + 0.1);
    subEnv.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 3.0);
    sub.connect(subEnv); subEnv.connect(c.destination);
    sub.start(c.currentTime); sub.stop(c.currentTime + 3.2);
  }

  /* ── Unlock audio context on first user gesture ── */
  let unlocked = false;
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    getCtx();
    startAmbientPad();
  }
  ['pointerdown','keydown','touchstart'].forEach(ev =>
    document.addEventListener(ev, unlock, { once: true })
  );

  return {
    startAmbientPad,
    stopAmbientPad,
    radarPing:    crystalChime,
    scanBlip:     (freq, vol) => whisperSweep(typeof freq === 'number' ? Math.round(freq / 250) : 0),
    lockOn:       goldenLock,
    whooshReveal: grandReveal,
    unlock
  };
})();

/* =========================================================
   RADAR MAP & MAGNIFYING GLASS OPENING ANIMATION
   ========================================================= */
const openingScreen = document.getElementById('openingScreen');
const openingFill = document.getElementById('openingFill');
const openingCounter = document.getElementById('openingCounter');
const terminalText = document.getElementById('terminalText');
const hudCoords = document.getElementById('hudCoords');
const openingSub = document.getElementById('openingSub');
const magnifierLens = document.getElementById('magnifierLens');
const locationPin = document.getElementById('locationPin');
const openingSkip = document.getElementById('openingSkip');

let introFinished = false;

function finishOpening() {
  if (introFinished) return;
  introFinished = true;
  // — SFX: Cinematic whoosh + shimmer saat site terbuka —
  SFX.whooshReveal();
  if (openingScreen) {
    if (magnifierLens) {
      magnifierLens.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease';
      magnifierLens.style.transform = 'translate(-50%, -50%) scale(2.4)';
      magnifierLens.style.opacity = '0';
    }
    openingScreen.classList.add('done');
    setTimeout(() => {
      openingScreen.style.display = 'none';
    }, 850);
  }
  startTypewriter();
}

if (openingScreen && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const introDurationMs = 10000;

  const searchPath = [
    { at: 0,   x: -110, y: -20, rot: -12, coords: "GPS: -7.2504° S, 112.7688° E", msg: "MENGAKTIFKAN RADAR LOKASI...", sub: "RADAR: MEMINDAI JAWA TIMUR" },
    { at: 25,  x: 100,  y: -10, rot: 10,  coords: "GPS: -7.9797° S, 112.6304° E", msg: "MEMINDAI AREA: KOTA MALANG...", sub: "RADAR: MENDETEKSI SINYAL KREATIF" },
    { at: 55,  x: -60,  y: 35,  rot: -7,  coords: "GPS: -7.9525° S, 112.6078° E", msg: "MENGUNCI TITIK: UIN MALANG...", sub: "RADAR: MENEMUKAN KOORDINAT TARGET" },
    { at: 82,  x: 0,    y: 0,   rot: 0,   coords: "GPS: -7.9525° S, 112.6078° E [LOKASI TERKUNCI]", msg: "TARGET TERKUNCI: MUKHAMAD BADRUS SHOLEH", sub: "STATUS: 100% TERVERIFIKASI // MEMBUKA" },
    { at: 100, x: 0,    y: 0,   rot: 0,   coords: "GPS: -7.9525° S, 112.6078° E [LOKASI TERKUNCI]", msg: "TARGET TERKUNCI: MUKHAMAD BADRUS SHOLEH", sub: "STATUS: LOKASI DITEMUKAN // MEMASUKI PORTOFOLIO" }
  ];

  const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let startTime = null;
  let lastMsg = '';
  let rafId = null;
  let lockTriggered = false;

  // SFX: Periodic radar ping (every ~2.2 s of animation, matching CSS sweep)
  let lastPingTime = -999;
  let lastBlipStep = -1;

  function tick(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(100, (elapsed / introDurationMs) * 100);

    if (openingCounter) openingCounter.textContent = `${String(Math.floor(progress)).padStart(2, '0')}%`;
    if (openingFill) openingFill.style.width = `${progress}%`;

    // — SFX: Radar ping every ~2.2 s of real time —
    const elapsedSec = elapsed / 1000;
    if (elapsedSec - lastPingTime >= 2.2) {
      lastPingTime = elapsedSec;
      SFX.radarPing();
    }

    // Locate the segment the current progress falls in, then ease across it.
    let prev = searchPath[0];
    let next = searchPath[searchPath.length - 1];
    let currentStepIdx = 0;
    for (let i = 0; i < searchPath.length - 1; i++) {
      if (progress >= searchPath[i].at && progress <= searchPath[i + 1].at) {
        prev = searchPath[i];
        next = searchPath[i + 1];
        currentStepIdx = i;
        break;
      }
    }
    const span = Math.max(1, next.at - prev.at);
    const localT = Math.min(1, Math.max(0, (progress - prev.at) / span));
    const eased = easeInOutCubic(localT);

    const x = prev.x + (next.x - prev.x) * eased;
    const y = prev.y + (next.y - prev.y) * eased;
    const rot = prev.rot + (next.rot - prev.rot) * eased;

    if (magnifierLens && !lockTriggered) {
      magnifierLens.style.transform = `translate(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px)) rotate(${rot.toFixed(2)}deg)`;
    }

    const activeStep = [...searchPath].reverse().find(step => progress >= step.at) || searchPath[0];
    if (hudCoords) hudCoords.textContent = activeStep.coords;
    if (openingSub) openingSub.textContent = activeStep.sub;
    if (terminalText && activeStep.msg !== lastMsg) {
      terminalText.textContent = activeStep.msg;
      lastMsg = activeStep.msg;

      // — SFX: Scan blip on each new waypoint message (different freq per step) —
      const blipFreqs = [1100, 900, 950, 0, 0];
      if (currentStepIdx !== lastBlipStep && blipFreqs[currentStepIdx] > 0) {
        lastBlipStep = currentStepIdx;
        SFX.scanBlip(blipFreqs[currentStepIdx]);
      }
    }

    if (progress >= 82 && !lockTriggered) {
      lockTriggered = true;
      // — SFX: Lock-on alert —
      SFX.lockOn();
      if (magnifierLens) {
        magnifierLens.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
        magnifierLens.style.transform = 'translate(-50%, -50%) scale(1.18)';
      }
    }

    if (progress >= 100) {
      setTimeout(finishOpening, 550);
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  openingSkip?.addEventListener('click', () => {
    if (rafId) cancelAnimationFrame(rafId);
    finishOpening();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !introFinished) {
      if (rafId) cancelAnimationFrame(rafId);
      finishOpening();
    }
  });
} else {
  finishOpening();
}

// Typewriter text for hero introduction
function startTypewriter() {
  const writerTargets = [
    { element: document.querySelector('.writer-kicker'), delay: 600, speed: 70 },
    { element: document.querySelector('.writer-text'), delay: 1200, speed: 20 }
  ];

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    writerTargets.forEach(({ element, delay, speed }) => {
      if (!element) return;
      const fullText = element.textContent.trim();
      element.textContent = '';
      element.classList.add('typing');
      let characterIndex = 0;
      const typeNextCharacter = () => {
        element.textContent = fullText.slice(0, characterIndex);
        characterIndex += 1;
        if (characterIndex <= fullText.length) setTimeout(typeNextCharacter, speed);
        else element.classList.remove('typing');
      };
      setTimeout(typeNextCharacter, delay);
    });
  }
}

/* =========================================================
   HEADER SCROLL & LIQUID NAVIGATION
   ========================================================= */
const header = document.getElementById('siteHeader');
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    header?.classList.toggle('scrolled', window.scrollY > 40);
    scrollTicking = false;
  });
}, { passive: true });

// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}
function closeMenu(){
  if (navLinks && menuToggle) {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
}

// Liquid highlight navigation
const navItems = navLinks ? [...navLinks.querySelectorAll('a')] : [];
const navSections = navItems
  .map(item => document.querySelector(item.getAttribute('href')))
  .filter(Boolean);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let navigationTimer;
let isNavigating = false;

function moveLiquidHighlight(item){
  if (window.innerWidth <= 880 || !item || !navLinks) return;
  navLinks.style.setProperty('--liquid-x', `${item.offsetLeft - 6}px`);
  navLinks.style.setProperty('--liquid-width', `${item.offsetWidth}px`);
}
function setActiveNav(item){
  navItems.forEach(navItem => navItem.classList.toggle('active', navItem === item));
  moveLiquidHighlight(item);
}
if (navItems.length > 0) setActiveNav(navItems[0]);

navItems.forEach(item => {
  item.addEventListener('click', event => {
    event.preventDefault();
    closeMenu();
    const targetSelector = item.getAttribute('href');
    isNavigating = true;
    clearTimeout(navigationTimer);
    setActiveNav(item);
    history.pushState(null, '', targetSelector);
    document.querySelector(targetSelector)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    navigationTimer = setTimeout(() => {
      isNavigating = false;
    }, reduceMotion ? 0 : 1000);
  });
});

function updateActiveNav(){
  if (isNavigating || navSections.length === 0) return;
  const anchorY = window.scrollY + (header ? header.getBoundingClientRect().height : 80) + 110;
  let currentSection = navSections[0];
  navSections.forEach(section => {
    if (section.offsetTop <= anchorY) currentSection = section;
  });
  setActiveNav(navItems.find(item => item.getAttribute('href') === `#${currentSection.id}`));
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('resize', () => {
  moveLiquidHighlight(navItems.find(item => item.classList.contains('active')));
  updateActiveNav();
});
window.addEventListener('popstate', updateActiveNav);

/* =========================================================
   SCROLL REVEAL OBSERVER
   ========================================================= */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
revealEls.forEach((el, index) => {
  el.style.setProperty('--reveal-delay', `${(index % 4) * 80}ms`);
  el.dataset.reveal = ['up', 'left', 'right', 'scale'][index % 4];
  io.observe(el);
});

/* =========================================================
   SKILL CAROUSEL — DRAG TO SCROLL & ARROW NAVIGATION
   ========================================================= */
(function initSkillCarousel(){
  const track = document.getElementById('skillGrid');
  const prevBtn = document.getElementById('skillPrev');
  const nextBtn = document.getElementById('skillNext');
  if (!track) return;

  const getStep = () => {
    const card = track.querySelector('.skill-card');
    if (!card) return 240;
    const style = getComputedStyle(track);
    return card.getBoundingClientRect().width + parseFloat(style.gap || 22);
  };

  function updateNavState(){
    if (!prevBtn || !nextBtn) return;
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  prevBtn?.addEventListener('click', () => {
    track.scrollBy({ left: -getStep() * 2, behavior: 'smooth' });
  });
  nextBtn?.addEventListener('click', () => {
    track.scrollBy({ left: getStep() * 2, behavior: 'smooth' });
  });

  track.addEventListener('scroll', () => {
    if (!track.scrollTicking) {
      track.scrollTicking = true;
      requestAnimationFrame(() => { updateNavState(); track.scrollTicking = false; });
    }
  }, { passive: true });

  // Mouse drag-to-scroll (touch already scrolls natively).
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragMoved = false;

  track.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return;
    isDragging = true;
    dragMoved = false;
    dragStartX = e.clientX;
    dragStartScroll = track.scrollLeft;
    track.classList.add('dragging');
  });

  window.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX;
    if (Math.abs(delta) > 4) dragMoved = true;
    track.scrollLeft = dragStartScroll - delta;
  });

  function endDrag(){
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // Prevent link/card clicks from firing right after a drag.
  track.addEventListener('click', e => {
    if (dragMoved) { e.preventDefault(); e.stopPropagation(); dragMoved = false; }
  }, true);

  window.addEventListener('resize', updateNavState);
  updateNavState();
})();

/* =========================================================
   PORTFOLIO FILTERING & LIGHTBOX
   ========================================================= */
const filterBtns = document.querySelectorAll('.filter-btn');
function applyPortfolioFilter(filter){
  const cards = document.querySelectorAll('#portfolioGrid .card');
  cards.forEach(c => {
    const shouldShow = filter === 'all' || c.dataset.cat === filter;
    clearTimeout(c.filterHideTimer);
    if (shouldShow) {
      c.hidden = false;
      c.classList.remove('filter-out');
      c.classList.remove('filter-in');
      requestAnimationFrame(() => c.classList.add('filter-in'));
    } else {
      c.classList.remove('filter-in');
      c.classList.add('filter-out');
      c.filterHideTimer = setTimeout(() => {
        if (c.classList.contains('filter-out')) c.hidden = true;
      }, 420);
    }
  });
}
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyPortfolioFilter(btn.dataset.filter);
  });
});

// Fullscreen Lightbox Modal (For both Karya & Prestasi)
const proofLightbox = document.getElementById('proofLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src, caption, alt) {
  if (!proofLightbox || !lightboxImage || !lightboxCaption) return;
  lightboxImage.src = src;
  lightboxImage.alt = alt || caption || 'Pratinjau karya';
  lightboxCaption.textContent = caption || '';
  proofLightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightboxClose?.focus();
}

function closeLightbox(){
  if (proofLightbox) {
    proofLightbox.hidden = true;
    document.body.style.overflow = '';
  }
}

// Attach lightbox to portfolio cards
document.querySelectorAll('#portfolioGrid .card').forEach(card => {
  card.addEventListener('click', () => {
    const imgUrl = card.dataset.image;
    const caption = card.dataset.caption;
    const alt = card.querySelector('img')?.alt;
    if (imgUrl) openLightbox(imgUrl, caption, alt);
  });
});

// Attach lightbox to achievement proof buttons
document.querySelectorAll('.ach-proof').forEach(button => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const imgUrl = button.dataset.image;
    const caption = button.dataset.caption;
    const alt = button.querySelector('img')?.alt;
    if (imgUrl) openLightbox(imgUrl, caption, alt);
  });
});

lightboxClose?.addEventListener('click', closeLightbox);
proofLightbox?.addEventListener('click', event => {
  if (event.target === proofLightbox) closeLightbox();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && proofLightbox && !proofLightbox.hidden) closeLightbox();
});

// Contact Form Handler
function handleSubmit(e){
  e.preventDefault();
  const name = document.getElementById('fname')?.value || '';
  const email = document.getElementById('femail')?.value || '';
  const msg = document.getElementById('fmsg')?.value || '';
  const formStatus = document.getElementById('formStatus');
  const subject = encodeURIComponent('Pesan dari Portofolio — ' + name);
  const body = encodeURIComponent(msg + '\n\nDari: ' + name + ' (' + email + ')');
  if (formStatus) formStatus.hidden = false;
  window.location.href = 'mailto:sholehbadrus278@email.com?subject=' + subject + '&body=' + body;
  return false;
}

/* =========================================================
   3D BACKGROUND CANVAS ENGINE (HIGH PERFORMANCE & ZERO-LAG)
   ========================================================= */
const bgCanvas = document.getElementById('bg3dCanvas');
if (bgCanvas && !reduceMotion) {
  const ctx = bgCanvas.getContext('2d');
  let width, height, cx, cy;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  function resizeCanvas() {
    width = bgCanvas.width = window.innerWidth;
    height = bgCanvas.height = window.innerHeight;
    cx = width / 2;
    cy = height / 2;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  window.addEventListener('mousemove', e => {
    targetMouseX = (e.clientX - cx) / cx;
    targetMouseY = (e.clientY - cy) / cy;
  }, { passive: true });

  const particleCount = Math.min(Math.floor(window.innerWidth / 18), 70);
  const particles = [];
  const focalLength = 360;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 1600,
      y: (Math.random() - 0.5) * 1600,
      z: Math.random() * 1200 + 50,
      size: Math.random() * 2.2 + 1,
      color: Math.random() > 0.4 ? 'rgba(217,176,101,' : 'rgba(247,217,164,',
      baseAlpha: Math.random() * 0.6 + 0.35,
      speedZ: Math.random() * 0.35 + 0.1
    });
  }

  // 3D Floating Octahedron Geometry
  const polyhedra = [
    { x: -350, y: -200, z: 450, rotX: 0, rotY: 0, scale: 65 },
    { x: 400, y: 250, z: 550, rotX: 0, rotY: 0, scale: 85 }
  ];

  const octahedronVertices = [
    [0, -1, 0], [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1], [0, 1, 0]
  ];
  const octahedronEdges = [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [5, 1], [5, 2], [5, 3], [5, 4],
    [1, 2], [2, 3], [3, 4], [4, 1]
  ];

  function project3D(x, y, z, rotX = 0, rotY = 0) {
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

    let y1 = y * cosX - z * sinX;
    let z1 = y * sinX + z * cosX;

    let x2 = x * cosY + z1 * sinY;
    let z2 = -x * sinY + z1 * cosY;

    const scale = focalLength / Math.max(z2, 10);
    return {
      x: cx + x2 * scale,
      y: cy + y1 * scale,
      scale: scale,
      z: z2
    };
  }

  function render3DScene() {
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    const cameraRotY = mouseX * 0.28;
    const cameraRotX = -mouseY * 0.28;
    const projectedPoints = [];

    // 1. Draw 3D Particles
    particles.forEach(p => {
      p.z -= p.speedZ;
      if (p.z < 20) {
        p.z = 1200;
        p.x = (Math.random() - 0.5) * 1600;
        p.y = (Math.random() - 0.5) * 1600;
      }

      const proj = project3D(p.x, p.y, p.z, cameraRotX, cameraRotY);
      if (proj.x >= -50 && proj.x <= width + 50 && proj.y >= -50 && proj.y <= height + 50) {
        projectedPoints.push({ x: proj.x, y: proj.y, z: proj.z, color: p.color, alpha: p.baseAlpha });

        const radius = Math.max(p.size * proj.scale * 0.8, 0.6);
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.baseAlpha * Math.min(proj.scale, 1.2)})`;
        ctx.shadowColor = 'rgba(217,176,101,0.6)';
        ctx.shadowBlur = 8 * proj.scale;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // 2. Draw 3D Connection Lines
    const maxDist = 130;
    for (let i = 0; i < projectedPoints.length; i++) {
      for (let j = i + 1; j < projectedPoints.length; j++) {
        const p1 = projectedPoints[i];
        const p2 = projectedPoints[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.18 * Math.min(p1.alpha, p2.alpha);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(217,176,101,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // 3. Render 3D Wireframe Polyhedra
    polyhedra.forEach(poly => {
      poly.rotX += 0.005;
      poly.rotY += 0.008;

      const cosRX = Math.cos(poly.rotX), sinRX = Math.sin(poly.rotX);
      const cosRY = Math.cos(poly.rotY), sinRY = Math.sin(poly.rotY);

      const transformedNodes = octahedronVertices.map(v => {
        let vx = v[0] * poly.scale;
        let vy = v[1] * poly.scale;
        let vz = v[2] * poly.scale;

        let y1 = vy * cosRX - vz * sinRX;
        let z1 = vy * sinRX + vz * cosRX;
        let x2 = vx * cosRY + z1 * sinRY;
        let z2 = -vx * sinRY + z1 * cosRY;

        return project3D(poly.x + x2, poly.y + y1, poly.z + z2, cameraRotX, cameraRotY);
      });

      octahedronEdges.forEach(edge => {
        const n1 = transformedNodes[edge[0]];
        const n2 = transformedNodes[edge[1]];

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = 'rgba(247,217,164,0.22)';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = 'rgba(217,176,101,0.5)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    });

    requestAnimationFrame(render3DScene);
  }

  requestAnimationFrame(render3DScene);
}

/* =========================================================
   INTERACTIVE 3D CARD TILT EFFECT
   ========================================================= */
if (!reduceMotion && !window.matchMedia('(pointer: coarse)').matches) {
  const tiltElements = document.querySelectorAll('.card, .skill-card, .profile-photo-frame, .ach-item');

  tiltElements.forEach(el => {
    let rect = el.getBoundingClientRect();

    el.addEventListener('mouseenter', () => {
      rect = el.getBoundingClientRect();
      el.style.transition = 'transform 0.12s ease-out, border-color 0.4s ease, box-shadow 0.4s ease';
    });

    el.addEventListener('mousemove', e => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025) translateZ(12px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.4s ease, box-shadow 0.4s ease';
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)';
    });
  });
}