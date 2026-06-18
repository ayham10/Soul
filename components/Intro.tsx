"use client";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/lang";

type P = {
  sx: number; sy: number;      // start (drift) position
  tx: number; ty: number;      // bottle target position
  vx: number; vy: number;      // spray velocity
  r: number; tw: number;       // radius, twinkle phase
  col: string;
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Timeline (ms)
const T = { drift: 1300, gather: 3300, hold: 4600, spray: 5700, logo: 5300, exit: 7100, end: 7950 };

const GOLD = ["#f6e3ab", "#e3c789", "#c6a15b", "#fff6da", "#d8b164"];

export default function Intro() {
  const { t, dir } = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const rafRef = useRef<number>(0);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setFadeOut(true);
    try { sessionStorage.setItem("soul-intro-shown", "1"); } catch {}
    window.setTimeout(() => setVisible(false), 900);
  };

  useEffect(() => {
    // `?intro=1` forces a replay (handy for previewing the experience).
    const forced = new URLSearchParams(window.location.search).has("intro");
    // Already played this session → don't replay.
    let already = false;
    try { already = sessionStorage.getItem("soul-intro-shown") === "1"; } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (already && !forced) { setVisible(false); return; }

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.body.style.overflow = "hidden";

    if (prefersReduced) {
      setShowLogo(true);
      const tm = window.setTimeout(finish, 2200);
      return () => { window.clearTimeout(tm); document.body.style.overflow = ""; };
    }

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Build bottle silhouette target points.
    const buildTargets = (count: number) => {
      const bw = 240, bh = 372;
      const oc = document.createElement("canvas");
      oc.width = bw; oc.height = bh;
      const o = oc.getContext("2d")!;
      o.fillStyle = "#fff";
      const rr = (x: number, y: number, w: number, h: number, rad: number) => {
        if (o.roundRect) { o.beginPath(); o.roundRect(x, y, w, h, rad); o.fill(); }
        else { o.fillRect(x, y, w, h); }
      };
      rr(bw / 2 - 24, 8, 48, 44, 9);          // cap
      o.fillRect(bw / 2 - 16, 50, 32, 30);     // neck
      o.beginPath();                            // shoulders
      o.moveTo(bw / 2 - 18, 78); o.lineTo(bw / 2 + 18, 78);
      o.lineTo(bw / 2 + 78, 120); o.lineTo(bw / 2 - 78, 120); o.closePath(); o.fill();
      rr(bw / 2 - 80, 116, 160, 248, 24);      // body
      const data = o.getImageData(0, 0, bw, bh).data;
      const pts: [number, number][] = [];
      for (let y = 0; y < bh; y += 2) for (let x = 0; x < bw; x += 2) {
        if (data[(y * bw + x) * 4 + 3] > 128) pts.push([x, y]);
      }
      const scale = (H * 0.5) / bh;
      const offX = W / 2 - (bw * scale) / 2;
      const offY = H * 0.46 - (bh * scale) / 2;
      const out: { x: number; y: number }[] = [];
      for (let i = 0; i < count; i++) {
        const p = pts[(Math.random() * pts.length) | 0];
        out.push({ x: offX + p[0] * scale, y: offY + p[1] * scale });
      }
      return out;
    };

    const count = Math.max(360, Math.min(1100, Math.floor((W * H) / 2300)));
    const targets = buildTargets(count);
    const cx = W / 2, cy = H * 0.46;

    const ps: P[] = targets.map((tg) => {
      const ang = Math.random() * Math.PI * 2;
      const dist = (0.4 + Math.random() * 0.7) * Math.max(W, H);
      const dx = tg.x - cx, dy = tg.y - cy;
      const dlen = Math.hypot(dx, dy) || 1;
      const upBias = tg.y < cy ? 1.6 : 0.7;
      return {
        sx: cx + Math.cos(ang) * dist,
        sy: cy + Math.sin(ang) * dist * 0.7,
        tx: tg.x, ty: tg.y,
        vx: (dx / dlen) * (60 + Math.random() * 180) + (Math.random() - 0.5) * 120,
        vy: (dy / dlen) * (40 + Math.random() * 120) - (80 + Math.random() * 220) * upBias,
        r: 0.7 + Math.random() * 1.8,
        tw: Math.random() * Math.PI * 2,
        col: GOLD[(Math.random() * GOLD.length) | 0],
      };
    });

    window.addEventListener("resize", resize);
    // Accumulate elapsed time from a CLAMPED per-frame delta. Using the raw
    // (now - start) timeline lets a single main-thread stall (e.g. the homepage
    // video/images decoding behind the overlay) skip the whole sequence; clamping
    // the delta turns a stall into a brief pause instead.
    let elapsed = 0;
    let last = 0;
    let logoTriggered = false;

    const frame = (now: number) => {
      if (!last) last = now;
      let dt = now - last;
      last = now;
      if (dt > 80) dt = 16; // ignore long gaps from throttling / jank
      elapsed += dt;
      const e = elapsed;

      // trail fade
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(6,5,4,0.34)";
      ctx.fillRect(0, 0, W, H);

      // radial pulse during hold
      if (e > T.gather && e < T.spray) {
        const pe = easeOut(Math.min(1, (e - T.gather) / (T.spray - T.gather)));
        const grad = ctx.createRadialGradient(cx, cy + H * 0.04, 0, cx, cy + H * 0.04, Math.max(W, H) * 0.5 * pe);
        grad.addColorStop(0, `rgba(198,161,91,${0.16 * (1 - pe)})`);
        grad.addColorStop(1, "rgba(198,161,91,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        // platform glow
        ctx.fillStyle = `rgba(227,199,137,${0.10 * pe})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy + H * 0.27, W * 0.16 * pe, H * 0.018 * pe, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        let x: number, y: number, a: number;

        if (e < T.drift) {
          const k = e / T.drift;
          x = p.sx + Math.sin(p.tw + e / 600) * 8;
          y = p.sy + Math.cos(p.tw + e / 700) * 8;
          a = 0.15 + 0.55 * k;
        } else if (e < T.gather) {
          const k = easeInOut(Math.min(1, (e - T.drift) / (T.gather - T.drift)));
          x = p.sx + (p.tx - p.sx) * k + Math.sin(p.tw + e / 600) * 8 * (1 - k);
          y = p.sy + (p.ty - p.sy) * k + Math.cos(p.tw + e / 700) * 8 * (1 - k);
          a = 0.7 + 0.3 * k;
        } else if (e < T.spray) {
          x = p.tx + Math.sin(p.tw + e / 240) * 1.2;
          y = p.ty + Math.cos(p.tw + e / 240) * 1.2;
          a = 0.95;
        } else {
          const dt = (e - T.spray) / 1000;
          x = p.tx + p.vx * dt;
          y = p.ty + p.vy * dt + 90 * dt * dt;
          a = Math.max(0, 0.95 - dt * 0.7);
        }

        const tw = 0.7 + 0.3 * Math.sin(p.tw + e / 200);
        ctx.globalAlpha = a * tw;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (a > 0.6) {
          ctx.globalAlpha = a * 0.25;
          ctx.beginPath();
          ctx.arc(x, y, p.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (!logoTriggered && e >= T.logo) { logoTriggered = true; setShowLogo(true); }
      if (e >= T.exit && !doneRef.current) { finish(); }
      if (!doneRef.current) rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      dir={dir}
      style={{
        position: "fixed", inset: 0, zIndex: 4000, background: "#060504",
        opacity: fadeOut ? 0 : 1, transition: "opacity 0.9s ease",
        pointerEvents: fadeOut ? "none" : "auto",
      }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, display: "block" }} />

      {/* Logo reveal */}
      <div
        style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center", pointerEvents: "none",
          opacity: showLogo ? 1 : 0, transform: showLogo ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 1.4s ease, transform 1.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 500,
          fontSize: "clamp(56px, 16vw, 150px)", letterSpacing: "0.18em",
          color: "#f3ead6", textShadow: "0 0 38px rgba(198,161,91,0.55)", lineHeight: 1,
        }}>
          S<span style={{ color: "#c6a15b" }}>O</span>UL
        </div>
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: "clamp(28px,8vw,60px)", height: 1, background: "linear-gradient(to right, transparent, #c6a15b)" }} />
          <span style={{ fontSize: "clamp(10px,2.6vw,13px)", letterSpacing: "0.42em", textTransform: "uppercase", color: "#c6a15b", whiteSpace: "nowrap" }}>
            {t.intro.discover}
          </span>
          <span style={{ width: "clamp(28px,8vw,60px)", height: 1, background: "linear-gradient(to left, transparent, #c6a15b)" }} />
        </div>
      </div>

      {/* Skip */}
      <button
        onClick={finish}
        style={{
          position: "absolute", bottom: 26, insetInlineEnd: 26, zIndex: 2,
          background: "transparent", border: "1px solid rgba(198,161,91,0.4)", color: "#c6a15b",
          fontFamily: "'Jost', sans-serif", fontSize: 10.5, letterSpacing: "0.25em", textTransform: "uppercase",
          padding: "9px 20px", cursor: "pointer",
        }}
      >
        {t.intro.skip}
      </button>
    </div>
  );
}
