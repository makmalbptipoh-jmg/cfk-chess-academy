// Fill missing images by fetching all chessemo products first,
// then matching OUR unmapped products to chessemo titles.

const fs   = require('fs');
const path = require('path');

const CATALOG   = JSON.parse(fs.readFileSync(path.join(__dirname,'..','src','products-data.json'),'utf8'));
const IMG_PATH  = path.join(__dirname,'..','src','product-images.json');
let   IMG_MAP   = {};
try { IMG_MAP = JSON.parse(fs.readFileSync(IMG_PATH,'utf8')); } catch(e) {}

// Which of our products are missing images?
const MISSING = CATALOG.filter(p => !IMG_MAP[p.title]);
console.log(`Products missing images: ${MISSING.length}`);

// Normalise title for comparison
function norm(s) {
  return s
    .toLowerCase()
    .replace(/&#\d+;/g, ' ')                         // HTML entities
    .replace(/\(pdf.*?\)|\(mp4.*?\)|\(pgn.*?\)|\(cbv.*?\)|\(video.*?\)/gi, '')
    .replace(/\bpgn only\b|\bpgn-only\b|\+\s*pgn\b/gi, '')
    .replace(/chessable|limitless chess|modern chess|forward chess/gi, '')
    .replace(/\bpart\s*\d+\b/gi, '')
    .replace(/vol(?:ume)?\s*\d+/gi, '')
    .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d*/gi, '')
    .replace(/\b20\d\d\b/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Word-overlap similarity
function sim(a, b) {
  const na = norm(a), nb = norm(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.88;
  const wa = na.split(' ').filter(w => w.length > 2);
  const wb = new Set(nb.split(' ').filter(w => w.length > 2));
  let hits = 0;
  wa.forEach(w => { if (wb.has(w)) hits++; });
  return hits / Math.max(wa.length, wb.size, 1);
}

// Fetch ALL chessemo products with images
async function fetchAll() {
  const all = [];
  let page = 1;
  while (true) {
    const url = `https://chessemo.my.id/wp-json/wp/v2/product?per_page=100&page=${page}&_embed=wp:featuredmedia`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.length) break;
      for (const item of data) {
        const title  = (item.title?.rendered || '')
          .replace(/&#8211;/g,'–').replace(/&#8217;/g,"'").replace(/&amp;/g,'&')
          .replace(/<[^>]+>/g,'').trim();
        const imgUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
        if (title && imgUrl) all.push({ title, imgUrl });
      }
      process.stdout.write(`\rFetched ${all.length} chessemo products (page ${page})...`);
      if (data.length < 100) break;
      page++;
    } catch(e) { break; }
    await new Promise(r => setTimeout(r, 250));
  }
  console.log(`\nTotal chessemo products: ${all.length}`);
  return all;
}

(async () => {
  const chessemo = await fetchAll();

  let newlyMapped = 0;
  const newMap = { ...IMG_MAP };
  const THRESHOLD = 0.52;

  // For each missing product, find the best chessemo match
  for (const prod of MISSING) {
    let bestScore = 0, bestUrl = null;
    for (const { title: ct, imgUrl } of chessemo) {
      const score = sim(prod.title, ct);
      if (score > bestScore) { bestScore = score; bestUrl = imgUrl; }
    }
    if (bestScore >= THRESHOLD && bestUrl) {
      newMap[prod.title] = bestUrl;
      newlyMapped++;
      if (newlyMapped <= 15) {
        console.log(`  ✓ [${bestScore.toFixed(2)}] "${prod.title.substring(0,55)}" → gambar dijumpai`);
      }
    }
  }

  const stillMissing = MISSING.length - newlyMapped;
  console.log(`\nHasil:`);
  console.log(`  Berjaya dipadankan : ${newlyMapped}`);
  console.log(`  Masih tiada gambar : ${stillMissing}`);
  console.log(`  Coverage baru      : ${(Object.keys(newMap).length / CATALOG.length * 100).toFixed(1)}%`);

  fs.writeFileSync(IMG_PATH, JSON.stringify(newMap), 'utf8');
  console.log('Saved → product-images.json');
})();
