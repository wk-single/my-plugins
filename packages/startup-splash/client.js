/**
 * Client half of the DeepSeek Harness startup splash.
 *
 * A frame-wide, one-shot hyperspace boot sequence rendered into `shell.overlay`.
 * The whole viewport carries the motion: a warp starfield on canvas, drifting
 * aurora fields, a rotating light fan, full-screen expanding rings, a HUD frame
 * and scanline. The centered stage holds an energy core, the wordmark and a live
 * boot readout. It plays for ~3s, then bursts and flashes out.
 *
 * Everything is cheap by design: one canvas drawing plain lines (no per-face
 * shading or sorting) plus GPU-composited CSS transforms. All resources belong
 * to the component, so unmounting cancels the frame loop and removes the styles.
 * Click / Escape skips.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-startup-splash',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-startup-splash';
    const EN = {
      loading: 'Loading DeepSeek Harness',
      phaseCore: 'Initializing core',
      phaseLoad: 'Loading modules',
      phaseReady: 'Ready',
      skip: 'Click anywhere to skip',
    };
    const ZH = {
      loading: '正在加载 DeepSeek Harness',
      phaseCore: '初始化核心',
      phaseLoad: '装载模块',
      phaseReady: '即将就绪',
      skip: '点击任意位置跳过',
    };

    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/*<>';

    const STYLE = `
.dsh-splash {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: grid;
  place-items: center;
  overflow: hidden;
  pointer-events: auto;
  background:
    radial-gradient(90% 70% at 50% 46%, rgba(60, 90, 220, .18) 0%, transparent 62%),
    radial-gradient(120% 90% at 50% -10%, color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 14%, transparent) 0%, transparent 55%),
    var(--dsw-alias-bg-base, #08090f);
  color: var(--dsw-alias-label-primary, #f4f5f7);
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  opacity: 1;
  transform: scale(1);
  transition: opacity 700ms cubic-bezier(.4, 0, .2, 1), transform 700ms cubic-bezier(.4, 0, .2, 1);
  will-change: opacity, transform;
}
.dsh-splash-out {
  opacity: 0;
  transform: scale(1.04);
  pointer-events: none;
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
  opacity: .55;
}
.dsh-aurora-a {
  width: 95vmax;
  height: 72vmax;
  left: -28vmax;
  top: -22vmax;
  background: radial-gradient(closest-side, rgba(70, 104, 255, .34) 0%, rgba(70, 104, 255, 0) 72%);
  animation: dsh-aurora-a 9s ease-in-out infinite alternate;
}
.dsh-aurora-b {
  width: 88vmax;
  height: 76vmax;
  right: -32vmax;
  top: 2vmax;
  background: radial-gradient(closest-side, rgba(124, 92, 255, .32) 0%, rgba(124, 92, 255, 0) 72%);
  animation: dsh-aurora-b 12s ease-in-out infinite alternate;
}
.dsh-aurora-c {
  width: 82vmax;
  height: 62vmax;
  left: 8vmax;
  bottom: -28vmax;
  background: radial-gradient(closest-side, rgba(56, 198, 255, .26) 0%, rgba(56, 198, 255, 0) 72%);
  animation: dsh-aurora-c 8s ease-in-out infinite alternate;
}

.dsh-beams {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 110vmax;
  height: 110vmax;
  margin: -55vmax 0 0 -55vmax;
  pointer-events: none;
  opacity: .5;
  background: repeating-conic-gradient(from 0deg,
    rgba(132, 172, 255, .11) 0deg 1.2deg,
    transparent 1.2deg 17deg);
  -webkit-mask: radial-gradient(closest-side, transparent 6%, #000 38%, transparent 86%);
  mask: radial-gradient(closest-side, transparent 6%, #000 38%, transparent 86%);
  animation: dsh-splash-spin 64s linear infinite;
}

.dsh-wave-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 140vmax;
  height: 140vmax;
  margin: -70vmax 0 0 -70vmax;
  border-radius: 50%;
  border: 1px solid rgba(122, 172, 255, .24);
  opacity: 0;
  pointer-events: none;
  animation: dsh-wave 4200ms cubic-bezier(.15, .6, .3, 1) infinite;
}
.dsh-wave-ring-2 { animation-delay: 1400ms; border-color: rgba(124, 92, 255, .22); }
.dsh-wave-ring-3 { animation-delay: 2800ms; border-color: rgba(56, 198, 255, .2); }

.dsh-splash-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--dsw-alias-label-secondary, #9aa0aa) 36%, transparent) 1px, transparent 0);
  background-size: 34px 34px;
  opacity: .13;
  -webkit-mask-image: radial-gradient(70% 65% at 50% 48%, #000 0%, transparent 82%);
  mask-image: radial-gradient(70% 65% at 50% 48%, #000 0%, transparent 82%);
  animation: dsh-splash-veil 1100ms ease 120ms both;
}

.dsh-splash-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .7;
  box-shadow:
    inset 0 0 22vmax rgba(64, 100, 255, .18),
    inset 0 0 3vmax rgba(90, 140, 255, .12);
  animation: dsh-frame-glow 2600ms ease-in-out infinite alternate;
}

.dsh-splash-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 48%, transparent 42%, color-mix(in srgb, var(--dsw-alias-bg-base, #08090f) 82%, transparent) 100%);
  pointer-events: none;
}

.dsh-splash-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: -180px;
  height: 180px;
  pointer-events: none;
  opacity: .45;
  background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 30%, transparent) 70%, transparent 100%);
  mix-blend-mode: screen;
  animation: dsh-splash-scan 3000ms cubic-bezier(.45, 0, .55, 1) 150ms infinite;
}

.dsh-splash-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 80%, transparent);
  opacity: 0;
  pointer-events: none;
  animation: dsh-splash-fade 700ms ease 240ms both;
}
.dsh-splash-corner-tl { top: 22px; left: 22px; border-right: 0; border-bottom: 0; }
.dsh-splash-corner-tr { top: 22px; right: 22px; border-left: 0; border-bottom: 0; }
.dsh-splash-corner-bl { bottom: 22px; left: 22px; border-right: 0; border-top: 0; }
.dsh-splash-corner-br { bottom: 22px; right: 22px; border-left: 0; border-top: 0; }

.dsh-splash-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: scale(1);
  transition: transform 700ms cubic-bezier(.4, 0, .2, 1), opacity 500ms ease;
}
.dsh-splash-out .dsh-splash-stage {
  transform: scale(1.08);
  opacity: 0;
}

.dsh-core {
  position: relative;
  width: 132px;
  height: 132px;
  display: grid;
  place-items: center;
  margin-bottom: 26px;
  animation: dsh-splash-pop 1000ms cubic-bezier(.16, 1, .3, 1) both;
}

.dsh-core-glow {
  position: absolute;
  inset: -60%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(88, 126, 255, .38) 0%, rgba(88, 126, 255, .12) 40%, transparent 66%);
  animation: dsh-core-breathe 2400ms ease-in-out 200ms infinite;
}

.dsh-core-ring {
  position: absolute;
  border-radius: 50%;
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - var(--rw, 2px)), #000 calc(100% - var(--rw, 2px)));
  mask: radial-gradient(farthest-side, transparent calc(100% - var(--rw, 2px)), #000 calc(100% - var(--rw, 2px)));
}
.dsh-core-ring-a {
  inset: 0;
  --rw: 2px;
  background: conic-gradient(from 0deg, transparent 0deg 228deg, #4d6bfe 318deg, #38c6ff 357deg, transparent 360deg);
  animation: dsh-splash-spin 2200ms linear infinite;
}
.dsh-core-ring-b {
  inset: 14px;
  --rw: 1.5px;
  background: conic-gradient(from 180deg, transparent 0deg 195deg, #7c5cff 330deg, transparent 360deg);
  animation: dsh-splash-spin 1700ms linear infinite reverse;
}
.dsh-core-ring-c {
  inset: 27px;
  --rw: 1px;
  background: conic-gradient(from 90deg, transparent 0deg 258deg, #38c6ff 348deg, transparent 360deg);
  animation: dsh-splash-spin 3200ms linear infinite;
  opacity: .8;
}

.dsh-core-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, #ffffff 0%, #a8bcff 42%, #4d6bfe 100%);
  box-shadow:
    0 0 18px 4px rgba(96, 136, 255, .8),
    0 0 64px 20px rgba(77, 107, 254, .32);
  animation: dsh-core-pulse 1700ms ease-in-out infinite;
}

.dsh-splash-brand {
  display: flex;
  align-items: baseline;
  gap: 14px;
  font-size: 18px;
  font-weight: 650;
  letter-spacing: .3em;
  line-height: 1;
  text-transform: uppercase;
  animation: dsh-splash-rise 800ms cubic-bezier(.16, 1, .3, 1) 180ms both;
}
.dsh-splash-brand-strong {
  background: linear-gradient(100deg,
    var(--dsw-alias-label-primary, #f4f5f7) 0%,
    color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 70%, var(--dsw-alias-label-primary, #f4f5f7)) 34%,
    #7c5cff 54%,
    #38c6ff 74%,
    var(--dsw-alias-label-primary, #f4f5f7) 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: dsh-splash-shine 3600ms linear infinite;
}
.dsh-splash-brand-soft {
  color: color-mix(in srgb, var(--dsw-alias-label-primary, #f4f5f7) 52%, transparent);
  font-weight: 400;
  letter-spacing: .34em;
}

.dsh-splash-status {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 250px;
  margin-top: 20px;
  font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--dsw-alias-label-secondary, #9aa0aa);
  animation: dsh-splash-fade 600ms ease 700ms both;
}
.dsh-splash-pct {
  color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 80%, var(--dsw-alias-label-primary, #f4f5f7));
  font-variant-numeric: tabular-nums;
}

.dsh-splash-track {
  position: relative;
  width: 250px;
  height: 2px;
  margin-top: 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #f4f5f7) 12%, transparent);
  animation: dsh-splash-fade 600ms ease 760ms both;
}
.dsh-splash-fill {
  position: relative;
  display: block;
  height: 100%;
  width: 0%;
  border-radius: inherit;
  background: linear-gradient(90deg, #4d6bfe 0%, #7c5cff 55%, #38c6ff 100%);
  box-shadow: 0 0 8px rgba(77, 107, 254, .55);
  transition: width 130ms linear;
}
.dsh-splash-fill::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dbe6ff;
  transform: translate(50%, -50%);
  box-shadow: 0 0 10px 2px rgba(111, 140, 255, .9);
}

.dsh-splash-skip {
  position: absolute;
  bottom: 30px;
  left: 50%;
  padding: 6px 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #9aa0aa);
  font: inherit;
  font-size: 11px;
  letter-spacing: .12em;
  cursor: pointer;
  opacity: 0;
  transform: translateX(-50%);
  animation: dsh-splash-fade 600ms ease 1600ms both;
  transition: color 160ms ease, background 160ms ease;
}
.dsh-splash-skip:hover {
  color: var(--dsw-alias-label-primary, #f4f5f7);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #f4f5f7) 8%, transparent);
}
.dsh-splash-skip:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe);
  outline-offset: 2px;
}

.dsh-splash-flash {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(circle at 50% 48%, rgba(215, 230, 255, .6) 0%, rgba(215, 230, 255, 0) 62%);
}
.dsh-splash-out .dsh-splash-flash {
  animation: dsh-splash-flash 620ms ease-out forwards;
}

.dsh-splash-exit-wave {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 150vmax;
  height: 150vmax;
  margin: -75vmax 0 0 -75vmax;
  border-radius: 50%;
  border: 2px solid rgba(176, 214, 255, .55);
  opacity: 0;
  pointer-events: none;
}
.dsh-splash-out .dsh-splash-exit-wave {
  animation: dsh-exit-wave 700ms cubic-bezier(.2, .7, .2, 1) forwards;
}

@keyframes dsh-splash-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes dsh-splash-veil {
  from { opacity: 0; }
  to { opacity: .13; }
}
@keyframes dsh-splash-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes dsh-splash-pop {
  from { opacity: 0; transform: scale(.88); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes dsh-splash-spin {
  to { transform: rotate(360deg); }
}
@keyframes dsh-splash-shine {
  0% { background-position: 0% 50%; }
  100% { background-position: 220% 50%; }
}
@keyframes dsh-splash-flash {
  0% { opacity: 0; }
  22% { opacity: .55; }
  100% { opacity: 0; }
}
@keyframes dsh-splash-scan {
  0% { transform: translateY(0); }
  100% { transform: translateY(calc(100vh + 360px)); }
}
@keyframes dsh-core-breathe {
  0%, 100% { opacity: .6; transform: scale(.94); }
  50% { opacity: 1; transform: scale(1.06); }
}
@keyframes dsh-core-pulse {
  0%, 100% { transform: scale(.92); opacity: .85; }
  50% { transform: scale(1.08); opacity: 1; }
}
@keyframes dsh-aurora-a {
  from { transform: translate3d(-4vmax, -2vmax, 0) scale(1); }
  to { transform: translate3d(7vmax, 5vmax, 0) scale(1.14); }
}
@keyframes dsh-aurora-b {
  from { transform: translate3d(5vmax, 3vmax, 0) scale(1.1); }
  to { transform: translate3d(-7vmax, -4vmax, 0) scale(.96); }
}
@keyframes dsh-aurora-c {
  from { transform: translate3d(-3vmax, 4vmax, 0) scale(.98); }
  to { transform: translate3d(6vmax, -5vmax, 0) scale(1.16); }
}
@keyframes dsh-wave {
  0% { opacity: 0; transform: scale(.12); }
  12% { opacity: .8; }
  70% { opacity: .16; }
  100% { opacity: 0; transform: scale(1); }
}
@keyframes dsh-frame-glow {
  from { opacity: .55; }
  to { opacity: 1; }
}
@keyframes dsh-exit-wave {
  0% { opacity: .85; transform: scale(.05); }
  100% { opacity: 0; transform: scale(1.15); }
}

@media (prefers-reduced-motion: reduce) {
  .dsh-splash,
  .dsh-splash *,
  .dsh-splash *::before,
  .dsh-splash *::after {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 220ms !important;
  }
  .dsh-splash-skip {
    opacity: 1;
  }
  .dsh-splash-scan {
    display: none;
  }
}
`;

    function prefersReducedMotion() {
      try {
        return typeof window.matchMedia === 'function'
          && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch {
        return false;
      }
    }

    /** Letter-scramble reveal used by the wordmark. */
    function Scramble(props) {
      const text = props.text;
      const delay = props.delay || 0;
      const duration = props.duration || 900;
      const [value, setValue] = React.useState(text);

      React.useEffect(() => {
        if (prefersReducedMotion()) {
          setValue(text);
          return undefined;
        }
        let frame = 0;
        const timer = window.setTimeout(() => {
          const startedAt = performance.now();
          const tick = (now) => {
            const progress = Math.min(1, (now - startedAt) / duration);
            const reveal = Math.floor(progress * text.length);
            let next = '';
            for (let i = 0; i < text.length; i += 1) {
              next += i < reveal ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
            }
            setValue(next);
            if (progress < 1) {
              frame = window.requestAnimationFrame(tick);
            } else {
              setValue(text);
            }
          };
          frame = window.requestAnimationFrame(tick);
        }, delay);
        return () => {
          window.clearTimeout(timer);
          window.cancelAnimationFrame(frame);
        };
      }, [text, delay, duration]);

      return value;
    }

    /** Full-viewport warp field: radial streaks accelerating outward. */
    function Warp() {
      const canvasRef = React.useRef(null);

      React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const g = canvas.getContext('2d');
        if (!g) return undefined;

        const reduced = prefersReducedMotion();
        const palette = ['138,170,255', '164,132,255', '104,206,255', '226,236,255'];
        let W = 0;
        let H = 0;
        let cx = 0;
        let cy = 0;
        let maxR = 1;
        let stars = [];
        let frame = 0;
        let startedAt = 0;
        let last = 0;

        const measure = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          W = canvas.clientWidth || window.innerWidth;
          H = canvas.clientHeight || window.innerHeight;
          canvas.width = Math.max(1, Math.round(W * dpr));
          canvas.height = Math.max(1, Math.round(H * dpr));
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          cx = W / 2;
          cy = H / 2;
          maxR = Math.hypot(W, H) / 2;
        };

        const seed = () => {
          const count = Math.round(Math.min(280, Math.max(150, (W * H) / 8500)));
          stars = [];
          for (let i = 0; i < count; i += 1) {
            stars.push({
              angle: Math.random() * Math.PI * 2,
              radius: Math.random() * maxR,
              speed: 0.012 + Math.random() * 0.045,
              size: 0.6 + Math.random() * 1.5,
              color: palette[(Math.random() * palette.length) | 0],
              flare: Math.random() < 0.1,
            });
          }
        };

        const draw = (now, dt) => {
          const elapsed = now - startedAt;
          const boost = elapsed > 2400 ? 1 + ((elapsed - 2400) / 500) * 2.4 : 1;
          g.clearRect(0, 0, W, H);
          g.globalCompositeOperation = 'lighter';

          for (let i = 0; i < stars.length; i += 1) {
            const star = stars[i];
            star.radius += star.speed * dt * (0.45 + (star.radius / maxR) * 1.6) * boost;
            if (star.radius > maxR) {
              star.radius = 6 + Math.random() * 40;
              star.angle = Math.random() * Math.PI * 2;
              continue;
            }
            const trail = 6 + star.speed * dt * boost * 5;
            const r0 = Math.max(2, star.radius - trail);
            const cos = Math.cos(star.angle);
            const sin = Math.sin(star.angle);
            const x2 = cx + cos * star.radius;
            const y2 = cy + sin * star.radius;
            const fade = Math.min(1, (star.radius / maxR) * 1.6);

            g.strokeStyle = 'rgba(' + star.color + ',' + (0.1 + fade * 0.75).toFixed(3) + ')';
            g.lineWidth = star.size;
            g.beginPath();
            g.moveTo(cx + cos * r0, cy + sin * r0);
            g.lineTo(x2, y2);
            g.stroke();

            if (star.flare) {
              g.fillStyle = 'rgba(' + star.color + ',' + (0.3 + fade * 0.5).toFixed(3) + ')';
              g.beginPath();
              g.arc(x2, y2, star.size * 1.4, 0, Math.PI * 2);
              g.fill();
            }
          }
        };

        const loop = (now) => {
          const dt = Math.min(40, last ? now - last : 16);
          last = now;
          draw(now, dt);
          frame = window.requestAnimationFrame(loop);
        };

        const resize = () => {
          measure();
          seed();
          if (reduced) draw(startedAt + 16, 16);
        };

        measure();
        seed();
        startedAt = performance.now();
        last = startedAt;
        if (reduced) {
          draw(startedAt, 16);
        } else {
          frame = window.requestAnimationFrame(loop);
        }
        window.addEventListener('resize', resize);

        return () => {
          window.cancelAnimationFrame(frame);
          window.removeEventListener('resize', resize);
        };
      }, []);

      return h('canvas', { ref: canvasRef, className: 'dsh-splash-canvas', 'aria-hidden': true });
    }

    function Splash(props) {
      const t = props.t;
      const [phase, setPhase] = React.useState('in');
      const [alive, setAlive] = React.useState(true);
      const [percent, setPercent] = React.useState(0);

      const skip = React.useCallback(() => {
        setPhase('out');
      }, []);

      React.useEffect(() => {
        const reduced = prefersReducedMotion();
        const hold = reduced ? 700 : 3000;
        const timer = window.setTimeout(() => setPhase('out'), hold);
        return () => window.clearTimeout(timer);
      }, []);

      React.useEffect(() => {
        if (prefersReducedMotion()) {
          setPercent(100);
          return undefined;
        }
        const startedAt = performance.now();
        const duration = 2600;
        const timer = window.setInterval(() => {
          const progress = Math.min(1, (performance.now() - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 2.2);
          setPercent(Math.round(eased * 100));
          if (progress >= 1) window.clearInterval(timer);
        }, 55);
        return () => window.clearInterval(timer);
      }, []);

      React.useEffect(() => {
        if (phase !== 'out') return undefined;
        const reduced = prefersReducedMotion();
        const fade = reduced ? 240 : 700;
        const timer = window.setTimeout(() => setAlive(false), fade + 60);
        return () => window.clearTimeout(timer);
      }, [phase]);

      React.useEffect(() => {
        const onKeyDown = (event) => {
          if (event.key === 'Escape') skip();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
      }, [skip]);

      if (!alive) return null;

      const phaseKey = percent < 38 ? 'phaseCore' : percent < 78 ? 'phaseLoad' : 'phaseReady';

      return h('div', {
        className: 'dsh-splash' + (phase === 'out' ? ' dsh-splash-out' : ''),
        role: 'status',
        'aria-live': 'polite',
        'aria-label': t('loading'),
        onClick: skip,
      },
        h('style', { key: 'style' }, STYLE),
        h(Warp, { key: 'warp' }),
        h('div', { key: 'aurora-a', className: 'dsh-aurora dsh-aurora-a', 'aria-hidden': true }),
        h('div', { key: 'aurora-b', className: 'dsh-aurora dsh-aurora-b', 'aria-hidden': true }),
        h('div', { key: 'aurora-c', className: 'dsh-aurora dsh-aurora-c', 'aria-hidden': true }),
        h('div', { key: 'beams', className: 'dsh-beams', 'aria-hidden': true }),
        h('div', { key: 'wave-1', className: 'dsh-wave-ring dsh-wave-ring-1', 'aria-hidden': true }),
        h('div', { key: 'wave-2', className: 'dsh-wave-ring dsh-wave-ring-2', 'aria-hidden': true }),
        h('div', { key: 'wave-3', className: 'dsh-wave-ring dsh-wave-ring-3', 'aria-hidden': true }),
        h('div', { key: 'grid', className: 'dsh-splash-grid', 'aria-hidden': true }),
        h('div', { key: 'frame', className: 'dsh-splash-frame', 'aria-hidden': true }),
        h('div', { key: 'vignette', className: 'dsh-splash-vignette', 'aria-hidden': true }),
        h('div', { key: 'scan', className: 'dsh-splash-scan', 'aria-hidden': true }),
        h('div', { key: 'corner-tl', className: 'dsh-splash-corner dsh-splash-corner-tl', 'aria-hidden': true }),
        h('div', { key: 'corner-tr', className: 'dsh-splash-corner dsh-splash-corner-tr', 'aria-hidden': true }),
        h('div', { key: 'corner-bl', className: 'dsh-splash-corner dsh-splash-corner-bl', 'aria-hidden': true }),
        h('div', { key: 'corner-br', className: 'dsh-splash-corner dsh-splash-corner-br', 'aria-hidden': true }),
        h('div', { key: 'stage', className: 'dsh-splash-stage', 'aria-hidden': true },
          h('div', { key: 'core', className: 'dsh-core' },
            h('div', { key: 'glow', className: 'dsh-core-glow' }),
            h('div', { key: 'ring-a', className: 'dsh-core-ring dsh-core-ring-a' }),
            h('div', { key: 'ring-b', className: 'dsh-core-ring dsh-core-ring-b' }),
            h('div', { key: 'ring-c', className: 'dsh-core-ring dsh-core-ring-c' }),
            h('div', { key: 'dot', className: 'dsh-core-dot' }),
          ),
          h('div', { key: 'brand', className: 'dsh-splash-brand' },
            h('span', { key: 'strong', className: 'dsh-splash-brand-strong' },
              h(Scramble, { text: 'DEEPSEEK', delay: 200, duration: 950 }),
            ),
            h('span', { key: 'soft', className: 'dsh-splash-brand-soft' },
              h(Scramble, { text: 'HARNESS', delay: 340, duration: 950 }),
            ),
          ),
          h('div', { key: 'status', className: 'dsh-splash-status' },
            h('span', { key: 'label' }, t(phaseKey)),
            h('span', { key: 'pct', className: 'dsh-splash-pct' }, percent + '%'),
          ),
          h('div', { key: 'track', className: 'dsh-splash-track' },
            h('span', {
              key: 'fill',
              className: 'dsh-splash-fill',
              style: { width: percent + '%' },
            }),
          ),
        ),
        h('button', {
          key: 'skip',
          type: 'button',
          className: 'dsh-splash-skip',
          onClick: (event) => {
            event.stopPropagation();
            skip();
          },
        }, t('skip')),
        h('div', { key: 'exit-wave', className: 'dsh-splash-exit-wave', 'aria-hidden': true }),
        h('div', { key: 'flash', className: 'dsh-splash-flash', 'aria-hidden': true }),
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
