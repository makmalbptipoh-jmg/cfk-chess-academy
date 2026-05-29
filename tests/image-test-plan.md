# CFK Chess Shop — Image Update Test Plan

**Prepared by:** QA Engineer  
**Date:** 2026-05-29  
**Scope:** Product cover-image feature for CFK chess shop (`src/shop.html`, `src/server.js`, `src/product-images.json`)  
**Source of images:** https://chessemo.my.id  
**Total products:** 3,948

---

## Background

The team is adding real product cover images scraped from chessemo.my.id. Images are stored in `src/product-images.json` (keyed by product title). The API exposes `/api/product-image?title=X`. The shop frontend renders `<img>` tags when an image URL is available, and falls back to a CSS-only cover for products that have no scraped image.

---

## Test Environment

| Item | Value |
|------|-------|
| Server command | `node src/server.js` |
| Base URL | http://localhost:3000 |
| Shop page | http://localhost:3000/shop |
| Mapping file | `src/product-images.json` |
| Methods allowed | Static code analysis + live server (where noted) |

---

## Check 1 — Image URL Mapping File

**Goal:** Confirm `src/product-images.json` exists and contains usable entries.

| ID | Step | Expected Result | Pass Criteria |
|----|------|-----------------|---------------|
| 1.1 | Verify file exists at `src/product-images.json` | File is present on disk | File found; no FileNotFoundError |
| 1.2 | Open and parse the file as JSON | Valid JSON object | No parse errors |
| 1.3 | Count total keys (product titles) in the object | At least 1 entry | `Object.keys(map).length >= 1` |
| 1.4 | Spot-check 5 random keys — each value should be a non-empty string starting with `https://` | All 5 values are valid HTTPS URLs | All 5 match `/^https:\/\/.+/` |
| 1.5 | Verify no duplicate keys exist (JSON spec forbids them, but parsers may silently deduplicate) | Each product title appears once | Key count equals expected scrape count |

---

## Check 2 — API Endpoint `/api/product-image?title=X`

**Goal:** Confirm the endpoint exists in `server.js`, handles normal and edge cases, and returns the correct JSON shape.

| ID | Step | Expected Result | Pass Criteria |
|----|------|-----------------|---------------|
| 2.1 | Search `server.js` for `app.get('/api/product-image'` | Route declaration present | Route found in source |
| 2.2 | Call `GET /api/product-image?title=<known_title>` | `{ "url": "https://..." }` JSON body, HTTP 200 | `res.url` is a non-empty HTTPS string |
| 2.3 | Call `GET /api/product-image?title=UNKNOWN_PRODUCT_XYZ` | `{ "url": null }` or `{}` with HTTP 200, OR HTTP 404 — NOT a 500 | No server crash; graceful null/404 |
| 2.4 | Call `GET /api/product-image` (no `title` param) | Graceful error response (400 or `{ url: null }`) | No unhandled exception; HTTP != 500 |
| 2.5 | Call with a title that has special characters (e.g., `title=Chess%20Fundamentals%3A%20Vol.1`) | Correct URL lookup after URL-decode | Returns correct image or null |
| 2.6 | Response `Content-Type` header is `application/json` | Header present and correct | `content-type: application/json` |

---

## Check 3 — Frontend: Product Cards Render Image Tags

**Goal:** Confirm `shop.html` injects `<img>` elements for products that have a cover image.

| ID | Step | Expected Result | Pass Criteria |
|----|------|-----------------|---------------|
| 3.1 | Static code search in `shop.html` for `<img` or `img` template literal inside `renderProducts()` | An `<img>` tag is built in the card HTML template | String `<img` found inside the `renderProducts` function body |
| 3.2 | The `<img>` tag has a `src` attribute bound to the image URL from the API or pre-fetched data | `src="${product.imageUrl}"` or equivalent | `src=` assignment found in template |
| 3.3 | The `<img>` tag has `alt` attribute set (at minimum to the product title) | `alt` attribute present | `alt=` found on every rendered `<img>` |
| 3.4 | Live: load page 1, open DevTools Elements panel — cards with known images show `<img class="p-card__cover">` | Image element exists in DOM | At least one `img.p-card__cover` element visible |
| 3.5 | The CSS class `p-card__cover` has `object-fit:cover` applied (see Check 5) | Style rule exists | Linked to Check 5 |

---

## Check 4 — Frontend: Fallback Cards for Products Without Images

**Goal:** Products with no scraped image display a CSS fallback cover, not a broken image.

| ID | Step | Expected Result | Pass Criteria |
|----|------|-----------------|---------------|
| 4.1 | Static code: `renderProducts()` contains a conditional that checks whether a product has an image URL | `if (product.imageUrl)` or equivalent | Conditional branch found in source |
| 4.2 | When no image, the card renders a `.p-card__cover-fallback` div (not an `<img>`) | Fallback div generated | `p-card__cover-fallback` string in template for the else-branch |
| 4.3 | The fallback div renders the product icon (`p.icon`) and a hint text | Icon and hint present | `.icon` and `.hint` elements inside fallback branch |
| 4.4 | Live: find a product with no image entry — its card must show the fallback div, not a broken `<img>` | No broken image icon; fallback div present | No `<img>` with empty/missing `src` in DOM |
| 4.5 | `onerror` handler on `<img>` OR fallback via CSS/JS — image load failure hides the `<img>` and shows fallback | Graceful degradation | Linked to Check 7 |

---

## Check 5 — CSS: `object-fit: cover` on Images

**Goal:** Cover images fill their container without distortion.

| ID | Step | Expected Result | Pass Criteria |
|----|------|-----------------|---------------|
| 5.1 | Search `shop.html` inline `<style>` for `.p-card__cover` rule | Rule present | `.p-card__cover{` found in `<style>` block |
| 5.2 | That rule includes `object-fit:cover` | Property set | `object-fit:cover` found in the rule |
| 5.3 | `.p-card__top` has a fixed `height` (e.g., `height:160px`) | Container height constrained | `height:` property set on `.p-card__top` |
| 5.4 | The `<img>` has `width:100%` and `height:100%` so it fills its container | Fill properties present | `width:100%` and `height:100%` on `.p-card__cover` |
| 5.5 | Live: rendered images appear correctly cropped (no letterboxing, no stretch) | Visual confirmation | Manual inspection of 5 image cards |

---

## Check 6 — Lazy Loading: Images Only Fetched Near Viewport

**Goal:** Images below the fold are not fetched on initial page load, improving performance.

| ID | Step | Expected Result | Pass Criteria |
|----|------|-----------------|---------------|
| 6.1 | Static: `<img>` tags in the template include `loading="lazy"` attribute | Attribute present | `loading="lazy"` found in `<img>` template literal |
| 6.2 | Alternative: `IntersectionObserver` is used to set `src` only when card enters viewport | Observer logic present | `IntersectionObserver` found in JS, OR `loading="lazy"` from 6.1 satisfies this check |
| 6.3 | Live (DevTools Network tab): on initial load of page 1, only images for cards in the first visible rows are requested | Network requests limited to viewport images | Requests for below-fold images absent on initial load |
| 6.4 | Live: scrolling down triggers image loads for newly visible cards | Lazy images load on scroll | Network activity increases as user scrolls |

---

## Check 7 — Error Handling: 404 Image URL Shows Fallback

**Goal:** A broken image URL never shows the browser's broken-image icon.

| ID | Step | Expected Result | Pass Criteria |
|----|------|-----------------|---------------|
| 7.1 | Static: `<img>` tag has `onerror` handler | `onerror=` attribute or addEventListener('error') found | Error handler present in template |
| 7.2 | The `onerror` handler hides the `<img>` and reveals `.p-card__cover-fallback` | Hide/show logic correct | Handler contains `style.display='none'` or class toggle |
| 7.3 | Live: open a product card whose image URL is manually broken (edit Network condition or use DevTools to block) | Fallback cover replaces broken image | No broken-image icon visible |
| 7.4 | 404 on the image does not throw a JS exception or cause card re-render failures | Console is clean | No uncaught errors in console |

---

## Check 8 — Cart: Add-to-Cart Still Works After Image Update

**Goal:** The image feature has no side-effects on cart functionality.

| ID | Step | Expected Result | Pass Criteria |
|----|------|-----------------|---------------|
| 8.1 | Static: `renderProducts()` still attaches `.add-btn` click listeners after any image-related changes | Event listener attachment code present | `addEventListener('click'` on `.add-btn` found in `renderProducts` |
| 8.2 | Each product card still contains a `data-id` attribute on the add button | `data-id="${p.id}"` in template | `data-id` attribute found |
| 8.3 | Live: click "Tambah ke Troli" on a card with a real image — item appears in cart sidebar | Cart count increments; item in sidebar | Cart badge shows `1`; item renders correctly |
| 8.4 | Live: click "Tambah ke Troli" on a card with a fallback cover — item appears in cart sidebar | Same as 8.3 | Cart badge shows correct count |
| 8.5 | Cart `icon` field still populated from product data (not from image URL) | Cart item shows emoji icon, not `<img>` | Correct emoji in `.cart-item__icon` |
| 8.6 | Cart persists in `localStorage` after page reload | `cfk_cart` key in localStorage unchanged | Items survive page reload |

---

## Check 9 — Pagination: Images Load Correctly on Page 2+

**Goal:** Switching pages loads fresh product data with correct images.

| ID | Step | Expected Result | Pass Criteria |
|----|------|-----------------|---------------|
| 9.1 | Static: `loadProducts()` fetches `/api/products?page=N&limit=48` and passes image URLs to `renderProducts()` | API call includes page param; image data flows through | `page=` param in fetch URL; image URL passed to card render |
| 9.2 | Live: navigate to page 2 — grid clears and 48 new cards render, each with correct image or fallback | Correct page 2 products shown | Product titles are different from page 1; no leftover page-1 cards |
| 9.3 | Live: on page 2, scroll-triggered lazy loading still works | Below-fold images on page 2 load on scroll | Same as Check 6 for page 2 |
| 9.4 | Live: navigate page 3 → page 1 → page 3 rapidly — no stale images (old page's image URLs do not appear on wrong cards) | Race condition check — final page always shows correct data | Correct product-image pairing on all navigations |
| 9.5 | `renderPagination()` does not remove or break image-related DOM elements | Pagination bar insertion leaves grid intact | `<div class="product-grid">` contents unaffected by `insertAdjacentElement('afterend', ...)` |

---

## Check 10 — Performance: Shop Loads Within Reasonable Time

**Goal:** Adding images does not significantly degrade page load or interaction speed.

| ID | Step | Expected Result | Pass Criteria |
|----|------|-----------------|---------------|
| 10.1 | Live (DevTools Performance or Network tab): Time to first product grid render on page 1 | Under 2 seconds on localhost | `DOMContentLoaded` + first `fetch` response within 2 s |
| 10.2 | `/api/products?page=1&limit=48` response time | Under 500 ms | Response time < 500 ms in Network tab |
| 10.3 | If image URLs are fetched individually per card (48 separate API calls on page load), flag as a performance issue | Prefer bulk: image URLs embedded in product data OR fetched in a single batch call | Only 1–2 API calls on page load (not 48+) |
| 10.4 | `product-images.json` lookup in server-side handler uses O(1) map access, not a linear scan | Server code uses object property access `map[title]` | `map[title]` or `map.hasOwnProperty(title)` pattern in server |
| 10.5 | Total page weight (HTML + inline JS) does not increase unreasonably | shop.html < 200 KB | File size check on `src/shop.html` |

---

## Pass/Fail Criteria

| Verdict | Definition |
|---------|-----------|
| **PASS** | Code element is present, correct, and would function at runtime without modification. |
| **FAIL** | Code element is absent, incorrect, or mismatched — would cause a visible bug or server error. |
| **WARN** | Element is present but has a non-blocking concern (e.g., missing `alt` text, no lazy loading attribute but functional otherwise). |
| **N/A** | Check not applicable because the feature is implemented via an alternative mechanism. |

---

## Out of Scope

- Cross-browser compatibility (IE, Safari iOS)
- CDN or production deployment testing
- Accessibility audit beyond `alt` attribute checks
- Image scraper correctness (chessemo.my.id coverage is assumed as-given)
- Security testing (CORS, CSP headers on image URLs)

---

## Dependencies / Blockers

This test plan requires **both** of the following to be complete before the test report (Task 2) can be written:

- `tests/backend-images-done.txt` — signals that `server.js` and `product-images.json` are ready
- `tests/frontend-images-done.txt` — signals that `shop.html` image rendering is complete
