# iNCO Creative — Website Redesign (2026, cinematic edition)

A premium, conversion-focused redesign of [incocreative.com](https://incocreative.com): a fast static site (HTML + CSS + vanilla JS) with a dark, cinematic look — film grain, letterbox heroes, Ken Burns imagery and slow blur-in reveals — in the iNCO brand colours.

## Pages
| Page | File |
|---|---|
| Home (cinematic hero slideshow) | `index.html` |
| Services overview | `services.html` |
| Digital Design & Branding | `digital-design-branding.html` |
| Social Media Marketing | `social-media-marketing.html` |
| Video Production | `video-production.html` |
| Web Design & Development | `web-design-development.html` |
| iNCO Creative Hub (studios, gallery, pricing tabs, FAQ) | `creative-hub.html` |
| Work / portfolio | `work.html` |
| About (Talent) | `about.html` |
| Clients (logo wall) | `clients.html` |
| Contact (quote form, 3 offices + maps) | `contact.html` |
| Internships (application form) | `internships.html` |
| Blog listing — live from WordPress | `blog.html` |
| Blog article — live from WordPress | `article.html?slug=…` |
| Website Privacy Policy | `privacy-policy.html` |
| Data Processing Policy | `data-processing-policy.html` |
| Multimedia Ts & Cs | `multimedia-terms.html` |
| Graphic & Web Design Ts & Cs | `graphic-web-design-terms.html` |

Shared files: `style.css` (design system), `main.js` (header, menu, reveals, slideshow, tabs, forms), `blog.js` (blog + article).

## How to edit (important)
Every page is generated from `_build/`, so the header, navigation and footer stay identical everywhere.

1. Edit the page body in `_build/pages/<page>.html` (the JSON block at the top holds the title, SEO description and hero).
2. Edit the shared header / nav / footer / page hero in `_build/build.py`.
3. Run `python3 _build/build.py` — it rewrites the `.html` files in the root.

Editing a root `.html` file directly works, but it will be overwritten the next time the build runs. GitHub Pages never publishes the `_build` folder.

## Blog
`blog.html` and `article.html` read posts live from the WordPress REST API at `incocreative.com/wp-json/wp/v2`, so new posts published in WordPress appear automatically. If WordPress is ever switched off, the blog needs a new source.

## Before going live (to-do)
- [ ] **Images**: photos and logos are hot-linked from `incocreative.com/wp-content/uploads`. Copy them into an `images/` folder if the WordPress site will be retired.
- [ ] **Forms**: quote, contact and internship forms open a pre-filled email. Connect them to Formspree, WordPress or a CRM for proper lead capture.
- [ ] **Hub copy check**: the Hub page (copied as-is) says "Five studios" while listing three, and mentions "Gauteng" for free on-location travel.
- [ ] **Ts & Cs**: the old site's accept/decline forms and "Download PDF" links weren't carried over; the "Why we don't provide raws" panel on Multimedia Ts & Cs had no text to copy.
- [ ] Add Google Analytics / Meta Pixel.
