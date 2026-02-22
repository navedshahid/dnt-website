/**
 * Elite CMS Loader
 * Fetches JSON data and renders it into the DOM with high-end styling.
 */

async function loadCMSData() {
  // Load Clients
  const clientsContainer = document.getElementById('clients-list');
  const clientsDupContainer = document.getElementById('clients-list-dup');
  if (clientsContainer) {
    try {
      const response = await fetch('/data/clients.json');
      const clients = await response.json();
      const logoHtml = clients.map(client => `
        <a href="${client.url}" class="client-logo px-3 py-2 inline-flex items-center justify-center">
          <img src="${client.logo}" alt="${client.name}">
        </a>
      `).join('');
      clientsContainer.innerHTML = logoHtml;
      if (clientsDupContainer) clientsDupContainer.innerHTML = logoHtml;
      if (window.refreshReveal) window.refreshReveal();
    } catch (e) { console.error('Error loading clients:', e); }
  }

  // Load Testimonials
  const testimonialsContainer = document.getElementById('testimonials-list');
  if (testimonialsContainer) {
    try {
      const response = await fetch('/data/testimonials.json');
      const testimonials = await response.json();
      testimonialsContainer.innerHTML = testimonials.map(t => `
        <div class="premium-card reveal testimonial-card opacity-90 h-full flex flex-col">
          <p class="italic mb-6 text-lg text-slate-700 leading-relaxed flex-grow">"${t.quote || 'No quote available'}"</p>
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">${(t.name || 'U').charAt(0)}</div>
            <div>
              <div class="font-black text-slate-900 leading-tight">${t.name || 'Anonymous'}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${t.designation || 'Client'}</div>
            </div>
          </div>
        </div>
      `).join('');
      if (window.refreshReveal) window.refreshReveal();
    } catch (e) { console.error('Error loading testimonials:', e); }
  }

  // Load Jobs
  const jobsContainer = document.getElementById('jobs-list');
  const jobCountEl = document.getElementById('job-count');
  if (jobsContainer) {
    try {
      const response = await fetch('/data/jobs.json');
      const jobs = await response.json();
      if (jobCountEl) jobCountEl.innerText = jobs.length;

      jobsContainer.innerHTML = jobs.map(job => `
        <div class="premium-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6 reveal">
          <div>
            <span class="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 block">${job.type || 'Position'}</span>
            <h3 class="text-2xl font-black mb-1">${job.title || 'Untitled Role'}</h3>
            <div class="text-sm text-slate-400 font-bold">${job.location || 'Remote'} | Remote Friendly</div>
          </div>
          <a href="/index.html?job=${job.id || ''}#contact" class="btn-elite btn-elite-primary py-3 px-8 text-sm">Apply Now</a>
        </div>
      `).join('');
      if (window.refreshReveal) window.refreshReveal();
    } catch (e) {
      console.error('Error loading jobs:', e);
      jobsContainer.innerHTML = '<div class="text-slate-400 text-center py-20">No active openings at this moment.</div>';
    }
  }

  // Load Portfolio
  const portfolioContainer = document.getElementById('portfolio-list');
  if (portfolioContainer) {
    try {
      const response = await fetch('/data/portfolio.json');
      const projects = await response.json();
      portfolioContainer.innerHTML = projects.map(project => `
        <div class="premium-card group overflow-hidden p-0 h-full flex flex-col reveal text-left">
          <div class="h-64 overflow-hidden relative">
            <div class="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-all duration-500 z-10"></div>
            <img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110">
          </div>
          <div class="p-8 flex flex-col flex-grow">
            <span class="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 block">${project.category}</span>
            <h3 class="text-2xl font-black mb-4 leading-tight">${project.title}</h3>
            <p class="text-slate-500 text-sm mb-8 flex-grow leading-relaxed">${project.description || ''}</p>
            <a href="${project.link || '#'}" class="text-slate-900 font-bold flex items-center gap-3 group/link">
              View Case Study <i class="fas fa-arrow-right text-[10px] transform group-hover/link:translate-x-2 transition-transform"></i>
            </a>
          </div>
        </div>
      `).join('');
      if (window.refreshReveal) window.refreshReveal();
    } catch (e) { console.error('Error loading portfolio:', e); }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Wait a small bit to ensure site-components are partially handled or handle concurrently
  loadCMSData();
});
