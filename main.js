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
