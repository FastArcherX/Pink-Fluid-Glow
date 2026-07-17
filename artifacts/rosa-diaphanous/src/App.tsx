import { useLayoutEffect, useEffect, useRef, useState } from "react";
import phrases from "./phrases.json";
import girlAvatar from "@assets/ChatGPT_Image_3_lug_2026__01_58_27-removebg-preview_1784160643734.png";
import boyAvatar from "@assets/ChatGPT_Image_15_lug_2026__15_32_52-removebg-preview_1784160650131.png";
import bgFloral from "@assets/ChatGPT_Image_16_lug_2026,_02_47_11_1784162852061.png";

const phrase = phrases[Math.floor(Math.random() * phrases.length)];

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

  return (
    <div
      className="site-wrapper"
      style={{
        backgroundImage: `url(${bgFloral})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
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
  );
}
