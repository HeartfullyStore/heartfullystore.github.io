/* HeartfullyStore card engine (browser port of card.html, 2026-10-18).
   CardEngine.render(canvas, o) draws one panel.
   o = {w,h,layout:'cover'|'inside'|'flat'|'back'|'insideleft', theme, name, g1, sub, msg:[...], sign, top, qr:canvas|null, qrpx}
   CardEngine.qrCanvas(url, hex) -> canvas with 40 px modules and a 4-module quiet zone (same geometry as qr.py). */
window.CardEngine = (function () {
  const FONT = 'LoraX';
  const THEMES = {
    rose: { pet: ['#c98b8f', '#e3b3b0', '#b56d76', '#efcdb8', '#a9757a'], ink: '#5b3440', gold: '#b8862f', bg: ['#fcf8f0', '#f6ece0', '#eadcc9'], leaf: ['#7fa38a', '#8fa98c', '#a7bba0', '#7e9a7c', '#9db497'], qr: '5a2a3c' },
    navy: { pet: ['#e6b85c', '#f3d58a', '#c99a45', '#f7e3b0', '#d4a640'], ink: '#17233a', gold: '#c9a24a', bg: ['#f7f4ec', '#efe9dc', '#e3dbc8'], leaf: ['#5f7d8c', '#6f8d9c', '#8aa5b2', '#50707f', '#7c98a6'], qr: '17233a' },
    wine: { pet: ['#b23a48', '#d4606c', '#8f2432', '#e8a0a8', '#a12f3c'], ink: '#4a1f2a', gold: '#c9a24a', bg: ['#fbf5f1', '#f4e9e3', '#eadcd4'], leaf: ['#7a8f6e', '#8aa07c', '#9fb391', '#6c8060', '#93a785'], qr: '4a1f2a' },
    green: { pet: ['#b8343f', '#d9565f', '#8f1f2a', '#e8b4b8', '#a62b36'], ink: '#1f3d2f', gold: '#c9a24a', bg: ['#f9f7f0', '#f1ede0', '#e6e0cd'], leaf: ['#2f6a4a', '#3f7d5a', '#5a9472', '#27573d', '#4e8a66'], qr: '1f3d2f' },
    lavender: { pet: ['#9b86c2', '#b8a6d6', '#7b63a8', '#d9cdea', '#8c74b8'], ink: '#3b2f55', gold: '#b8862f', bg: ['#faf7fc', '#f1ecf6', '#e6dfee'], leaf: ['#7fa38a', '#8fa98c', '#a7bba0', '#7e9a7c', '#9db497'], qr: '3b2f55' },
  };
  const DEFAULT_MSG = ['There are words we say out loud,', 'and words we keep inside.', 'This card holds a little of both:', 'open it, scan it, and listen.', 'It was made with you in mind.'];

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shade(hex, k) { const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = n >> 8 & 255, b = n & 255; const f = v => Math.round(Math.min(255, Math.max(0, k < 0 ? v * (1 + k) : v + (255 - v) * k))); return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')'; }

  function render(cv, o) {
    const PW = o.w || 1500, PH = o.h || 2100, S = PW / 1500, W = 1500, H = PH / S, QRPX = o.qrpx || 345;
    const NAME = (o.name || 'Friend') + '!';
    const G1 = o.g1 || 'Happy Birthday,';
    const SUB = o.sub || 'with all our love';
    const SIGN = o.sign || (G1.replace(/,$/, '') + ', ' + NAME);
    const TOP = o.top || 'A MESSAGE JUST FOR YOU';
    const MSG = (o.msg && o.msg.length ? o.msg : DEFAULT_MSG).slice(0, 8);
    const T = THEMES[o.theme] || THEMES.rose;
    const LAYOUT = o.layout || 'flat';
    const qrImg = o.qr || null;
    cv.width = PW; cv.height = PH;
    const ctx = cv.getContext('2d');
    const R = mulberry(2027);
    const PET = T.pet, LEAF = T.leaf, INK = T.ink, GOLD = T.gold;
    const hasLS = 'letterSpacing' in ctx;

    function txt(s, x, y, font, fill, ls) { ctx.font = font; if (hasLS) ctx.letterSpacing = ls || '0px'; ctx.fillStyle = fill; ctx.fillText(s, x, y); if (hasLS) ctx.letterSpacing = '0px'; }
    // shrink a font until the text fits maxW (added for free-text fields)
    function fit(s, style, size, maxW, min) { let fs = size; ctx.font = style + ' ' + fs + 'px ' + FONT; while (ctx.measureText(s).width > maxW && fs > min) { fs -= 2; ctx.font = style + ' ' + fs + 'px ' + FONT; } return style + ' ' + fs + 'px ' + FONT; }
    function star5(cx, cy, r, rot, fill, stroke, lw) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot || 0); ctx.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 3; ctx.lineJoin = 'round'; ctx.stroke(); } ctx.restore(); }
    function sparkle(x, y, s, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#d9a64a'; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s); ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill(); ctx.restore(); }
    function leaf(x, y, l, rot, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col || LEAF[0]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(l * .5, -l * .32, l, 0); ctx.quadraticCurveTo(l * .5, l * .32, 0, 0); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(l * .85, 0); ctx.stroke(); ctx.restore(); }
    function flower(cx, cy, r, rot, col) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot || 0); ctx.shadowColor = 'rgba(70,40,40,.28)'; ctx.shadowBlur = r * .3 * S; ctx.shadowOffsetY = r * .08 * S;
      const g = ctx.createRadialGradient(-r * .25, -r * .3, r * .05, 0, 0, r); g.addColorStop(0, '#fff4ee'); g.addColorStop(.55, col); g.addColorStop(1, shade(col, -.28)); ctx.fillStyle = g;
      ctx.beginPath(); for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7, a2 = a + Math.PI / 7; ctx.quadraticCurveTo(Math.cos(a2 - .2) * r * 1.12, Math.sin(a2 - .2) * r * 1.12, Math.cos(a + Math.PI * 2 / 7) * r * .92, Math.sin(a + Math.PI * 2 / 7) * r * .92); } ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.lineCap = 'round'; for (let i = 0; i < 6; i++) { const rr = r * (.8 - i * .13); ctx.strokeStyle = 'rgba(110,45,55,' + (.22 + i * .06) + ')'; ctx.lineWidth = Math.max(1.5, r * .07); ctx.beginPath(); ctx.arc(i * r * .02, -i * r * .015, rr, i * 1.25, i * 1.25 + 3.6); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,245,240,.45)'; ctx.lineWidth = Math.max(1, r * .035); ctx.beginPath(); ctx.arc(i * r * .02 - r * .02, -i * r * .015 - r * .02, rr * .96, i * 1.25 + .3, i * 1.25 + 2.2); ctx.stroke(); }
      ctx.restore();
    }
    function wreath(cx, cy, R0, a0, a1, seed) {
      const r = mulberry(seed); ctx.strokeStyle = '#8a9f84'; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const a = a0 + (a1 - a0) * i / 60; const x = cx + Math.cos(a) * R0, y = cy + Math.sin(a) * R0; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      for (let i = 0; i < 22; i++) { const a = a0 + (a1 - a0) * (i + .5) / 22, x = cx + Math.cos(a) * R0, y = cy + Math.sin(a) * R0, dir = a + (a1 > a0 ? Math.PI / 2 : -Math.PI / 2); leaf(x, y, 58 + r() * 22, dir - .7 - r() * .3, i % 2 ? LEAF[1] : LEAF[2]); leaf(x, y, 52 + r() * 20, dir + .7 + r() * .3, i % 3 ? LEAF[3] : LEAF[4]); }
      const ks = [.12, .3, .5, .7, .88]; ks.forEach((k, i) => { const a = a0 + (a1 - a0) * k; flower(cx + Math.cos(a) * R0, cy + Math.sin(a) * R0, i === 2 ? 46 : 30 + (i % 2) * 6, i * .9, PET[i % PET.length]); });
      for (let i = 0; i < 8; i++) { const a = a0 + (a1 - a0) * r(), x = cx + Math.cos(a) * (R0 + (r() - .5) * 40), y = cy + Math.sin(a) * (R0 + (r() - .5) * 40); ctx.fillStyle = '#f3e6d4'; ctx.beginPath(); ctx.arc(x, y, 6 + r() * 4, 0, 6.28); ctx.fill(); ctx.strokeStyle = 'rgba(184,134,47,.6)'; ctx.lineWidth = 2; ctx.stroke(); }
    }
    function sprig(x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); leaf(0, 0, 150, -.5, LEAF[1]); leaf(0, 0, 150, .5, LEAF[1]); leaf(0, 0, 120, -1.1, LEAF[2]); leaf(0, 0, 120, 1.1, LEAF[2]); ctx.restore(); }
    function petals(n, x0, y0, x1, y1) { for (let i = 0; i < n; i++) { const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0); ctx.save(); ctx.translate(x, y); ctx.rotate(R() * 6.28); ctx.fillStyle = PET[(R() * PET.length) | 0]; ctx.globalAlpha = .55 + R() * .4; ctx.beginPath(); ctx.ellipse(0, 0, 6 + R() * 6, 10 + R() * 8, 0, 0, 6.28); ctx.fill(); ctx.restore(); } }
    function garland(y, x0, x1, n, sag) {
      ctx.strokeStyle = '#8a9f84'; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const t = i / 40, x = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * sag; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke();
      for (let i = 0; i < n; i++) { const t = (i + .5) / n, x = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * sag; leaf(x, yy, 52, 1.2 + i * .9, LEAF[1]); leaf(x, yy, 52, -1.2 - i * .7, LEAF[2]); flower(x, yy + 8, 34 + ((i % 3) * 5), i * .7, PET[i % PET.length]); }
    }
    function bg() {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, T.bg[0]); g.addColorStop(.55, T.bg[1]); g.addColorStop(1, T.bg[2]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 30; i++) { const x = R() * W, y = R() * H, r = 40 + R() * 110; const gg = ctx.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, 'rgba(255,255,255,' + (.18 + R() * .2) + ')'); gg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gg; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
      for (let i = 0; i < 22; i++) sparkle(R() * W, R() * H, 7 + R() * 12, .3 + R() * .4);
    }
    function frame() { ctx.strokeStyle = '#c99a45'; ctx.lineWidth = 4; ctx.strokeRect(70, 70, W - 140, H - 140); ctx.strokeStyle = 'rgba(201,154,69,.5)'; ctx.lineWidth = 2; ctx.strokeRect(96, 96, W - 192, H - 192); }
    function cornerFlowers() { sprig(150, H - 170, 1, -.9); sprig(W - 150, H - 170, 1, -2.25); flower(190, H - 205, 62, .2, PET[0]); flower(300, H - 150, 36, .7, PET[1]); flower(W - 190, H - 205, 62, -.2, PET[2]); flower(W - 300, H - 150, 36, -.6, PET[3]); sparkle(250, H - 290, 16, .9); sparkle(W - 250, H - 290, 16, .9); }
    function qrFrame(fx, fy, frameU) {
      ctx.save(); ctx.shadowColor = 'rgba(90,42,60,.35)'; ctx.shadowBlur = 24 * S; ctx.fillStyle = '#fff';
      const r = 30, x = fx, y = fy, w = frameU, h = frameU; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.strokeStyle = '#c99a45'; ctx.lineWidth = 5; ctx.stroke();
      if (qrImg) { ctx.imageSmoothingEnabled = false; ctx.drawImage(qrImg, fx + 8, fy + 8, frameU - 16, frameU - 16); ctx.imageSmoothingEnabled = true; }
    }

    ctx.setTransform(S, 0, 0, S, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const qw = qrImg ? qrImg.width : (o.qrW || 0); // o.qrW: size the frame for a QR that is drawn later (vector in the PDF)
    const frameU = QRPX * (qw ? qw / (qw - 320) : 1) / S;
    const info = { frameU, layout: LAYOUT };

    if (LAYOUT === 'back') {
      bg(); frame(); petals(40, 120, 120, W - 120, H * .25); petals(40, 120, H * .78, W - 120, H - 120);
      const cy = H * .5;
      flower(W / 2, cy - 70, 80, 0, PET[0]); sprig(W / 2 - 120, cy - 40, .6, 3.4); sprig(W / 2 + 120, cy - 40, .6, -.25);
      txt('Made with love', W / 2, cy + 90, 'italic 500 52px ' + FONT, INK);
      txt('HEARTFULLY STORE', W / 2 + 8, cy + 155, '500 30px ' + FONT, GOLD, '14px');
      return info;
    }
    if (LAYOUT === 'insideleft') {
      bg();
      const m = 215; ctx.strokeStyle = '#c99a45'; ctx.lineWidth = 5; ctx.strokeRect(m, m + 60, W - 2 * m, H - 2 * m - 120); ctx.strokeStyle = 'rgba(201,154,69,.5)'; ctx.lineWidth = 2; ctx.strokeRect(m + 22, m + 82, W - 2 * m - 44, H - 2 * m - 164);
      ctx.fillStyle = 'rgba(255,252,248,.97)'; ctx.fillRect(m + 26, m + 86, W - 2 * m - 52, H - 2 * m - 172);
      ctx.strokeStyle = 'rgba(185,110,130,.16)'; ctx.lineWidth = 2; for (let y = m + 420; y < H - m - 160; y += 92) { ctx.beginPath(); ctx.moveTo(m + 110, y); ctx.lineTo(W - m - 110, y); ctx.stroke(); }
      for (const [cx, cy2] of [[m, m + 60], [W - m, m + 60], [m, H - m - 60], [W - m, H - m - 60]]) { flower(cx, cy2, 56, R() * .6 - .3, PET[(R() * 5) | 0]); sparkle(cx + (cx < W / 2 ? 70 : -70), cy2 + (cy2 < H / 2 ? -40 : 40), 14, .9); }
      txt('A few words just for you', W / 2, m + 220, 'italic 500 56px ' + FONT, INK);
      flower(W / 2, m + 290, 22, 0, PET[1]);
      return info;
    }
    if (LAYOUT === 'inside') {
      bg(); frame();
      garland(150, 110, W - 110, 8, 55);
      const lines = MSG;
      const lh = 64, py = H * .26, y0 = py + 40;
      lines.forEach((s, i) => { if (s) txt(s, W / 2, y0 + i * lh, fit(s, 'italic 500', 46, 1180, 30), INK); });
      const fy0 = y0 + lines.length * lh + 50;
      txt(SIGN, W / 2, fy0, fit(SIGN, 'italic 700', 62, 1180, 36), GOLD);
      flower(W / 2, fy0 + 80, 36, 0, PET[0]);
      const fx = W - 170 - frameU, fy = H - 190 - frameU; qrFrame(fx, fy, frameU);
      ctx.textAlign = 'right'; txt('Scan me to watch', fx - 34, fy + frameU / 2 - 14, 'italic 600 42px ' + FONT, INK); txt('your video message', fx - 34, fy + frameU / 2 + 40, 'italic 500 40px ' + FONT, INK); ctx.textAlign = 'center';
      info.qrFrame = [fx, fy, frameU]; info.lastY = fy0 + 114;
      return info;
    }
    // cover / flat
    bg(); frame();
    const top = H * .255;
    petals(46, 130, 130, W - 130, top - 90); sprig(W / 2 - 70, 190, .55, -2.6); sprig(W / 2 + 70, 190, .55, -.55); flower(W / 2, 200, 44, 0, PET[0]); flower(W / 2 - 95, 215, 26, .5, PET[1]); flower(W / 2 + 95, 215, 26, -.5, PET[3]);
    const wcy = H * .47; wreath(W / 2, wcy, 610, Math.PI * 0.765, Math.PI * 1.25, 11); wreath(W / 2, wcy, 610, Math.PI * 0.235, -Math.PI * 0.25, 12);
    txt(TOP, W / 2 + 9, top, '500 44px ' + FONT, GOLD, '14px');
    ctx.strokeStyle = '#c99a45'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 300, top + 34); ctx.lineTo(W / 2 - 22, top + 34); ctx.moveTo(W / 2 + 22, top + 34); ctx.lineTo(W / 2 + 300, top + 34); ctx.stroke();
    flower(W / 2, top + 34, 15, 0, PET[1]);
    const yH = H * .40, yM = yH + 240;
    txt(G1, W / 2, yH, fit(G1, 'italic 600', 118, 1000, 60), INK);
    const gx = ctx.createLinearGradient(W / 2 - 420, yM - 260, W / 2 + 420, yM); gx.addColorStop(0, '#c99a45'); gx.addColorStop(.4, '#e6b85c'); gx.addColorStop(.65, '#c28a2c'); gx.addColorStop(1, '#8f5e12');
    let fs = 195; ctx.font = 'italic 700 ' + fs + 'px ' + FONT; while (ctx.measureText(NAME).width > 940 && fs > 90) { fs -= 5; ctx.font = 'italic 700 ' + fs + 'px ' + FONT; }
    ctx.fillStyle = 'rgba(40,20,30,.18)'; ctx.fillText(NAME, W / 2 + 6, yM + 8); info.heroFont = fs; ctx.fillStyle = gx; ctx.fillText(NAME, W / 2, yM);
    const hy = yM + 150; flower(W / 2, hy, 50, 0, PET[0]);
    ctx.strokeStyle = 'rgba(201,154,69,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 430, hy); ctx.lineTo(W / 2 - 90, hy); ctx.moveTo(W / 2 + 90, hy); ctx.lineTo(W / 2 + 430, hy); ctx.stroke();
    if (LAYOUT === 'flat') {
      const fTop = H - 215 - frameU, fx = (W - frameU) / 2; qrFrame(fx, fTop, frameU);
      txt('Scan me to watch your video message', W / 2, H - 140, 'italic 500 44px ' + FONT, INK); info.qrFrame = [fx, fTop, frameU];
    } else {
      cornerFlowers(); petals(50, 140, H * .84, W - 140, H - 130); txt(SUB, W / 2, hy + 125, fit(SUB, 'italic 500', 66, 1050, 36), INK);
      flower(W / 2, H * .83, 80, 0, PET[0]); flower(W / 2 - 150, H * .855, 42, -.25, PET[2]); flower(W / 2 + 150, H * .855, 42, .25, PET[3]); sparkle(W / 2 - 90, H * .78, 14, .9); sparkle(W / 2 + 95, H * .79, 12, .9);
    }
    return info;
  }

  function qrCanvas(url, hex) {
    const q = qrcode(0, 'M'); q.addData(url); q.make();
    const n = q.getModuleCount(), M = 40, Q = 4, size = (n + 2 * Q) * M;
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, size, size); x.fillStyle = '#' + (hex || '5a2a3c');
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect((k + Q) * M, (r + Q) * M, M, M);
    c.modules = n; return c;
  }

  // module matrix for vector drawing in the PDF
  function qrMatrix(url) { const q = qrcode(0, 'M'); q.addData(url); q.make(); return { n: q.getModuleCount(), dark: (r, c) => q.isDark(r, c) }; }

  async function fontsReady() {
    await Promise.all(['500 40px', 'italic 500 44px', 'italic 600 150px', 'italic 700 195px'].map(f => document.fonts.load(f + ' ' + FONT)));
  }
  return { render, qrCanvas, qrMatrix, fontsReady, THEMES, DEFAULT_MSG };
})();
