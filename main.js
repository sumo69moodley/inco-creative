// iNCO Creative — site interactions
(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');

  // Sticky header style on scroll
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.main-nav a').forEach(a =>
    a.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );

  // Reveal on scroll
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
    io ? io.observe(el) : el.classList.add('in');
  });

  // Portfolio filter
  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.project').forEach(p => {
        const show = f === 'all' || p.dataset.cat.split(' ').includes(f);
        p.classList.toggle('hidden', !show);
      });
    });
  });

  // Service card CTAs pre-select the service in the quote form
  document.querySelectorAll('.card-link[data-service]').forEach(link => {
    link.addEventListener('click', () => {
      const name = link.dataset.service.replace('&amp;', '&');
      document.querySelectorAll('.chips input').forEach(cb => {
        if (cb.value === name || (name === 'Video Production' && cb.value === 'Video Production')) cb.checked = true;
      });
    });
  });

  // Quote form → opens a pre-filled email to hello@incocreative.com
  // (swap for Formspree / WordPress / HubSpot endpoint when going live)
  const form = document.getElementById('quoteForm');
  const note = form.querySelector('.form-note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Please fill in your name, a valid email and your mobile number.'; return; }
    const d = new FormData(form);
    const services = d.getAll('service').join(', ') || 'Not specified';
    const body =
      `Name: ${d.get('name')}\nEmail: ${d.get('email')}\nMobile: ${d.get('mobile')}\n` +
      `Company: ${d.get('company') || '-'}\nInterested in: ${services}\n\n${d.get('message') || ''}`;
    window.location.href = 'mailto:hello@incocreative.com?subject=' +
      encodeURIComponent('Quote request – ' + d.get('name')) + '&body=' + encodeURIComponent(body);
    note.textContent = 'Thanks! Your email app is opening with your enquiry ready to send.';
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

// ---------- Cinematic hero slideshow ----------
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
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
