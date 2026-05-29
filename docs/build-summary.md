# CFK Academy — Build Summary

## What Was Built

A full-stack chess academy landing site for **Chess For Kids (CFK)**, running locally at `http://localhost:3000`.

### Files

| File | Role |
|------|------|
| `src/index.html` | Single-page landing site — hero, features, pricing, enrollment form |
| `src/styles.css` | 930-line bespoke stylesheet — no CSS framework used |
| `src/server.js` | Express.js API server + static file serving |
| `package.json` | Node project config (`npm start` runs the server) |
| `README.md` | Setup and usage documentation |
| `tests/test-plan.md` | QA test plan (18 checks across 6 categories) |
| `tests/report.md` | QA test report (16/18 pass; 2 issues found and fixed) |

---

## Architecture Decisions

### 1. Express serves both the API and the static files
`app.use(express.static(__dirname))` in `server.js` (which lives in `src/`) means `http://localhost:3000` serves `index.html` directly — no separate static server needed. This keeps the dev setup to a single `node src/server.js` command.

### 2. Vanilla JS with static HTML fallbacks
The landing page fetches live data from `/api/features` and `/api/pricing` on load and re-renders the grids from the API response. However, all three feature cards and all three pricing cards are also hardcoded in the DOM. If the server is slow or the API returns an error, the user sees real content immediately — the API fetch is an enhancement, not a dependency.

### 3. No frontend framework
CSS is written by hand against CSS custom properties (`--amber`, `--navy`, etc.). This keeps the project dependency-free on the frontend and fully readable without a build step.

### 4. API field names aligned to the renderer
The original backend used generic REST field names (`name`, `price`, `highlight`). The frontend renderer was written independently and used more descriptive names (`tier`, `amount`, `popular`). QA caught this mismatch; the server was updated to match what the renderer expects so live API data renders correctly.

### 5. CORS enabled globally
`cors()` middleware is applied to all routes. This allows the page to call the API even if it is later served from a different origin (e.g. a CDN or a staging domain).

---

## How to Run

```bash
cd C:\Users\User\cfk
npm install        # only needed once
npm start          # starts server at http://localhost:3000
```

Then open **http://localhost:3000** in a browser.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/features` | Returns 3 CFK feature objects |
| `GET` | `/api/pricing` | Returns 3 pricing tier objects |
| `POST` | `/api/contact` | Accepts enrollment enquiry; validates name + email |

### POST /api/contact body shape
```json
{
  "name": "Ahmad Zulkifli",
  "email": "ahmad@example.com",
  "studentAge": 10,
  "chessLevel": "Beginner",
  "message": "Interested in the Starter plan."
}
```

---

## QA Summary

16/18 checks passed on first review. Two issues found and fixed before delivery:

1. **Pricing field name mismatch** (critical) — server returned `name`/`price`/`highlight`; renderer read `tier`/`amount`/`popular`. Fixed in `server.js`.
2. **`package.json` main/start script** (minor) — `"main"` pointed to non-existent `index.js`; no `start` script. Fixed to `src/server.js` with `npm start`.
