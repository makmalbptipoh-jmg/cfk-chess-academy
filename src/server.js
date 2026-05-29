const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app      = express();
const PORT     = 3000;
const PRODUCTS = require('./products-data.json');

// Image map — loaded once; Backend Dev agent writes this file
let PRODUCT_IMAGES = {};
try { PRODUCT_IMAGES = require('./product-images.json'); } catch(e) {}

// Hot-reload image map without restarting server
function reloadImageMap() {
  try {
    delete require.cache[require.resolve('./product-images.json')];
    PRODUCT_IMAGES = require('./product-images.json');
    console.log(`[images] Reloaded ${Object.keys(PRODUCT_IMAGES).length} image mappings`);
  } catch(e) {}
}

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── Academy endpoints ─────────────────────────────────────────────────────────

app.get('/api/features', (req, res) => {
  res.json([
    { id:1, icon:'🧠', title:'Fokus & Kemahiran Kognitif', description:'Catur melatih otak untuk fokus lebih lama, meningkatkan kemahiran menyelesaikan masalah, pemikiran strategik, dan keupayaan membuat keputusan yang lebih baik.' },
    { id:2, icon:'♟',  title:'Keyakinan & Disiplin Diri',  description:'Setiap kemenangan membina keyakinan diri. Setiap cabaran mengajar kesabaran dan ketekunan.' },
    { id:3, icon:'♛',  title:'Kelas Kumpulan Persendirian', description:'Maksimum 10 pelajar setiap sesi. Jurulatih berpengalaman 17 tahun memastikan setiap kanak-kanak mendapat perhatian penuh.' }
  ]);
});

app.get('/api/pricing', (req, res) => {
  res.json([
    { id:1, icon:'📋', tier:'Pakej Pendaftaran',   subtitle:'Bayaran sekali sahaja', amount:'70',  period:'(sekali)', features:['Yuran Pendaftaran: RM 30','Yuran Keahlian: RM 30','Buku Modul: RM 10','🎁 Set catur percuma!'], popular:false, ctaLabel:'Daftar Sekarang' },
    { id:2, icon:'♟',  tier:'Yuran Bulanan',        subtitle:'Semua 5 cawangan',     amount:'70',  period:'/bulan',   features:['🎉 1 bulan PERCUMA untuk pelajar baru!','Akses ke SEMUA 5 cawangan di Perak','Polisi Satu Harga — tiada caj tambahan','Modul pembelajaran progresif & sistematik','Kumpulan kecil (maks 10 pelajar)'], popular:true, ctaLabel:'Tuntut Kelas Percuma ♞' },
    { id:3, icon:'💎', tier:'Jumlah Bulan Pertama', subtitle:'Semua termasuk',        amount:'140', period:'(bulan 1)',features:['Pakej pendaftaran (RM 70)','Yuran bulan pertama (RM 70)','Cuba percuma 1 bulan sebelum bayar','Bulan seterusnya: RM 70/bulan sahaja','Set catur percuma disertakan'], popular:false, ctaLabel:'Mula Sekarang' }
  ]);
});

app.post('/api/contact', (req, res) => {
  const { name, email, studentAge, chessLevel, message } = req.body || {};
  if (!name || !email) return res.status(400).json({ success:false, message:'Nama dan emel diperlukan.' });
  console.log(`[${new Date().toISOString()}] Contact: ${name} <${email}> age=${studentAge} level=${chessLevel}`);
  res.json({ success:true, message:"Terima kasih! Kami akan menghubungi anda dalam masa 24 jam." });
});

// ── Shop endpoints ────────────────────────────────────────────────────────────

app.get('/api/products', (req, res) => {
  const { category, search, page, limit } = req.query;
  let list = PRODUCTS;

  if (category && category !== 'all')
    list = list.filter(p => p.category === category);

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(q));
  }

  // Pagination (default: all if no page param, otherwise 48/page)
  if (page) {
    const perPage = parseInt(limit) || 48;
    const pg      = Math.max(1, parseInt(page));
    const total   = list.length;
    const start   = (pg - 1) * perPage;
    return res.json({ products: list.slice(start, start + perPage), total, page: pg, perPage });
  }

  res.json(list);
});

app.get('/api/products/stats', (req, res) => {
  const stats = {};
  PRODUCTS.forEach(p => stats[p.category] = (stats[p.category]||0) + 1);
  stats.all = PRODUCTS.length;
  res.json(stats);
});

app.post('/api/order', (req, res) => {
  const { name, email, phone, items, total } = req.body || {};
  if (!name || !email || !items?.length)
    return res.status(400).json({ success:false, message:'Nama, emel dan item diperlukan.' });
  console.log(`[${new Date().toISOString()}] ORDER ${name} <${email}> phone=${phone} total=RM${total}`);
  items.forEach(item => console.log(`  - ${item.title} x${item.qty} RM${item.price * item.qty}`));
  res.json({ success:true, orderId:`CFK-${Date.now()}`, message:'Pesanan diterima!' });
});

// ── Image proxy (bypasses hotlink protection on external sites) ───────────────
app.get('/api/img', async (req, res) => {
  const url = decodeURIComponent(req.query.url || '');
  if (!url.startsWith('http')) return res.status(400).end();
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Referer': 'https://www.google.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      }
    });
    if (!r.ok) return res.status(r.status).end();
    const ct = r.headers.get('content-type') || 'image/jpeg';
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch(e) {
    res.status(502).end();
  }
});

// ── Image lookup ──────────────────────────────────────────────────────────────
app.get('/api/product-image', (req, res) => {
  const title = decodeURIComponent(req.query.title || '');
  const url   = PRODUCT_IMAGES[title] || null;
  res.json({ url });
});

app.post('/api/reload-images', (req, res) => {
  reloadImageMap();
  res.json({ success: true, count: Object.keys(PRODUCT_IMAGES).length });
});

// ── Super Admin: set/delete product image ─────────────────────────────────────
app.post('/api/admin/set-image', (req, res) => {
  const { title, url } = req.body || {};
  if (!title) return res.status(400).json({ success: false, message: 'title diperlukan' });
  if (url) {
    PRODUCT_IMAGES[title] = url;
  } else {
    delete PRODUCT_IMAGES[title];
  }
  try {
    require('fs').writeFileSync(
      require('path').join(__dirname, 'product-images.json'),
      JSON.stringify(PRODUCT_IMAGES),
      'utf8'
    );
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ success: false, message: 'Gagal tulis fail.' });
  }
});

app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, 'shop.html')));

app.use((req, res) => res.status(404).json({ error:'Not found' }));

// Start server locally; export for Vercel serverless
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CFK server running at http://localhost:${PORT}`);
    console.log(`Products loaded: ${PRODUCTS.length}`);
  });
}

module.exports = app;
