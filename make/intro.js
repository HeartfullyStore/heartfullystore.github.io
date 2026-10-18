/* HeartfullyStore scan intro (2026-10-18).
   A 1-3 s opening shot before the video: the buyer's own card (drawn by CardEngine, same art as the PDF)
   resting on a linen table beside a sealed envelope. One continuous camera move: it starts low and
   turned, glides in while the card lifts and opens, and settles framing the open card.
   Then a wax seal "Play" button; tapping it dives into the card and hands over to the video.

   HFIntro.create(host, design, opts) -> { ready:Promise, play():Promise, dive():Promise, destroy() }
     design = { style, theme, name, g1, sub, msg:[...], sign }   (same fields CardEngine.render takes)
     opts   = { duration:2800, onDive:fn }                        (reduced motion: no camera move)
   HFIntro.fromTitle("Happy Birthday, Grandma Rose") -> a design for cards that have only a title. */
window.HFIntro = (function () {
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var css = "\
.hfi{position:absolute;inset:0;overflow:hidden;background:#e7dfd1;perspective:1000px;perspective-origin:50% 42%;contain:strict;-webkit-user-select:none;user-select:none}\
.hfi *{box-sizing:border-box}\
.hfi-world{position:absolute;left:50%;top:46%;width:0;height:0;transform-style:preserve-3d;will-change:transform}\
.hfi-table{position:absolute;left:-5000px;top:-5000px;width:10000px;height:10000px;\
 background:radial-gradient(14% 14% at 47% 48%,#f6f0e5 0%,#ebe3d5 50%,#ddd3c3 100%)}\
.hfi-table:after{content:'';position:absolute;inset:0;opacity:.45;mix-blend-mode:multiply;\
 background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .27 0 0 0 0 .2 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E\")}\
.hfi-sh{position:absolute;border-radius:6px;background:rgba(55,38,24,.42);filter:blur(14px)}\
.hfi-card,.hfi-leaf,.hfi-env,.hfi-seal{position:absolute;transform-style:preserve-3d}\
.hfi-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;border-radius:1.5px;background:#fbf7ef;box-shadow:0 0 0 .5px rgba(80,60,40,.25)}\
.hfi-face canvas{display:block;width:100%;height:100%}\
.hfi-face i{position:absolute;inset:0;pointer-events:none;mix-blend-mode:soft-light;\
 background:linear-gradient(112deg,rgba(255,255,255,0) 35%,rgba(255,250,235,.85) 48%,rgba(255,255,255,0) 60%);background-size:280% 100%}\
.hfi-face b{position:absolute;inset:0;pointer-events:none;background:#3a2a1c;opacity:0}\
.hfi-env .pap{position:absolute;inset:0;border-radius:2px;background:linear-gradient(170deg,#f7f1e6,#e9dfcd);box-shadow:0 0 0 .5px rgba(80,60,40,.25)}\
.hfi-env svg{position:absolute;inset:0;width:100%;height:100%}\
.hfi-flake{position:absolute;width:10px;height:10px;transform-style:preserve-3d}\
.hfi-flake span{position:absolute;inset:0;border-radius:1px}\
.hfi-light{position:absolute;inset:0;pointer-events:none;\
 background:radial-gradient(80% 60% at 18% 8%,rgba(255,250,238,.55),rgba(255,250,238,0) 60%),linear-gradient(180deg,rgba(40,26,18,.28),rgba(40,26,18,0) 26%,rgba(40,26,18,0) 70%,rgba(40,26,18,.30))}\
.hfi-win{position:absolute;inset:-40%;pointer-events:none;opacity:.35;filter:blur(28px);mix-blend-mode:soft-light;\
 background:repeating-linear-gradient(90deg,rgba(255,252,240,0) 0 12%,rgba(255,252,240,.9) 12% 21%,rgba(255,252,240,0) 21% 25%)}\
.hfi-veil{position:absolute;inset:0;background:#e7dfd1;pointer-events:none;transition:opacity .5s cubic-bezier(.22,1,.36,1)}\
.hfi-black{position:absolute;inset:0;background:#120a0d;opacity:0;pointer-events:none}\
.hfi-cta{position:absolute;left:50%;bottom:max(7%,calc(env(safe-area-inset-bottom) + 28px));transform:translate(-50%,16px);opacity:0;pointer-events:none;\
 display:flex;flex-direction:column;align-items:center;gap:10px;border:0;background:none;cursor:pointer;color:#2b2326;\
 transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1)}\
.hfi-cta.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}\
.hfi-cta svg{width:74px;height:74px;filter:drop-shadow(0 6px 8px rgba(40,5,15,.35));transition:transform .2s ease-out}\
.hfi-cta:active svg{transform:scale(.94)}\
.hfi-cta span{font:italic 400 21px/1 HFDisplay,Georgia,serif;letter-spacing:.01em;text-shadow:0 1px 0 rgba(255,255,255,.6)}\
.hfi-cta.on svg{animation:hfiBreath 2.6s ease-in-out 1s infinite}\
@keyframes hfiBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}\
@media (prefers-reduced-motion:reduce){.hfi-cta.on svg{animation:none}}";
  var SEAL = '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="hfiw" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#a64a58"/><stop offset=".5" stop-color="#76222f"/><stop offset="1" stop-color="#46101c"/></radialGradient></defs>' +
    '<path fill="url(#hfiw)" d="M96.6 46.8Q98.3 50 96.3 53.2Q94.4 56.4 94.3 59.7Q94.3 63 92.3 65.7Q90.2 68.4 90.3 72.2Q90.4 76 86.7 77.3Q83 78.6 80.3 80.2Q77.6 81.8 75.3 83.9Q73.1 85.9 70.7 88.1Q68.4 90.3 65.1 90.3Q61.8 90.3 58.9 90.6Q55.9 90.9 52.9 91.5Q50 92 46.7 94.1Q43.3 96.3 40.3 94.9Q37.2 93.5 34.4 91.9Q31.6 90.2 28.7 89Q25.7 87.8 21.7 87.5Q17.7 87.3 16.2 84Q14.6 80.6 13.2 77.6Q11.8 74.5 10.8 71.5Q9.8 68.4 6.8 66Q3.8 63.6 6.2 59.8Q8.6 56 7.6 53Q6.6 50 7.7 47Q8.8 44.1 8 40.8Q7.3 37.4 9.7 35.1Q12.1 32.7 13.1 29.8Q14 26.9 15.1 23.8Q16.1 20.6 17.6 17.5Q19.1 14.4 22.3 13Q25.4 11.7 28.1 9.9Q30.9 8.1 34 7.2Q37.2 6.4 40.1 4Q43 1.7 46.5 3.9Q50 6.2 53.1 6.7Q56.1 7.3 59.1 8.2Q62 9 65.7 8.4Q69.3 7.7 71.1 11.1Q72.8 14.5 75.1 16.5Q77.3 18.5 79.8 20.3Q82.2 22.1 85.4 23.6Q88.6 25.2 88.9 28.7Q89.1 32.1 91.1 34.7Q93.2 37.3 94.1 40.4Q95 43.5 96.6 46.8Z"/>' +
    '<circle cx="50" cy="50" r="31" fill="none" stroke="rgba(30,0,8,.35)" stroke-width="2.4"/><circle cx="50.8" cy="50.8" r="31" fill="none" stroke="rgba(255,190,190,.22)" stroke-width="1.2"/>' +
    '<ellipse cx="34" cy="28" rx="14" ry="6" transform="rotate(-30 34 28)" fill="rgba(255,255,255,.16)"/>';
  var SEAL_H = '<text x="51.2" y="62.5" text-anchor="middle" font-family="HFDisplay,Georgia,serif" font-style="italic" font-size="38" fill="rgba(255,200,200,.25)">H</text><text x="50" y="61" text-anchor="middle" font-family="HFDisplay,Georgia,serif" font-style="italic" font-size="38" fill="rgba(35,2,10,.55)">H</text></svg>';
  var SEAL_PLAY = '<path d="M43 37 L64 50 L43 63 Z" fill="rgba(255,225,225,.85)"/></svg>';

  function injectCSS() { if (document.getElementById("hfi-css")) return; var s = document.createElement("style"); s.id = "hfi-css"; s.textContent = css; document.head.appendChild(s); }
  function el(cls, parent, html) { var d = document.createElement("div"); d.className = cls; if (html) d.innerHTML = html; if (parent) parent.appendChild(d); return d; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function smoother(t) { t = Math.max(0, Math.min(1, t)); return t * t * t * (t * (t * 6 - 15) + 10); }
  function easeOut(t) { t = Math.max(0, Math.min(1, t)); return 1 - Math.pow(1 - t, 3); }
  function seg(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function fromTitle(title) {
    var t = (title || "").trim(), i = t.lastIndexOf(", ");
    var g1 = i > 0 ? t.slice(0, i) + "," : "A message just for you,", name = i > 0 ? t.slice(i + 2) : (t || "You");
    return { style: "atelier", theme: "champagne", name: name, g1: g1, sub: "with all our love", msg: null, sign: g1.replace(/,$/, "") + ", " + name + "!" };
  }

  function create(host, design, opts) {
    injectCSS(); opts = opts || {};
    var E = window.CardEngine, D = design || fromTitle("");
    var T = E.THEMES[D.theme] || E.THEMES.champagne;
    var root = el("hfi", null); host.appendChild(root);
    var world = el("hfi-world", root);
    el("hfi-table", world);
    // sizes in world px: a 5x7 card
    var W = 300, H = 420;
    var shadow = el("hfi-sh", world), envSh = el("hfi-sh", world);
    // envelope (lies on the table, under-left of the card)
    var env = el("hfi-env", world, '<div class="pap"></div><svg viewBox="0 0 725 525" preserveAspectRatio="none"><path d="M0 525 L300 270 Q362 228 425 270 L725 525Z" fill="rgba(255,255,255,.35)"/><path d="M0 525 L300 270 Q362 228 425 270 L725 525" fill="none" stroke="rgba(120,95,65,.3)" stroke-width="1.5"/><path d="M0 0 L330 300 Q362 326 395 300 L725 0Z" fill="#efe6d6"/><path d="M0 0 L330 300 Q362 326 395 300 L725 0" fill="none" stroke="rgba(120,95,65,.38)" stroke-width="1.5"/></svg>');
    var EW = 420, EH = 304;
    env.style.cssText = "width:" + EW + "px;height:" + EH + "px;left:" + (-EW * 0.98) + "px;top:" + (-EH * 0.05) + "px;transform:translateZ(1px) rotateZ(-9deg)";
    envSh.style.cssText = "width:" + EW + "px;height:" + EH + "px;left:" + (-EW * 0.98 + 6) + "px;top:" + (-EH * 0.05 + 10) + "px;transform:rotateZ(-9deg);opacity:.45";
    // the wax seal: a few stacked discs give it real thickness
    var seal = el("hfi-seal", env); seal.style.cssText = "width:78px;height:78px;left:" + (EW / 2 - 39) + "px;top:" + (EH * 0.58 - 39) + "px";
    for (var k = 0; k < 4; k++) { var d = el("", seal, SEAL + (k === 3 ? SEAL_H : "</svg>")); d.style.cssText = "position:absolute;inset:0;transform:translateZ(" + (k * 1.4) + "px)" + (k < 3 ? ";filter:brightness(" + (0.55 + k * .12) + ")" : ""); }

    // the card: right panel (inside) + a leaf hinged on its left edge (cover / inside-left)
    var card = el("hfi-card", world); card.style.cssText = "width:" + W + "px;height:" + H + "px;left:0;top:" + (-H / 2) + "px";
    var right = el("hfi-face", card); right.style.transform = "translateZ(1px)";
    var leaf = el("hfi-leaf", card); leaf.style.cssText = "width:" + W + "px;height:" + H + "px;left:0;top:0;transform-origin:0 50%";
    var front = el("hfi-face", leaf); front.style.transform = "translateZ(2.2px)";
    var inl = el("hfi-face", leaf); inl.style.transform = "translateZ(2px) rotateY(180deg)";
    var edge = el("hfi-face", leaf); edge.style.cssText = "background:#efe7d8;transform:translateZ(1.1px)";
    var faces = [[front, "cover"], [right, "inside"], [inl, "insideleft"]];
    faces.forEach(function (f) { f[0].appendChild(document.createElement("canvas")); f.sheen = document.createElement("i"); f[0].appendChild(f.sheen); f.dark = document.createElement("b"); f[0].appendChild(f.dark); });

    // foil flakes floating above the table at different depths (parallax with the camera)
    var R = mulberry(7), flakes = [], cols = (T.foil ? [T.foil[1], T.foil[2], T.foil[3]] : [T.gold, T.pet[0], T.pet[1]]);
    for (var i = 0; i < 12; i++) {
      var ang = R() * 6.283, rad = 250 + R() * 260, f = el("hfi-flake", world), sp = el("", f), z = 140 + R() * 260, x = 60 + Math.cos(ang) * rad * 1.3, y = Math.sin(ang) * rad, s = 9 + R() * 9;
      sp.style.background = "linear-gradient(135deg," + cols[i % 3] + ",#fff7e0 50%," + cols[(i + 1) % 3] + ")"; sp.style.opacity = .9;
      f.style.width = s + "px"; f.style.height = (s * (i % 3 ? 1 : 1.6)) + "px";
      flakes.push({ el: f, x: x, y: y, z: z, r0: R() * 360, vr: (R() - .5) * 160, rx: R() * 360 });
    }

    el("hfi-win", root); el("hfi-light", root);
    var black = el("hfi-black", root);
    var cta = document.createElement("button"); cta.type = "button"; cta.className = "hfi-cta"; cta.setAttribute("aria-label", "Play your video message");
    cta.innerHTML = SEAL + SEAL_PLAY + "<span>Tap to play</span>"; root.appendChild(cta);
    var veil = el("hfi-veil", root);

    // ---------- render the card faces (same art as the printed card) ----------
    var ready = (E.fontsReady ? E.fontsReady() : Promise.resolve()).then(function () {
      var px = Math.min(1100, Math.round(W * 2.2 * Math.min(2, window.devicePixelRatio || 1))); px -= px % 5;
      faces.forEach(function (f) {
        var o = { w: px, h: px / 5 * 7, qrpx: 345 * px / 1500, layout: f[1], style: D.style, theme: D.theme, name: D.name, g1: D.g1, sub: D.sub, msg: D.msg, sign: D.sign, qr: null };
        if (f[1] === "inside") o.qr = E.qrCanvas(opts.qrUrl || "https://heartfullystore.github.io/", T.qr);
        E.render(f[0].querySelector("canvas"), o);
      });
    });

    // ---------- the shot ----------
    var vw = 0, vh = 0, zOpen = 0, endX = 0, raf = 0, state = { t: 0 };
    function fit() {
      var r = root.getBoundingClientRect(); vw = r.width; vh = r.height;
      var P = 1000, portrait = vh > vw * 1.15;
      // landscape: frame the whole open card. portrait: frame the inside page, the left page bleeds off the edge
      var s = portrait ? Math.min(vw * 0.9 / (1.32 * W), vh * 0.6 / H) : Math.min(vw * 0.8 / (2 * W), vh * 0.56 / H);
      world.style.top = portrait ? '46%' : '41%';
      endX = portrait ? W * 0.36 : 0;
      zOpen = P * (1 - 1 / s);  // camera push that frames the open card
    }
    // camera keys: rx tilt, rz turn, cz push, cx/cy focus. One curve, no stops.
    function cam(t) {
      var e = mix(t, smoother(t), .55), e2 = mix(seg(t, 0, .85), smoother(seg(t, 0, .85)), .6), lift = easeOut(seg(t, .15, 1));
      return {
        rx: mix(60, 12, e2), rz: mix(-24, -2, e), cz: mix(zOpen - 520, zOpen, e), cx: mix(-150, endX, e), cy: mix(70, -4, e), lift: lift
      };
    }
    function apply(t, extra) {
      var c = cam(t); extra = extra || {};
      var cz = c.cz + (extra.dz || 0), cx = c.cx + (extra.dx || 0), cy = c.cy + (extra.dy || 0);
      world.style.transform = "translateZ(" + cz.toFixed(1) + "px) rotateX(" + c.rx.toFixed(2) + "deg) rotateZ(" + c.rz.toFixed(2) + "deg) translate3d(" + (-cx).toFixed(1) + "px," + (-cy).toFixed(1) + "px,0)";
      // the card lifts a little off the table and the cover opens in the same breath
      var open = smoother(seg(t, .26, .92)), lz = 4 + 26 * c.lift;
      card.style.transform = "translateZ(" + lz.toFixed(1) + "px) rotateX(" + (-4 * c.lift).toFixed(2) + "deg)";
      leaf.style.transform = "rotateY(" + (-172 * open).toFixed(2) + "deg)";
      shadow.style.cssText = "width:" + (W * (1 + open) + 10) + "px;height:" + (H + 10) + "px;left:" + (-W * open - 5 + lz * .25) + "px;top:" + (-H / 2 - 5 + lz * .5) + "px;opacity:" + (0.55 - c.lift * .2).toFixed(2);
      // light: the turning leaf darkens as it faces away from the window; foil catches a glint as the camera turns
      var a = 172 * open, shade = Math.sin(a * Math.PI / 180) * .22;
      faces[0].dark.style.opacity = shade.toFixed(3); faces[2].dark.style.opacity = (Math.max(0, .22 - a / 172 * .22) + shade * .5).toFixed(3);
      var gx = (120 - t * 140).toFixed(1) + "% 0";
      faces.forEach(function (f) { f.sheen.style.backgroundPosition = gx; f.sheen.style.opacity = (0.35 + 0.5 * Math.sin(t * Math.PI)).toFixed(2); });
      var tt = t * 2.8;
      flakes.forEach(function (fl) { fl.el.style.transform = "translate3d(" + fl.x + "px," + fl.y + "px," + (fl.z + Math.sin(tt * 1.3 + fl.r0) * 10).toFixed(1) + "px) rotateZ(" + (fl.r0 + fl.vr * tt).toFixed(1) + "deg) rotateX(" + (fl.rx + 90 * tt).toFixed(1) + "deg)"; });
    }
    fit(); apply(0);
    var ro = window.ResizeObserver ? new ResizeObserver(function () { fit(); apply(state.t, state.extra); }) : null; if (ro) ro.observe(root);

    function play() {
      return ready.then(function () {
        veil.style.opacity = "0";
        var dur = RM ? 0 : (opts.duration || 2800);
        if (!dur) { state.t = 1; apply(1); cta.classList.add("on"); return; }
        return new Promise(function (res) {
          var t0 = performance.now();
          (function fr(now) {
            state.t = Math.min(1, (now - t0) / dur); apply(state.t);
            if (state.t > .82) cta.classList.add("on");
            if (state.t < 1) raf = requestAnimationFrame(fr); else res();
          })(t0);
        });
      });
    }
    // tap: the camera keeps travelling into the card and the video takes over
    function dive() {
      cta.classList.remove("on"); cancelAnimationFrame(raf);
      if (RM) { black.style.transition = "opacity .35s"; black.style.opacity = "1"; return new Promise(function (r) { setTimeout(r, 350); }); }
      return new Promise(function (res) {
        var t0 = performance.now(), D2 = 650, from = state.t;
        (function fr(now) {
          var p = Math.min(1, (now - t0) / D2), e = p * p * (3 - 2 * p);
          state.extra = { dz: 900 * e * e, dx: W * .5 * e, dy: 0 };
          apply(mix(from, 1, e), state.extra); black.style.opacity = Math.max(0, (p - .45) / .55).toFixed(3);
          if (p < 1) raf = requestAnimationFrame(fr); else res();
        })(t0);
      });
    }
    cta.addEventListener("click", function () { if (opts.onTap) opts.onTap(); });
    return { root: root, ready: ready, play: play, dive: dive, seek: function (t) { veil.style.opacity = '0'; state.t = t; apply(t); if (t > .82) cta.classList.add('on'); }, cta: cta, destroy: function () { cancelAnimationFrame(raf); if (ro) ro.disconnect(); root.remove(); } };
  }
  return { create: create, fromTitle: fromTitle };
})();
