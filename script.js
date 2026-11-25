/* Portfolio interactions: Mahendra K */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- Content data (from resume) ---------- */
  const SKILLS = [
    ['Programming', ['Python']],
    ['Software Engineering', ['Data Structures & Algorithms', 'Object-Oriented Programming']],
    ['Backend & Databases', ['FastAPI', 'SQLite', 'SQL']],
    ['AI & Machine Learning', ['Machine Learning', 'NLP', 'Generative AI', 'LLM Integration', 'Scikit-learn']],
    ['Data Science', ['Pandas', 'NumPy', 'Matplotlib', 'Data Cleaning', 'Data Visualization']],
    ['Tools', ['Git', 'GitHub', 'Jupyter', 'Google Colab']],
    ['Soft Skills', ['Leadership', 'Teamwork', 'Time Management', 'Analytical & Logical Reasoning']]
  ];
  const ROLES = ['CSE (AI & ML) student', 'backend engineer in the making', 'LLM application builder', 'hackathon team leader'];

  /* ---------- Theme (persisted) ---------- */
  const themeBtn = $('#themeBtn');
  const setTheme = t => {
    root.dataset.theme = t;
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    try { localStorage.setItem('theme', t); } catch (e) {}
  };
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  setTheme(saved || 'dark');
  themeBtn.addEventListener('click', () => { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); colors(); });

  /* ---------- Skills render ---------- */
  const grid = $('#skills-grid');
  const max = Math.max(...SKILLS.map(s => s[1].length));
  SKILLS.forEach(([title, items], i) => {
    const card = document.createElement('article');
    card.className = 'glass skill-card reveal';
    card.style.setProperty('--d', (i % 3) * 0.1 + 's');
    card.innerHTML = `<h3>${title}<small>${items.length} ${items.length > 1 ? 'skills' : 'skill'}</small></h3>
      <div class="meter" aria-hidden="true"><i style="--w:${(items.length / max) * 100}%"></i></div>
      <ul>${items.map(x => `<li>${x.replace(/&/g, '&amp;')}</li>`).join('')}</ul>`;
    grid.appendChild(card);
  });

  /* ---------- Loader, then hero entrance ---------- */
  const start = () => {
    $('#loader').classList.add('done');
    document.body.classList.add('ready');
    typeRoles();
  };
  addEventListener('load', () => setTimeout(start, reduce ? 0 : 900));
  setTimeout(() => !document.body.classList.contains('ready') && start(), 3500); // safety net

  /* ---------- Typed roles ---------- */
  function typeRoles() {
    const el = $('#typed');
    if (reduce) { el.textContent = ROLES[0]; return; }
    let r = 0, c = 0, del = false;
    (function tick() {
      const word = ROLES[r];
      c += del ? -1 : 1;
      el.textContent = word.slice(0, c);
      let wait = del ? 35 : 70;
      if (!del && c === word.length) { del = true; wait = 1600; }
      else if (del && c === 0) { del = false; r = (r + 1) % ROLES.length; wait = 350; }
      setTimeout(tick, wait);
    })();
  }

  /* ---------- Reveal on scroll + counters + skill meters ---------- */
  const countUp = el => {
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1400;
    (function f(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  };
  $$('.stats .stat').forEach((s, i) => s.style.setProperty('--d', i * 0.1 + 's'));
  $$('.t-item, .ach article, .project').forEach((s, i) => s.style.setProperty('--d', (i % 2) * 0.12 + 's'));
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Navigation: scroll state, progress, active section ---------- */
  const nav = $('#nav'), bar = $('#progress');
  addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 20);
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  }, { passive: true });
  const links = $$('#menu a');
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger'), menu = $('#menu');
  const toggleMenu = open => {
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('lock', open);
  };
  burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });

  /* ---------- Project details (accordion) ---------- */
  $$('.more').forEach(btn => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open);
    $('#' + btn.getAttribute('aria-controls')).classList.toggle('open', open);
  }));

  /* ---------- Tilt cards & magnetic buttons (fine pointers only) ---------- */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px,${(e.clientY - r.top - r.height / 2) * .25}px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  /* ---------- Particle background ---------- */
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W, H, pts = [], rgb = '124,92,255';
  function colors() { rgb = root.dataset.theme === 'dark' ? '124,160,255' : '91,61,245'; }
  function size() {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * d; H = cv.height = innerHeight * d;
    pts = Array.from({ length: Math.min(70, Math.round(innerWidth / 18)) }, () => ({
      x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3 * d, vy: (Math.random() - .5) * .3 * d, r: (Math.random() * 1.4 + .6) * d
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const link = 120 * (W / innerWidth);
    pts.forEach((p, i) => {
      p.x = (p.x + p.vx + W) % W; p.y = (p.y + p.vy + H) % H;
      ctx.fillStyle = `rgba(${rgb},.7)`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < link) { ctx.strokeStyle = `rgba(${rgb},${.18 * (1 - d / link)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
    });
    if (!reduce && !document.hidden) requestAnimationFrame(draw);
  }
  colors(); size(); draw();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 200); });
  document.addEventListener('visibilitychange', () => !document.hidden && !reduce && draw());

  $('#year').textContent = new Date().getFullYear();
})();
