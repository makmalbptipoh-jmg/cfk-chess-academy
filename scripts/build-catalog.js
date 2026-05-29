// Reads docs/products-raw.json, categorises every title, writes src/products-data.json
const fs   = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname,'..','docs','products-raw.json'),'utf8'));

const ICONS = { video:'🎬', ebook:'📖', software:'💻', database:'🗄️', magazine:'📰' };

function categorise(title) {
  const t = title.toLowerCase();

  // Software first (specific)
  if (/fritz\s*\d|chessbase|komodo|stockfish|houdini|leela|lc0|arena chess|scid|lucas chess/.test(t))
    return 'software';

  // Magazine
  if (/magazine|chess life|new in chess|british chess magazine|chess informant|american chess|64 chess/.test(t))
    return 'magazine';

  // Video keywords (explicit)
  if (/\(video\)|\bvideo\b|masterclass|chessable|gm prep video|master class|online course/.test(t))
    return 'video';

  // PGN-only database
  if (/pgn only|pgn-only|\(pgn\)|\bpgn\b(?!.*pdf)|\bcbv\b|\.cbv|opening tree|chess tree/.test(t))
    return 'database';

  // PDF + PGN or PDF alone → ebook
  if (/\(pdf\s*\+\s*pgn\)|\(pdf\)|\bpdf\b/.test(t))
    return 'ebook';

  // Fallback heuristics
  if (/vol\.\s*\d|part\s*\d|series|course|repertoire|for beginners|beginner|training|workbook/.test(t))
    return 'ebook';

  // Sheet 3 entries (2025-2026) are mostly Chessable/video courses
  return 'ebook';
}

function price(cat) {
  if (cat === 'software') return { price:40, originalPrice:100, discount:60 };
  return { price:8, originalPrice:30, discount:73 };
}

function randBetween(min, max) { return Math.round((Math.random()*(max-min)+min)*10)/10; }

const seen = new Set();
const products = [];
let id = 1;

for (const row of raw) {
  const title = row.title.trim();
  if (!title || seen.has(title.toLowerCase())) continue;
  seen.add(title.toLowerCase());

  const cat = categorise(title);
  const p   = price(cat);

  products.push({
    id,
    category:      cat,
    icon:          ICONS[cat],
    title,
    price:         p.price,
    originalPrice: p.originalPrice,
    discount:      p.discount,
    rating:        randBetween(4.5, 5.0),
    ratingCount:   Math.floor(Math.random()*180)+20,
  });
  id++;
}

// Category summary
const summary = {};
products.forEach(p => summary[p.category] = (summary[p.category]||0)+1);
console.log('Category breakdown:', summary);
console.log('Total unique products:', products.length);

const outPath = path.join(__dirname,'..','src','products-data.json');
fs.writeFileSync(outPath, JSON.stringify(products, null, 0), 'utf8');
console.log('Written to', outPath);
