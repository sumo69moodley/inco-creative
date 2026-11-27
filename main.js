// iNCO Creative — site interactions
(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');

  // Sticky header style on scroll
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const closeMenu = () => { document.body.classList.remove('menu-open'); toggle && toggle.setAttribute('aria-expanded', 'false'); };
  toggle && toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // Services dropdown (keyboard / touch)
  document.querySelectorAll('.nav-drop').forEach(drop => {
    const btn = drop.querySelector('.drop-toggle');
    btn && btn.addEventListener('click', e => {
      e.preventDefault();
      const open = drop.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', e => { if (!drop.contains(e.target)) { drop.classList.remove('open'); btn && btn.setAttribute('aria-expanded', 'false'); } });
  });

  // Sub-page hero: open the letterbox once the frame is ready
  document.querySelectorAll('.page-hero.is-loading').forEach(hero => {
    const img = hero.querySelector('.ph-media img');
    const open = () => requestAnimationFrame(() => hero.classList.remove('is-loading'));
    if (!img || img.complete) setTimeout(open, 60);
    else { img.addEventListener('load', open); img.addEventListener('error', open); }
    setTimeout(open, 1500);
  });

  // Reveal on scroll
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;
  window.__reveal = root => (root || document).querySelectorAll('.reveal:not(.in)').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
    io ? io.observe(el) : el.classList.add('in');
  });
  window.__reveal();

  // Portfolio filter
  document.querySelectorAll('.filter[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.project').forEach(p => {
        const show = f === 'all' || p.dataset.cat.split(' ').includes(f);
        p.classList.toggle('hidden', !show);
      });
    });
  });

  // Pre-select a service in the quote form from ?service= or data-service links
  const pick = name => document.querySelectorAll('.chips input').forEach(cb => { if (cb.value === name) cb.checked = true; });
  const qs = new URLSearchParams(location.search).get('service');
  if (qs) pick(qs);
  document.querySelectorAll('[data-service]').forEach(link => {
    link.addEventListener('click', () => { if (link.dataset.service) pick(link.dataset.service.replace('&amp;', '&')); });
  });

  // Tabs (Hub pricing)
  document.querySelectorAll('[role="tablist"]').forEach(list => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const show = t => tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', on);
      x.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(x.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t));
      t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
          n.focus(); show(n);
        }
      });
    });
  });

  // Links that open a specific pricing tab
  document.querySelectorAll('[data-tab]').forEach(a => a.addEventListener('click', () => {
    const t = document.getElementById(a.dataset.tab);
    t && t.click();
  }));

  // Section highlight in sticky sub-nav (Hub)
  const subLinks = [...document.querySelectorAll('.sub-nav a[href^="#"]')];
  if (subLinks.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) subLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    subLinks.forEach(a => { const t = document.querySelector(a.getAttribute('href')); t && spy.observe(t); });
  }

  // Forms → open a pre-filled email (swap for Formspree / WordPress / HubSpot endpoint when going live)
  document.querySelectorAll('form[data-mailto]').forEach(form => {
    const note = form.querySelector('.form-note');
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach(f => {
        const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      if (!ok) { note && (note.textContent = 'Please complete the required fields (marked *) with a valid email.'); return; }
      const d = new FormData(form);
      const lines = [];
      form.querySelectorAll('[name]').forEach(f => {
        if (f.type === 'checkbox') return;
        const label = (f.closest('label') && f.closest('label').firstChild.textContent.replace('*', '').trim()) || f.name;
        if (f.name !== 'message') lines.push(`${label}: ${d.get(f.name) || '-'}`);
      });
      const picks = d.getAll('service');
      if (form.querySelector('[name="service"]')) lines.push('Interested in: ' + (picks.join(', ') || 'Not specified'));
      const body = lines.join('\n') + '\n\n' + (d.get('message') || '');
      const subject = (form.dataset.subject || 'Website enquiry') + ' – ' + (d.get('name') || '');
      window.location.href = 'mailto:' + form.dataset.mailto + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      note && (note.textContent = 'Thanks! Your email app is opening with your message ready to send.');
    });
  });

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// ---------- Cinematic hero slideshow ----------
(function () {
  const hero = document.querySelector('section.hero');
  if (!hero || !hero.querySelector('.slide')) return;
  const slides = [...hero.querySelectorAll('.slide')];
  const caps = [...hero.querySelectorAll('.caption')];
  const dots = [...hero.querySelectorAll('.hero-dot')];
  const leak = hero.querySelector('.hero-leak');
  const cta = document.getElementById('heroCta');
  const pauseBtn = document.getElementById('heroPause');
  const tcEl = document.getElementById('timecode');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DURATION = 7000;
  let i = 0, elapsed = 0, last = performance.now(), paused = reduced, hidden = false, hover = false;

  // Open the letterbox "curtain" once the first frame is ready
  const firstImg = slides[0].querySelector('img');
  const open = () => requestAnimationFrame(() => hero.classList.remove('is-loading'));
  if (firstImg.complete) open(); else { firstImg.addEventListener('load', open); firstImg.addEventListener('error', open); }
  setTimeout(open, 1500);

  // Warm up the other frames after the page has loaded
  window.addEventListener('load', () => slides.forEach(s => { const im = s.querySelector('img'); im.loading = 'eager'; }));

  function go(n) {
    n = (n + slides.length) % slides.length;
    if (n === i) return;
    hero.classList.add('is-playing');
    caps[i].classList.add('is-leaving');
    const prev = caps[i];
    setTimeout(() => prev.classList.remove('is-leaving'), 900);
    [slides, caps, dots].forEach(list => list.forEach((el, k) => el.classList.toggle('is-active', k === n)));
    caps.forEach((c, k) => c.setAttribute('aria-hidden', k === n ? 'false' : 'true'));
    dots.forEach((d, k) => {
      d.classList.toggle('is-done', k < n);
      d.querySelector('.bar i').style.transform = 'scaleX(0)';
    });
    // restart Ken Burns on the incoming frame
    const img = slides[n].querySelector('img');
    img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
    if (leak) { leak.classList.remove('flash'); void leak.offsetWidth; leak.classList.add('flash'); }
    // per-slide CTA
    const label = caps[n].dataset.cta || 'Start your project';
    cta.innerHTML = label + ' <span class="arrow">→</span>';
    cta.dataset.service = caps[n].dataset.service || '';
    i = n; elapsed = 0;
  }

  cta.addEventListener('click', () => {
    const svc = cta.dataset.service;
    if (!svc) return;
    document.querySelectorAll('.chips input').forEach(cb => { if (cb.value === svc) cb.checked = true; });
  });

  dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
  document.getElementById('heroNext').addEventListener('click', () => go(i + 1));
  document.getElementById('heroPrev').addEventListener('click', () => go(i - 1));
  const setPaused = p => {
    paused = p;
    pauseBtn.setAttribute('aria-pressed', p);
    pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow');
  };
  setPaused(paused);
  pauseBtn.addEventListener('click', () => setPaused(!paused));
  hero.querySelector('.hero-nav').addEventListener('mouseenter', () => hover = true);
  hero.querySelector('.hero-nav').addEventListener('mouseleave', () => hover = false);
  document.addEventListener('visibilitychange', () => { hidden = document.hidden; last = performance.now(); });

  // keyboard + swipe
  hero.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go(i + 1);
    if (e.key === 'ArrowLeft') go(i - 1);
  });
  let x0 = null;
  hero.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  // progress + autoplay + running timecode
  const start = performance.now();
  const pad = n => String(n).padStart(2, '0');
  let heroVisible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; last = performance.now(); }).observe(hero);
  }
  function tick(now) {
    const dt = now - last; last = now;
    if (!paused && !hidden && !hover && heroVisible && !hero.classList.contains('is-loading')) {
      elapsed += dt;
      dots[i].querySelector('.bar i').style.transform = `scaleX(${Math.min(elapsed / DURATION, 1)})`;
      if (elapsed >= DURATION) go(i + 1);
    }
    if (tcEl) {
      const t = (now - start) / 1000;
      tcEl.textContent = `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(Math.floor(t) % 60)}:${pad(Math.floor((t % 1) * 24))}`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// ---------- Client logo marquee: duplicate for a seamless loop ----------
(function () {
  document.querySelectorAll('.logo-track').forEach(track => {
    track.querySelectorAll('img').forEach(img => img.addEventListener('error', () => img.closest('.logo-tile').classList.add('broken')));
    [...track.children].forEach(li => {
      const c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.querySelector('img').alt = '';
      track.appendChild(c);
    });
  });
})();

// ---------- Subtle parallax on the CTA backdrop ----------
(function () {
  const bg = document.querySelector('.big-cta-bg');
  if (!bg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sec = bg.parentElement;
  const onScroll = () => {
    const r = sec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    bg.style.setProperty('--py', (p * -60).toFixed(1) + 'px');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ---------- Case studies: on-site lightbox + click-to-play video ----------
(function () {
  const items = [...document.querySelectorAll('.lb-open')];
  if (items.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-btn lb-close" aria-label="Close">✕</button>' +
      (items.length > 1 ? '<button class="lb-btn lb-prev" aria-label="Previous image">←</button><button class="lb-btn lb-next" aria-label="Next image">→</button>' : '');
    document.body.appendChild(lb);
    const img = lb.querySelector('img'), cap = lb.querySelector('figcaption');
    let i = 0, last = null;
    const show = n => { i = (n + items.length) % items.length; img.src = items[i].dataset.full; img.alt = items[i].dataset.caption; cap.textContent = items[i].dataset.caption; };
    const open = n => { last = document.activeElement; show(n); lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); };
    const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; last && last.focus(); };
    items.forEach((b, n) => b.addEventListener('click', () => open(n)));
    lb.addEventListener('click', e => {
      if (e.target === lb || e.target.closest('.lb-close')) close();
      else if (e.target.closest('.lb-prev')) show(i - 1);
      else if (e.target.closest('.lb-next')) show(i + 1);
    });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'ArrowLeft') show(i - 1);
    });
  }
  document.querySelectorAll('.video-facade').forEach(btn => btn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + btn.dataset.yt + '?autoplay=1&rel=0&modestbranding=1';
    f.title = btn.getAttribute('aria-label');
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    btn.replaceWith(f);
  }));
})();
