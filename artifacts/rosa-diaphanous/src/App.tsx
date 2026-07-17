import { useLayoutEffect, useEffect, useRef, useState } from "react";
import phrases from "./phrases.json";
import girlAvatar from "@assets/ChatGPT_Image_3_lug_2026__01_58_27-removebg-preview_1784160643734.png";
import boyAvatar from "@assets/ChatGPT_Image_15_lug_2026__15_32_52-removebg-preview_1784160650131.png";
import bgFloral from "@assets/ChatGPT_Image_16_lug_2026,_02_47_11_1784162852061.png";

const phrase = phrases[Math.floor(Math.random() * phrases.length)];

/* ── Flower curtain (intro) ───────────────────────────────── */
const FLOWER_SRCS = [1,2,3,4,5,7,9].map(n => `/flowers/flower${n}.png`);

// Seeded pseudo-random: gives stable but natural-looking scatter
function sr(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Stratified grid (14 cols × 11 rows) + top/left edge strip + fillers
const COLS = 14, ROWS = 11;
const CURTAIN_TILES = (() => {
  const tiles = [];
  let k = 0;
  const cw = 110 / COLS;
  const ch = 110 / ROWS;

  // Main grid — each cell offset -12% so row0/col0 bleed well above/left of viewport
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      tiles.push({
        id:     k,
        src:    FLOWER_SRCS[Math.floor(sr(k + 7) * FLOWER_SRCS.length)],
        x:      col * cw - 12 + sr(k)       * cw * 0.9,
        y:      row * ch - 12 + sr(k + 200) * ch * 0.9,
        size:   155 + sr(k + 400) * 115,
        rot:    sr(k + 600) * 360,
        fallDx: (sr(k + 800)  - 0.5) * 220,
        fallDy: 110 + sr(k + 1000) * 30,
        dur:    2600 + sr(k + 1200) * 1600,
        delay:  sr(k + 1400) * 1000,
      });
      k++;
    }
  }
  // Dedicated top-edge strip (y: -20% to 5%)
  for (let j = 0; j < 20; j++) {
    tiles.push({
      id:     k,
      src:    FLOWER_SRCS[Math.floor(sr(k + 11) * FLOWER_SRCS.length)],
      x:      sr(k) * 110 - 5,
      y:      sr(k + 300) * 15 - 20,
      size:   160 + sr(k + 700) * 100,
      rot:    sr(k + 900) * 360,
      fallDx: (sr(k + 1100) - 0.5) * 200,
      fallDy: 112 + sr(k + 1300) * 28,
      dur:    2600 + sr(k + 1500) * 1600,
      delay:  sr(k + 1700) * 1000,
    });
    k++;
  }
  // Dedicated left-edge strip (x: -20% to 5%)
  for (let j = 0; j < 20; j++) {
    tiles.push({
      id:     k,
      src:    FLOWER_SRCS[Math.floor(sr(k + 13) * FLOWER_SRCS.length)],
      x:      sr(k + 200) * 15 - 20,
      y:      sr(k) * 110 - 5,
      size:   160 + sr(k + 600) * 100,
      rot:    sr(k + 800) * 360,
      fallDx: (sr(k + 1000) - 0.5) * 200,
      fallDy: 112 + sr(k + 1200) * 28,
      dur:    2600 + sr(k + 1400) * 1600,
      delay:  sr(k + 1600) * 1000,
    });
    k++;
  }
  return tiles;
})();

function FlowerCurtain({ onFall }: { onFall: () => void }) {
  const [phase, setPhase] = useState<"show"|"fall"|"done">("show");
  const [allLoaded, setAllLoaded] = useState(false);
  const loadedCount = useRef(0);
  const total = CURTAIN_TILES.length;

  const handleLoad = useRef(() => {
    loadedCount.current += 1;
    if (loadedCount.current >= total) setAllLoaded(true);
  }).current;

  useEffect(() => {
    if (!allLoaded) return;
    // Brief pause so user sees full coverage, then fall
    const t1 = setTimeout(() => { setPhase("fall"); onFall(); }, 800);
    const t2 = setTimeout(() => setPhase("done"), 800 + 4200 + 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [allLoaded, onFall]);

  if (phase === "done") return null;

  return (
    <div className="flower-curtain" aria-hidden="true">
      {CURTAIN_TILES.map(f => (
        <img
          key={f.id}
          src={f.src}
          draggable={false}
          onLoad={handleLoad}
          onError={handleLoad}
          style={{
            position:   "absolute",
            left:       `${f.x}%`,
            top:        `${f.y}%`,
            width:      f.size,
            height:     f.size,
            objectFit:  "contain",
            transform:  phase === "fall"
              ? `translate3d(${f.fallDx}px, ${f.fallDy}vh, 0) rotate(${f.rot + sr(f.id) * 180}deg)`
              : `rotate(${f.rot}deg)`,
            transition: phase === "fall"
              ? `transform ${f.dur}ms cubic-bezier(.3,0,.7,1) ${f.delay}ms`
              : "none",
          }}
        />
      ))}
    </div>
  );
}

/* ── Petal rain ───────────────────────────────────────────── */
const PETAL_COUNT = 90;
const PETALS = Array.from({ length: PETAL_COUNT }, (_, i) => ({
  id: i,
  left:     Math.random() * 100,
  size:     10 + Math.random() * 22,
  duration: 8  + Math.random() * 14,
  delay:    -(Math.random() * 22),
  drift:    (Math.random() - 0.5) * 120,
  spin:     (Math.random() - 0.5) * 600,
  opacity:  0.35 + Math.random() * 0.5,
  hue:      Math.random() > 0.5 ? "#f9b8c8" : "#f7d0da",
}));

function PetalRain() {
  return (
    <div className="petal-container" aria-hidden="true">
      {PETALS.map(p => (
        <svg
          key={p.id}
          viewBox="0 0 40 40"
          width={p.size}
          height={p.size}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-8%",
            opacity: p.opacity,
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite`,
            "--drift": `${p.drift}px`,
            "--spin":  `${p.spin}deg`,
          } as React.CSSProperties}
        >
          <ellipse cx="20" cy="25" rx="10" ry="16" fill={p.hue} transform="rotate(-20,20,20)" />
          <ellipse cx="20" cy="25" rx="10" ry="16" fill={p.hue} transform="rotate(20,20,20)" opacity="0.7" />
        </svg>
      ))}
    </div>
  );
}

/* ── Shrink font to fit N lines ───────────────────────────── */
function useFitLines(maxLines: number) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let size = 104; // px — start large
    el.style.fontSize = size + "px";
    const lineH = parseFloat(getComputedStyle(el).lineHeight);
    while (el.scrollHeight > Math.ceil(lineH * maxLines + 8) && size > 28) {
      size -= 1;
      el.style.fontSize = size + "px";
    }
  }, [maxLines]);
  return ref;
}

/* ── Road path: organic S-curve ──────────────────────────────── */
const ROAD = "M 70,108 C 160,72 270,138 390,102 C 510,66 610,132 730,98 C 830,68 890,112 940,102";

/* ── Decorative hearts along the wave ────────────────────────── */
const HEARTS = [
  { x: 164, y: 58,  s: 10, d: 0.0 },
  { x: 295, y: 145, s: 7,  d: 0.6 },
  { x: 428, y: 52,  s: 11, d: 1.1 },
  { x: 570, y: 148, s: 8,  d: 0.3 },
  { x: 708, y: 50,  s: 9,  d: 0.9 },
  { x: 845, y: 130, s: 7,  d: 0.5 },
];

/* ── Countdown hook ──────────────────────────────────────────── */
const TARGET = new Date("2026-08-27T23:59:59").getTime();

function useCountdown() {
  const calc = () => {
    const diff = Math.max(0, TARGET - Date.now());
    return {
      days:    Math.floor(diff / 864e5),
      hours:   Math.floor((diff % 864e5) / 36e5),
      minutes: Math.floor((diff % 36e5)  / 6e4),
      seconds: Math.floor((diff % 6e4)   / 1e3),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function CountdownDisplay() {
  const { days, hours, minutes, seconds } = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  const units = [
    { value: days,    label: "DAYS"    },
    { value: hours,   label: "HOURS"   },
    { value: minutes, label: "MINUTES" },
    { value: seconds, label: "SECONDS" },
  ];
  return (
    <div className="countdown-block">
      <div className="countdown-wrap">
        {units.map(({ value, label }) => (
          <div key={label} className="countdown-card">
            <span className="countdown-num">{label === "DAYS" ? value : pad(value)}</span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </div>
      <p className="countdown-subtitle">Back where I belong on August 27 ♡</p>
    </div>
  );
}

/* ── Mouse glow hook ─────────────────────────────────────────── */
function useMouseGlow() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const mv = (e: MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }); setVisible(true); };
    const ml = () => setVisible(false);
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseleave", ml);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseleave", ml); };
  }, []);
  return { pos, visible };
}

/* ── Road component ──────────────────────────────────────────── */
function Road() {
  const START = new Date("2026-06-23T00:00:00").getTime();
  const END   = new Date("2026-08-27T23:59:59").getTime();
  const now   = Date.now();
  const progress = Math.min(1, Math.max(0, (now - START) / (END - START)));

  const pathRef = useRef<SVGPathElement>(null);
  const [boyPos, setBoyPos] = useState({ x: 70, y: 108 });

  useLayoutEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    const pt  = pathRef.current.getPointAtLength(progress * len);
    setBoyPos({ x: pt.x, y: pt.y });
  }, []);

  const daysPassed = Math.floor((now - START) / 864e5);
  const daysLeft   = Math.max(0, 65 - daysPassed);

  /* girl is always at the path endpoint */
  const GIRL_X = 940;
  const GIRL_Y = 102;

  /* avatar sizes */
  const BOY_W  = 108;
  const BOY_H  = 108;
  const GIRL_W = 120;
  const GIRL_H = 120;

  return (
    <div className="road-section">
      <CountdownDisplay />

      <svg
        viewBox="0 0 1000 210"
        preserveAspectRatio="xMidYMid meet"
        className="road-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Split road at boy's x position */}
          <clipPath id="cp-past">
            <rect x="0" y="0" width={boyPos.x} height="210" />
          </clipPath>
          <clipPath id="cp-future">
            <rect x={boyPos.x} y="0" width="1000" height="210" />
          </clipPath>

          {/* Soft glow filter for avatars */}
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Drop shadow for avatars */}
          <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(60,20,30,0.18)" />
          </filter>
        </defs>

        {/* Invisible path for getPointAtLength */}
        <path d={ROAD} ref={pathRef} fill="none" stroke="none" />

        {/* ── Road: future (light) ── */}
        <path
          d={ROAD}
          className="road-path road-future"
          clipPath="url(#cp-future)"
        />
        {/* ── Road: past (dark) ── */}
        <path
          d={ROAD}
          className="road-path road-past"
          clipPath="url(#cp-past)"
        />

        {/* ── Start & end dots ── */}
        <circle cx="70"  cy="108" r="4" className="dot-past"   />
        <circle cx="940" cy="102" r="4" className="dot-future" />

        {/* ── Boy position dot ── */}
        <circle cx={boyPos.x} cy={boyPos.y} r="4" className="dot-past" />


        {/* ── Decorative hearts ── */}
        {HEARTS.map((h, i) => (
          <text
            key={i}
            x={h.x} y={h.y}
            fontSize={h.s}
            textAnchor="middle"
            className="heart-float"
            style={{ animationDelay: `${h.d}s` }}
          >♥</text>
        ))}

        {/* ── Girl avatar — end of road ── */}
        <g transform={`translate(${GIRL_X}, ${GIRL_Y})`}>
          <g className="avatar-wave">
            <image
              href={girlAvatar}
              x={-GIRL_W / 2}
              y={-GIRL_H + 22}
              width={GIRL_W}
              height={GIRL_H}
              filter="url(#shadow)"
            />
          </g>
        </g>

        {/* ── Boy avatar — current progress ── */}
        <g transform={`translate(${boyPos.x}, ${boyPos.y})`}>
          <g className="avatar-bob">
            <image
              href={boyAvatar}
              x={-BOY_W / 2}
              y={-BOY_H + 22}
              width={BOY_W}
              height={BOY_H}
              filter="url(#shadow)"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ── App ─────────────────────────────────────────────────────── */
export default function App() {
  const { pos, visible } = useMouseGlow();
  const glowRef = useRef<HTMLDivElement>(null);
  const titleRef = useFitLines(2);
  const [siteReady, setSiteReady] = useState(false);
  const onFall = useRef(() => setSiteReady(true)).current;

  return (
    <>
    <FlowerCurtain onFall={onFall} />
    {siteReady && <PetalRain />}
    <div
      className="site-wrapper"
      style={{
        backgroundImage: `url(${bgFloral})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        visibility: siteReady ? "visible" : "hidden",
      }}
    >
      <div
        ref={glowRef}
        className="glow-cursor"
        style={{ left: pos.x, top: pos.y, opacity: visible ? 1 : 0 }}
      />
      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">Made with 💕 by your Samu</span>
          <h1 ref={titleRef} className="hero-title">
            {phrase.split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h1>
        </div>
      </section>
      <Road />
    </div>
    </>
  );
}
