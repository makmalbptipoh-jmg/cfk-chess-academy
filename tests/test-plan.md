# CFK QA Test Plan

## Scope
Static review of all source files for the Chess For Kids (CFK) academy project:
- `src/index.html`
- `src/styles.css`
- `src/server.js`

No server will be started. All checks are performed by static code analysis and cross-file inspection.

---

## Category 1 — HTML Structure

**What is being tested:** Presence of required page sections, correct IDs, form fields, and basic accessibility attributes.

| Check | Description |
|-------|-------------|
| 1.1 | Hero section exists and contains a CTA button (`Enroll Today` / link to `#enroll`) |
| 1.2 | Features grid section exists (id `features`) with 3 feature cards or API fetch to `/api/features` |
| 1.3 | Pricing section exists (id `pricing`) with 3 tier cards |
| 1.4 | Contact/enrollment form exists with all required fields: `name`, `email`, `studentAge`, `chessLevel`, `message` |
| 1.5 | Form submits via POST to `/api/contact` |
| 1.6 | `<link rel="stylesheet">` points to `./styles.css` |
| 1.7 | Fallback static feature and pricing cards are present in the DOM for offline/API-down scenarios |
| 1.8 | Key sections have `aria-label` or `aria-labelledby` attributes (basic accessibility) |

---

## Category 2 — CSS Coverage

**What is being tested:** All CSS class names referenced in HTML exist as rules in `styles.css`, key layout selectors are present, and responsive breakpoints are defined.

| Check | Description |
|-------|-------------|
| 2.1 | `.navbar` class exists in CSS |
| 2.2 | `.hero` class exists in CSS |
| 2.3 | `.features__grid` class exists in CSS |
| 2.4 | `.feature-card` class exists in CSS |
| 2.5 | `.pricing__grid` class exists in CSS |
| 2.6 | `.pricing-card` class exists in CSS |
| 2.7 | `.enrollment` class exists in CSS |
| 2.8 | `.form__control` class exists in CSS |
| 2.9 | `.footer` class exists in CSS |
| 2.10 | `.pricing-card--popular` modifier exists and applies visual distinction (border, scale, background) |
| 2.11 | At least two `@media` breakpoints are present for mobile/tablet responsiveness |

---

## Category 3 — API Contract

**What is being tested:** The fetch() calls in `index.html` reference endpoint paths and HTTP methods that exactly match the routes defined in `server.js`.

| Check | Description |
|-------|-------------|
| 3.1 | HTML `fetch('/api/features')` (GET) matches server `app.get('/api/features', ...)` |
| 3.2 | HTML `fetch('/api/pricing')` (GET) matches server `app.get('/api/pricing', ...)` |
| 3.3 | HTML `fetch('/api/contact', { method: 'POST' })` matches server `app.post('/api/contact', ...)` |
| 3.4 | Content-Type header `application/json` is set on the POST, and server uses `express.json()` middleware |

---

## Category 4 — Form Behavior

**What is being tested:** Client-side validation logic is present, all required fields are validated before submission, and the POST body field names exactly match what `server.js` destructures.

| Check | Description |
|-------|-------------|
| 4.1 | Client-side validation checks that `name`, `email`, `studentAge`, `chessLevel` are non-empty before posting |
| 4.2 | Email format validation (regex or type=email) is applied |
| 4.3 | Age range validation (4–18) is applied |
| 4.4 | POST payload field names (`name`, `email`, `studentAge`, `chessLevel`, `message`) match the destructured fields in the server's POST handler |
| 4.5 | Submit button is disabled while the request is in flight (prevents duplicate submissions) |
| 4.6 | Success and error states are shown to the user after submission |

---

## Category 5 — Server Correctness

**What is being tested:** All three routes are present and return the right data shapes, validation is applied, static files are served, and dependencies are correctly imported.

| Check | Description |
|-------|-------------|
| 5.1 | `GET /api/features` route exists and returns a 3-element array |
| 5.2 | `GET /api/pricing` route exists and returns a 3-element array |
| 5.3 | `POST /api/contact` route exists and accepts `{ name, email, studentAge, chessLevel, message }` |
| 5.4 | Server validates `name` and `email` are required; returns 400 on missing values |
| 5.5 | `express.static(__dirname)` (or equivalent) is used so `http://localhost:3000` serves `index.html` |
| 5.6 | Both `express` and `cors` are imported and applied as middleware |
| 5.7 | A 404 catch-all handler is present |

---

## Category 6 — Integration

**What is being tested:** End-to-end coherence — the URLs in HTML fetch calls, POST body field names, and server route definitions all align so the full stack would function correctly when running together.

| Check | Description |
|-------|-------------|
| 6.1 | Feature API URL `/api/features` is identical in HTML and server |
| 6.2 | Pricing API URL `/api/pricing` is identical in HTML and server |
| 6.3 | Contact API URL `/api/contact` is identical in HTML and server |
| 6.4 | POST body field names sent by the form (`name`, `email`, `studentAge`, `chessLevel`, `message`) exactly match what the server destructures from `req.body` |
| 6.5 | The pricing API response shape (`name`, `price`, `highlight`, `features`) is compatible with what the HTML JS renderer expects (`tier`, `amount`, `popular`, `features`) — flag any mismatch as an integration risk |

---

## Pass/Fail Criteria
- **PASS**: The code element is present, correct, and unambiguously functional.
- **FAIL**: The code element is absent, incorrect, or mismatched in a way that would cause a runtime bug.
- **WARN**: The element is present but has a non-blocking quality concern (e.g., naming mismatch handled by fallback).

---

## Out of Scope
- Live HTTP testing (server not started)
- Browser cross-compatibility testing
- Performance and load testing
- Security penetration testing
- Accessibility audit beyond basic ARIA labels
