/**
 * Client half of the DeepSeek Harness startup splash — v3 "Supernova".
 *
 * A frame-wide, one-shot cinematic boot sequence rendered into `shell.overlay`:
 *   0.0–1.5s  IGNITION   hundreds of streaks converge into a growing singularity
 *                        core while lightning arcs snap around it;
 *   1.5–2.0s  CRITICAL   the core goes white-hot, convergence triples, a red
 *                        overload vignette pulses and the frame starts to rumble;
 *   2.0s      DETONATION full-screen flash, violent screen quake, 400+ debris
 *                        fragments, three shockwave rings, a fireball and god rays;
 *   2.0–2.6s  SLAM       the DEEPSEEK / HARNESS wordmark slams out of the blast
 *                        with blur-settle, impact shake and RGB glitch bursts;
 *   2.6–3.6s  STABILIZE  embers drift through the afterglow, readout hits 100%;
 *   3.6s      JUMP       everything stretches into hyperspace streaks and the
 *                        overlay flashes and fades away for good.
 *
 * Design notes:
 * - The backdrop is intentionally theme-independent dark: the sequence is a
 *   film, not a themed surface, so it looks the same in light and dark UI.
 * - One canvas draws plain lines, dots and at most one radial gradient per
 *   frame (no shadows, filters or per-particle gradients); the CSS layers are
 *   transform/opacity only, so it stays cheap.
 * - Everything is owned by the component: unmount cancels the frame loop and
 *   removes the styles. Click / Escape skips.
 * - The Host half paints a pre-boot copy of the same timeline; this half reads
 *   `window.__DSH_SPLASH_PREBOOT__` and continues it instead of restarting.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-startup-splash',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-startup-splash';
    const VERSION = '3.0.0';
    const CHARGE_END = 1500;
    const BOOM_AT = 2000;
    const EXIT_AT = 3600;
    const LINGER = 980;

    const EN = {
      loading: 'Loading DeepSeek Harness',
      kicker: 'Singularity online',
      sub: 'Supernova boot sequence',
      phaseCore: 'Charging singularity',
      phaseCrit: 'Critical overload',
      phaseBoom: 'Detonation',
      phaseOnline: 'System online',
      phaseJump: 'Jumping to hyperspace',
      skip: 'Click / Esc to skip',
    };
    const ZH = {
      loading: '正在加载 DeepSeek Harness',
      kicker: '奇点在线',
      sub: '超新星启动序列',
      phaseCore: '奇点充能',
      phaseCrit: '临界过载',
      phaseBoom: '聚变爆发',
      phaseOnline: '系统在线',
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

.dsh-frame {
  position: absolute;
  inset: 0;
  will-change: transform;
}
.dsh-splash-boom .dsh-frame {
  animation: dsh-quake 640ms cubic-bezier(.36, .07, .19, .97) both;
}
.dsh-splash-boomdone .dsh-frame { animation: none; }

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
  background: radial-gradient(closest-side, rgba(70, 104, 255, .34) 0%, rgba(70, 104, 255, 0) 70%);
  animation: dsh-drift-a 10s ease-in-out infinite alternate;
}
.dsh-aurora-b {
  width: 110vmax; height: 92vmax; right: -42vmax; top: -10vmax;
  background: radial-gradient(closest-side, rgba(160, 107, 255, .32) 0%, rgba(160, 107, 255, 0) 70%);
  animation: dsh-drift-b 13s ease-in-out infinite alternate;
}
.dsh-aurora-c {
  width: 104vmax; height: 78vmax; left: 6vmax; bottom: -40vmax;
  background: radial-gradient(closest-side, rgba(53, 230, 255, .26) 0%, rgba(53, 230, 255, 0) 70%);
  animation: dsh-drift-c 9s ease-in-out infinite alternate;
}

.dsh-rays {
  position: absolute;
  left: 50%; top: 46%;
  width: 160vmax; height: 160vmax;
  margin: -80vmax 0 0 -80vmax;
  pointer-events: none;
  opacity: .22;
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

.dsh-crit {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(118% 92% at 50% 46%,
    transparent 42%,
    rgba(255, 62, 120, .16) 74%,
    rgba(255, 92, 60, .34) 100%);
  mix-blend-mode: screen;
}
.dsh-splash-crit .dsh-crit { animation: dsh-crit 420ms ease-in-out infinite; }

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
}
.dsh-flare-v {
  width: 1px;
  height: min(46vh, 460px);
  transform: translate(-50%, -50%) scaleY(.12);
  background: linear-gradient(180deg, transparent 0%, rgba(150, 200, 255, .5) 40%, rgba(255, 255, 255, .85) 50%, rgba(120, 160, 255, .35) 62%, transparent 100%);
}
.dsh-splash-boom .dsh-flare { animation: dsh-flare 2400ms cubic-bezier(.2, .7, .2, 1) 120ms both; }
.dsh-splash-boom .dsh-flare-v { animation: dsh-flare-v 2400ms cubic-bezier(.2, .7, .2, 1) 120ms both; }
.dsh-splash-boomdone .dsh-flare,
.dsh-splash-boomdone .dsh-flare-v { animation: none; opacity: 0; }

.dsh-stage {
  position: absolute;
  left: 50%; top: 46%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: min(92vw, 1100px);
  will-change: transform;
}
.dsh-splash-boom .dsh-stage {
  animation: dsh-impact 460ms cubic-bezier(.36, .07, .19, .97) 80ms both;
}
.dsh-splash-boomdone .dsh-stage {
  animation: none;
  transform: translate(-50%, -50%);
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
.dsh-splash-crit .dsh-kicker i { background: #ff5c7a; box-shadow: 0 0 12px 2px rgba(255, 92, 122, .9); }

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
  opacity: 0;
}
.dsh-line-1 {
  background: linear-gradient(180deg, #ffffff 0%, #dbe7ff 34%, #8fb0ff 66%, #4d6bfe 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 26px rgba(77, 107, 254, .38));
}
.dsh-line-2 {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(168, 204, 255, .78);
  background: linear-gradient(180deg, rgba(120, 170, 255, .10), rgba(77, 107, 254, .02));
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 0 36px rgba(53, 230, 255, .22);
}
.dsh-splash-boom .dsh-line-1 { animation: dsh-slam 680ms cubic-bezier(.16, 1, .3, 1) 40ms both; }
.dsh-splash-boom .dsh-line-2 { animation: dsh-slam 680ms cubic-bezier(.16, 1, .3, 1) 150ms both; }
.dsh-splash-boomdone .dsh-line-1,
.dsh-splash-boomdone .dsh-line-2 {
  animation: none;
  opacity: 1;
  transform: none;
  filter: none;
}
.dsh-splash-boomdone .dsh-line-1 { filter: drop-shadow(0 0 26px rgba(77, 107, 254, .38)); }
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
.dsh-splash-boom .dsh-line-1::after { animation: dsh-glitch 900ms steps(2, jump-none) 640ms 2; }
.dsh-splash-boom .dsh-line-2::after { animation: dsh-glitch 900ms steps(2, jump-none) 780ms 2; color: #ff3ea5; }
.dsh-splash-boomdone .dsh-line-1::after,
.dsh-splash-boomdone .dsh-line-2::after { animation: none; }

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
.dsh-splash-crit .dsh-meter-row { color: rgba(255, 168, 190, .9); }
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
.dsh-shock-3 { border-color: rgba(255, 62, 165, .5); border-width: 1px; }

.dsh-splash-boom .dsh-flash { animation: dsh-flash 760ms ease-out both; }
.dsh-splash-boom .dsh-shock { animation: dsh-shock 950ms cubic-bezier(.16, .8, .24, 1) both; }
.dsh-splash-boom .dsh-shock-2 { animation-delay: 90ms; }
.dsh-splash-boom .dsh-shock-3 { animation-delay: 180ms; }
.dsh-splash-boomdone .dsh-flash,
.dsh-splash-boomdone .dsh-shock { animation: none; opacity: 0; }

.dsh-splash-out .dsh-stage { animation: dsh-burst 700ms cubic-bezier(.3, .7, .2, 1) forwards; }

.dsh-splash-late .dsh-kicker,
.dsh-splash-late .dsh-sub,
.dsh-splash-late .dsh-meter,
.dsh-splash-late .dsh-hud-tl,
.dsh-splash-late .dsh-hud-tr,
.dsh-splash-late .dsh-hud-bl,
.dsh-splash-late .dsh-hud-br,
.dsh-splash-late .dsh-corner,
.dsh-splash-late .dsh-side,
.dsh-splash-late .dsh-skip {
  animation: none;
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
@keyframes dsh-crit {
  0%, 100% { opacity: .35; }
  50% { opacity: .95; }
}
@keyframes dsh-quake {
  0% { transform: translate(0, 0); }
  12% { transform: translate(-13px, 8px) scale(1.012); }
  24% { transform: translate(11px, -7px); }
  38% { transform: translate(-8px, -5px) scale(1.006); }
  52% { transform: translate(6px, 4px); }
  68% { transform: translate(-4px, 2px); }
  84% { transform: translate(2px, -1px); }
  100% { transform: translate(0, 0); }
}
@keyframes dsh-impact {
  0% { transform: translate(-50%, -50%) scale(1.05); }
  30% { transform: translate(calc(-50% + 5px), calc(-50% - 3px)) scale(1.012); }
  60% { transform: translate(calc(-50% - 3px), calc(-50% + 2px)) scale(1); }
  100% { transform: translate(-50%, -50%) scale(1); }
}
@keyframes dsh-slam {
  0% { opacity: 0; transform: scale(2.6); filter: blur(18px); }
  55% { opacity: 1; filter: blur(0); }
  72% { transform: scale(.985); }
  100% { opacity: 1; transform: scale(1); filter: blur(0); }
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
@keyframes dsh-glitch {
  0% { opacity: 0; transform: translate(0, 0); clip-path: inset(0 0 100% 0); }
  12% { opacity: .9; transform: translate(-7px, 2px); clip-path: inset(12% 0 58% 0); }
  24% { opacity: .75; transform: translate(6px, -2px); clip-path: inset(56% 0 18% 0); }
  36% { opacity: 0; transform: translate(0, 0); clip-path: inset(0 0 100% 0); }
  100% { opacity: 0; }
}
@keyframes dsh-flash {
  0% { opacity: 0; }
  14% { opacity: 1; }
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
  .dsh-crit { display: none; }
  .dsh-skip { opacity: 1; }
}
`;

    const PALETTE = [
      [130, 168, 255],
      [86, 224, 255],
      [168, 124, 255],
      [255, 96, 180],
      [235, 244, 255],
      [255, 186, 110],
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
        return Math.min(3400, Math.max(0, performance.now() - pre.startedAt));
      } catch {
        return 0;
      }
    }

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const smooth = (a, b, v) => {
      const x = clamp((v - a) / (b - a), 0, 1);
      return x * x * (3 - 2 * x);
    };

    /** Shared with the pre-boot layer: identical curve on both halves. */
    function percentAt(t) {
      if (t >= BOOM_AT) return 100;
      if (t >= CHARGE_END) {
        const p = (t - CHARGE_END) / (BOOM_AT - CHARGE_END);
        let v = 62 + 35 * (1 - Math.pow(1 - p, 1.6));
        if (v > 78 && v < 84) v = 80;
        if (v > 90 && v < 95) v = 93;
        return Math.min(99, Math.round(v));
      }
      const p = clamp(t / CHARGE_END, 0, 1);
      let v = 62 * (1 - Math.pow(1 - p, 2.2));
      if (v > 17 && v < 23) v = 19;
      if (v > 41 && v < 47) v = 44;
      return Math.round(v);
    }

    function phaseKeyAt(t) {
      if (t >= EXIT_AT) return 'phaseJump';
      if (t >= BOOM_AT + 600) return 'phaseOnline';
      if (t >= BOOM_AT) return 'phaseBoom';
      if (t >= CHARGE_END) return 'phaseCrit';
      return 'phaseCore';
    }

    function hudAt(t) {
      if (t >= EXIT_AT) return 'JUMP';
      if (t >= BOOM_AT + 600) return 'ONLINE';
      if (t >= BOOM_AT) return 'DETONATE';
      if (t >= CHARGE_END) return 'CRITICAL';
      return 'CHARGE';
    }

    function clockAt(t) {
      const ss = Math.floor(t / 1000);
      const ms = Math.floor(t % 1000);
      return String(ss).padStart(2, '0') + ':' + String(ms).padStart(3, '0');
    }

    function hexAt(t) {
      return '0x' + ((t * 2654435761) >>> 0).toString(16).slice(0, 6).toUpperCase();
    }

    function readoutAt(t) {
      return {
        pct: percentAt(t),
        clock: clockAt(t),
        hex: hexAt(t),
        hud: hudAt(t),
        key: phaseKeyAt(t),
      };
    }

    /**
     * Full-viewport canvas: converging singularity, lightning arcs, detonation
     * debris, shockwaves, embers and the exit hyperspace stretch.
     */
    function Supernova(props) {
      const canvasRef = React.useRef(null);

      React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const g = canvas.getContext('2d');
        if (!g) return undefined;

        const reduced = prefersReducedMotion();
        const conv = [];
        const arcs = [];
        const debris = [];
        const embers = [];
        const jump = [];
        let debrisBorn = false;
        let embersBorn = false;
        let jumpBorn = false;
        let arcTimer = 0;
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
          conv.length = 0;
          const count = Math.round(Math.min(380, Math.max(170, (W * H) / 5400)));
          for (let i = 0; i < count; i += 1) {
            conv.push({
              a: Math.random() * Math.PI * 2,
              r: 30 + Math.random() * MAXR,
              v: 0.12 + Math.random() * 0.35,
              w: 0.6 + Math.random() * 2.0,
              c: PALETTE[(Math.random() * PALETTE.length) | 0],
              p: Math.random() * Math.PI * 2,
            });
          }
        };

        const coreRadius = (t) => {
          let r = 5 + 22 * smooth(0, CHARGE_END, t);
          if (t >= CHARGE_END && t < BOOM_AT) {
            r += 3 + Math.sin(t * 0.09) * 2 + Math.sin(t * 0.161) * 1.6;
          }
          return r;
        };

        const step = (dt, t) => {
          if (t < BOOM_AT) {
            const mult = 1 + smooth(0, CHARGE_END, t) * 0.8 + smooth(CHARGE_END, BOOM_AT, t) * 2.2;
            const core = coreRadius(t);
            for (let i = 0; i < conv.length; i += 1) {
              const s = conv[i];
              s.r -= s.v * dt * mult;
              s.a += 0.00016 * dt * (0.4 + s.r / MAXR);
              if (s.r < core + 6) {
                s.r = MAXR * (0.72 + Math.random() * 0.38);
                s.a = Math.random() * Math.PI * 2;
              }
            }
            arcTimer += dt;
            const gap = 170 - smooth(CHARGE_END, BOOM_AT, t) * 105;
            if (t > 500 && arcTimer > gap) {
              arcTimer = 0;
              let ang = Math.random() * Math.PI * 2;
              let rad = core + 6;
              const pts = [[CX + Math.cos(ang) * rad, CY + Math.sin(ang) * rad]];
              const segs = 4 + ((Math.random() * 3) | 0);
              for (let k = 0; k < segs; k += 1) {
                ang += (Math.random() - 0.5) * 1.1;
                rad += 7 + Math.random() * 16;
                pts.push([CX + Math.cos(ang) * rad, CY + Math.sin(ang) * rad]);
              }
              arcs.push({ pts, born: t });
            }
            for (let i = arcs.length - 1; i >= 0; i -= 1) {
              if (t - arcs[i].born > 170) arcs.splice(i, 1);
            }
            return;
          }

          const e = t - BOOM_AT;
          if (!debrisBorn) {
            debrisBorn = true;
            for (let i = 0; i < 430; i += 1) {
              const ang = Math.random() * Math.PI * 2;
              const fast = i % 11 === 0;
              const sp = fast
                ? 2.6 + Math.random() * 1.9
                : 0.25 + Math.pow(Math.random(), 1.6) * 2.2;
              debris.push({
                x: CX,
                y: CY,
                vx: Math.cos(ang) * sp,
                vy: Math.sin(ang) * sp,
                life: 700 + Math.random() * 1100,
                w: fast ? 1.6 + Math.random() * 1.6 : 0.7 + Math.random() * 1.5,
                c: PALETTE[(Math.random() * PALETTE.length) | 0],
              });
            }
          }
          const drag = 1 - 0.012 * (dt / 16.7);
          for (let i = debris.length - 1; i >= 0; i -= 1) {
            const p = debris[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= drag;
            p.vy *= drag;
            p.life -= dt;
            if (p.life <= 0) debris.splice(i, 1);
          }
          if (!embersBorn && e > 160) {
            embersBorn = true;
            for (let i = 0; i < 90; i += 1) {
              embers.push({
                x: CX + (Math.random() - 0.5) * W * 0.72,
                y: CY + (Math.random() - 0.5) * H * 0.62,
                vx: (Math.random() - 0.5) * 0.05,
                vy: (Math.random() - 0.5) * 0.04 + 0.016,
                life: 2600 + Math.random() * 1400,
                w: 0.8 + Math.random() * 1.6,
                c: PALETTE[(Math.random() * PALETTE.length) | 0],
                p: Math.random() * Math.PI * 2,
              });
            }
          }
          for (let i = embers.length - 1; i >= 0; i -= 1) {
            const p = embers[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) embers.splice(i, 1);
          }
          if (t >= EXIT_AT) {
            if (!jumpBorn) {
              jumpBorn = true;
              for (let i = 0; i < 240; i += 1) {
                jump.push({
                  a: Math.random() * Math.PI * 2,
                  r: 8 + Math.random() * MAXR * 0.35,
                  v: 0.5 + Math.random() * 1.5,
                  w: 0.6 + Math.random() * 2.0,
                  c: PALETTE[(Math.random() * PALETTE.length) | 0],
                });
              }
            }
            const ramp = 1 + smooth(EXIT_AT, EXIT_AT + 450, t) * 9;
            for (let i = 0; i < jump.length; i += 1) {
              const s = jump[i];
              s.r += s.v * dt * ramp * (0.4 + (s.r / MAXR) * 2.2);
            }
          }
        };

        const paint = (t, dt) => {
          g.clearRect(0, 0, W, H);
          g.globalCompositeOperation = 'lighter';
          g.lineCap = 'round';

          if (t < BOOM_AT) {
            const core = coreRadius(t);
            const crit = smooth(CHARGE_END, BOOM_AT, t);

            for (let k = 0; k < 3; k += 1) {
              const phase = (t * 0.00030 + k / 3) % 1;
              const rr = core + (MAXR * 0.92) * (1 - phase);
              g.strokeStyle = 'rgba(120,170,255,' + (0.05 + phase * 0.30).toFixed(3) + ')';
              g.lineWidth = 1 + phase * 1.6;
              g.beginPath();
              g.arc(CX, CY, rr, 0, Math.PI * 2);
              g.stroke();
            }

            for (let i = 0; i < conv.length; i += 1) {
              const s = conv[i];
              const near = 1 - clamp(s.r / MAXR, 0, 1);
              const len = 8 + s.v * dt * 6 + near * 46;
              const r1 = s.r + len;
              const ca = Math.cos(s.a);
              const sa = Math.sin(s.a);
              const alpha = (0.14 + near * 0.74) * (0.78 + 0.22 * Math.sin(s.p + t * 0.004));
              g.strokeStyle = 'rgba(' + s.c[0] + ',' + s.c[1] + ',' + s.c[2] + ',' + alpha.toFixed(3) + ')';
              g.lineWidth = s.w;
              g.beginPath();
              g.moveTo(CX + ca * s.r, CY + sa * s.r);
              g.lineTo(CX + ca * r1, CY + sa * r1);
              g.stroke();
            }

            for (let i = 0; i < arcs.length; i += 1) {
              const arc = arcs[i];
              const a = clamp(1 - (t - arc.born) / 170, 0, 1);
              g.strokeStyle = 'rgba(190,235,255,' + (a * 0.85).toFixed(3) + ')';
              g.lineWidth = 1.2;
              g.beginPath();
              g.moveTo(arc.pts[0][0], arc.pts[0][1]);
              for (let k = 1; k < arc.pts.length; k += 1) {
                g.lineTo(arc.pts[k][0], arc.pts[k][1]);
              }
              g.stroke();
            }

            const flick = t >= CHARGE_END ? 0.72 + 0.28 * Math.abs(Math.sin(t * 0.045) * Math.sin(t * 0.013)) : 1;
            g.fillStyle = 'rgba(77,107,254,' + (0.16 * flick).toFixed(3) + ')';
            g.beginPath();
            g.arc(CX, CY, core * 3.4, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = 'rgba(140,210,255,' + (0.34 * flick).toFixed(3) + ')';
            g.beginPath();
            g.arc(CX, CY, core * 1.8, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = 'rgba(255,255,255,' + (0.92 * flick).toFixed(3) + ')';
            g.beginPath();
            g.arc(CX, CY, core, 0, Math.PI * 2);
            g.fill();
            g.strokeStyle = 'rgba(210,240,255,' + (0.5 * flick).toFixed(3) + ')';
            g.lineWidth = 1.4;
            g.beginPath();
            g.moveTo(CX - core * 6, CY);
            g.lineTo(CX + core * 6, CY);
            g.moveTo(CX, CY - core * 4);
            g.lineTo(CX, CY + core * 4);
            g.stroke();
            if (crit > 0.02) {
              g.strokeStyle = 'rgba(255,92,122,' + (crit * 0.4).toFixed(3) + ')';
              g.lineWidth = 2;
              g.beginPath();
              g.arc(CX, CY, core * 2.6 + Math.sin(t * 0.03) * 6, 0, Math.PI * 2);
              g.stroke();
            }
          } else {
            const e = t - BOOM_AT;

            if (e < 560) {
              const rad = 30 + e * 1.1;
              const grad = g.createRadialGradient(CX, CY, 0, CX, CY, rad);
              const a = 1 - e / 560;
              grad.addColorStop(0, 'rgba(255,255,255,' + (0.95 * a).toFixed(3) + ')');
              grad.addColorStop(0.45, 'rgba(150,220,255,' + (0.55 * a).toFixed(3) + ')');
              grad.addColorStop(1, 'rgba(77,107,254,0)');
              g.fillStyle = grad;
              g.beginPath();
              g.arc(CX, CY, rad, 0, Math.PI * 2);
              g.fill();
            }

            if (e < 950) {
              const a = (1 - e / 950) * 0.16;
              const len = MAXR * (0.45 + 0.55 * smooth(0, 900, e));
              g.fillStyle = 'rgba(190,225,255,' + a.toFixed(3) + ')';
              for (let i = 0; i < 22; i += 1) {
                const ang = (i / 22) * Math.PI * 2 + e * 0.0004;
                g.beginPath();
                g.moveTo(CX, CY);
                g.lineTo(CX + Math.cos(ang - 0.014) * len, CY + Math.sin(ang - 0.014) * len);
                g.lineTo(CX + Math.cos(ang + 0.014) * len, CY + Math.sin(ang + 0.014) * len);
                g.closePath();
                g.fill();
              }
            }

            if (e < 1500) {
              const rings = [
                [1.05, 'rgba(235,244,255,', 3],
                [1.4, 'rgba(53,230,255,', 2],
                [1.75, 'rgba(255,62,165,', 1.4],
              ];
              for (let k = 0; k < rings.length; k += 1) {
                const rr = 20 + e * rings[k][0];
                const a = clamp(0.55 - e / 1500, 0, 0.55);
                g.strokeStyle = rings[k][1] + a.toFixed(3) + ')';
                g.lineWidth = rings[k][2];
                g.beginPath();
                g.arc(CX, CY, rr, 0, Math.PI * 2);
                g.stroke();
              }
            }

            for (let i = 0; i < debris.length; i += 1) {
              const p = debris[i];
              const a = clamp(p.life / 700, 0, 1) * 0.9;
              g.strokeStyle = 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ',' + a.toFixed(3) + ')';
              g.lineWidth = p.w;
              g.beginPath();
              g.moveTo(p.x - p.vx * 10, p.y - p.vy * 10);
              g.lineTo(p.x, p.y);
              g.stroke();
            }

            for (let i = 0; i < embers.length; i += 1) {
              const p = embers[i];
              const a = clamp(p.life / 1200, 0, 1) * (0.42 + 0.42 * Math.sin(p.p + t * 0.02));
              if (a <= 0.02) continue;
              g.fillStyle = 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ',' + a.toFixed(3) + ')';
              g.beginPath();
              g.arc(p.x, p.y, p.w, 0, Math.PI * 2);
              g.fill();
            }

            if (t >= EXIT_AT) {
              const ramp = 1 + smooth(EXIT_AT, EXIT_AT + 450, t) * 9;
              for (let i = 0; i < jump.length; i += 1) {
                const s = jump[i];
                const len = 26 + ramp * 26;
                const r0 = Math.max(1, s.r - len);
                const ca = Math.cos(s.a);
                const sa = Math.sin(s.a);
                const a = 0.18 + clamp(s.r / MAXR, 0, 1) * 0.7;
                g.strokeStyle = 'rgba(' + s.c[0] + ',' + s.c[1] + ',' + s.c[2] + ',' + a.toFixed(3) + ')';
                g.lineWidth = s.w;
                g.beginPath();
                g.moveTo(CX + ca * r0, CY + sa * r0);
                g.lineTo(CX + ca * s.r, CY + sa * s.r);
                g.stroke();
              }
              const fade = clamp(1 - (t - EXIT_AT) / 400, 0, 1);
              if (fade > 0.02) {
                g.fillStyle = 'rgba(255,255,255,' + (0.7 * fade).toFixed(3) + ')';
                g.beginPath();
                g.arc(CX, CY, 46 * fade + 6, 0, Math.PI * 2);
                g.fill();
              }
            }
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
          if (t < EXIT_AT + 800) {
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
          for (let tt = 0; tt <= 2800; tt += 50) step(50, tt);
          paint(2800, 16);
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
      const late = offset >= 600;
      const lateBoom = offset >= BOOM_AT;
      const [phase, setPhase] = React.useState(() => {
        if (lateBoom) return 'boom';
        if (offset >= CHARGE_END) return 'crit';
        return 'charge';
      });
      const [boomed, setBoomed] = React.useState(lateBoom);
      const [alive, setAlive] = React.useState(true);
      const [ro, setRo] = React.useState(() => readoutAt(offset));

      const skip = React.useCallback(() => {
        setPhase('out');
      }, []);

      React.useEffect(() => {
        const timers = [];
        const detonate = () => {
          setBoomed(true);
          setPhase('boom');
        };
        if (reduced) {
          timers.push(window.setTimeout(detonate, 60));
          timers.push(window.setTimeout(() => setPhase('out'), 1400));
        } else {
          if (offset < CHARGE_END) {
            timers.push(window.setTimeout(() => setPhase('crit'), CHARGE_END - offset));
          }
          if (offset < BOOM_AT) {
            timers.push(window.setTimeout(detonate, BOOM_AT - offset));
          }
          timers.push(window.setTimeout(() => setPhase('out'), Math.max(0, EXIT_AT - offset)));
        }
        return () => timers.forEach((id) => window.clearTimeout(id));
      }, [reduced, offset]);

      React.useEffect(() => {
        if (phase !== 'out') return undefined;
        const timer = window.setTimeout(() => setAlive(false), reduced ? 420 : LINGER);
        return () => window.clearTimeout(timer);
      }, [phase, reduced]);

      React.useEffect(() => {
        if (reduced) {
          setRo({ pct: 100, clock: '00:02.800', hex: hexAt(2800), hud: 'ONLINE', key: 'phaseOnline' });
          return undefined;
        }
        const startedAt = performance.now() - offset;
        const timer = window.setInterval(() => {
          setRo(readoutAt(performance.now() - startedAt));
        }, 80);
        return () => window.clearInterval(timer);
      }, [reduced, offset]);

      React.useEffect(() => {
        const onKeyDown = (event) => {
          if (event.key === 'Escape') skip();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
      }, [skip]);

      if (!alive) return null;

      const className = 'dsh-splash'
        + (late ? ' dsh-splash-late' : '')
        + (lateBoom ? ' dsh-splash-boomdone' : '')
        + (boomed ? ' dsh-splash-boom' : '')
        + (phase === 'crit' ? ' dsh-splash-crit' : '')
        + (phase === 'out' ? ' dsh-splash-out' : '');

      return h('div', {
        className,
        role: 'status',
        'aria-live': 'polite',
        'aria-label': t('loading'),
        onClick: skip,
      },
        h('style', { key: 'style' }, STYLE),
        h('div', { key: 'frame', className: 'dsh-frame' },
          h(Supernova, { key: 'canvas', offset }),

          h('div', { key: 'aurora-a', className: 'dsh-aurora dsh-aurora-a', 'aria-hidden': true }),
          h('div', { key: 'aurora-b', className: 'dsh-aurora dsh-aurora-b', 'aria-hidden': true }),
          h('div', { key: 'aurora-c', className: 'dsh-aurora dsh-aurora-c', 'aria-hidden': true }),
          h('div', { key: 'rays', className: 'dsh-rays', 'aria-hidden': true }),
          h('div', { key: 'glow', className: 'dsh-glow', 'aria-hidden': true }),
          h('div', { key: 'crit', className: 'dsh-crit', 'aria-hidden': true }),
          h('div', { key: 'flare', className: 'dsh-flare', 'aria-hidden': true }),
          h('div', { key: 'flare-v', className: 'dsh-flare-v', 'aria-hidden': true }),

          h('div', { key: 'hud', className: 'dsh-hud', 'aria-hidden': true },
            h('div', { key: 'tl', className: 'dsh-hud-tl' },
              'DSH ', h('span', { className: 'dsh-hud-cyan' }, '//'), ' SUPERNOVA BOOT ',
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
          h('div', { key: 'side-r', className: 'dsh-side dsh-side-r', 'aria-hidden': true }, 'SUPERNOVA · BUILD 2026.10'),

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
        ),

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
