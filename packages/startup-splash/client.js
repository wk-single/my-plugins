/**
 * Client half of the DeepSeek Harness startup splash — v2 "Hyperdrive".
 *
 * A frame-wide, one-shot cinematic boot sequence rendered into `shell.overlay`:
 * a canvas hyperspace tunnel with hundreds of accelerating streaks, a particle
 * burst on exit, aurora fields, an anamorphic lens flare, a HUD frame, and a
 * huge glitching wordmark with a live boot readout.
 *
 * Design notes:
 * - The backdrop is intentionally theme-independent dark: the sequence is a
 *   film, not a themed surface, so it looks the same in light and dark UI.
 * - One canvas draws plain lines and dots (no shadows, filters or gradients per
 *   particle) and the CSS layers are transform/opacity only, so it stays cheap.
 * - Everything is owned by the component: unmount cancels the frame loop and
 *   removes the styles. Click / Escape skips.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-startup-splash',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-startup-splash';
    const VERSION = '2.1.0';
    const EXIT_AT = 3050;
    const LINGER = 980;

    const EN = {
      loading: 'Loading DeepSeek Harness',
      kicker: 'System online',
      sub: 'Hyperspace boot sequence',
      phaseCore: 'Initializing core',
      phaseOptics: 'Calibrating optics',
      phaseLink: 'Linking modules',
      phaseReady: 'Hyperspace ready',
      phaseJump: 'Jumping to hyperspace',
      skip: 'Click / Esc to skip',
    };
    const ZH = {
      loading: '正在加载 DeepSeek Harness',
      kicker: '系统在线',
      sub: '超空间启动序列',
      phaseCore: '初始化核心',
      phaseOptics: '校准光学',
      phaseLink: '链接模块',
      phaseReady: '超空间就绪',
      phaseJump: '跃迁至超空间',
      skip: '点击 / Esc 跳过',
    };

    const STYLE = `
.dsh-splash {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2147483000;
  overflow: hidden;
  background: radial-gradient(120% 92% at 50% 44%, #0b1230 0%, #070a18 46%, #04050a 100%);
  color: #f5f8ff;
  color-scheme: dark;
  font-family: "Segoe UI", Inter, ui-sans-serif, system-ui, "Microsoft YaHei", sans-serif;
  opacity: 1;
  user-select: none;
  -webkit-user-select: none;
  will-change: opacity;
}
.dsh-splash-out {
  pointer-events: none;
  animation: dsh-fade-out 620ms cubic-bezier(.4, 0, .2, 1) 240ms forwards;
}

.dsh-splash-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.dsh-aurora {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  mix-blend-mode: screen;
  will-change: transform;
}
.dsh-aurora-a {
  width: 120vmax; height: 86vmax; left: -40vmax; top: -36vmax;
  background: radial-gradient(closest-side, rgba(70, 104, 255, .40) 0%, rgba(70, 104, 255, 0) 70%);
  animation: dsh-drift-a 10s ease-in-out infinite alternate;
}
.dsh-aurora-b {
  width: 110vmax; height: 92vmax; right: -42vmax; top: -10vmax;
  background: radial-gradient(closest-side, rgba(160, 107, 255, .38) 0%, rgba(160, 107, 255, 0) 70%);
  animation: dsh-drift-b 13s ease-in-out infinite alternate;
}
.dsh-aurora-c {
  width: 104vmax; height: 78vmax; left: 6vmax; bottom: -40vmax;
  background: radial-gradient(closest-side, rgba(53, 230, 255, .30) 0%, rgba(53, 230, 255, 0) 70%);
  animation: dsh-drift-c 9s ease-in-out infinite alternate;
}

.dsh-rays {
  position: absolute;
  left: 50%; top: 46%;
  width: 160vmax; height: 160vmax;
  margin: -80vmax 0 0 -80vmax;
  pointer-events: none;
  opacity: .34;
  background: repeating-conic-gradient(from 0deg,
    rgba(150, 190, 255, .16) 0deg 1deg,
    transparent 1deg 14deg);
  -webkit-mask: radial-gradient(closest-side, transparent 4%, #000 34%, transparent 82%);
  mask: radial-gradient(closest-side, transparent 4%, #000 34%, transparent 82%);
  animation: dsh-spin 90s linear infinite;
  mix-blend-mode: screen;
}

.dsh-glow {
  position: absolute;
  left: 50%; top: 46%;
  width: min(76vw, 980px);
  height: min(50vw, 620px);
  transform: translate(-50%, -50%);
  pointer-events: none;
  background: radial-gradient(closest-side, rgba(77, 107, 254, .30) 0%, rgba(53, 230, 255, .10) 46%, transparent 74%);
  filter: blur(14px);
  animation: dsh-glow-pulse 2600ms ease-in-out infinite alternate;
}

.dsh-flare,
.dsh-flare-v {
  position: absolute;
  left: 50%; top: 46%;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0;
}
.dsh-flare {
  width: min(88vw, 1440px);
  height: 2px;
  transform: translate(-50%, -50%) scaleX(.15);
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(53, 230, 255, .45) 26%,
    rgba(255, 255, 255, .95) 50%,
    rgba(120, 160, 255, .5) 74%,
    transparent 100%);
  filter: blur(.6px);
  animation: dsh-flare 2800ms cubic-bezier(.2, .7, .2, 1) 650ms both;
}
.dsh-flare-v {
  width: 1px;
  height: min(46vh, 460px);
  transform: translate(-50%, -50%) scaleY(.12);
  background: linear-gradient(180deg, transparent 0%, rgba(150, 200, 255, .5) 40%, rgba(255, 255, 255, .85) 50%, rgba(120, 160, 255, .35) 62%, transparent 100%);
  animation: dsh-flare-v 2800ms cubic-bezier(.2, .7, .2, 1) 650ms both;
}

.dsh-stage {
  position: absolute;
  left: 50%; top: 46%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: min(92vw, 1100px);
  animation: dsh-shake-in 1.1s cubic-bezier(.22, 1, .36, 1) both;
  will-change: transform;
}

.dsh-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: clamp(16px, 2.4vh, 28px);
  font-family: ui-monospace, Consolas, "SFMono-Regular", monospace;
  font-size: clamp(10px, 1vw, 13px);
  letter-spacing: .42em;
  text-transform: uppercase;
  color: rgba(186, 208, 255, .72);
  animation: dsh-fade 700ms ease 180ms both;
}
.dsh-kicker i {
  width: 7px; height: 7px; border-radius: 50%;
  background: #35e6ff;
  box-shadow: 0 0 12px 2px rgba(53, 230, 255, .85);
  animation: dsh-blink 900ms steps(2, jump-none) infinite;
}

.dsh-title {
  position: relative;
  margin: 0;
  line-height: .9;
  font-weight: 850;
  letter-spacing: .015em;
}
.dsh-line {
  display: block;
  position: relative;
  font-size: clamp(52px, 9.2vw, 126px);
  line-height: .92;
}
.dsh-line-1 {
  background: linear-gradient(180deg, #ffffff 0%, #dbe7ff 34%, #8fb0ff 66%, #4d6bfe 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 26px rgba(77, 107, 254, .38));
  animation: dsh-line-in 900ms cubic-bezier(.16, 1, .3, 1) 260ms both;
}
.dsh-line-2 {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(168, 204, 255, .78);
  background: linear-gradient(180deg, rgba(120, 170, 255, .10), rgba(77, 107, 254, .02));
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 0 36px rgba(53, 230, 255, .22);
  animation: dsh-line-in 900ms cubic-bezier(.16, 1, .3, 1) 420ms both;
}
.dsh-line-1::after,
.dsh-line-2::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  color: #35e6ff;
  opacity: 0;
  mix-blend-mode: screen;
  pointer-events: none;
}
.dsh-line-1::after { animation: dsh-glitch 900ms steps(2, jump-none) 1400ms 2; }
.dsh-line-2::after { animation: dsh-glitch 900ms steps(2, jump-none) 1550ms 2; color: #ff3ea5; }

.dsh-sub {
  margin-top: clamp(14px, 2.2vh, 24px);
  font-family: ui-monospace, Consolas, "SFMono-Regular", monospace;
  font-size: clamp(10px, 1.05vw, 14px);
  letter-spacing: .46em;
  text-transform: uppercase;
  color: rgba(170, 198, 255, .8);
  animation: dsh-fade 700ms ease 700ms both;
}

.dsh-meter {
  margin-top: clamp(26px, 4.4vh, 52px);
  width: min(76vw, 520px);
  animation: dsh-fade 700ms ease 900ms both;
}
.dsh-meter-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  font-family: ui-monospace, Consolas, "SFMono-Regular", monospace;
  font-size: clamp(10px, 1vw, 12px);
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgba(176, 200, 245, .82);
}
.dsh-pct {
  font-size: clamp(15px, 1.8vw, 22px);
  letter-spacing: .04em;
  color: #eaf3ff;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 18px rgba(53, 230, 255, .55);
}
.dsh-track {
  position: relative;
  height: 3px;
  margin-top: 12px;
  border-radius: 999px;
  background: rgba(160, 190, 255, .16);
}
.dsh-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0%;
  border-radius: inherit;
  background: linear-gradient(90deg, #4d6bfe 0%, #35e6ff 55%, #ff3ea5 100%);
  box-shadow: 0 0 14px rgba(53, 230, 255, .65), 0 0 40px rgba(77, 107, 254, .45);
}
.dsh-fill::after {
  content: "";
  position: absolute;
  right: -4px; top: 50%;
  width: 9px; height: 9px;
  border-radius: 50%;
  background: #ffffff;
  transform: translateY(-50%);
  box-shadow: 0 0 16px 4px rgba(120, 220, 255, .95);
}
.dsh-ticks {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 9px;
  letter-spacing: .12em;
  color: rgba(140, 168, 220, .48);
}

.dsh-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: ui-monospace, Consolas, "SFMono-Regular", monospace;
  font-size: clamp(9px, .9vw, 12px);
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgba(160, 190, 240, .7);
}
.dsh-hud::before,
.dsh-hud::after {
  content: "";
  position: absolute;
  left: 26px; right: 26px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(120, 170, 255, .35), transparent);
}
.dsh-hud::before { top: 30px; }
.dsh-hud::after { bottom: 30px; }

.dsh-hud-tl, .dsh-hud-tr, .dsh-hud-bl, .dsh-hud-br {
  position: absolute;
  animation: dsh-fade 600ms ease 500ms both;
}
.dsh-hud-tl { top: 46px; left: 34px; }
.dsh-hud-tr { top: 46px; right: 34px; text-align: right; }
.dsh-hud-bl { bottom: 46px; left: 34px; }
.dsh-hud-br { bottom: 46px; right: 34px; text-align: right; }
.dsh-hud b { color: #dceaff; font-weight: 600; }
.dsh-hud-cyan { color: rgba(53, 230, 255, .9); }

.dsh-corner {
  position: absolute;
  width: 34px; height: 34px;
  border: 1px solid rgba(130, 180, 255, .5);
  opacity: 0;
  animation: dsh-fade 700ms ease 420ms both;
  pointer-events: none;
}
.dsh-corner-tl { top: 18px; left: 18px; border-right: 0; border-bottom: 0; }
.dsh-corner-tr { top: 18px; right: 18px; border-left: 0; border-bottom: 0; }
.dsh-corner-bl { bottom: 18px; left: 18px; border-right: 0; border-top: 0; }
.dsh-corner-br { bottom: 18px; right: 18px; border-left: 0; border-top: 0; }

.dsh-side {
  position: absolute;
  top: 50%;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 10px;
  letter-spacing: .5em;
  text-transform: uppercase;
  color: rgba(150, 180, 235, .45);
  writing-mode: vertical-rl;
  pointer-events: none;
  animation: dsh-fade 900ms ease 900ms both;
}
.dsh-side-l { left: 28px; transform: translateY(-50%) rotate(180deg); }
.dsh-side-r { right: 28px; transform: translateY(-50%); }

.dsh-scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(180deg, rgba(255, 255, 255, .028) 0 1px, transparent 1px 3px);
  mix-blend-mode: overlay;
}
.dsh-scan {
  position: absolute;
  left: 0; right: 0; top: -140px;
  height: 140px;
  pointer-events: none;
  opacity: .5;
  background: linear-gradient(180deg, transparent 0%, rgba(120, 190, 255, .05) 55%, rgba(180, 230, 255, .14) 82%, transparent 100%);
  mix-blend-mode: screen;
  animation: dsh-scan 2600ms cubic-bezier(.45, 0, .55, 1) 200ms infinite;
}
.dsh-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(120% 96% at 50% 45%, transparent 38%, rgba(0, 0, 0, .62) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, .45) 0%, transparent 16%, transparent 82%, rgba(0, 0, 0, .5) 100%);
}

.dsh-flash {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(circle at 50% 46%, #ffffff 0%, rgba(210, 235, 255, .9) 26%, rgba(120, 180, 255, 0) 66%);
  mix-blend-mode: screen;
}
.dsh-shock {
  position: absolute;
  left: 50%; top: 46%;
  width: 30vmax; height: 30vmax;
  margin: -15vmax 0 0 -15vmax;
  border-radius: 50%;
  border: 2px solid rgba(190, 225, 255, .8);
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
}
.dsh-shock-2 { border-color: rgba(53, 230, 255, .65); border-width: 3px; }
.dsh-shock-3 { border-color: rgba(160, 107, 255, .5); border-width: 1px; }

.dsh-splash-out .dsh-flash { animation: dsh-flash 700ms ease-out forwards; }
.dsh-splash-out .dsh-shock { animation: dsh-shock 900ms cubic-bezier(.16, .8, .24, 1) forwards; }
.dsh-splash-out .dsh-shock-2 { animation-delay: 90ms; }
.dsh-splash-out .dsh-shock-3 { animation-delay: 180ms; }
.dsh-splash-out .dsh-stage { animation: dsh-burst 700ms cubic-bezier(.3, .7, .2, 1) forwards; }

.dsh-splash-continue .dsh-stage {
  animation: none !important;
  transform: translate(-50%, -50%);
}
.dsh-splash-continue .dsh-kicker,
.dsh-splash-continue .dsh-line-1,
.dsh-splash-continue .dsh-line-2,
.dsh-splash-continue .dsh-sub,
.dsh-splash-continue .dsh-meter,
.dsh-splash-continue .dsh-hud-tl,
.dsh-splash-continue .dsh-hud-tr,
.dsh-splash-continue .dsh-hud-bl,
.dsh-splash-continue .dsh-hud-br,
.dsh-splash-continue .dsh-corner,
.dsh-splash-continue .dsh-side,
.dsh-splash-continue .dsh-skip {
  animation: none !important;
  opacity: 1;
}

.dsh-skip {
  position: absolute;
  bottom: 44px; left: 50%;
  transform: translateX(-50%);
  padding: 7px 14px;
  border: 1px solid rgba(130, 170, 255, .28);
  border-radius: 999px;
  background: rgba(10, 18, 40, .35);
  color: rgba(170, 198, 245, .7);
  font-family: ui-monospace, Consolas, monospace;
  font-size: 10px;
  letter-spacing: .2em;
  text-transform: uppercase;
  cursor: pointer;
  opacity: 0;
  animation: dsh-fade 600ms ease 1600ms both;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
}
.dsh-skip:hover { color: #fff; border-color: rgba(120, 220, 255, .7); background: rgba(20, 40, 80, .55); }
.dsh-skip:focus-visible { outline: 2px solid #35e6ff; outline-offset: 3px; }

@keyframes dsh-spin { to { transform: rotate(360deg); } }
@keyframes dsh-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes dsh-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes dsh-glow-pulse {
  from { opacity: .55; transform: translate(-50%, -50%) scale(.94); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1.06); }
}
@keyframes dsh-flare {
  0% { opacity: 0; transform: translate(-50%, -50%) scaleX(.12); }
  20% { opacity: .95; transform: translate(-50%, -50%) scaleX(1); }
  55% { opacity: .45; transform: translate(-50%, -50%) scaleX(1.04); }
  100% { opacity: 0; transform: translate(-50%, -50%) scaleX(1.3); }
}
@keyframes dsh-flare-v {
  0% { opacity: 0; transform: translate(-50%, -50%) scaleY(.12); }
  24% { opacity: .5; transform: translate(-50%, -50%) scaleY(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scaleY(1.25); }
}
@keyframes dsh-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: .15; } }
@keyframes dsh-scan { from { transform: translateY(0); } to { transform: translateY(calc(100vh + 440px)); } }
@keyframes dsh-drift-a { from { transform: translate3d(-4vmax, -3vmax, 0) scale(1); } to { transform: translate3d(8vmax, 6vmax, 0) scale(1.18); } }
@keyframes dsh-drift-b { from { transform: translate3d(4vmax, 4vmax, 0) scale(1.12); } to { transform: translate3d(-8vmax, -5vmax, 0) scale(.94); } }
@keyframes dsh-drift-c { from { transform: translate3d(-3vmax, 5vmax, 0) scale(.96); } to { transform: translate3d(7vmax, -6vmax, 0) scale(1.2); } }
@keyframes dsh-line-in {
  0% { opacity: 0; transform: translateY(26px) scale(.96); filter: blur(10px); }
  55% { opacity: 1; filter: blur(0); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
@keyframes dsh-glitch {
  0% { opacity: 0; transform: translate(0, 0); clip-path: inset(0 0 100% 0); }
  12% { opacity: .9; transform: translate(-7px, 2px); clip-path: inset(12% 0 58% 0); }
  24% { opacity: .75; transform: translate(6px, -2px); clip-path: inset(56% 0 18% 0); }
  36% { opacity: 0; transform: translate(0, 0); clip-path: inset(0 0 100% 0); }
  100% { opacity: 0; }
}
@keyframes dsh-shake-in {
  0% { transform: translate(-50%, -50%) scale(.965); }
  18% { transform: translate(calc(-50% + 7px), calc(-50% - 4px)) scale(.985); }
  34% { transform: translate(calc(-50% - 6px), calc(-50% + 3px)); }
  52% { transform: translate(calc(-50% + 4px), calc(-50% + 2px)); }
  70% { transform: translate(calc(-50% - 2px), calc(-50% - 1px)); }
  100% { transform: translate(-50%, -50%) scale(1); }
}
@keyframes dsh-flash {
  0% { opacity: 0; }
  18% { opacity: .95; }
  100% { opacity: 0; }
}
@keyframes dsh-shock {
  0% { opacity: .95; transform: scale(.02); }
  60% { opacity: .45; }
  100% { opacity: 0; transform: scale(4.6); }
}
@keyframes dsh-burst {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; filter: blur(0); }
  100% { transform: translate(-50%, -50%) scale(1.18); opacity: 0; filter: blur(6px); }
}

@media (prefers-reduced-motion: reduce) {
  .dsh-splash,
  .dsh-splash *,
  .dsh-splash *::before,
  .dsh-splash *::after {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 200ms !important;
  }
  .dsh-scan { display: none; }
  .dsh-skip { opacity: 1; }
}
`;

    const PALETTE = [
      [130, 168, 255],
      [86, 224, 255],
      [168, 124, 255],
      [255, 96, 180],
      [235, 244, 255],
    ];

    function prefersReducedMotion() {
      try {
        return typeof window.matchMedia === 'function'
          && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch {
        return false;
      }
    }

    /** Elapsed time inherited from the index-injected pre-boot splash. */
    function prebootOffset() {
      try {
        const pre = window.__DSH_SPLASH_PREBOOT__;
        if (!pre || typeof pre.startedAt !== 'number') return 0;
        return Math.min(2900, Math.max(0, performance.now() - pre.startedAt));
      } catch {
        return 0;
      }
    }

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const smooth = (a, b, v) => {
      const x = clamp((v - a) / (b - a), 0, 1);
      return x * x * (3 - 2 * x);
    };

    function percentAt(t) {
      const p = clamp((t - 420) / 2380, 0, 1);
      let eased = 1 - Math.pow(1 - p, 2.6);
      if (eased > 0.17 && eased < 0.24) eased = 0.19;
      if (eased > 0.52 && eased < 0.60) eased = 0.55;
      if (eased > 0.81 && eased < 0.88) eased = 0.83;
      return Math.min(100, Math.round(eased * 100));
    }

    function phaseKeyAt(t, pct) {
      if (t >= EXIT_AT) return 'phaseJump';
      if (pct >= 92) return 'phaseReady';
      if (pct >= 58) return 'phaseLink';
      if (pct >= 26) return 'phaseOptics';
      return 'phaseCore';
    }

    function hudAt(t, pct) {
      if (t >= EXIT_AT) return 'JUMP';
      if (pct >= 92) return 'READY';
      if (pct >= 58) return 'LINK';
      if (pct >= 26) return 'OPTICS';
      return 'IGNITION';
    }

    function clockAt(t) {
      const ss = Math.floor(t / 1000);
      const ms = Math.floor(t % 1000);
      return String(ss).padStart(2, '0') + ':' + String(ms).padStart(3, '0');
    }

    function hexAt(t) {
      return '0x' + ((t * 2654435761) >>> 0).toString(16).slice(0, 6).toUpperCase();
    }

    /** Full-viewport hyperspace tunnel with an exit particle burst. */
    function Warp(props) {
      const canvasRef = React.useRef(null);

      React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const g = canvas.getContext('2d');
        if (!g) return undefined;

        const reduced = prefersReducedMotion();
        const stars = [];
        const sparks = [];
        let sparksBorn = false;
        let W = 0;
        let H = 0;
        let CX = 0;
        let CY = 0;
        let MAXR = 1;
        let DPR = 1;
        let frame = 0;
        let startedAt = 0;
        let last = 0;
        let dtSafe = 16;

        const measure = () => {
          DPR = Math.min(window.devicePixelRatio || 1, 2);
          W = canvas.clientWidth || window.innerWidth;
          H = canvas.clientHeight || window.innerHeight;
          canvas.width = Math.max(1, Math.round(W * DPR));
          canvas.height = Math.max(1, Math.round(H * DPR));
          g.setTransform(DPR, 0, 0, DPR, 0, 0);
          CX = W * 0.5;
          CY = H * 0.46;
          MAXR = Math.hypot(W, H) * 0.62;
        };

        const seed = () => {
          stars.length = 0;
          const count = Math.round(Math.min(420, Math.max(180, (W * H) / 5200)));
          for (let i = 0; i < count; i += 1) {
            stars.push({
              a: Math.random() * Math.PI * 2,
              r: Math.random() * MAXR,
              v: 0.006 + Math.random() * 0.030,
              w: 0.6 + Math.random() * 2.1,
              c: PALETTE[(Math.random() * PALETTE.length) | 0],
              p: Math.random() * Math.PI * 2,
            });
          }
        };

        const step = (dt, t) => {
          const ramp = smooth(500, 2700, t);
          const boost = 1 + ramp * 5.4;
          for (let i = 0; i < stars.length; i += 1) {
            const s = stars[i];
            s.r += s.v * dt * boost * (0.35 + (s.r / MAXR) * 2.1);
            s.a += 0.00010 * dt * (0.5 + s.r / MAXR);
            if (s.r > MAXR) {
              s.r = 4 + Math.random() * 26;
              s.a = Math.random() * Math.PI * 2;
            }
          }
          if (t >= EXIT_AT && !sparksBorn) {
            sparksBorn = true;
            for (let i = 0; i < 150; i += 1) {
              const ang = Math.random() * Math.PI * 2;
              const sp = 0.4 + Math.random() * 2.6;
              sparks.push({
                x: CX,
                y: CY,
                vx: Math.cos(ang) * sp,
                vy: Math.sin(ang) * sp,
                life: 0.5 + Math.random() * 0.6,
                w: 0.7 + Math.random() * 1.8,
                c: PALETTE[(Math.random() * PALETTE.length) | 0],
              });
            }
          }
          for (let i = sparks.length - 1; i >= 0; i -= 1) {
            const p = sparks[i];
            p.x += p.vx * dt * 0.9;
            p.y += p.vy * dt * 0.9;
            p.vx *= 0.992;
            p.vy *= 0.992;
            p.life -= dt / 900;
            if (p.life <= 0) sparks.splice(i, 1);
          }
        };

        const paint = (t, dt) => {
          const ramp = smooth(500, 2700, t);
          const boost = 1 + ramp * 5.4;
          g.clearRect(0, 0, W, H);
          g.globalCompositeOperation = 'lighter';
          g.lineCap = 'round';

          if (t < EXIT_AT) {
            for (let k = 0; k < 4; k += 1) {
              const phase = (t * 0.00036 + k * 0.25) % 1;
              const rr = 40 + phase * MAXR * 1.35;
              g.strokeStyle = 'rgba(120,170,255,' + (0.16 * (1 - phase)).toFixed(3) + ')';
              g.lineWidth = 1 + (1 - phase) * 2.4;
              g.beginPath();
              g.arc(CX, CY, rr, 0, Math.PI * 2);
              g.stroke();
            }
          }

          for (let i = 0; i < stars.length; i += 1) {
            const s = stars[i];
            const len = 5 + (s.v * dt * boost * 7) + (s.r / MAXR) * 120 * (0.35 + ramp);
            const r0 = Math.max(1, s.r - len);
            const ca = Math.cos(s.a);
            const sa = Math.sin(s.a);
            const fade = clamp(s.r / MAXR, 0, 1);
            const alpha = (0.10 + fade * 0.78) * (0.75 + 0.25 * Math.sin(s.p + t * 0.004));
            g.strokeStyle = 'rgba(' + s.c[0] + ',' + s.c[1] + ',' + s.c[2] + ',' + alpha.toFixed(3) + ')';
            g.lineWidth = s.w;
            g.beginPath();
            g.moveTo(CX + ca * r0, CY + sa * r0);
            g.lineTo(CX + ca * s.r, CY + sa * s.r);
            g.stroke();
            if (s.w > 2.1) {
              g.fillStyle = 'rgba(' + s.c[0] + ',' + s.c[1] + ',' + s.c[2] + ',' + (alpha * 0.8).toFixed(3) + ')';
              g.beginPath();
              g.arc(CX + ca * s.r, CY + sa * s.r, s.w * 1.3, 0, Math.PI * 2);
              g.fill();
            }
          }

          for (let i = 0; i < sparks.length; i += 1) {
            const p = sparks[i];
            g.strokeStyle = 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ',' + clamp(p.life, 0, 1).toFixed(3) + ')';
            g.lineWidth = p.w;
            g.beginPath();
            g.moveTo(p.x - p.vx * 14, p.y - p.vy * 14);
            g.lineTo(p.x, p.y);
            g.stroke();
          }

          if (t >= EXIT_AT) {
            const e = t - EXIT_AT;
            for (let k = 0; k < 3; k += 1) {
              const rr = 30 + e * (0.9 + k * 0.25);
              g.strokeStyle = 'rgba(200,235,255,' + clamp(0.5 - e / 1400, 0, 0.5).toFixed(3) + ')';
              g.lineWidth = 2;
              g.beginPath();
              g.arc(CX, CY, rr, 0, Math.PI * 2);
              g.stroke();
            }
            g.fillStyle = 'rgba(255,255,255,' + clamp(0.85 - e / 420, 0, 0.85).toFixed(3) + ')';
            g.beginPath();
            g.arc(CX, CY, 60 * Math.max(0, 1 - e / 420), 0, Math.PI * 2);
            g.fill();
          }

          g.globalCompositeOperation = 'source-over';
        };

        const loop = (now) => {
          const t = now - startedAt;
          const dt = Math.min(40, Math.max(1, now - last));
          last = now;
          dtSafe = dt;
          step(dt, t);
          paint(t, dt);
          if (t < EXIT_AT + 1200) {
            frame = window.requestAnimationFrame(loop);
          }
        };

        const resize = () => {
          measure();
          seed();
          paint(startedAt ? performance.now() - startedAt : 0, dtSafe);
        };

        measure();
        seed();
        startedAt = performance.now() - (props.offset > 0 ? props.offset : 0);
        last = performance.now();

        if (reduced) {
          step(16, 1400);
          paint(1400, 16);
        } else {
          frame = window.requestAnimationFrame(loop);
        }
        window.addEventListener('resize', resize);

        return () => {
          window.cancelAnimationFrame(frame);
          window.removeEventListener('resize', resize);
        };
      }, []);

      return h('canvas', {
        ref: canvasRef,
        className: 'dsh-splash-canvas',
        'aria-hidden': true,
      });
    }

    function Splash(props) {
      const t = props.t;
      const reduced = React.useMemo(prefersReducedMotion, []);
      const offset = React.useMemo(prebootOffset, []);
      const continuing = offset > 0;
      const [phase, setPhase] = React.useState('in');
      const [alive, setAlive] = React.useState(true);
      const [ro, setRo] = React.useState(() => {
        const pct = percentAt(offset);
        return {
          pct,
          clock: clockAt(offset),
          hex: hexAt(offset),
          hud: hudAt(offset, pct),
          key: phaseKeyAt(offset, pct),
        };
      });

      const skip = React.useCallback(() => {
        setPhase('out');
      }, []);

      React.useEffect(() => {
        const timer = window.setTimeout(
          () => setPhase('out'),
          reduced ? 1400 : Math.max(0, EXIT_AT - offset),
        );
        return () => window.clearTimeout(timer);
      }, [reduced, offset]);

      React.useEffect(() => {
        if (phase !== 'out') return undefined;
        const timer = window.setTimeout(() => setAlive(false), reduced ? 420 : LINGER);
        return () => window.clearTimeout(timer);
      }, [phase, reduced]);

      React.useEffect(() => {
        if (reduced) {
          setRo({ pct: 100, clock: '00:01.400', hex: hexAt(1400), hud: 'READY', key: 'phaseReady' });
          return undefined;
        }
        const startedAt = performance.now() - offset;
        const timer = window.setInterval(() => {
          const elapsed = performance.now() - startedAt;
          const pct = percentAt(elapsed);
          setRo({
            pct,
            clock: clockAt(elapsed),
            hex: hexAt(elapsed),
            hud: hudAt(elapsed, pct),
            key: phaseKeyAt(elapsed, pct),
          });
        }, 80);
        return () => window.clearInterval(timer);
      }, [reduced]);

      React.useEffect(() => {
        const onKeyDown = (event) => {
          if (event.key === 'Escape') skip();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
      }, [skip]);

      if (!alive) return null;

      return h('div', {
        className: 'dsh-splash' + (continuing ? ' dsh-splash-continue' : '') + (phase === 'out' ? ' dsh-splash-out' : ''),
        role: 'status',
        'aria-live': 'polite',
        'aria-label': t('loading'),
        onClick: skip,
      },
        h('style', { key: 'style' }, STYLE),
        h(Warp, { key: 'warp', offset }),

        h('div', { key: 'aurora-a', className: 'dsh-aurora dsh-aurora-a', 'aria-hidden': true }),
        h('div', { key: 'aurora-b', className: 'dsh-aurora dsh-aurora-b', 'aria-hidden': true }),
        h('div', { key: 'aurora-c', className: 'dsh-aurora dsh-aurora-c', 'aria-hidden': true }),
        h('div', { key: 'rays', className: 'dsh-rays', 'aria-hidden': true }),
        h('div', { key: 'glow', className: 'dsh-glow', 'aria-hidden': true }),
        h('div', { key: 'flare', className: 'dsh-flare', 'aria-hidden': true }),
        h('div', { key: 'flare-v', className: 'dsh-flare-v', 'aria-hidden': true }),

        h('div', { key: 'hud', className: 'dsh-hud', 'aria-hidden': true },
          h('div', { key: 'tl', className: 'dsh-hud-tl' },
            'DSH ', h('span', { className: 'dsh-hud-cyan' }, '//'), ' HYPERDRIVE BOOT ',
            h('b', null, 'v' + VERSION),
          ),
          h('div', { key: 'tr', className: 'dsh-hud-tr' }, 'T+', h('span', null, ro.clock)),
          h('div', { key: 'bl', className: 'dsh-hud-bl' },
            'NODE ', h('b', null, 'SHA-01'), ' · ', h('span', null, ro.hex),
          ),
          h('div', { key: 'br', className: 'dsh-hud-br' },
            h('span', null, ro.hud), ' · SYNC',
          ),
        ),

        h('div', { key: 'corner-tl', className: 'dsh-corner dsh-corner-tl', 'aria-hidden': true }),
        h('div', { key: 'corner-tr', className: 'dsh-corner dsh-corner-tr', 'aria-hidden': true }),
        h('div', { key: 'corner-bl', className: 'dsh-corner dsh-corner-bl', 'aria-hidden': true }),
        h('div', { key: 'corner-br', className: 'dsh-corner dsh-corner-br', 'aria-hidden': true }),

        h('div', { key: 'side-l', className: 'dsh-side dsh-side-l', 'aria-hidden': true }, 'DEEPSEEK HARNESS'),
        h('div', { key: 'side-r', className: 'dsh-side dsh-side-r', 'aria-hidden': true }, 'HYPERSPACE · BUILD 2026.10'),

        h('div', { key: 'stage', className: 'dsh-stage', 'aria-hidden': true },
          h('div', { key: 'kicker', className: 'dsh-kicker' },
            h('i', { key: 'dot' }),
            t('kicker'),
          ),
          h('h1', { key: 'title', className: 'dsh-title' },
            h('span', { key: 'l1', className: 'dsh-line dsh-line-1', 'data-text': 'DEEPSEEK' }, 'DEEPSEEK'),
            h('span', { key: 'l2', className: 'dsh-line dsh-line-2', 'data-text': 'HARNESS' }, 'HARNESS'),
          ),
          h('div', { key: 'sub', className: 'dsh-sub' }, t('sub')),
          h('div', { key: 'meter', className: 'dsh-meter' },
            h('div', { key: 'row', className: 'dsh-meter-row' },
              h('span', { key: 'phase' }, t(ro.key)),
              h('span', { key: 'pct', className: 'dsh-pct' }, ro.pct + '%'),
            ),
            h('div', { key: 'track', className: 'dsh-track' },
              h('span', { key: 'fill', className: 'dsh-fill', style: { width: ro.pct + '%' } }),
            ),
            h('div', { key: 'ticks', className: 'dsh-ticks' },
              h('span', { key: 't0' }, '00'),
              h('span', { key: 't1' }, '25'),
              h('span', { key: 't2' }, '50'),
              h('span', { key: 't3' }, '75'),
              h('span', { key: 't4' }, '100'),
            ),
          ),
        ),

        h('div', { key: 'scanlines', className: 'dsh-scanlines', 'aria-hidden': true }),
        h('div', { key: 'scan', className: 'dsh-scan', 'aria-hidden': true }),
        h('div', { key: 'vignette', className: 'dsh-vignette', 'aria-hidden': true }),

        h('div', { key: 'flash', className: 'dsh-flash', 'aria-hidden': true }),
        h('div', { key: 'shock-1', className: 'dsh-shock dsh-shock-1', 'aria-hidden': true }),
        h('div', { key: 'shock-2', className: 'dsh-shock dsh-shock-2', 'aria-hidden': true }),
        h('div', { key: 'shock-3', className: 'dsh-shock dsh-shock-3', 'aria-hidden': true }),

        h('button', {
          key: 'skip',
          type: 'button',
          className: 'dsh-skip',
          onClick: (event) => {
            event.stopPropagation();
            skip();
          },
        }, t('skip')),
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => {
          const disposeEn = ctx.locale.register(NS, 'en', EN);
          const disposeZh = ctx.locale.register(NS, 'zh', ZH);
          return () => {
            disposeZh();
            disposeEn();
          };
        }, 'startup-splash: dictionaries');

        const t = ctx.locale.bind(NS);

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'startup-splash',
          order: 1000,
          inject: () => ({ t }),
        }, Splash));
      },
    };
  },
});