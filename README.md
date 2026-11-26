# iNCO Creative — Website Redesign (2026)

A premium, conversion-focused redesign of [incocreative.com](https://incocreative.com), built as a fast static site (HTML + CSS + vanilla JS, no build step).

## Files
| File | Purpose |
|---|---|
| `index.html` | Full one-page site: hero, services, why-it-matters, work, process, about/awards, clients, CTA, contact |
| `style.css` | Brand design system (colours, type, components, responsive) |
| `main.js` | Sticky header, mobile menu, scroll reveals, portfolio filter, quote form |

Open `index.html` in a browser to preview. Deploys as-is to GitHub Pages, Netlify, Vercel or any host.

## Brand system (taken from the current site)
| Token | Hex | Use |
|---|---|---|
| Navy | `#003D57` | Primary background, headings |
| Teal | `#176F6F` / `#1E8A80` | About section, accents |
| Orange | `#EE6020` / `#FC6625` | Primary CTAs, highlights |
| Amber | `#FC9234` | Secondary accent |
| Fonts | Poppins (headings), Roboto (body) | |

## What changed vs. the current site
1. **Clear value proposition in the hero** — headline + subline + two CTAs above the fold, instead of an illustration-led banner.
2. **CTAs everywhere it matters** — header "Get a Quote", hero, every service card (pre-selects the service in the form), work section, about, full-width orange CTA band, floating WhatsApp, click-to-call.
3. **Proof up front** — Level 1 B-BBEE, 3 cities and the Favourite Local Business 2019 award surface in the hero and About section.
4. **Service pages content consolidated** — the current service pages are mostly empty headings; the six "why it matters" benefits are now one strong section.
5. **Work-first portfolio** — large image cards with category filters, linking to existing case studies.
6. **Process section** — Discover → Define → Create → Launch & grow, to reassure new clients.
7. **Clients** — scrolling client wall (Durban ICC, OK Foods, Flora, Harcourts and more).
8. **Smarter quote form** — service chips, validation, mobile number, company.
9. **Performance & SEO** — no page builder bloat, semantic HTML, meta/OG tags, `prefers-reduced-motion` support, mobile-first layouts.

## Before going live (to-do)
- [ ] **Images**: project images and the logo are currently hot-linked from incocreative.com/wp-content. Download them into an `images/` folder and update the paths (and add a dark-on-light logo variant if needed).
- [ ] **Form**: the quote form currently opens a pre-filled email to hello@incocreative.com. Connect it to Formspree, WordPress (Contact Form 7 / WPForms) or your CRM for proper lead capture.
- [ ] **Legal links** in the footer (`data-todo`) — point to the existing Privacy Policy and Ts & Cs pages.
- [ ] Add hero showreel video (a muted, looping MP4 behind the hero works well for a video studio).
- [ ] Add client testimonials and results/numbers to each case study.
- [ ] Add Google Analytics / Meta Pixel.

## Reference sites used for direction
Huge (point-of-view hero), Instrument (work-led homepage), Collins (consistent case studies), That Lot & Mosaic (full-screen video hero), 72andSunny (scroll-guided sections), Hello Monday (purposeful motion).
