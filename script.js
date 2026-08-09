// Header scroll state
const header = document.getElementById('siteHeader');
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
    scrollTicking = false;
  });
}, { passive: true });

// Opening animation
const openingScreen = document.getElementById('openingScreen');
window.addEventListener('load', () => {
  openingScreen?.classList.add('ready');
});

// Typewriter text for the hero introduction
const writerTargets = [
  { element: document.querySelector('.writer-kicker'), delay: 5_200, speed: 75 },
  { element: document.querySelector('.writer-text'), delay: 5_700, speed: 22 }
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
      if (characterIndex <= fullText.length) window.setTimeout(typeNextCharacter, speed);
      else element.classList.remove('typing');
    };
    window.setTimeout(typeNextCharacter, delay);
  });
}

// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.contains('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
function closeMenu(){
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
revealEls.forEach((el, index) => {
  el.style.setProperty('--reveal-delay', `${(index % 4) * 90}ms`);
  el.dataset.reveal = ['up', 'left', 'right', 'scale'][index % 4];
  io.observe(el);
});

// Portfolio filter
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioGrid = document.getElementById('portfolioGrid');
const workTitle = document.getElementById('workTitle');
const workCategory = document.getElementById('workCategory');
const workImage = document.getElementById('workImage');
const uploadNote = document.getElementById('uploadNote');

function applyPortfolioFilter(filter){
  const cards = document.querySelectorAll('#portfolioGrid .card');
  cards.forEach(c => {
    const shouldShow = filter === 'all' || c.dataset.cat === filter;
    window.clearTimeout(c.filterHideTimer);
    if (shouldShow) {
      c.hidden = false;
      c.classList.remove('filter-out');
      c.classList.remove('filter-in');
      window.requestAnimationFrame(() => c.classList.add('filter-in'));
    } else {
      c.classList.remove('filter-in');
      c.classList.add('filter-out');
      c.filterHideTimer = window.setTimeout(() => {
        if (c.classList.contains('filter-out')) c.hidden = true;
      }, 460);
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

// Achievement photo lightbox
const proofLightbox = document.getElementById('proofLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const proofButtons = document.querySelectorAll('.ach-proof');

function closeProofLightbox(){
  proofLightbox.hidden = true;
  document.body.style.overflow = '';
}
proofButtons.forEach(button => {
  button.addEventListener('click', () => {
    lightboxImage.src = button.dataset.image;
    lightboxImage.alt = button.querySelector('img').alt;
    lightboxCaption.textContent = button.dataset.caption;
    proofLightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  });
});
lightboxClose.addEventListener('click', closeProofLightbox);
proofLightbox.addEventListener('click', event => {
  if (event.target === proofLightbox) closeProofLightbox();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !proofLightbox.hidden) closeProofLightbox();
});

workImage?.addEventListener('change', event => {
  const files = Array.from(event.target.files || []);
  const category = workCategory.value;
  const categoryLabel = category === 'desain' ? 'Desain Grafis' : 'Fotografi';
  const title = workTitle.value.trim() || 'Karya Baru';
  const oversized = files.find(file => file.size > 5 * 1024 * 1024);

  if (oversized) {
    uploadNote.textContent = `${oversized.name} terlalu besar. Maksimal 5 MB per gambar.`;
    uploadNote.style.color = 'var(--gold-bright)';
  }

  files.filter(file => file.size <= 5 * 1024 * 1024 && file.type.startsWith('image/')).forEach((file, index) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const card = document.createElement('div');
      card.className = 'card reveal in uploaded-card';
      card.dataset.cat = category;
      card.innerHTML = `<div class="card-thumb has-image"><img src="${reader.result}" alt="${title}${files.length > 1 ? ` ${index + 1}` : ''}"><span class="cat-icon">${categoryLabel}</span></div><div class="card-body"><span class="card-tag">${categoryLabel}</span><div class="card-title">${title}${files.length > 1 ? ` ${index + 1}` : ''}</div><div class="card-year">2026 · Karya pribadi</div></div>`;
      portfolioGrid.appendChild(card);
      const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
      applyPortfolioFilter(activeFilter);
    });
    reader.readAsDataURL(file);
  });

  if (files.length && !oversized) uploadNote.textContent = `${files.length} gambar sedang ditambahkan ke galeri.`;
  workImage.value = '';
});

// Contact form (no backend — opens mail client)
function handleSubmit(e){
  e.preventDefault();
  const name = document.getElementById('fname').value;
  const email = document.getElementById('femail').value;
  const msg = document.getElementById('fmsg').value;
  const subject = encodeURIComponent('Pesan dari Portofolio — ' + name);
  const body = encodeURIComponent(msg + '\n\nDari: ' + name + ' (' + email + ')');
  window.location.href = 'mailto:sholehbadrus278@gmail.com?subject=' + subject + '&body=' + body;
  return false;
}
