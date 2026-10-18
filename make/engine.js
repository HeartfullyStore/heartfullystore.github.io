/* HeartfullyStore card engine (browser port of card.html, 2026-10-18).
   CardEngine.render(canvas, o) draws one panel.
   o = {w,h,layout:'cover'|'inside'|'flat'|'back'|'insideleft', style:'floral'|'modern'|'party'|'winter', theme, name, g1, sub, msg:[...], sign, top, qr:canvas|null, qrpx}
   CardEngine.qrCanvas(url, hex) -> canvas with 40 px modules and a 4-module quiet zone (same geometry as qr.py). */
window.CardEngine = (function () {
  const FONT = 'HFText', DISP = 'HFDisplay', CAPS = 'HFText';
  const THEMES = {
    rose: { pet: ['#c98b8f', '#e3b3b0', '#b56d76', '#efcdb8', '#a9757a'], ink: '#5b3440', gold: '#b8862f', bg: ['#fcf8f0', '#f6ece0', '#eadcc9'], leaf: ['#7fa38a', '#8fa98c', '#a7bba0', '#7e9a7c', '#9db497'], qr: '5a2a3c' },
    navy: { pet: ['#e6b85c', '#f3d58a', '#c99a45', '#f7e3b0', '#d4a640'], ink: '#17233a', gold: '#c9a24a', bg: ['#f7f4ec', '#efe9dc', '#e3dbc8'], leaf: ['#5f7d8c', '#6f8d9c', '#8aa5b2', '#50707f', '#7c98a6'], qr: '17233a' },
    wine: { pet: ['#b23a48', '#d4606c', '#8f2432', '#e8a0a8', '#a12f3c'], ink: '#4a1f2a', gold: '#c9a24a', bg: ['#fbf5f1', '#f4e9e3', '#eadcd4'], leaf: ['#7a8f6e', '#8aa07c', '#9fb391', '#6c8060', '#93a785'], qr: '4a1f2a' },
    green: { pet: ['#b8343f', '#d9565f', '#8f1f2a', '#e8b4b8', '#a62b36'], ink: '#1f3d2f', gold: '#c9a24a', bg: ['#f9f7f0', '#f1ede0', '#e6e0cd'], leaf: ['#2f6a4a', '#3f7d5a', '#5a9472', '#27573d', '#4e8a66'], qr: '1f3d2f' },
    lavender: { pet: ['#9b86c2', '#b8a6d6', '#7b63a8', '#d9cdea', '#8c74b8'], ink: '#3b2f55', gold: '#b8862f', bg: ['#faf7fc', '#f1ecf6', '#e6dfee'], leaf: ['#7fa38a', '#8fa98c', '#a7bba0', '#7e9a7c', '#9db497'], qr: '3b2f55' },
    // Modern (minimal arch)
    ivory: { pet: ['#b08d57', '#d8c3a0', '#8c6a3a', '#efe3cf', '#c7a978'], ink: '#2b2a33', gold: '#a8834b', bg: ['#fbf8f2', '#f5efe5', '#ece4d6'], leaf: ['#b08d57', '#c7a978', '#d8c3a0', '#8c6a3a', '#efe3cf'], qr: '2b2a33' },
    sage: { pet: ['#8a9a6a', '#b9c4a2', '#6d7d52', '#dfe5d3', '#a3b088'], ink: '#2f4036', gold: '#7d8a5c', bg: ['#f6f7f1', '#eef0e6', '#e3e7d8'], leaf: ['#8a9a6a', '#a3b088', '#b9c4a2', '#6d7d52', '#dfe5d3'], qr: '2f4036' },
    blush: { pet: ['#c27b6e', '#e6b7ad', '#a35d52', '#f5ddd7', '#d6988c'], ink: '#5a2e3a', gold: '#b86f63', bg: ['#fcf6f3', '#f8ece8', '#f1dfd9'], leaf: ['#c27b6e', '#d6988c', '#e6b7ad', '#a35d52', '#f5ddd7'], qr: '5a2e3a' },
    slate: { pet: ['#9a7b4f', '#c9b593', '#5d6f8c', '#e4dccd', '#7d8fab'], ink: '#1f2f4a', gold: '#9a7b4f', bg: ['#f6f7f9', '#edf0f4', '#e1e6ed'], leaf: ['#9a7b4f', '#c9b593', '#5d6f8c', '#7d8fab', '#e4dccd'], qr: '1f2f4a' },
    // Party (balloons + confetti)
    sunny: { pet: ['#f4a93b', '#ef6f6c', '#4fb3a9', '#8a6fd1', '#f7c948'], ink: '#2f3550', gold: '#e2554f', bg: ['#fffaf0', '#fff3e0', '#fde9cf'], leaf: ['#4fb3a9', '#f4a93b', '#ef6f6c', '#8a6fd1', '#f7c948'], qr: '2f3550' },
    candy: { pet: ['#f27fa6', '#b07fe0', '#7fcfe0', '#ffc95e', '#ff9db9'], ink: '#4a2a4f', gold: '#d94f8a', bg: ['#fff8fb', '#fdeef4', '#f8e2ec'], leaf: ['#b07fe0', '#f27fa6', '#7fcfe0', '#ffc95e', '#ff9db9'], qr: '4a2a4f' },
    ocean: { pet: ['#3d8fd6', '#5cc8c2', '#f2b84b', '#ef7d6b', '#8fb2ee'], ink: '#1d3557', gold: '#2f7cc4', bg: ['#f6fbff', '#eaf4fb', '#dcecf6'], leaf: ['#5cc8c2', '#3d8fd6', '#f2b84b', '#ef7d6b', '#8fb2ee'], qr: '1d3557' },
    // Winter (pine + ornaments)
    pine: { pet: ['#b8343f', '#d9a64a', '#9e2a35', '#e8d6a8', '#c7474f'], ink: '#1f3d2f', gold: '#b8862f', bg: ['#fbf8f1', '#f2ede1', '#e7e0cd'], leaf: ['#2f6a4a', '#3f7d5a', '#27573d', '#4e8a66', '#5a9472'], qr: '1f3d2f' },
    frost: { pet: ['#5b7fb8', '#c9a24a', '#2f4a7a', '#d7e2f1', '#8fb0d9'], ink: '#1c2b4a', gold: '#a8863f', bg: ['#f8fafd', '#edf2f8', '#dfe7f2'], leaf: ['#4f6f86', '#5f7f96', '#3f5f76', '#7f9cb2', '#6c8aa0'], qr: '1c2b4a' },
  };
  // Atelier (letterpress + foil). foil = gradient stops for the foil layer.
  Object.assign(THEMES, {
    champagne: { pet: ['#c9a35c', '#e6cf9a', '#a8843e', '#f1e4c4', '#b8924a'], ink: '#2b2326', gold: '#a8843e', bg: ['#fbf7ef', '#f6efe2', '#efe6d5'], leaf: ['#b8924a', '#c9a35c', '#d9bd85', '#8f6f32', '#e6cf9a'], qr: '2b2326', foil: ['#6e5020', '#b08743', '#ead8a4', '#a47b37', '#6f5124', '#d0ae6b', '#8a682d'] },
    bordeaux: { pet: ['#8c2f45', '#c27a86', '#6d2335', '#ecd3d4', '#a24a5c'], ink: '#55192a', gold: '#a8843e', bg: ['#fcf6f1', '#f6ece5', '#efdfd6'], leaf: ['#6d2335', '#8c2f45', '#c27a86', '#55192a', '#ecd3d4'], qr: '55192a', foil: ['#6e5020', '#b08743', '#ead8a4', '#a47b37', '#6f5124', '#d0ae6b', '#8a682d'] },
    midnight: { pet: ['#8e9bb3', '#c8d0de', '#5d6a85', '#e6eaf1', '#a7b2c6'], ink: '#1b2438', gold: '#8e96a6', bg: ['#f9f8f5', '#f2f0eb', '#e8e5de'], leaf: ['#1b2438', '#5d6a85', '#8e9bb3', '#2f3a52', '#c8d0de'], qr: '1b2438', foil: ['#6f737c', '#b9bec8', '#f3f5f8', '#9ba1ad', '#646973', '#d9dde4', '#868c97'] },
    rosegold: { pet: ['#c98d7e', '#e9c2b6', '#a8695b', '#f6e2da', '#b97a6b'], ink: '#4a2c2e', gold: '#b97a6b', bg: ['#fdf7f3', '#f9ede7', '#f2e0d8'], leaf: ['#b97a6b', '#c98d7e', '#e9c2b6', '#8f5547', '#f6e2da'], qr: '4a2c2e', foil: ['#8a5548', '#c98d7a', '#f6d9cc', '#b77a68', '#8e5a4c', '#e3b4a4', '#a26a5a'] },
  });
  const STYLES = {
    atelier: { label: 'Atelier', palettes: ['champagne', 'bordeaux', 'midnight', 'rosegold'] },
    floral: { label: 'Floral', palettes: ['rose', 'navy', 'wine', 'green', 'lavender'] },
    modern: { label: 'Modern', palettes: ['ivory', 'sage', 'blush', 'slate'] },
    party: { label: 'Party', palettes: ['sunny', 'candy', 'ocean'] },
    winter: { label: 'Winter', palettes: ['pine', 'frost'] },
  };
  const PALETTE_NAMES = { champagne: 'Champagne', bordeaux: 'Bordeaux', midnight: 'Midnight', rosegold: 'Rose gold', rose: 'Rose', navy: 'Navy', wine: 'Wine', green: 'Holly', lavender: 'Lilac', ivory: 'Ivory', sage: 'Sage', blush: 'Blush', slate: 'Slate', sunny: 'Sunny', candy: 'Candy', ocean: 'Ocean', pine: 'Pine', frost: 'Frost' };
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
    let ctx = cv.getContext('2d');
    const R = mulberry(2027);
    const PET = T.pet, LEAF = T.leaf, INK = T.ink, GOLD = T.gold;
    const hasLS = 'letterSpacing' in ctx;

    function txt(s, x, y, font, fill, ls) { ctx.font = font; if (hasLS) ctx.letterSpacing = ls || '0px'; ctx.fillStyle = fill; ctx.fillText(s, x, y); if (hasLS) ctx.letterSpacing = '0px'; }
    // shrink a font until the text fits maxW (added for free-text fields)
    function fit(s, style, size, maxW, min, fam) { fam = fam || FONT; let fs = size; ctx.font = style + ' ' + fs + 'px ' + fam; while (ctx.measureText(s).width > maxW && fs > min) { fs -= 2; ctx.font = style + ' ' + fs + 'px ' + fam; } return style + ' ' + fs + 'px ' + fam; }
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
      if (STYLE === 'atelier') { ctx.strokeStyle = T.gold; ctx.lineWidth = 2.5; ctx.stroke(); ctx.globalAlpha = .55; rr(x - 16, y - 16, w + 32, h + 32, r + 12); ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1; }
      else { ctx.strokeStyle = '#c99a45'; ctx.lineWidth = 5; ctx.stroke(); }
      if (qrImg) { ctx.imageSmoothingEnabled = false; ctx.drawImage(qrImg, fx + 8, fy + 8, frameU - 16, frameU - 16); ctx.imageSmoothingEnabled = true; }
    }

    const STYLE = STYLES[o.style] ? o.style : 'atelier';
    ctx.setTransform(S, 0, 0, S, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const qw = qrImg ? qrImg.width : (o.qrW || 0); // o.qrW: size the frame for a QR that is drawn later (vector in the PDF)
    const frameU = QRPX * (qw ? qw / (qw - 320) : 1) / S;
    const info = { frameU, layout: LAYOUT };
    

    // ---------- shared helpers for the newer styles ----------
    function plainBg(blobs) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, T.bg[0]); g.addColorStop(.6, T.bg[1]); g.addColorStop(1, T.bg[2]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < (blobs || 0); i++) { const x = R() * W, y = R() * H, r = 60 + R() * 140; const gg = ctx.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, 'rgba(255,255,255,' + (.16 + R() * .2) + ')'); gg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gg; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
      ctx.fillStyle = 'rgba(60,40,30,.035)'; for (let i = 0; i < 900; i++) { ctx.fillRect(R() * W, R() * H, 2, 2); }
    }
    function archPath(cx, y0, w, y1) { const r = w / 2; ctx.beginPath(); ctx.moveTo(cx - r, y1); ctx.lineTo(cx - r, y0 + r); ctx.arc(cx, y0 + r, r, Math.PI, 0); ctx.lineTo(cx + r, y1); ctx.closePath(); }
    function spark4(x, y, s, col, a) { ctx.save(); ctx.globalAlpha = a == null ? 1 : a; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s * .7, y); ctx.quadraticCurveTo(x, y, x, y + s); ctx.quadraticCurveTo(x, y, x - s * .7, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill(); ctx.restore(); }
    function rule(m, col, lw) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m); }
    function msgBlock(y0, lh, signCol) {
      MSG.forEach((s, i) => { if (s) txt(s, W / 2, y0 + i * lh, fit(s, 'italic 400', 52, 1140, 30), INK); });
      const fy0 = y0 + MSG.length * lh + 50; txt(SIGN, W / 2, fy0, fit(SIGN, 'italic 400', 74, 1140, 40, DISP), signCol); return fy0;
    }
    function insideQR(capCol) {
      const fx = W - 170 - frameU, fy = H - 190 - frameU; qrFrame(fx, fy, frameU);
      ctx.textAlign = 'right'; txt('Scan me to watch', fx - 34, fy + frameU / 2 - 14, 'italic 600 42px ' + FONT, capCol || INK); txt('your video message', fx - 34, fy + frameU / 2 + 40, 'italic 500 40px ' + FONT, capCol || INK); ctx.textAlign = 'center';
      info.qrFrame = [fx, fy, frameU];
    }
    function flatQR() { const fTop = H - 215 - frameU, fx = (W - frameU) / 2; qrFrame(fx, fTop, frameU); txt('Scan me to watch your video message', W / 2, H - 140, 'italic 500 44px ' + FONT, INK); info.qrFrame = [fx, fTop, frameU]; }
    function writeLines(top, bottom) { ctx.strokeStyle = 'rgba(120,100,90,.16)'; ctx.lineWidth = 2; for (let y = top; y < bottom; y += 92) { ctx.beginPath(); ctx.moveTo(300, y); ctx.lineTo(W - 300, y); ctx.stroke(); } }
    function backText(y) { txt('Made with love', W / 2, y, 'italic 400 60px ' + DISP, INK); txt('HEARTFULLY', W / 2 + 9, y + 70, '500 30px ' + CAPS, GOLD, '18px'); }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

    // ---------- ATELIER: letterpress stock, blind emboss, foil monogram ----------
    if (STYLE === 'atelier') {
      const FOIL = T.foil || ['#6e5020', '#b08743', '#ead8a4', '#a47b37', '#6f5124', '#d0ae6b', '#8a682d'];
      const MONO = ((o.name || 'F').trim().charAt(0) || 'F').toUpperCase();
      function paper() {
        const g = ctx.createLinearGradient(0, 0, W * .3, H); g.addColorStop(0, T.bg[0]); g.addColorStop(.6, T.bg[1]); g.addColorStop(1, T.bg[2]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        const v = ctx.createRadialGradient(W * .42, H * .32, H * .1, W / 2, H / 2, H * .78); v.addColorStop(0, 'rgba(255,255,255,.16)'); v.addColorStop(1, 'rgba(120,90,60,.08)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
        ctx.lineCap = 'round';
        for (let i = 0; i < 2600; i++) { const x = R() * W, y = R() * H, a = R() * 6.28, l = 3 + R() * 9; ctx.strokeStyle = R() < .55 ? 'rgba(110,85,55,' + (.03 + R() * .05) + ')' : 'rgba(255,255,255,' + (.25 + R() * .3) + ')'; ctx.lineWidth = .8 + R() * 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }
        ctx.lineCap = 'butt';
      }
      function emboss(m) {
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.strokeRect(m - 1.5, m - 1.5, W - 2 * m, H - 2 * m);
        ctx.strokeStyle = 'rgba(90,65,40,.16)'; ctx.strokeRect(m + 1.5, m + 1.5, W - 2 * m, H - 2 * m);
      }
      // draw shapes into a layer, then dress it as hot-foil (gradient + grain + sheen)
      function foil(draw, y0, y1) {
        const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
        const main = ctx; ctx = c.getContext('2d'); ctx.setTransform(S, 0, 0, S, 0, 0); ctx.textAlign = 'center'; ctx.fillStyle = '#000'; ctx.strokeStyle = '#000';
        draw();
        ctx.globalCompositeOperation = 'source-in';
        const g = ctx.createLinearGradient(W * .18, y0, W * .82, y1); FOIL.forEach((col, i) => g.addColorStop(i / (FOIL.length - 1), col)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-atop';
        const sh = ctx.createLinearGradient(W * .2, y0, W * .7, y1 + 200); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.47, 'rgba(255,252,235,.0)'); sh.addColorStop(.52, 'rgba(255,252,235,.38)'); sh.addColorStop(.57, 'rgba(255,252,235,0)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 2600; i++) { const x = W * .1 + R() * W * .8, y = y0 - 60 + R() * (y1 - y0 + 120); ctx.fillStyle = R() < .5 ? 'rgba(255,248,220,.45)' : 'rgba(70,45,10,.30)'; ctx.fillRect(x, y, 2.2, 2.2); }
        ctx = main; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.shadowColor = 'rgba(70,45,15,.30)'; ctx.shadowBlur = 2.5 * S; ctx.shadowOffsetY = 1.6 * S; ctx.drawImage(c, 0, 0);
        ctx.shadowColor = 'transparent'; ctx.globalAlpha = .22; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(c, -1, -1); ctx.restore();
        c.width = c.height = 1;
      }
      function laurelSide(cx, cy, r, sd) {
        // stem
        ctx.lineWidth = 3.2; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = Math.PI / 2 + sd * (0.18 + i / 40 * 2.05); const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
        for (let i = 0; i < 11; i++) {
          const t = (i + .6) / 11, a = Math.PI / 2 + sd * (0.18 + t * 2.05), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, dir = a + sd * Math.PI / 2, l = 34 - t * 10;
          for (const k of [-1, 1]) { ctx.save(); ctx.translate(x, y); ctx.rotate(dir + k * .62 * sd); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(l * .5, -l * .3, l, 0); ctx.quadraticCurveTo(l * .5, l * .3, 0, 0); ctx.fill(); ctx.restore(); }
        }
      }
      function crest(cx, cy, r, withRing) {
        foil(() => {
          laurelSide(cx, cy, r, 1); laurelSide(cx, cy, r, -1);
          if (withRing) { ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r * .74, 0, 6.283); ctx.stroke(); }
          ctx.font = 'italic 400 ' + Math.round(r * 1.18) + 'px ' + DISP; ctx.textBaseline = 'middle'; ctx.fillText(MONO, cx - r * .03, cy + r * .04); ctx.textBaseline = 'alphabetic';
          diamond(cx, cy - r - 14, 7);
        }, cy - r - 30, cy + r + 30);
      }
      function diamond(x, y, s) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y); ctx.closePath(); ctx.fill(); }
      function foilRule(y, half) { ctx.fillRect(W / 2 - half, y - 1.25, half - 26, 2.5); ctx.fillRect(W / 2 + 26, y - 1.25, half - 26, 2.5); diamond(W / 2, y, 10); }
      // fine engraved botanical: outline leaves + hatching, in ink
      function engraved(x, y, len, rot, flip) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, flip ? -1 : 1);
        ctx.strokeStyle = INK; ctx.globalAlpha = .62; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * .5, -len * .12, len, -len * .04); ctx.stroke();
        for (let i = 0; i < 9; i++) {
          const t = .12 + i * .1, px = len * t, py = -len * .12 * 4 * t * (1 - t) * .5 - len * .04 * t, side = i % 2 ? 1 : -1, l = 70 - i * 4.5;
          ctx.save(); ctx.translate(px, py); ctx.rotate(side * (.75 - t * .25) - .12);
          ctx.lineWidth = 1.9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(l * .3, -l * .34, l * .78, -l * .26, l, 0); ctx.bezierCurveTo(l * .78, l * .24, l * .3, l * .3, 0, 0); ctx.stroke();
          ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(l * .9, 0); ctx.stroke();
          ctx.lineWidth = 1; for (let h = 1; h < 6; h++) { const hx = l * h / 6.2; ctx.beginPath(); ctx.moveTo(hx, 1.5); ctx.lineTo(hx + l * .07, l * .2 * Math.sin(Math.PI * h / 6.2)); ctx.stroke(); }
          ctx.restore();
        }
        ctx.lineWidth = 1.9; ctx.beginPath(); ctx.moveTo(len, -len * .04); ctx.bezierCurveTo(len + 30, -len * .04 - 20, len + 50, -len * .04 - 10, len + 64, -len * .04 + 2); ctx.bezierCurveTo(len + 48, -len * .04 + 14, len + 26, -len * .04 + 12, len, -len * .04); ctx.stroke();
        ctx.restore();
      }
      function spray(cy, s) { engraved(W / 2 - 18, cy, 330 * s, -Math.PI * .86, false); engraved(W / 2 + 18, cy, 330 * s, -Math.PI * .14, true); foil(() => diamond(W / 2, cy - 6, 9), cy - 20, cy + 10); }
      function caption(fx, fy) { ctx.textAlign = 'right'; txt('Scan to watch', fx - 36, fy + frameU / 2 - 12, 'italic 400 46px ' + FONT, INK); txt('your video message', fx - 36, fy + frameU / 2 + 42, 'italic 400 46px ' + FONT, INK); ctx.textAlign = 'center'; }
      paper();
      if (LAYOUT === 'back') { emboss(78); crest(W / 2, H * .42, 120, true); txt('Made with love', W / 2, H * .58, 'italic 400 60px ' + DISP, INK); txt('HEARTFULLY', W / 2 + 9, H * .58 + 72, '500 30px ' + CAPS, INK, '18px'); return info; }
      if (LAYOUT === 'insideleft') {
        emboss(78); crest(W / 2, H * .17, 90, false);
        txt('A few words just for you', W / 2, H * .17 + 210, 'italic 400 66px ' + DISP, INK);
        ctx.strokeStyle = 'rgba(90,70,50,.14)'; ctx.lineWidth = 2; for (let y = H * .17 + 380; y < H - 260; y += 96) { ctx.beginPath(); ctx.moveTo(250, y); ctx.lineTo(W - 250, y); ctx.stroke(); }
        return info;
      }
      if (LAYOUT === 'inside') {
        emboss(78); crest(W / 2, H * .13, 84, false);
        const lh = 74, y0 = H * .29;
        MSG.forEach((s, i) => { if (s) txt(s, W / 2, y0 + i * lh, fit(s, 'italic 400', 54, 1120, 30), INK); });
        const fy0 = y0 + MSG.length * lh + 70; const sf = fit(SIGN, 'italic 400', 88, 1120, 44, DISP);
        foil(() => { ctx.font = sf; ctx.fillText(SIGN, W / 2, fy0); foilRule(fy0 + 62, 120); }, fy0 - 80, fy0 + 70);
        const fx = W - 170 - frameU, fy = H - 190 - frameU; qrFrame(fx, fy, frameU); caption(fx, fy);
        info.qrFrame = [fx, fy, frameU]; info.lastY = fy0 + 80; return info;
      }
      const flat = LAYOUT === 'flat';
      emboss(78);
      const cyC = H * (flat ? .13 : .19); crest(W / 2, cyC, flat ? 92 : 128, false);
      const yT = H * (flat ? .235 : .325), yG = H * (flat ? .32 : .425), yN = H * (flat ? .46 : .575);
      txt(TOP, W / 2 + 9, yT, '500 36px ' + CAPS, INK, '17px');
      txt(G1, W / 2, yG, fit(G1, '400', 120, 1060, 60, DISP), INK);
      let fs = 260; ctx.font = 'italic 400 ' + fs + 'px ' + DISP; while (ctx.measureText(NAME).width > 1080 && fs > 100) { fs -= 5; ctx.font = 'italic 400 ' + fs + 'px ' + DISP; }
      info.heroFont = fs; const nf = ctx.font;
      foil(() => { ctx.font = nf; ctx.fillText(NAME, W / 2, yN); foilRule(yN + 96, 230); }, yN - fs, yN + 110);
      if (flat) { const fTop = H - 215 - frameU, fx = (W - frameU) / 2; qrFrame(fx, fTop, frameU); txt('Scan to watch your video message', W / 2, H - 140, 'italic 400 48px ' + FONT, INK); info.qrFrame = [fx, fTop, frameU]; }
      else { txt(SUB, W / 2, yN + 200, fit(SUB, 'italic 400', 68, 1060, 36), INK); spray(H * .85, 1); }
      return info;
    }

    // ---------- MODERN: quiet arch, big serif name ----------
    if (STYLE === 'modern') {
      const A1 = GOLD;
      plainBg(10);
      if (LAYOUT === 'back') { archPath(W / 2, H * .34, 300, H * .56); ctx.strokeStyle = A1; ctx.lineWidth = 3; ctx.stroke(); spark4(W / 2, H * .43, 34, A1); backText(H * .64); return info; }
      if (LAYOUT === 'insideleft') {
        rule(90, A1, 3); archPath(W / 2, H * .12, 1040, H * .88); ctx.fillStyle = 'rgba(255,255,255,.62)'; ctx.fill(); ctx.strokeStyle = A1; ctx.lineWidth = 2; ctx.stroke();
        spark4(W / 2, H * .12 + 180, 26, A1); txt('A few words just for you', W / 2, H * .12 + 300, 'italic 400 66px ' + DISP, INK); writeLines(H * .12 + 470, H * .86); return info;
      }
      if (LAYOUT === 'inside') {
        rule(90, A1, 3); rule(112, 'rgba(0,0,0,.06)', 1.5);
        spark4(W / 2, H * .15, 26, A1); ctx.strokeStyle = A1; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 220, H * .15); ctx.lineTo(W / 2 - 50, H * .15); ctx.moveTo(W / 2 + 50, H * .15); ctx.lineTo(W / 2 + 220, H * .15); ctx.stroke();
        const fy0 = msgBlock(H * .26, 66, A1);
        for (let i = -1; i <= 1; i++) { ctx.fillStyle = A1; ctx.beginPath(); ctx.arc(W / 2 + i * 34, fy0 + 70, 6, 0, 6.28); ctx.fill(); }
        insideQR(); info.lastY = fy0 + 90; return info;
      }
      const flat = LAYOUT === 'flat', fTop = H - 215 - frameU;
      const a0 = flat ? 150 : H * .1, a1 = flat ? fTop - 70 : H * .9, A = a1 - a0;
      rule(70, 'rgba(0,0,0,.05)', 1.5);
      archPath(W / 2, a0, 1080, a1); ctx.save(); ctx.shadowColor = 'rgba(60,40,30,.10)'; ctx.shadowBlur = 50 * S; ctx.shadowOffsetY = 14 * S; ctx.fillStyle = 'rgba(255,255,255,.66)'; ctx.fill(); ctx.restore();
      ctx.strokeStyle = A1; ctx.lineWidth = 3; ctx.stroke(); archPath(W / 2, a0 + 28, 1024, a1 - 28); ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 1.5; ctx.stroke();
      spark4(W / 2, a0 + A * .13, 34, A1); spark4(W / 2 - 70, a0 + A * .15, 14, A1, .7); spark4(W / 2 + 70, a0 + A * .15, 14, A1, .7);
      const yT = a0 + A * .26; txt(TOP, W / 2 + 8, yT, '500 36px ' + CAPS, A1, '16px');
      const yG = a0 + A * .40; txt(G1, W / 2, yG, fit(G1, 'italic 400', 112, 880, 56, DISP), INK);
      const yN = a0 + A * (flat ? .62 : .58);
      let fs = 240; ctx.font = '400 ' + fs + 'px ' + DISP; while (ctx.measureText(NAME).width > 900 && fs > 96) { fs -= 5; ctx.font = '400 ' + fs + 'px ' + DISP; }
      ctx.fillStyle = INK; ctx.fillText(NAME, W / 2, yN); info.heroFont = fs;
      ctx.strokeStyle = A1; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(W / 2 - 150, yN + 66); ctx.quadraticCurveTo(W / 2, yN + 96, W / 2 + 150, yN + 66); ctx.stroke(); ctx.lineCap = 'butt';
      if (!flat) { txt(SUB, W / 2, a0 + A * .72, fit(SUB, 'italic 500', 58, 820, 34), INK); for (let i = -1; i <= 1; i++) { ctx.fillStyle = A1; ctx.beginPath(); ctx.arc(W / 2 + i * 34, a0 + A * .84, 6, 0, 6.28); ctx.fill(); } }
      if (flat) flatQR();
      return info;
    }

    // ---------- PARTY: bunting, balloons, confetti, colorful name ----------
    if (STYLE === 'party') {
      const COLS = PET.concat([GOLD]);
      function confetti(n, ax0, ay0, ax1, ay1) {
        for (let i = 0; i < n; i++) {
          const x = R() * W, y = R() * H; if (x > ax0 && x < ax1 && y > ay0 && y < ay1 && R() < .92) continue;
          ctx.save(); ctx.translate(x, y); ctx.rotate(R() * 6.28); ctx.fillStyle = COLS[(R() * COLS.length) | 0]; ctx.globalAlpha = .7 + R() * .3; const k = R();
          if (k < .45) ctx.fillRect(-7, -14, 14, 28); else if (k < .8) { ctx.beginPath(); ctx.arc(0, 0, 7 + R() * 5, 0, 6.28); ctx.fill(); }
          else { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.bezierCurveTo(-8, -14, 8, 14, 18, 0); ctx.stroke(); }
          ctx.restore();
        }
      }
      function balloon(x, y, r, col, len, sway) {
        const by = y + r * 1.18;
        ctx.strokeStyle = 'rgba(70,60,70,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, by + 12); ctx.bezierCurveTo(x + sway, by + len * .35, x - sway, by + len * .7, x + sway * .5, by + len); ctx.stroke();
        ctx.save(); ctx.shadowColor = 'rgba(40,30,50,.22)'; ctx.shadowBlur = r * .35 * S; ctx.shadowOffsetY = r * .1 * S;
        const g = ctx.createRadialGradient(x - r * .35, y - r * .45, r * .05, x, y, r * 1.25); g.addColorStop(0, shade(col, .55)); g.addColorStop(.5, col); g.addColorStop(1, shade(col, -.25));
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.18, 0, 0, 6.28); ctx.fill(); ctx.restore();
        ctx.fillStyle = shade(col, -.2); ctx.beginPath(); ctx.moveTo(x, by - 4); ctx.lineTo(x - 13, by + 14); ctx.lineTo(x + 13, by + 14); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x - r * .42, y - r * .45, r * .13, r * .26, .5, 0, 6.28); ctx.fill(); ctx.restore();
      }
      function bunting(y, x0, x1, n, sag, size) {
        ctx.strokeStyle = 'rgba(70,60,70,.5)'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const t = i / 40, x = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * sag; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke();
        for (let i = 0; i < n; i++) {
          const t = (i + .5) / n, x = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * sag, sl = Math.atan(Math.cos(t * Math.PI) * Math.PI * sag / (x1 - x0));
          ctx.save(); ctx.translate(x, yy); ctx.rotate(sl); ctx.fillStyle = COLS[i % COLS.length]; ctx.beginPath(); ctx.moveTo(-size * .45, 0); ctx.lineTo(size * .45, 0); ctx.lineTo(0, size); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.moveTo(-size * .45, 0); ctx.lineTo(0, 0); ctx.lineTo(0, size); ctx.closePath(); ctx.fill(); ctx.restore();
        }
      }
      function rainbowName(s, y, size, maxW) {
        let fs = size; const ls = 4; ctx.font = '700 ' + fs + 'px ' + FONT; const wOf = () => { let w = 0; for (const ch of s) w += ctx.measureText(ch).width + ls; return w - ls; };
        while (wOf() > maxW && fs > 80) { fs -= 5; ctx.font = '700 ' + fs + 'px ' + FONT; }
        let x = W / 2 - wOf() / 2; ctx.textAlign = 'left'; let i = 0;
        for (const ch of s) { const cw = ctx.measureText(ch).width; const dy = (i % 2 ? -1 : 1) * fs * .03; ctx.fillStyle = 'rgba(40,30,60,.16)'; ctx.fillText(ch, x + 6, y + dy + 9); ctx.fillStyle = ch === ' ' ? INK : shade(PET[i % PET.length], -.08); ctx.fillText(ch, x, y + dy); x += cw + ls; if (ch !== ' ') i++; }
        ctx.textAlign = 'center'; return fs;
      }
      plainBg(14);
      if (LAYOUT === 'back') { confetti(70, 300, H * .25, 1200, H * .75); balloon(W / 2, H * .36, 120, PET[0], 260, 26); backText(H * .66); return info; }
      if (LAYOUT === 'insideleft') {
        confetti(90, 200, 330, 1300, H - 200); bunting(60, 40, W - 40, 11, 90, 100);
        ctx.fillStyle = 'rgba(255,255,255,.86)'; rr(200, 330, W - 400, H - 530, 40); ctx.fill(); ctx.strokeStyle = shade(PET[0], .3); ctx.lineWidth = 4; ctx.setLineDash([2, 16]); ctx.lineCap = 'round'; ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
        txt('A few words just for you', W / 2, 520, 'italic 400 66px ' + DISP, INK); writeLines(680, H - 260); return info;
      }
      if (LAYOUT === 'inside') {
        confetti(70, 140, 200, 1360, H - 120); bunting(50, 40, W - 40, 11, 80, 90);
        const fy0 = msgBlock(H * .25, 66, GOLD);
        star5(W / 2, fy0 + 80, 26, 0, PET[0]); star5(W / 2 - 70, fy0 + 86, 16, .3, PET[2]); star5(W / 2 + 70, fy0 + 86, 16, -.3, PET[3]);
        balloon(240, H - 470, 96, PET[1], 300, 20); balloon(380, H - 400, 70, PET[2], 260, -16);
        insideQR(); info.lastY = fy0 + 110; return info;
      }
      const flat = LAYOUT === 'flat';
      confetti(flat ? 110 : 150, 200, H * .2, 1300, flat ? H * .62 : H * .66);
      bunting(70, 30, W - 30, 12, 120, 115);
      const yT = H * .25, yG = H * .35, yN = yG + 235;
      txt(TOP, W / 2 + 7, yT, '600 38px ' + CAPS, INK, '14px');
      txt(G1, W / 2, yG, fit(G1, 'italic 400', 116, 1000, 56, DISP), INK);
      info.heroFont = rainbowName(NAME, yN, 205, 1040);
      star5(W / 2, yN + 105, 30, 0, GOLD); star5(W / 2 - 90, yN + 112, 18, .3, PET[2]); star5(W / 2 + 90, yN + 112, 18, -.3, PET[0]);
      if (flat) {
        const fTop = H - 215 - frameU; balloon(255, fTop - 10, 105, PET[0], 260, 18); balloon(1245, fTop - 10, 105, PET[2], 260, -18); balloon(395, fTop + 120, 66, PET[3], 180, -10); balloon(1105, fTop + 120, 66, PET[1], 180, 10);
        flatQR();
      } else {
        txt(SUB, W / 2, H * .63, fit(SUB, 'italic 500', 62, 1000, 34), INK);
        balloon(250, H * .74, 115, PET[0], 380, 22); balloon(430, H * .79, 90, PET[2], 300, -18); balloon(140, H * .84, 78, PET[3], 260, 12);
        balloon(W - 250, H * .74, 115, PET[1], 380, -22); balloon(W - 430, H * .79, 90, PET[4], 300, 18); balloon(W - 140, H * .84, 78, PET[2], 260, -12);
      }
      return info;
    }

    // ---------- WINTER: pine branches, ornaments, snow ----------
    if (STYLE === 'winter') {
      function branch(x, y, len, rot, sc) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc || 1, sc || 1); ctx.lineCap = 'round';
        ctx.strokeStyle = '#5e4c38'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * .5, -len * .04, len, 0); ctx.stroke();
        for (let layer = 0; layer < 3; layer++) {
          const n = 46;
          for (let i = 0; i < n; i++) {
            const t = i / n, px = len * t, py = -len * .04 * 4 * t * (1 - t) * .5, base = (layer === 0 ? 92 : layer === 1 ? 80 : 62) * (1 - t * .45);
            for (const sd of [-1, 1]) {
              const l = base * (.75 + R() * .3), ang = sd * (.95 - layer * .18 + (R() - .5) * .25);
              const ex = px + Math.cos(ang) * l * .9 + l * .25, ey = py + Math.sin(ang) * l;
              ctx.strokeStyle = layer === 0 ? shade(LEAF[2], -.25) : LEAF[(i + layer + (sd > 0 ? 1 : 0)) % LEAF.length]; ctx.lineWidth = layer === 2 ? 4 : 5;
              ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo((px + ex) / 2 + sd * 6, (py + ey) / 2 - sd * 4, ex, ey); ctx.stroke();
            }
          }
        }
        for (let i = 0; i < 9; i++) { const a = -.7 + i * .175, l = 50 + R() * 30; ctx.strokeStyle = LEAF[i % LEAF.length]; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(len, 0); ctx.lineTo(len + Math.cos(a) * l, Math.sin(a) * l); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; for (let i = 0; i < 18; i++) { const px = len * R(), sd = R() < .5 ? -1 : 1; ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px + 30, sd * 40); ctx.stroke(); }
        ctx.restore();
      }
      function ornament(x, y, r, col, top) {
        ctx.strokeStyle = 'rgba(184,134,47,.8)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, y - r - 14); ctx.stroke();
        ctx.fillStyle = GOLD; ctx.fillRect(x - r * .28, y - r - 16, r * .56, r * .28);
        ctx.save(); ctx.shadowColor = 'rgba(30,30,40,.25)'; ctx.shadowBlur = r * .4 * S; ctx.shadowOffsetY = r * .1 * S;
        const g = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .05, x, y, r * 1.1); g.addColorStop(0, shade(col, .6)); g.addColorStop(.55, col); g.addColorStop(1, shade(col, -.3)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill(); ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, r * .96, r * .3, 0, 0, 6.28); ctx.stroke();
      }
      function flake(x, y, r, a) {
        ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.strokeStyle = shade(INK, .72); ctx.lineWidth = Math.max(2, r * .09); ctx.lineCap = 'round';
        for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r); ctx.moveTo(0, -r * .55); ctx.lineTo(-r * .25, -r * .78); ctx.moveTo(0, -r * .55); ctx.lineTo(r * .25, -r * .78); ctx.stroke(); }
        ctx.restore();
      }
      function snow(n, ax0, ay0, ax1, ay1) { for (let i = 0; i < n; i++) { const x = R() * W, y = R() * H; if (x > ax0 && x < ax1 && y > ay0 && y < ay1) continue; if (R() < .4) flake(x, y, 16 + R() * 22, .35 + R() * .35); else { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(x, y, 4 + R() * 5, 0, 6.28); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.05)'; ctx.lineWidth = 1; ctx.stroke(); } } }
      function berries(x, y) { for (const [dx, dy] of [[0, 0], [24, 10], [8, 28]]) { const g = ctx.createRadialGradient(x + dx - 4, y + dy - 4, 1, x + dx, y + dy, 15); g.addColorStop(0, '#fff2ee'); g.addColorStop(.4, PET[0]); g.addColorStop(1, shade(PET[0], -.35)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + dx, y + dy, 14, 0, 6.28); ctx.fill(); } }
      function goldName(s, y, size, maxW) {
        let fs = size * 1.18; ctx.font = 'italic 400 ' + fs + 'px ' + DISP; while (ctx.measureText(s).width > maxW && fs > 96) { fs -= 5; ctx.font = 'italic 400 ' + fs + 'px ' + DISP; }
        const gx = ctx.createLinearGradient(W / 2 - 420, y - 200, W / 2 + 420, y); gx.addColorStop(0, '#c99a45'); gx.addColorStop(.4, '#e6c063'); gx.addColorStop(.65, '#b9862a'); gx.addColorStop(1, '#8f5e12');
        ctx.fillStyle = 'rgba(30,30,40,.16)'; ctx.fillText(s, W / 2 + 6, y + 8); ctx.fillStyle = gx; ctx.fillText(s, W / 2, y); return fs;
      }
      plainBg(18);
      if (LAYOUT === 'back') { snow(40, 300, H * .3, 1200, H * .72); frame(); star5(W / 2, H * .43, 90, 0, GOLD, shade(GOLD, -.25), 4); backText(H * .6); return info; }
      if (LAYOUT === 'insideleft') {
        snow(60, 230, 300, 1270, H - 300); frame();
        branch(80, 80, 380, .62, .8); branch(W - 80, 80, 380, Math.PI - .62, .8); branch(80, H - 80, 380, -.62, .8); branch(W - 80, H - 80, 380, Math.PI + .62, .8);
        ctx.fillStyle = 'rgba(255,255,255,.82)'; rr(230, 330, W - 460, H - 660, 30); ctx.fill(); ctx.strokeStyle = 'rgba(201,154,69,.6)'; ctx.lineWidth = 2; ctx.stroke();
        txt('A few words just for you', W / 2, 520, 'italic 400 66px ' + DISP, INK); star5(W / 2, 590, 18, 0, GOLD); writeLines(720, H - 380); return info;
      }
      if (LAYOUT === 'inside') {
        snow(46, 160, 300, 1340, H - 120); frame();
        branch(30, 60, 520, .32, .85); branch(W - 30, 60, 520, Math.PI - .32, .85);
        ornament(W / 2 - 250, 300, 34, PET[0], 160); ornament(W / 2, 330, 42, PET[1], 165); ornament(W / 2 + 250, 300, 34, PET[2] || PET[0], 160);
        const fy0 = msgBlock(H * .29, 64, GOLD); star5(W / 2, fy0 + 80, 24, 0, GOLD);
        branch(40, H - 120, 330, -.4, .8); berries(250, H - 250);
        insideQR(); info.lastY = fy0 + 110; return info;
      }
      const flat = LAYOUT === 'flat';
      snow(flat ? 60 : 80, 180, H * .2, 1320, flat ? H * .64 : H * .7); frame();
      branch(40, 40, 560, .38); branch(70, 10, 460, .95, .9); branch(W - 40, 40, 560, Math.PI - .38); branch(W - 70, 10, 460, Math.PI - .95, .9);
      ornament(W / 2 - 300, 260, 44, PET[0], 70); ornament(W / 2, 320, 58, PET[1], 70); ornament(W / 2 + 300, 250, 44, PET[0], 70);
      star5(W / 2 - 440, 330, 16, .2, GOLD); star5(W / 2 + 450, 350, 14, -.2, GOLD);
      const top = H * .27; txt(TOP, W / 2 + 9, top, '500 40px ' + CAPS, GOLD, '16px');
      ctx.strokeStyle = '#c99a45'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 300, top + 34); ctx.lineTo(W / 2 - 24, top + 34); ctx.moveTo(W / 2 + 24, top + 34); ctx.lineTo(W / 2 + 300, top + 34); ctx.stroke(); star5(W / 2, top + 34, 14, 0, GOLD);
      const yH = H * .40, yM = yH + 235;
      txt(G1, W / 2, yH, fit(G1, '400', 118, 1000, 60, DISP), INK);
      info.heroFont = goldName(NAME, yM, 195, 940);
      const hy = yM + 145; star5(W / 2, hy, 26, 0, GOLD); ctx.strokeStyle = 'rgba(201,154,69,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 430, hy); ctx.lineTo(W / 2 - 60, hy); ctx.moveTo(W / 2 + 60, hy); ctx.lineTo(W / 2 + 430, hy); ctx.stroke();
      if (flat) { branch(40, H - 60, 300, -.3, .8); branch(W - 40, H - 60, 300, Math.PI + .3, .8); flatQR(); }
      else {
        txt(SUB, W / 2, hy + 125, fit(SUB, 'italic 500', 64, 1050, 36), INK);
        branch(40, H - 40, 520, -.4); branch(70, H - 10, 420, -.95, .9); branch(W - 40, H - 40, 520, Math.PI + .4); branch(W - 70, H - 10, 420, Math.PI + .95, .9);
        berries(300, H - 300); berries(W - 324, H - 300); star5(W / 2, H * .82, 46, 0, GOLD, shade(GOLD, -.25), 3); star5(W / 2 - 110, H * .84, 20, .3, GOLD); star5(W / 2 + 110, H * .84, 20, -.3, GOLD);
      }
      return info;
    }

    if (LAYOUT === 'back') {
      bg(); frame(); petals(40, 120, 120, W - 120, H * .25); petals(40, 120, H * .78, W - 120, H - 120);
      const cy = H * .5;
      flower(W / 2, cy - 70, 80, 0, PET[0]); sprig(W / 2 - 120, cy - 40, .6, 3.4); sprig(W / 2 + 120, cy - 40, .6, -.25);
      txt('Made with love', W / 2, cy + 90, 'italic 400 60px ' + DISP, INK);
      txt('HEARTFULLY', W / 2 + 9, cy + 160, '500 30px ' + CAPS, GOLD, '18px');
      return info;
    }
    if (LAYOUT === 'insideleft') {
      bg();
      const m = 215; ctx.strokeStyle = '#c99a45'; ctx.lineWidth = 5; ctx.strokeRect(m, m + 60, W - 2 * m, H - 2 * m - 120); ctx.strokeStyle = 'rgba(201,154,69,.5)'; ctx.lineWidth = 2; ctx.strokeRect(m + 22, m + 82, W - 2 * m - 44, H - 2 * m - 164);
      ctx.fillStyle = 'rgba(255,252,248,.97)'; ctx.fillRect(m + 26, m + 86, W - 2 * m - 52, H - 2 * m - 172);
      ctx.strokeStyle = 'rgba(185,110,130,.16)'; ctx.lineWidth = 2; for (let y = m + 420; y < H - m - 160; y += 92) { ctx.beginPath(); ctx.moveTo(m + 110, y); ctx.lineTo(W - m - 110, y); ctx.stroke(); }
      for (const [cx, cy2] of [[m, m + 60], [W - m, m + 60], [m, H - m - 60], [W - m, H - m - 60]]) { flower(cx, cy2, 56, R() * .6 - .3, PET[(R() * 5) | 0]); sparkle(cx + (cx < W / 2 ? 70 : -70), cy2 + (cy2 < H / 2 ? -40 : 40), 14, .9); }
      txt('A few words just for you', W / 2, m + 220, 'italic 400 66px ' + DISP, INK);
      flower(W / 2, m + 290, 22, 0, PET[1]);
      return info;
    }
    if (LAYOUT === 'inside') {
      bg(); frame();
      garland(150, 110, W - 110, 8, 55);
      const lines = MSG;
      const lh = 64, py = H * .26, y0 = py + 40;
      lines.forEach((s, i) => { if (s) txt(s, W / 2, y0 + i * lh, fit(s, 'italic 400', 52, 1180, 30), INK); });
      const fy0 = y0 + lines.length * lh + 50;
      txt(SIGN, W / 2, fy0, fit(SIGN, 'italic 400', 74, 1180, 40, DISP), GOLD);
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
    txt(TOP, W / 2 + 9, top, '500 40px ' + CAPS, GOLD, '16px');
    ctx.strokeStyle = '#c99a45'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 300, top + 34); ctx.lineTo(W / 2 - 22, top + 34); ctx.moveTo(W / 2 + 22, top + 34); ctx.lineTo(W / 2 + 300, top + 34); ctx.stroke();
    flower(W / 2, top + 34, 15, 0, PET[1]);
    const yH = H * .40, yM = yH + 240;
    txt(G1, W / 2, yH, fit(G1, '400', 124, 1000, 60, DISP), INK);
    const gx = ctx.createLinearGradient(W / 2 - 420, yM - 260, W / 2 + 420, yM); gx.addColorStop(0, '#c99a45'); gx.addColorStop(.4, '#e6b85c'); gx.addColorStop(.65, '#c28a2c'); gx.addColorStop(1, '#8f5e12');
    let fs = 230; ctx.font = 'italic 400 ' + fs + 'px ' + DISP; while (ctx.measureText(NAME).width > 980 && fs > 96) { fs -= 5; ctx.font = 'italic 400 ' + fs + 'px ' + DISP; }
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
    await Promise.all(['400 40px ' + FONT, 'italic 400 44px ' + FONT, '700 40px ' + FONT, '400 100px ' + DISP, 'italic 400 100px ' + DISP, '400 40px ' + CAPS].map(f => document.fonts.load(f)));
  }
  return { render, qrCanvas, qrMatrix, fontsReady, THEMES, STYLES, PALETTE_NAMES, DEFAULT_MSG };
})();
