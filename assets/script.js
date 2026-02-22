
  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Theme toggle
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);
  toggle.addEventListener('click', () => {
    const next = (root.getAttribute('data-theme') || 'light') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // Contact form (mailto fallback)
  const form = document.getElementById('contactForm');
  if (form) {
    const statusEl = document.getElementById('formStatus');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company}\n\nMessage:\n${data.message}`
      );
      const mail = `mailto:hello@digitalnatives.work?subject=Website%20Inquiry&body=${body}`;
      window.location.href = mail;
      if (statusEl) statusEl.textContent = 'Opening your email client… if it does not open, email hello@digitalnatives.work';
      form.reset();
    });
  }

  // ===== Mobile sheet =====
  const menuToggle  = document.getElementById('menuToggle');
  const menuClose   = document.getElementById('menuClose');
  const sheet       = document.getElementById('mobileSheet');
  const backdrop    = document.getElementById('sheetBackdrop');
  const mobileNav   = document.getElementById('mobileNav');
  const desktopNav  = document.querySelector('.nav-links');

  // 1) Safety: if mobileNav has no links, clone desktop links
  function ensureMobileLinks() {
    if (!mobileNav || !desktopNav) return;
    if (mobileNav.children.length > 0) return; // already has links
    desktopNav.querySelectorAll('a').forEach(a => {
      const clone = a.cloneNode(true);
      mobileNav.appendChild(clone);
    });
  }
  ensureMobileLinks();

  // 2) Open / Close functions
  function openSheet() {
    sheet.classList.add('open');
    backdrop.classList.add('open');
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }
  function closeSheet() {
    sheet.classList.remove('open');
    backdrop.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = ''; // restore scroll
  }

  // Start closed
  closeSheet();

  // 3) Wire up events
  menuToggle?.addEventListener('click', () => {
    ensureMobileLinks();
    openSheet();
  });
  menuClose?.addEventListener('click', closeSheet);
  backdrop?.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

  // Close menu when a link inside it is clicked
  mobileNav?.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.tagName === 'A') closeSheet();
});
