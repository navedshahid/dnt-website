/**
 * Site Component Loader
 * Dynamically renders Header and Footer to ensure 100% consistency.
 */

async function initSiteComponents() {
  try {
    const response = await fetch('/data/config.json');
    const config = await response.json();

    // 1. Render Header
    renderHeader(config);

    // 2. Render Footer
    renderFooter(config);

    // 3. Initialize dynamic logic (menu toggles, etc.)
    initInteractions();

  } catch (e) {
    console.error('Error initializing components:', e);
  }
}

function renderHeader(config) {
  const headers = document.querySelectorAll('header');
  if (!headers.length) return;

  const menuHtml = config.menu.map(item =>
    `<a href="${item.url}" class="nav-link text-slate-600 hover:text-slate-900 transition-colors py-2">${item.label}</a>`
  ).join('');

  const headerContent = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
      <a href="/index.html" class="flex items-center gap-2 group">
        <img src="${config.brand.logo}" alt="${config.brand.name}" class="h-10 md:h-12 group-hover:scale-105 transition-transform">
      </a>
      
      <nav class="hidden md:flex items-center gap-8 text-sm font-semibold relative">
        ${menuHtml}
        <a href="${config.contact.meeting_link}" target="_blank" class="btn-elite btn-elite-primary text-xs px-6 py-2">
          Book a Consultation
        </a>
        <div id="services-dropdown" class="absolute top-full mt-3 left-0 bg-white shadow-2xl rounded-2xl border border-slate-200 hidden w-[520px]">
          <div class="grid grid-cols-2 gap-0">
            <div class="p-4 border-r border-slate-100">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">ERP & Consulting</div>
              <a href="/services.html#pillar1" class="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold">ERP & IT Consulting</a>
              <a href="/services.html#services" class="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-sm">Dynamics 365 F&O · Odoo · Governance</a>
            </div>
            <div class="p-4">
              <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">AI & Apps</div>
              <a href="/services.html#pillar2" class="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold">Applied AI & Data</a>
              <a href="/services.html#pillar3" class="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold">Custom Apps & Platforms</a>
            </div>
          </div>
        </div>
      </nav>

      <button id="mobile-menu-open" class="md:hidden text-slate-600 p-2">
        <i class="fas fa-bars text-xl"></i>
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <div id="mobile-overlay" class="fixed inset-0 bg-white z-[60] hidden flex flex-col p-8 transform translate-x-full transition-transform duration-300">
      <div class="flex justify-between items-center mb-12">
        <img src="${config.brand.logo}" alt="Logo" class="h-10">
        <button id="mobile-menu-close" class="text-slate-500 text-2xl">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <nav class="flex flex-col gap-6 text-xl font-bold">
        ${menuHtml}
      </nav>
      <div class="mt-auto">
        <a href="${config.contact.meeting_link}" class="btn-elite btn-elite-primary w-full py-4 text-center">
          Book a Consultation
        </a>
      </div>
    </div>
  `;

  headers.forEach(header => {
    header.className = "sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-50 transition-all duration-300";
    header.innerHTML = headerContent;
  });
}

function renderFooter(config) {
  const footers = document.querySelectorAll('footer');
  if (!footers.length) return;

  const footerContent = `
    <div class="max-w-7xl mx-auto px-4 py-16">
      <div class="grid md:grid-cols-4 gap-12">
        <div class="col-span-2">
          <img src="${config.brand.logo}" alt="Logo" class="h-12 mb-6">
          <p class="text-slate-400 max-w-sm mb-8">
            Empowering modern enterprises with AI-driven ERP, bespoke software solutions, and strategic digital transformation.
          </p>
          <div class="flex gap-4">
            <a href="${config.social.linkedin}" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent transition-colors"><i class="fab fa-linkedin-in text-white"></i></a>
            <a href="${config.social.twitter}" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent transition-colors"><i class="fab fa-twitter text-white"></i></a>
          </div>
        </div>
        <div>
          <h4 class="font-bold text-lg mb-6 text-white uppercase tracking-widest text-sm">Navigation</h4>
          <ul class="space-y-4 text-slate-400">
            ${config.menu.map(item => `<li><a href="${item.url}" class="hover:text-white transition-colors">${item.label}</a></li>`).join('')}
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-lg mb-6 text-white uppercase tracking-widest text-sm">Contact</h4>
          <p class="text-slate-400 mb-4">${config.contact.email}</p>
          <a href="${config.contact.meeting_link}" class="text-accent font-bold hover:underline">Schedule a call →</a>
        </div>
      </div>
      <div class="mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        &copy; ${new Date().getFullYear()} ${config.brand.name}. All rights reserved. Built with excellence.
      </div>
    </div>
  `;

  footers.forEach(footer => {
    footer.className = "bg-slate-900 border-t border-slate-800 dark-theme";
    footer.innerHTML = footerContent;
  });
}

function initInteractions() {
  const openBtn = document.getElementById('mobile-menu-open');
  const closeBtn = document.getElementById('mobile-menu-close');
  const overlay = document.getElementById('mobile-overlay');

  if (openBtn && overlay) {
    openBtn.onclick = () => {
      overlay.classList.remove('hidden');
      setTimeout(() => overlay.style.transform = 'translateX(0)', 10);
      document.body.style.overflow = 'hidden';
    };
  }

  if (closeBtn && overlay) {
    closeBtn.onclick = () => {
      overlay.style.transform = 'translateX(100%)';
      setTimeout(() => {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
    };
  }

  // Scroll transparency effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add('shadow-lg', 'py-1');
      } else {
        header.classList.remove('shadow-lg', 'py-1');
      }
    }
  });

  // Reveal animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Services hover submenu
  const nav = document.querySelector('nav');
  const dropdown = document.getElementById('services-dropdown');
  if (nav && dropdown) {
    const servicesLink = Array.from(nav.querySelectorAll('a')).find(a => a.innerText.trim().toLowerCase() === 'services');
    if (servicesLink) {
      let hideTimer;
      const show = () => {
        clearTimeout(hideTimer);
        dropdown.classList.remove('hidden');
        setTimeout(() => dropdown.style.opacity = '1', 10);
        align();
      };
      const hide = () => {
        hideTimer = setTimeout(() => {
          dropdown.classList.add('hidden');
          dropdown.style.opacity = '0';
        }, 150);
      };

      dropdown.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      dropdown.style.opacity = '0';

      servicesLink.addEventListener('mouseenter', show);
      servicesLink.addEventListener('mouseleave', hide);
      dropdown.addEventListener('mouseenter', show);
      dropdown.addEventListener('mouseleave', hide);

      servicesLink.addEventListener('click', (e) => {
        const isMobile = window.innerWidth < 768;
        if (!isMobile && dropdown.classList.contains('hidden')) {
          e.preventDefault();
          show();
        }
      });

      const align = () => {
        const rect = servicesLink.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        const left = rect.left - navRect.left;
        // Center the large dropdown under the link if possible, or align left with offset
        dropdown.style.left = `${Math.min(window.innerWidth - 540, Math.max(0, left - 180))}px`;
      };
      window.addEventListener('resize', align);
      align();
    }
  }
}

document.addEventListener('DOMContentLoaded', initSiteComponents);
