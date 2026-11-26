// iNCO Creative — blog (posts are read live from the WordPress site)
(function () {
  const API = 'https://incocreative.com/wp-json/wp/v2';
  const OLD_BLOG = 'https://incocreative.com/inco-blog/';
  const PER_PAGE = 7; // 1 wide feature card + 6 cards = full rows

  const text = html => { const d = document.createElement('div'); d.innerHTML = html || ''; return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = iso => new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  const catLabel = n => (n === 'Uncategorized' ? 'iNCO News' : n);
  const media = p => {
    const m = p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0];
    if (!m || !m.source_url) return null;
    const s = m.media_details && m.media_details.sizes;
    return { src: (s && (s.medium_large || s.large || s.full) || m).source_url || m.source_url, full: m.source_url, alt: m.alt_text || '' };
  };
  const cats = p => ((p._embedded && p._embedded['wp:term'] && p._embedded['wp:term'][0]) || []).map(t => catLabel(t.name));
  const minutes = html => Math.max(1, Math.round(text(html).split(' ').length / 220));

  function card(p, featured) {
    const m = media(p);
    const excerpt = text(p.excerpt && p.excerpt.rendered);
    const short = excerpt.length > 150 ? excerpt.slice(0, 147).replace(/\s+\S*$/, '') + '…' : excerpt;
    return `<a class="post-card reveal${featured ? ' featured-post' : ''}" href="article.html?slug=${encodeURIComponent(p.slug)}">
      <div class="pc-img">${m ? `<img src="${esc(m.src)}" alt="${esc(m.alt)}" loading="lazy">` : ''}</div>
      <div class="pc-body">
        <div class="pc-meta"><span class="cat">${esc(cats(p)[0] || 'iNCO News')}</span><span>${fmtDate(p.date)}</span></div>
        <h3>${p.title.rendered}</h3>
        <p>${esc(short)}</p>
        <span class="more">Read article →</span>
      </div>
    </a>`;
  }

  // ---------- Blog listing ----------
  const grid = document.getElementById('blogGrid');
  if (grid) {
    const pager = document.getElementById('blogPager');
    const catBox = document.getElementById('blogCats');
    let page = 1, cat = '';

    const skeleton = () => { grid.innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton"></div>').join(''); };

    async function load() {
      skeleton();
      try {
        const url = `${API}/posts?per_page=${PER_PAGE}&page=${page}&_embed=1${cat ? '&categories=' + cat : ''}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(r.status);
        const posts = await r.json();
        const pages = +r.headers.get('X-WP-TotalPages') || 1;
        if (!posts.length) { grid.innerHTML = '<p class="state-msg">No articles here yet.</p>'; pager.innerHTML = ''; return; }
        grid.innerHTML = posts.map((p, i) => card(p, i === 0)).join('');
        pager.innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) =>
          `<button data-p="${i + 1}"${i + 1 === page ? ' aria-current="page"' : ''}>${i + 1}</button>`).join('') : '';
        window.__reveal && window.__reveal(grid);
      } catch (e) {
        grid.innerHTML = `<p class="state-msg">We couldn't load the articles right now. <a href="${OLD_BLOG}" style="color:var(--amber)">Read them on our blog →</a></p>`;
        pager.innerHTML = '';
      }
    }

    pager.addEventListener('click', e => {
      const b = e.target.closest('button[data-p]');
      if (!b) return;
      page = +b.dataset.p;
      load();
      document.getElementById('articles').scrollIntoView({ behavior: 'smooth' });
    });

    fetch(`${API}/categories?per_page=50&hide_empty=true`).then(r => r.json()).then(list => {
      catBox.innerHTML = '<button class="filter active" data-c="">All</button>' +
        list.filter(c => c.count > 0).map(c => `<button class="filter" data-c="${c.id}">${esc(catLabel(text(c.name)))}</button>`).join('');
    }).catch(() => {});
    catBox.addEventListener('click', e => {
      const b = e.target.closest('button[data-c]');
      if (!b) return;
      catBox.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      cat = b.dataset.c; page = 1; load();
    });

    load();
  }

  // ---------- Single article ----------
  const body = document.getElementById('articleBody');
  if (body) {
    const slug = new URLSearchParams(location.search).get('slug');
    const hero = document.querySelector('.page-hero');
    const titleEl = hero.querySelector('.hero-title');
    const kicker = hero.querySelector('.chapter');
    const crumbCur = hero.querySelector('.crumbs [aria-current]');
    const cover = document.getElementById('articleCover');
    const fail = () => {
      titleEl.innerHTML = '<span class="line"><span>Article not found.</span></span>';
      body.innerHTML = `<p>We couldn't load this article. <a href="blog.html">Back to the blog</a> or <a href="${OLD_BLOG}">read it on our previous blog</a>.</p>`;
    };
    if (!slug) { fail(); return; }

    fetch(`${API}/posts?slug=${encodeURIComponent(slug)}&_embed=1`).then(r => r.json()).then(list => {
      const p = list && list[0];
      if (!p) return fail();
      const t = text(p.title.rendered);
      document.title = t + ' | iNCO Creative Blog';
      const md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', text(p.excerpt.rendered).slice(0, 155));
      hero.classList.add('is-loading');
      titleEl.innerHTML = `<span class="line"><span>${esc(t)}</span></span>`;
      kicker.innerHTML = `<span>${esc(cats(p)[0] || 'iNCO News')}</span>${fmtDate(p.date)} · ${minutes(p.content.rendered)} min read`;
      if (crumbCur) crumbCur.textContent = t.length > 40 ? t.slice(0, 38) + '…' : t;
      requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.remove('is-loading')));

      const m = media(p);
      if (m && cover) cover.innerHTML = `<img src="${esc(m.full)}" alt="${esc(m.alt)}">`;
      else if (cover) cover.remove();

      const d = document.createElement('div');
      d.innerHTML = p.content.rendered;
      d.querySelectorAll('script,style,noscript,form').forEach(x => x.remove());
      d.querySelectorAll('[style]').forEach(x => x.removeAttribute('style'));
      d.querySelectorAll('img').forEach(x => { x.loading = 'lazy'; x.removeAttribute('width'); x.removeAttribute('height'); x.removeAttribute('sizes'); });
      d.querySelectorAll('a[href^="http"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
      body.innerHTML = d.innerHTML;

      const share = document.getElementById('shareLinks');
      if (share) {
        const u = encodeURIComponent(location.href), tt = encodeURIComponent(t);
        share.innerHTML = `<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${u}">Facebook</a>
          <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${u}">LinkedIn</a>
          <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=${tt}%20${u}">WhatsApp</a>`;
      }

      // More articles
      const more = document.getElementById('moreGrid');
      if (more) {
        fetch(`${API}/posts?per_page=4&_embed=1&exclude=${p.id}`).then(r => r.json()).then(ps => {
          more.innerHTML = ps.slice(0, 3).map(x => card(x)).join('');
          window.__reveal && window.__reveal(more);
        }).catch(() => { more.closest('section').remove(); });
      }
    }).catch(fail);
  }
})();
