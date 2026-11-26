#!/usr/bin/env python3
"""
iNCO Creative site builder.

Every page lives in _build/pages/<name>.html as BODY content only, with a small
JSON block in an HTML comment at the top:

  <!--
  {"title": "...", "description": "...", "nav": "services",
   "hero": {"img": "2026/09/inco-hub-hero.jpg", "num": "01", "kicker": "...",
            "lines": ["First line", "second <em>line.</em>"], "sub": "...",
            "ctas": [["Get a quote", "contact.html#quote", "primary"]],
            "pos": "center 40%", "crumb": "Services"}}
  -->

Run:  python3 _build/build.py      (writes <name>.html into the site root)

The shared header, navigation, footer and page hero are defined once below,
so edit them here — not in the generated HTML files.
GitHub Pages ignores folders that start with "_", so this folder is never published.
"""
import json, re, pathlib, html

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ROOT / "_build" / "pages"
UP = "https://incocreative.com/wp-content/uploads/"
VERSION = "4"

SERVICES = [
    ("digital-design-branding.html", "Digital Design &amp; Branding"),
    ("social-media-marketing.html", "Social Media Marketing"),
    ("video-production.html", "Video Production"),
    ("web-design-development.html", "Web Design &amp; Development"),
]
NAV = [
    ("services", "services.html", "Services"),
    ("work", "work.html", "Work"),
    ("hub", "creative-hub.html", "The Hub"),
    ("about", "about.html", "About"),
    ("clients", "clients.html", "Clients"),
    ("blog", "blog.html", "Blog"),
    ("contact", "contact.html", "Contact"),
]
LEGAL = [
    ("privacy-policy.html", "Website Privacy Policy"),
    ("data-processing-policy.html", "Data Processing Policy"),
    ("multimedia-terms.html", "Multimedia Ts &amp; Cs"),
    ("graphic-web-design-terms.html", "Graphic &amp; Web Design Ts &amp; Cs"),
]


# ---------------------------------------------------------------------------
# Macros usable inside page partials
#   {{up}}                      -> WordPress uploads URL prefix
#   {{icon:name}}               -> inline SVG line icon
#   {{other_services:current}}  -> 3 cards linking to the other service pages
#   {{cta:Heading|Sub text|service}} -> full-width call-to-action band
# ---------------------------------------------------------------------------
_P = {
    "eye": '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    "shield": '<path d="M12 3l8 3v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    "message": '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14h4"/>',
    "heart": '<path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.4 3.8 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.2 0 5.4 2.9 4.2 6.2C19.5 15.4 12 20 12 20z"/>',
    "spark": '<path d="M12 2.5l2.4 6.1 6.1 2.4-6.1 2.4L12 19.5l-2.4-6.1-6.1-2.4 6.1-2.4z"/>',
    "trend": '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    "megaphone": '<path d="M3 10v4a1 1 0 0 0 1 1h3l8 5V4L7 9H4a1 1 0 0 0-1 1z"/><path d="M18.5 8.5a5 5 0 0 1 0 7"/>',
    "users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
    "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    "cart": '<path d="M3 4h2.5l2.3 11h10.4l2.3-8H7"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
    "flag": '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    "play": '<rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    "share": '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4M8.2 13.2l7.6 4"/>',
    "phone": '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    "search": '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    "lock": '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    "support": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>',
    "bulb": '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    "award": '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/>',
    "layers": '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    "briefcase": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12.5h18"/>',
    "handshake": '<path d="M2.5 11l4-4 4 2 3-2 4 1 4 3"/><path d="M6.5 7l-1 8 3 3 2-1 2 2 2-1 2 1 2-3-4-5"/>',
    "camera": '<path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.8l1.5-2h6.4l1.5 2h2.8A1.5 1.5 0 0 1 21 8.5v10A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5z"/><circle cx="12" cy="13" r="3.8"/>',
    "mic": '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
    "film": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"/>',
    "pen": '<path d="M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z"/><path d="M14 7l3 3"/>',
    "code": '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
    "pin": '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
}


def icon(name):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + _P[name] + '</svg>')


_SVC_IMG = {
    "digital-design-branding.html": "2026/08/branding-1.jpg",
    "social-media-marketing.html": "2026/08/header12.jpg",
    "video-production.html": "2026/08/video-1-1.jpg",
    "web-design-development.html": "2026/08/web-design-1.jpg",
}


def other_services(current):
    cards = []
    for h, l in SERVICES:
        if h == current:
            continue
        cards.append(f'<a class="os-card reveal" href="{h}"><img src="{UP}{_SVC_IMG[h]}" alt="" loading="lazy">'
                     f'<span>{l}<b>→</b></span></a>')
    return ('<section class="section bg-2"><div class="container"><div class="section-head split"><div>'
            '<p class="kicker">Keep exploring</p><h2>One team behind your whole brand.</h2></div>'
            '<a href="services.html" class="btn btn-ghost">All services</a></div>'
            f'<div class="other-services">{"".join(cards)}</div></div></section>')


def cta_band(arg):
    head, sub, svc = (arg.split("|") + ["", ""])[:3]
    q = ""
    if svc:
        q = "?service=" + svc.replace("&amp;", "&").replace("&", "%26").replace(" ", "+")
    sub = sub or "Tell us what you're building. We'll come back with ideas and a free, no-obligation quote."
    return (
        '<section class="big-cta">\n'
        f'  <div class="big-cta-bg" aria-hidden="true" style="background-image:url(\'{UP}2026/09/inco-hub-lounge.jpg\')"></div>\n'
        '  <div class="container big-cta-inner reveal">\n'
        f'    <h2>{head}</h2>\n    <p>{sub}</p>\n'
        '    <div class="big-cta-actions">\n'
        f'      <a href="contact.html{q}#quote" class="btn btn-light">Get a free quote <span class="arrow">→</span></a>\n'
        '      <a href="https://wa.me/27783623749" class="btn btn-outline-light" target="_blank" rel="noopener">WhatsApp us</a>\n'
        '      <a href="tel:+27872559067" class="btn btn-outline-light">Call +27 87 255 9067</a>\n'
        '    </div>\n  </div>\n</section>'
    )


def expand(body):
    body = body.replace("{{up}}", UP)
    body = re.sub(r"\{\{icon:([a-z]+)\}\}", lambda m: icon(m.group(1)), body)
    body = re.sub(r"\{\{other_services:([^}]+)\}\}", lambda m: other_services(m.group(1).strip()), body)
    body = re.sub(r"\{\{cta:([^}]*)\}\}", lambda m: cta_band(m.group(1)), body)
    return body


def header(active):
    items = []
    for key, href, label in NAV:
        cur = ' aria-current="page"' if key == active else ""
        if key == "services":
            sub = "".join(f'<a href="{h}">{l}</a>' for h, l in SERVICES)
            items.append(
                f'<div class="nav-drop"><a href="{href}"{cur}>{label}</a>'
                f'<button class="drop-toggle" aria-label="Show services" aria-expanded="false">▾</button>'
                f'<div class="drop-menu">{sub}<a href="services.html" class="drop-all">All services →</a></div></div>'
            )
        else:
            items.append(f'<a href="{href}"{cur}>{label}</a>')
    return f'''<header class="site-header" id="top">
  <div class="container header-inner">
    <a href="index.html" class="brand" aria-label="iNCO Creative home">
      <img src="{UP}2018/05/iNCO-Creative-Logo-Registered-Trademarked-11.png" alt="iNCO Creative" width="130" height="40">
    </a>
    <nav class="main-nav" aria-label="Main">
      {"".join(items)}
      <a href="contact.html#quote" class="btn btn-primary btn-sm nav-cta">Get a Quote</a>
    </nav>
    <a href="contact.html#quote" class="btn btn-primary btn-sm header-cta">Get a Quote</a>
    <button class="menu-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
  </div>
</header>
'''


def footer():
    svc = "\n".join(f'      <a href="{h}">{l}</a>' for h, l in SERVICES)
    legal = "\n".join(f'      <a href="{h}">{l}</a>' for h, l in LEGAL)
    return f'''<!-- ============ FOOTER ============ -->
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <img src="{UP}2018/05/iNCO-Creative-Logo-Registered-Trademarked-11.png" alt="iNCO Creative" width="130" height="40" loading="lazy">
      <p>A design &amp; media agency creating digital experiences people love. Durban · Johannesburg · Cape Town.</p>
      <div class="social">
        <a href="https://www.facebook.com/incocreative/" target="_blank" rel="noopener" aria-label="Facebook">Fb</a>
        <a href="https://www.instagram.com/incocreative/" target="_blank" rel="noopener" aria-label="Instagram">Ig</a>
        <a href="https://twitter.com/incocreative1" target="_blank" rel="noopener" aria-label="X / Twitter">X</a>
      </div>
    </div>
    <div>
      <h5>Services</h5>
{svc}
      <a href="services.html">All services</a>
    </div>
    <div>
      <h5>Company</h5>
      <a href="about.html">About</a>
      <a href="work.html">Work</a>
      <a href="clients.html">Clients</a>
      <a href="creative-hub.html">iNCO Creative Hub</a>
      <a href="blog.html">Blog</a>
      <a href="internships.html">Internships</a>
      <a href="contact.html">Say hello</a>
    </div>
    <div>
      <h5>Legal</h5>
{legal}
    </div>
  </div>
  <div class="container footer-bottom">
    <p>© <span id="year">2026</span> iNCO Creative · Keep Group (Pty) Ltd. All rights reserved.</p>
    <p>15 Glenridge Road, Westville, Durban 3629</p>
  </div>
</footer>

<a href="https://wa.me/27783623749" class="wa-float" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-1-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.3-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.7 5.8 5.1 2.2.9 3 1 4.1.8.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5 0-.2-.3-.3-.6-.4z"/></svg>
</a>
'''


def page_hero(h, active):
    img = h.get("img")
    lines = "".join(f'<span class="line"><span>{l}</span></span>' for l in h["lines"])
    ctas = ""
    if h.get("ctas"):
        btns = []
        for label, href, kind in h["ctas"]:
            arrow = ' <span class="arrow">→</span>' if kind == "primary" else ""
            ext = ' target="_blank" rel="noopener"' if href.startswith("http") else ""
            btns.append(f'<a href="{href}" class="btn btn-{kind}"{ext}>{label}{arrow}</a>')
        ctas = f'\n    <div class="hero-ctas">{"".join(btns)}</div>'
    crumb = h.get("crumb")
    crumbs = ""
    if crumb:
        parent = ""
        if h.get("parent"):
            p_href, p_label = h["parent"]
            parent = f'<a href="{p_href}">{p_label}</a><span>/</span>'
        crumbs = f'\n    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span>{parent}<span aria-current="page">{crumb}</span></nav>'
    sub = f'\n    <p class="hero-sub">{h["sub"]}</p>' if h.get("sub") else ""
    num = f'<span>{h["num"]}</span>' if h.get("num") else ""
    if img:
        media = (f'  <div class="ph-media" aria-hidden="true"><img src="{UP}{img}" alt="" fetchpriority="high" '
                 f'style="object-position:{h.get("pos", "center")}"></div>\n'
                 f'  <div class="hero-shade" aria-hidden="true"></div>\n')
        cls = "page-hero is-loading"
    else:
        media = '  <div class="ph-glow" aria-hidden="true"></div>\n'
        cls = "page-hero page-hero--text is-loading"
    return f'''<!-- ============ PAGE HERO ============ -->
<section class="{cls}">
{media}  <div class="letterbox lb-top" aria-hidden="true"></div>
  <div class="letterbox lb-bottom" aria-hidden="true"></div>
  <div class="container ph-inner">{crumbs}
    <p class="chapter">{num}{h["kicker"]}</p>
    <h1 class="hero-title">{lines}</h1>{sub}{ctas}
  </div>
</section>
'''


def render(name, meta, body):
    title = meta["title"]
    desc = meta.get("description", "")
    active = meta.get("nav", "")
    hero = page_hero(meta["hero"], active) if meta.get("hero") else ""
    extra_js = "".join(f'\n<script src="{s}?v={VERSION}"></script>' for s in meta.get("scripts", []))
    canonical = "" if name == "index" else ""
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{html.escape(desc, quote=True)}">
  <meta property="og:title" content="{html.escape(meta.get("og_title", title), quote=True)}">
  <meta property="og:description" content="{html.escape(desc, quote=True)}">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#050E14">
  <link rel="icon" href="{UP}2020/02/cropped-incoicon-1-180x180.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css?v={VERSION}">
  <noscript><style>.is-loading .letterbox{{height:5.5vh!important}}.is-loading .line>span{{transform:none!important}}.is-loading .chapter,.is-loading .hero-sub,.is-loading .hero-ctas,.is-loading .crumbs{{opacity:1!important;transform:none!important;filter:none!important}}.hero-nav{{display:none}}.reveal{{opacity:1;transform:none;filter:none}}</style></noscript>
</head>
<body class="page-{name}">
<div class="grain" aria-hidden="true"></div>

{header(active)}
{hero}{body}
{footer()}
<script src="main.js?v={VERSION}"></script>{extra_js}
</body>
</html>
'''


def main():
    built = []
    for f in sorted(PAGES.glob("*.html")):
        src = f.read_text(encoding="utf-8")
        m = re.match(r"\s*<!--\s*(\{.*?\})\s*-->\s*", src, re.S)
        if not m:
            raise SystemExit(f"{f.name}: missing JSON front matter")
        meta = json.loads(m.group(1))
        body = expand(src[m.end():])
        out = render(f.stem, meta, body)
        (ROOT / f.name).write_text(out, encoding="utf-8")
        built.append(f.name)
    print("built:", ", ".join(built))


if __name__ == "__main__":
    main()
