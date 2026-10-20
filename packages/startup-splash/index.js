/**
 * Host half of the startup splash bundle.
 *
 * The page shell paints a plain "Loading plugins..." screen before any client
 * module exists, which used to flash white in front of the animation. This half
 * taps the Web index and injects a pre-boot copy of the splash into the first
 * paint, so the dark hyperspace frame is what the window shows from the very
 * first frame. The Client half then continues the same timeline instead of
 * restarting it.
 *
 * The injected block is intentionally self-contained: markup, scoped CSS and a
 * small inline script with its own canvas. It records its start time on
 * `window.__DSH_SPLASH_PREBOOT__` and removes itself as soon as the real
 * `.dsh-splash` mounts (or after a safety timeout).
 */

const PREBOOT_MARKUP = `
<div id="dsh-preboot" aria-hidden="true">
  <canvas id="pb-warp"></canvas>
  <div class="pb-au pb-a"></div>
  <div class="pb-au pb-b"></div>
  <div class="pb-au pb-c"></div>
  <div class="pb-rays"></div>
  <div class="pb-glow"></div>
  <div class="pb-hud pb-tl">DSH <span class="pb-cy">//</span> HYPERDRIVE BOOT <b>v2.1.1</b></div>
  <div class="pb-hud pb-tr">T+<span id="pb-clock">00:00.000</span></div>
  <div class="pb-hud pb-bl">NODE <b>SHA-01</b> · <span id="pb-hex">0x000000</span></div>
  <div class="pb-hud pb-br"><span id="pb-phase">IGNITION</span> · SYNC</div>
  <div class="pb-corner pb-c-tl"></div>
  <div class="pb-corner pb-c-tr"></div>
  <div class="pb-corner pb-c-bl"></div>
  <div class="pb-corner pb-c-br"></div>
  <div class="pb-side pb-s-l">DEEPSEEK HARNESS</div>
  <div class="pb-side pb-s-r">HYPERSPACE · BUILD 2026.10</div>
  <div class="pb-stage">
    <div class="pb-kicker"><i></i><span id="pb-kicker">System online</span></div>
    <div class="pb-title"><span class="pb-l1">DEEPSEEK</span><span class="pb-l2">HARNESS</span></div>
    <div class="pb-sub" id="pb-sub">Hyperspace boot sequence</div>
    <div class="pb-meter">
      <div class="pb-row"><span id="pb-label">Initializing core</span><span class="pb-pct" id="pb-pct">0%</span></div>
      <div class="pb-track"><i id="pb-fill"></i></div>
      <div class="pb-ticks"><span>00</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
    </div>
  </div>
  <div class="pb-scanlines"></div>
  <div class="pb-vignette"></div>
</div>
<style>
#dsh-preboot{position:fixed;inset:0;width:100vw;height:100vh;z-index:2147482000;overflow:hidden;pointer-events:none;user-select:none;color:#f5f8ff;background:radial-gradient(120% 92% at 50% 44%,#0b1230 0%,#070a18 46%,#04050a 100%);font-family:"Segoe UI",Inter,ui-sans-serif,system-ui,"Microsoft YaHei",sans-serif;color-scheme:dark;animation:pb-hide 1ms linear 12s forwards}
body:has(.dsh-splash) #dsh-preboot{visibility:hidden;opacity:0}
#dsh-preboot canvas{position:absolute;inset:0;width:100%;height:100%}
#dsh-preboot .pb-au{position:absolute;border-radius:50%;mix-blend-mode:screen;will-change:transform}
#dsh-preboot .pb-a{width:120vmax;height:86vmax;left:-40vmax;top:-36vmax;background:radial-gradient(closest-side,rgba(70,104,255,.40) 0%,rgba(70,104,255,0) 70%);animation:pb-drift-a 10s ease-in-out infinite alternate}
#dsh-preboot .pb-b{width:110vmax;height:92vmax;right:-42vmax;top:-10vmax;background:radial-gradient(closest-side,rgba(160,107,255,.38) 0%,rgba(160,107,255,0) 70%);animation:pb-drift-b 13s ease-in-out infinite alternate}
#dsh-preboot .pb-c{width:104vmax;height:78vmax;left:6vmax;bottom:-40vmax;background:radial-gradient(closest-side,rgba(53,230,255,.30) 0%,rgba(53,230,255,0) 70%);animation:pb-drift-c 9s ease-in-out infinite alternate}
#dsh-preboot .pb-rays{position:absolute;left:50%;top:46%;width:160vmax;height:160vmax;margin:-80vmax 0 0 -80vmax;opacity:.34;background:repeating-conic-gradient(from 0deg,rgba(150,190,255,.16) 0deg 1deg,transparent 1deg 14deg);-webkit-mask:radial-gradient(closest-side,transparent 4%,#000 34%,transparent 82%);mask:radial-gradient(closest-side,transparent 4%,#000 34%,transparent 82%);animation:pb-spin 90s linear infinite;mix-blend-mode:screen}
#dsh-preboot .pb-glow{position:absolute;left:50%;top:46%;width:min(76vw,980px);height:min(50vw,620px);transform:translate(-50%,-50%);background:radial-gradient(closest-side,rgba(77,107,254,.30) 0%,rgba(53,230,255,.10) 46%,transparent 74%);filter:blur(14px);animation:pb-glow 2600ms ease-in-out infinite alternate}
#dsh-preboot .pb-stage{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;text-align:center;width:min(92vw,1100px)}
#dsh-preboot .pb-kicker{display:inline-flex;align-items:center;gap:10px;margin-bottom:clamp(16px,2.4vh,28px);font-family:ui-monospace,Consolas,"SFMono-Regular",monospace;font-size:clamp(10px,1vw,13px);letter-spacing:.42em;text-transform:uppercase;color:rgba(186,208,255,.72)}
#dsh-preboot .pb-kicker i{width:7px;height:7px;border-radius:50%;background:#35e6ff;box-shadow:0 0 12px 2px rgba(53,230,255,.85);animation:pb-blink 900ms steps(2,jump-none) infinite}
#dsh-preboot .pb-title{font-weight:850;line-height:.9;letter-spacing:.015em}
#dsh-preboot .pb-title span{display:block;position:relative;font-size:clamp(52px,9.2vw,126px);line-height:.92}
#dsh-preboot .pb-l1{background:linear-gradient(180deg,#fff 0%,#dbe7ff 34%,#8fb0ff 66%,#4d6bfe 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 26px rgba(77,107,254,.38))}
#dsh-preboot .pb-l2{color:transparent;-webkit-text-stroke:1.5px rgba(168,204,255,.78);background:linear-gradient(180deg,rgba(120,170,255,.10),rgba(77,107,254,.02));-webkit-background-clip:text;background-clip:text;text-shadow:0 0 36px rgba(53,230,255,.22)}
#dsh-preboot .pb-sub{margin-top:clamp(14px,2.2vh,24px);font-family:ui-monospace,Consolas,"SFMono-Regular",monospace;font-size:clamp(10px,1.05vw,14px);letter-spacing:.46em;text-transform:uppercase;color:rgba(170,198,255,.8)}
#dsh-preboot .pb-meter{margin-top:clamp(26px,4.4vh,52px);width:min(76vw,520px)}
#dsh-preboot .pb-row{display:flex;align-items:baseline;justify-content:space-between;gap:16px;font-family:ui-monospace,Consolas,"SFMono-Regular",monospace;font-size:clamp(10px,1vw,12px);letter-spacing:.18em;text-transform:uppercase;color:rgba(176,200,245,.82)}
#dsh-preboot .pb-pct{font-size:clamp(15px,1.8vw,22px);letter-spacing:.04em;color:#eaf3ff;font-variant-numeric:tabular-nums;text-shadow:0 0 18px rgba(53,230,255,.55)}
#dsh-preboot .pb-track{position:relative;height:3px;margin-top:12px;border-radius:999px;background:rgba(160,190,255,.16)}
#dsh-preboot .pb-track i{position:absolute;inset:0 auto 0 0;width:0%;border-radius:inherit;background:linear-gradient(90deg,#4d6bfe 0%,#35e6ff 55%,#ff3ea5 100%);box-shadow:0 0 14px rgba(53,230,255,.65),0 0 40px rgba(77,107,254,.45)}
#dsh-preboot .pb-track i:after{content:"";position:absolute;right:-4px;top:50%;width:9px;height:9px;border-radius:50%;background:#fff;transform:translateY(-50%);box-shadow:0 0 16px 4px rgba(120,220,255,.95)}
#dsh-preboot .pb-ticks{display:flex;justify-content:space-between;margin-top:10px;font-family:ui-monospace,Consolas,monospace;font-size:9px;letter-spacing:.12em;color:rgba(140,168,220,.48)}
#dsh-preboot .pb-hud{position:absolute;font-family:ui-monospace,Consolas,"SFMono-Regular",monospace;font-size:clamp(9px,.9vw,12px);letter-spacing:.18em;text-transform:uppercase;color:rgba(160,190,240,.7)}
#dsh-preboot .pb-hud b{color:#dceaff;font-weight:600}
#dsh-preboot .pb-cy{color:rgba(53,230,255,.9)}
#dsh-preboot .pb-tl{top:46px;left:34px}
#dsh-preboot .pb-tr{top:46px;right:34px;text-align:right}
#dsh-preboot .pb-bl{bottom:46px;left:34px}
#dsh-preboot .pb-br{bottom:46px;right:34px;text-align:right}
#dsh-preboot .pb-corner{position:absolute;width:34px;height:34px;border:1px solid rgba(130,180,255,.5)}
#dsh-preboot .pb-c-tl{top:18px;left:18px;border-right:0;border-bottom:0}
#dsh-preboot .pb-c-tr{top:18px;right:18px;border-left:0;border-bottom:0}
#dsh-preboot .pb-c-bl{bottom:18px;left:18px;border-right:0;border-top:0}
#dsh-preboot .pb-c-br{bottom:18px;right:18px;border-left:0;border-top:0}
#dsh-preboot .pb-side{position:absolute;top:50%;font-family:ui-monospace,Consolas,monospace;font-size:10px;letter-spacing:.5em;text-transform:uppercase;color:rgba(150,180,235,.45);writing-mode:vertical-rl}
#dsh-preboot .pb-s-l{left:28px;transform:translateY(-50%) rotate(180deg)}
#dsh-preboot .pb-s-r{right:28px;transform:translateY(-50%)}
#dsh-preboot .pb-scanlines{position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(255,255,255,.028) 0 1px,transparent 1px 3px);mix-blend-mode:overlay}
#dsh-preboot .pb-vignette{position:absolute;inset:0;background:radial-gradient(120% 96% at 50% 45%,transparent 38%,rgba(0,0,0,.62) 100%),linear-gradient(180deg,rgba(0,0,0,.45) 0%,transparent 16%,transparent 82%,rgba(0,0,0,.5) 100%)}
@keyframes pb-hide{to{visibility:hidden;opacity:0}}
@keyframes pb-spin{to{transform:rotate(360deg)}}
@keyframes pb-blink{0%,49%{opacity:1}50%,100%{opacity:.15}}
@keyframes pb-glow{from{opacity:.55;transform:translate(-50%,-50%) scale(.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1.06)}}
@keyframes pb-drift-a{from{transform:translate3d(-4vmax,-3vmax,0) scale(1)}to{transform:translate3d(8vmax,6vmax,0) scale(1.18)}}
@keyframes pb-drift-b{from{transform:translate3d(4vmax,4vmax,0) scale(1.12)}to{transform:translate3d(-8vmax,-5vmax,0) scale(.94)}}
@keyframes pb-drift-c{from{transform:translate3d(-3vmax,5vmax,0) scale(.96)}to{transform:translate3d(7vmax,-6vmax,0) scale(1.2)}}
@media (prefers-reduced-motion:reduce){#dsh-preboot *,#dsh-preboot *::before,#dsh-preboot *::after{animation-duration:1ms!important;animation-iteration-count:1!important}}
</style>
`;

const PREBOOT_BODY = `(function () {
  var root = document.getElementById('dsh-preboot');
  if (!root) return;
  var startedAt = performance.now();
  window.__DSH_SPLASH_PREBOOT__ = { startedAt: startedAt, version: '2.1.1' };

  var zh = (navigator.language || '').toLowerCase().indexOf('zh') === 0;
  var LABELS = zh ? ['初始化核心', '校准光学', '链接模块', '超空间就绪'] : ['Initializing core', 'Calibrating optics', 'Linking modules', 'Hyperspace ready'];
  var HUDS = ['IGNITION', 'OPTICS', 'LINK', 'READY'];
  if (zh) {
    document.getElementById('pb-kicker').textContent = '系统在线';
    document.getElementById('pb-sub').textContent = '超空间启动序列';
    document.getElementById('pb-label').textContent = LABELS[0];
  }

  var pctEl = document.getElementById('pb-pct');
  var fillEl = document.getElementById('pb-fill');
  var labelEl = document.getElementById('pb-label');
  var phaseEl = document.getElementById('pb-phase');
  var clockEl = document.getElementById('pb-clock');
  var hexEl = document.getElementById('pb-hex');
  var canvas = document.getElementById('pb-warp');
  var g = canvas ? canvas.getContext('2d') : null;
  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduced = false; }

  var W = 0, H = 0, CX = 0, CY = 0, MAXR = 1, DPR = 1;
  var stars = [], dtSafe = 16, raf = 0;

  function measure() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = root.clientWidth || window.innerWidth;
    H = root.clientHeight || window.innerHeight;
    if (!g) return;
    canvas.width = Math.max(1, Math.round(W * DPR));
    canvas.height = Math.max(1, Math.round(H * DPR));
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    CX = W * 0.5; CY = H * 0.46; MAXR = Math.hypot(W, H) * 0.62;
  }
  function seed() {
    stars = [];
    var count = Math.round(Math.min(380, Math.max(160, (W * H) / 5600)));
    for (var i = 0; i < count; i += 1) {
      stars.push({
        a: Math.random() * Math.PI * 2,
        r: Math.random() * MAXR,
        v: 0.006 + Math.random() * 0.030,
        w: 0.6 + Math.random() * 2.1,
        c: [[130,168,255],[86,224,255],[168,124,255],[255,96,180],[235,244,255]][(Math.random() * 5) | 0]
      });
    }
  }
  function smooth(a, b, v) {
    var x = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return x * x * (3 - 2 * x);
  }
  function percentAt(t) {
    var p = Math.min(1, Math.max(0, (t - 420) / 2380));
    var eased = 1 - Math.pow(1 - p, 2.6);
    if (eased > 0.17 && eased < 0.24) eased = 0.19;
    if (eased > 0.52 && eased < 0.60) eased = 0.55;
    if (eased > 0.81 && eased < 0.88) eased = 0.83;
    return Math.min(100, Math.round(eased * 100));
  }
  function paint(t, dt) {
    if (!g) return;
    var ramp = smooth(500, 2700, t);
    var boost = 1 + ramp * 5.4;
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    g.lineCap = 'round';
    for (var i = 0; i < stars.length; i += 1) {
      var s = stars[i];
      var len = 5 + (s.v * dt * boost * 7) + (s.r / MAXR) * 120 * (0.35 + ramp);
      var r0 = Math.max(1, s.r - len);
      var ca = Math.cos(s.a), sa = Math.sin(s.a);
      var fade = Math.min(1, s.r / MAXR);
      var alpha = (0.10 + fade * 0.78) * 0.95;
      g.strokeStyle = 'rgba(' + s.c[0] + ',' + s.c[1] + ',' + s.c[2] + ',' + alpha.toFixed(3) + ')';
      g.lineWidth = s.w;
      g.beginPath();
      g.moveTo(CX + ca * r0, CY + sa * r0);
      g.lineTo(CX + ca * s.r, CY + sa * s.r);
      g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
  }
  function readout(t) {
    var pct = percentAt(t);
    if (clockEl) {
      var ss = Math.floor(t / 1000), ms = Math.floor(t % 1000);
      clockEl.textContent = String(ss).padStart(2, '0') + ':' + String(ms).padStart(3, '0');
    }
    if (hexEl) hexEl.textContent = '0x' + ((t * 2654435761) >>> 0).toString(16).slice(0, 6).toUpperCase();
    if (pctEl) pctEl.textContent = pct + '%';
    if (fillEl) fillEl.style.width = pct + '%';
    var idx = pct >= 92 ? 3 : pct >= 58 ? 2 : pct >= 26 ? 1 : 0;
    if (labelEl) labelEl.textContent = LABELS[idx];
    if (phaseEl) phaseEl.textContent = HUDS[idx];
  }
  function frame(now) {
    var t = now - startedAt;
    var dt = Math.min(40, Math.max(1, now - (frame.last || now)));
    frame.last = now;
    dtSafe = dt;
    var ramp = smooth(500, 2700, t);
    var boost = 1 + ramp * 5.4;
    for (var i = 0; i < stars.length; i += 1) {
      var s = stars[i];
      s.r += s.v * dt * boost * (0.35 + (s.r / MAXR) * 2.1);
      s.a += 0.00010 * dt * (0.5 + s.r / MAXR);
      if (s.r > MAXR) { s.r = 4 + Math.random() * 26; s.a = Math.random() * Math.PI * 2; }
    }
    paint(t, dt);
    readout(t);
    raf = requestAnimationFrame(frame);
  }

  measure();
  seed();
  window.addEventListener('resize', function () { measure(); seed(); });

  if (reduced) {
    readout(1400);
    paint(1400, 16);
  } else {
    raf = requestAnimationFrame(frame);
  }

  function remove() {
    if (raf) cancelAnimationFrame(raf);
    if (root && root.parentNode) root.parentNode.removeChild(root);
  }
  var watch = setInterval(function () {
    if (document.querySelector('.dsh-splash')) {
      clearInterval(watch);
      setTimeout(remove, 140);
    }
  }, 80);
  setTimeout(remove, 15000);
})();
`;

/**
 * Boot-injection script.
 *
 * The Desktop shell serves its page from `dsh-app://app/` (the packaged static
 * frontend), so `webServer.tapIndex` never reaches it. Both the Desktop shell
 * and the browser index consume `webserver/index-inject` rows instead: this row
 * paints the pre-boot layer at boot - before the client modules load.
 */
export const PREBOOT_SCRIPT = `(function () {
  if (document.getElementById('dsh-preboot')) return;
  var holder = document.createElement('div');
  holder.innerHTML = ${JSON.stringify(PREBOOT_MARKUP)};
  var parent = document.body || document.documentElement;
  while (holder.firstChild) parent.appendChild(holder.firstChild);
  ${PREBOOT_BODY}
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', function () {
      var node = document.getElementById('dsh-preboot');
      if (node && node.parentNode !== document.body) document.body.appendChild(node);
    }, { once: true });
  }
})();`;

export function apply(ctx) {
  ctx.effect(
    () => ctx.on('webserver/index-inject', (table) => {
      table.push({ kind: 'script', placement: 'head', text: PREBOOT_SCRIPT });
    }),
    'startup-splash: pre-boot boot injection',
  );
}