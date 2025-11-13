// Simple site script: theme toggle, dynamic projects, routing to project detail
(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const page = document.body.getAttribute('data-page');

  // Skip link target support
  const mainEl = document.querySelector('main');
  if (mainEl && !mainEl.id) mainEl.id = 'content';

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(navLinks.classList.contains('open')));
    });
  }

  // Set aria-current on active nav link for a11y
  const activeNav = document.querySelector('.nav-links a.active');
  if (activeNav) activeNav.setAttribute('aria-current', 'page');

  // Persisted theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    if (savedTheme === 'light') root.classList.add('light');
  } else {
    // Default to user's OS preference on first visit
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    if (prefersLight) root.classList.add('light');
  }

  if (themeToggle) {
    // Treat the button like an accessible switch
    themeToggle.setAttribute('role', 'switch');

    const setA11yState = () => {
      const isLight = root.classList.contains('light');
      themeToggle.setAttribute('aria-checked', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    };

    const toggleTheme = () => {
      root.classList.toggle('light');
      localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
      setA11yState();
    };

    setA11yState();

    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Fetch projects data once
  async function getProjects() {
    const res = await fetch('assets/data/projects.json');
    return await res.json();
  }

  // Render featured on home
  async function renderFeatured() {
    const el = document.getElementById('featured-projects');
    if (!el) return;
    const data = await getProjects();
    const featured = data.filter(p => p.featured).slice(0, 3);
    el.innerHTML = featured.map(cardHTML).join('');
  }

  // Render all projects with filters
  function setupProjectsPage() {
    const grid = document.getElementById('projects-grid');
    const filterButtons = document.querySelectorAll('.chip');
    if (!grid) return;

    getProjects().then(data => {
      let current = 'all';
      function render() {
        const filtered = current === 'all' ? data : data.filter(p => p.tags.includes(current));
        grid.innerHTML = filtered.map(cardHTML).join('');
      }
      render();

      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          current = btn.dataset.filter;
          render();
        });
      });
    });
  }

  // Render project detail
  function setupProjectDetail() {
    const wrap = document.getElementById('project-detail');
    if (!wrap) return;
    const id = new URLSearchParams(location.search).get('id');
    if (!id) {
      wrap.innerHTML = '<p class="muted">Missing project id.</p>';
      return;
    }
    getProjects().then(data => {
      const proj = data.find(p => p.id === id);
      if (!proj) {
        wrap.innerHTML = '<p class="muted">Project not found.</p>';
        return;
      }
      wrap.innerHTML = `
        <h1>${proj.title}</h1>
        <p class="meta">${proj.summary}</p>
        <div class="badges">${proj.tech.map(t => `<span class="badge">${t}</span>`).join('')}</div>
        <div class="gallery">${(proj.images||[]).map(src => `<img src="assets/img/${src}" alt="${proj.title} screenshot" />`).join('')}</div>
        <h3>Overview</h3>
        <p>${proj.description}</p>
        ${proj.features?.length ? `<h3>Key Features</h3><ul class="list">${proj.features.map(f=>`<li>${f}</li>`).join('')}</ul>` : ''}
        ${proj.skills?.length ? `<h3>Skills Demonstrated</h3><ul class="list">${proj.skills.map(s=>`<li>${s}</li>`).join('')}</ul>` : ''}
        <h3>Links</h3>
        <p>
          ${proj.links.github ? `<a href="${proj.links.github}" target="_blank" rel="noopener">GitHub</a>` : ''}
          ${proj.links.demo ? ` · <a href="${proj.links.demo}" target="_blank" rel="noopener">Live Demo</a>` : ''}
          ${proj.links.docs ? ` · <a href="${proj.links.docs}" target="_blank" rel="noopener">API Docs</a>` : ''}
        </p>
      `;
    });
  }

  function cardHTML(p) {
    return `
      <article class="card">
        <h3>${p.title}</h3>
        <p class="muted">${p.summary}</p>
        <div class="stack">${p.tech.map(t => `<span class="badge">${t}</span>`).join('')}</div>
        <div class="actions" style="margin-top:12px">
          <a class="btn" href="project.html?id=${p.id}">Details</a>
          ${p.links.github ? `<a class="btn btn-outline" href="${p.links.github}" target="_blank" rel="noopener">GitHub</a>` : ''}
        </div>
      </article>
    `;
  }

  // Contact form (Formspree helper)
  function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const endpoint = form.getAttribute('data-formspree');
    if (!endpoint) return; // if not configured yet, do nothing

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if (res.ok) {
          form.reset();
          alert('Thanks! Your message has been sent.');
        } else {
          alert('Sorry, something went wrong. Please email me directly.');
        }
      } catch (err) {
        alert('Network error. Please email me directly.');
      }
    });
  }

  // Page initializers
  if (page === 'home') renderFeatured();
  if (page === 'projects') setupProjectsPage();
  if (page === 'project') setupProjectDetail();
  if (page === 'contact') setupContactForm();
})();