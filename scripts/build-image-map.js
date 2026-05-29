// Build product-images.json from collected cover URLs
const fs   = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname,'..','src','products-data.json'),'utf8'));

// ── Image library ─────────────────────────────────────────────────────────────
const CC   = 'https://chess.co.uk/cdn/shop/';
const FC   = 'https://forwardchess.com/storage/products/';
const TP   = 'https://thinkerspublishing.com/wp-content/uploads/';
const CB   = 'https://shop.chessbase.com/en/pics/';
const CMO  = 'https://chessemo.my.id/wp-content/uploads/2026/05/';

const IMGS = {
  // ── Sicilian variants ────────────────────────────────────────────────────
  sic_dragon:    FC+'the-dragon-sicilian-1764331347.jpeg',
  sic_killer:    CC+'products/killer-sicilian-rotella_1024x.jpg',
  sic_alapin:    CC+'products/squeezing-the-sicilian-alapin-variation_1024x.jpg?v=1600957757',
  sic_kalashnikov: CC+'products/kings-kalashnikov-sicilian-daniel-king_1024x.jpg?v=1655802458',
  sic_steamroll: CC+'products/CB04887-2_1024x.jpg?v=1599658444',
  sic_general:   CC+'products/20220824_giri_dragon_sicilian_1000px_1024x.jpg?v=1665153747',
  // ── French ──────────────────────────────────────────────────────────────
  french:        FC+'win-with-the-french-1772109709.jpeg',
  french2:       CC+'products/moskalenko_the_fully_fledged_french_x1000_6d168a37-ea39-4ed0-b51b-1e55d28dd6ff_1024x.jpg?v=1619703201',
  // ── Nimzo Indian ────────────────────────────────────────────────────────
  nimzo1:        CC+'files/NIMZOBIBLEVOL11000px_1024x.jpg?v=1682593678',
  nimzo2:        CC+'files/NimzoBibleVOL21000px_1024x.jpg?v=1682593987',
  // ── Alekhine ────────────────────────────────────────────────────────────
  alekhine:      CC+'products/CB06998-2_1024x.jpg?v=1599662253',
  // ── King's Indian ───────────────────────────────────────────────────────
  kid:           CMO+'Screenshot_3-10.png',
  // ── Benoni ──────────────────────────────────────────────────────────────
  benoni:        CC+'products/CB07835-2_1024x.jpg?v=1599664278',
  // ── Endgames ────────────────────────────────────────────────────────────
  endgame:       FC+'100-basic-endgames-you-must-know-1775223276.jpeg',
  endgame2:      CMO+'Screenshot-2026-05-23-090036.png',
  // ── Tactics ─────────────────────────────────────────────────────────────
  tactics:       CC+'products/CheckandMatecover1000px_1024x.jpg?v=1671710054',
  // ── Checkmate / Mate ────────────────────────────────────────────────────
  mate:          FC+'check-and-mate-a-beginners-guide-with-2000-examples-1684150607.jpeg',
  // ── Openings 1.d4 ───────────────────────────────────────────────────────
  d4:            FC+'opening-repertoire-strategic-play-with-1-d4-1705411053.jpeg',
  // ── Ragozin / QGD / QGI ─────────────────────────────────────────────────
  ragozin:       FC+'the-ragozin-complex-1777605324.jpeg',
  // ── Bogo-Indian / Nimzo variations ───────────────────────────────────────
  bogo:          FC+'the-modern-bogo-1d4-e6-1777605097.jpeg',
  // ── Middlegame ───────────────────────────────────────────────────────────
  middlegame:    CMO+'Screenshot-2026-05-23-090856.png',
  // ── Strategy / masterclass ───────────────────────────────────────────────
  strategy:      CMO+'Screenshot_8-5.png',
  // ── Akobian / Varuzhan ───────────────────────────────────────────────────
  akobian:       CMO+'Screenshot_8-5.png',
  // ── Petrosian ───────────────────────────────────────────────────────────
  petrosian:     CMO+'Screenshot-2026-05-19-120506.png',
  // ── Kasparov ────────────────────────────────────────────────────────────
  kasparov:      CC+'products/CB06998-2_1024x.jpg?v=1599662253',
  // ── Magnus / Carlsen ────────────────────────────────────────────────────
  magnus:        CB+'bp_8641',
  // ── Chess magazines ─────────────────────────────────────────────────────
  chess_life:    CMO+'Screenshot_3-9.png',
  new_in_chess:  FC+'new-in-chess-20262-1778506805.jpeg',
  british_chess: FC+'british-chess-magazine-may-2026-1778967804.jpeg',
  // ── Ruy Lopez / Spanish ──────────────────────────────────────────────────
  ruy_lopez:     FC+'opening-repertoire-strategic-play-with-1-d4-1705411053.jpeg',
  // ── Chess for beginners ──────────────────────────────────────────────────
  beginners:     FC+'check-and-mate-a-beginners-guide-with-2000-examples-1684150607.jpeg',
  // ── Chess puzzles / training ─────────────────────────────────────────────
  puzzles:       FC+'100-basic-endgames-you-must-know-1775223276.jpeg',
  // ── Fritz / ChessBase software ───────────────────────────────────────────
  fritz:         CB+'bp_9402',
  chessbase:     CB+'bp_9402',
  // ── Euwe ────────────────────────────────────────────────────────────────
  euwe:          FC+'max-euwe-world-champion-1779831597.jpeg',
  // ── Rubinstein ───────────────────────────────────────────────────────────
  rubinstein:    FC+'uncrowned-chess-champions-akiba-rubinstein-1778115455.jpeg',
  // ── Miniatures / short games ─────────────────────────────────────────────
  miniature:     FC+'chess-in-miniature-volume-1-1776720472.jpeg',
  // ── Brutal tactics / chessemo ────────────────────────────────────────────
  brutal:        CMO+'Screenshot_1-7.png',
};

// ── Matching rules: [regex, imageKey, priority] ───────────────────────────────
// Higher priority = tried first. Specific beats general.
const RULES = [
  // Specific books
  [/nimzo.indian bible.*vol.*1|nimzo.*bible.*white.*vol.*1/i,  'nimzo1',   10],
  [/nimzo.indian bible.*vol.*2|nimzo.*bible.*white.*vol.*2/i,  'nimzo2',   10],
  [/alekhine.*complete guide|complete.*alekhine/i,             'alekhine', 10],
  [/modern benoni|opening.*benoni/i,                           'benoni',   10],
  [/check and mate.*beginners|beginners.*check.*mate/i,        'mate',     10],
  [/win with the french/i,                                     'french',   10],
  [/fully.fledged french/i,                                    'french2',  10],
  [/dragon.*sicilian|sicilian.*dragon/i,                       'sic_dragon',10],
  [/killer.*sicilian/i,                                        'sic_killer',10],
  [/alapin|squeezing.*sicilian/i,                              'sic_alapin',10],
  [/kalashnikov/i,                                             'sic_kalashnikov',10],
  [/steamroll.*sicilian/i,                                     'sic_steamroll',10],
  [/100.*basic endgame|endgame.*you must know/i,               'endgame',  10],
  [/ragozin/i,                                                 'ragozin',  10],
  [/bogo.indian|modern bogo/i,                                 'bogo',     10],
  [/petrosian/i,                                               'petrosian', 9],
  [/akobian|varuzhan/i,                                        'akobian',   9],
  [/euwe/i,                                                    'euwe',      9],
  [/rubinstein/i,                                              'rubinstein', 9],
  [/chess in miniature/i,                                      'miniature', 9],
  [/magnus.*touch|touch.*magnus|magnus.*strategy/i,            'magnus',    9],
  [/kasparov.*masterclass|masterclass.*kasparov/i,             'kasparov',  9],
  // Openings
  [/king.?s indian/i,                                          'kid',       8],
  [/french/i,                                                  'french',    7],
  [/sicilian/i,                                                'sic_general',6],
  [/nimzo.indian|nimzo.indian/i,                               'nimzo1',    7],
  [/alekhine/i,                                                'alekhine',  7],
  [/ruy.lopez|spanish.*opening|open.*ruy|ruy.*lopez/i,         'ruy_lopez', 7],
  [/slav.*defense|slav.*defence|positional.*slav/i,            'd4',        6],
  [/1\.d4|strategic.*1\.d4|1\.d4.*strategic/i,                 'd4',        6],
  // Endgame/Tactic/Strategy
  [/endgame|end.game/i,                                        'endgame',   5],
  [/tactic|puzzle|combination/i,                               'tactics',   5],
  [/middlegame|middle.game/i,                                  'middlegame',5],
  [/strategy|strategic/i,                                      'strategy',  4],
  [/masterclass|master class/i,                                'strategy',  4],
  // Fritz/ChessBase
  [/fritz\s*\d|fritz.*chessbase/i,                             'fritz',     9],
  [/chessbase|fritz/i,                                         'chessbase', 8],
  // Magazines
  [/chess life/i,                                              'chess_life', 8],
  [/new in chess|new-in-chess/i,                               'new_in_chess',8],
  [/british chess magazine/i,                                  'british_chess',8],
  // Beginners
  [/beginner|beginners|for kids/i,                             'beginners', 5],
  // Kasparov
  [/kasparov/i,                                                'kasparov',  7],
  // Magnus
  [/carlsen|magnus/i,                                          'magnus',    7],
  // Brutal
  [/brutal/i,                                                  'brutal',    8],
];

// Sort rules by priority descending
RULES.sort((a,b) => b[2] - a[2]);

function findImage(title) {
  for (const [re, key] of RULES) {
    if (re.test(title)) return IMGS[key] || null;
  }
  return null;
}

const map = {};
let matched = 0;
for (const p of products) {
  const url = findImage(p.title);
  if (url) { map[p.title] = url; matched++; }
}

// Stats
const byImg = {};
Object.values(map).forEach(url => {
  const k = url.split('/').pop().split('?')[0];
  byImg[k] = (byImg[k]||0)+1;
});

console.log(`Matched ${matched} / ${products.length} products`);
Object.entries(byImg).sort((a,b)=>b[1]-a[1]).slice(0,15).forEach(([k,v]) => console.log(` ${String(v).padStart(4)}  ${k}`));

fs.writeFileSync(path.join(__dirname,'..','src','product-images.json'), JSON.stringify(map), 'utf8');
console.log('Saved product-images.json');
