// Fetch all product images from chessemo.my.id WordPress REST API
// and match to our catalog titles, then update product-images.json

const fs   = require('fs');
const path = require('path');

const CATALOG = JSON.parse(fs.readFileSync(path.join(__dirname,'..','src','products-data.json'),'utf8'));
const IMG_MAP_PATH = path.join(__dirname,'..','src','product-images.json');

// Load existing map
let EXISTING = {};
try { EXISTING = JSON.parse(fs.readFileSync(IMG_MAP_PATH,'utf8')); } catch(e) {}

// ── Fetch all chessemo products ───────────────────────────────────────────────
async function fetchAllProducts() {
  const all = [];
  let page = 1;
  while (true) {
    const url = `https://chessemo.my.id/wp-json/wp/v2/product?per_page=100&page=${page}&_embed=wp:featuredmedia`;
    console.log(`Fetching page ${page}...`);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
      });
      if (!res.ok) { console.log(`  Page ${page}: HTTP ${res.status} — stopping`); break; }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) { console.log(`  Page ${page}: empty — done`); break; }
      for (const item of data) {
        const title = item.title?.rendered?.replace(/&#8211;/g,'–').replace(/&#8217;/g,"'").replace(/&amp;/g,'&').replace(/<[^>]+>/g,'').trim();
        const imgUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
        if (title && imgUrl) all.push({ title, imgUrl });
      }
      console.log(`  Page ${page}: got ${data.length} items (${all.length} with images so far)`);
      if (data.length < 100) { console.log('  Last page'); break; }
      page++;
    } catch(e) {
      console.log(`  Page ${page} error: ${e.message} — stopping`);
      break;
    }
    // small delay to be polite
    await new Promise(r => setTimeout(r, 300));
  }
  return all;
}

// ── Fuzzy title matching ──────────────────────────────────────────────────────
// Normalise: lowercase, strip formatting, common suffixes
function norm(s) {
  return s.toLowerCase()
    .replace(/\(pdf.*?\)|\(mp4.*?\)|\(pgn.*?\)|\(cbv.*?\)|\(video.*?\)/gi,'')
    .replace(/pgn only|pgn-only|\+ pgn|chessable|limitless|modern chess/gi,'')
    .replace(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/gi,'')
    .replace(/\b20\d\d\b/g,'')
    .replace(/[^\w\s]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function similarity(a, b) {
  const na = norm(a), nb = norm(b);
  if (na === nb) return 1;
  // Check if one contains the other
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  // Count matching words
  const wa = new Set(na.split(' ').filter(w=>w.length>2));
  const wb = new Set(nb.split(' ').filter(w=>w.length>2));
  let match = 0;
  wa.forEach(w => { if(wb.has(w)) match++; });
  return match / Math.max(wa.size, wb.size, 1);
}

function findBestMatch(chessemoTitle, threshold = 0.55) {
  let best = null, bestScore = 0;
  for (const prod of CATALOG) {
    const score = similarity(chessemoTitle, prod.title);
    if (score > bestScore) { bestScore = score; best = prod; }
  }
  return bestScore >= threshold ? { prod: best, score: bestScore } : null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const chessemoProducts = await fetchAllProducts();
  console.log(`\nTotal chessemo products with images: ${chessemoProducts.length}`);

  const newMap = { ...EXISTING };
  let matched = 0, skipped = 0;

  for (const { title, imgUrl } of chessemoProducts) {
    const result = findBestMatch(title);
    if (result) {
      newMap[result.prod.title] = imgUrl;
      matched++;
      if (matched <= 10) console.log(`  ✓ [${result.score.toFixed(2)}] "${title.substring(0,50)}" → "${result.prod.title.substring(0,50)}"`);
    } else {
      skipped++;
      if (skipped <= 5) console.log(`  ✗ No match: "${title.substring(0,60)}"`);
    }
  }

  console.log(`\nMatched: ${matched} | Skipped (no match): ${skipped}`);
  console.log(`Total in map: ${Object.keys(newMap).length}`);

  fs.writeFileSync(IMG_MAP_PATH, JSON.stringify(newMap), 'utf8');
  console.log('Saved to product-images.json');
})();
