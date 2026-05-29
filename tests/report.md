# CFK QA Test Report

## Summary
**18/18 checks passed** (2 issues found during review and fixed before delivery)

---

## Results

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Hero section with CTA button | ✅ PASS | `<section class="hero">` present with "Enroll Today" primary CTA and "Learn More" outline button |
| 2 | Features grid with 3 cards or API fetch to `/api/features` | ✅ PASS | `id="featuresGrid"` has 3 hardcoded fallback cards; JS calls `fetch('/api/features')` on DOMContentLoaded |
| 3 | Pricing table with 3 tiers | ✅ PASS | `id="pricingGrid"` contains Starter (RM99), Intermediate (RM199), Champion (RM349) |
| 4 | Contact form with fields: name, email, studentAge, chessLevel, message | ✅ PASS | All 5 `name` attributes present on form elements |
| 5 | Form POSTs to `/api/contact` | ✅ PASS | `fetch('/api/contact', { method: 'POST', ... })` in JS submit handler |
| 6 | HTML links to `./styles.css` | ✅ PASS | `<link rel="stylesheet" href="./styles.css" />` on line 8 |
| 7 | Fallback static feature and pricing cards present | ✅ PASS | All 6 fallback cards hardcoded in DOM; JS `FALLBACK_*` constants also present as secondary fallback |
| 8 | Required CSS classes present | ✅ PASS | `.navbar`, `.hero`, `.features__grid`, `.feature-card`, `.pricing__grid`, `.pricing-card`, `.enrollment`, `.form__control`, `.footer` all confirmed in styles.css |
| 9 | `.pricing-card--popular` visually distinguishes Intermediate tier | ✅ PASS | Amber border, `scale(1.04)`, elevated shadow, "⭐ Most Popular" badge — applied to Intermediate card |
| 10 | Media queries for mobile responsiveness | ✅ PASS | Breakpoints at 960px (tablet), 768px (mobile), 400px (small mobile) — grids collapse, navbar hides |
| 11 | `GET /api/features` returns 3-element array | ✅ PASS | Route at server.js line 16; array literal has exactly 3 objects with `icon`, `title`, `description` |
| 12 | `GET /api/pricing` returns 3-element array | ✅ PASS | Route at server.js line 41; array literal has 3 objects with `tier`, `amount`, `popular`, `icon`, `ctaLabel`, `features` |
| 13 | `POST /api/contact` accepts `{name, email, studentAge, chessLevel, message}` | ✅ PASS | Route at server.js line 86; destructures all 5 fields from `req.body` |
| 14 | Server validates name and email as required | ✅ PASS | Returns HTTP 400 with descriptive message if name or email missing |
| 15 | Server serves static files | ✅ PASS | `app.use(express.static(__dirname))` — `GET /` returns `src/index.html` |
| 16 | `express` and `cors` imported and used | ✅ PASS | Both required on lines 1–2; applied as middleware lines 9–10; in `package.json` dependencies |
| 17 | API fetch URLs in HTML match server routes exactly | ✅ PASS | `/api/features`, `/api/pricing`, `/api/contact` — all paths and methods match exactly |
| 18 | Form POST body field names match server destructuring | ✅ PASS | `name`, `email`, `studentAge`, `chessLevel`, `message` match exactly on both sides. Pricing field names also aligned after fix. |

---

## Issues Found and Fixed

### Issue 1 — FIXED: Pricing API field name mismatch

**Severity:** Critical (broke live pricing rendering)

The server originally returned `name`, `price`, `highlight`; the HTML renderer read `tier`, `amount`, `popular`. When the API responded successfully, pricing cards rendered with `undefined` tier names, no price, and no "Most Popular" badge.

**Fix applied:** `server.js` updated to return `tier`, `amount`, `popular`, `icon`, and `ctaLabel` — matching the renderer exactly.

### Issue 2 — FIXED: `package.json` entry point and start script

**Severity:** Minor

`"main"` pointed to non-existent `index.js`; no `start` script existed so `npm start` would fail.

**Fix applied:** `"main": "src/server.js"` and `"start": "node src/server.js"` added.

---

## Recommendations (resolved)

All critical and recommended fixes have been applied. The project is ready to run with `npm start`.
