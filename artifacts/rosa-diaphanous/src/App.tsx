import { useLayoutEffect, useEffect, useRef, useState } from "react";
import phrases from "./phrases.json";
import girlAvatar from "@assets/ChatGPT_Image_3_lug_2026__01_58_27-removebg-preview_1784160643734.png";
import boyAvatar from "@assets/ChatGPT_Image_15_lug_2026__15_32_52-removebg-preview_1784160650131.png";

const phrase = phrases[Math.floor(Math.random() * phrases.length)];

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
  const BOY_W  = 58;
  const BOY_H  = 58;
  const GIRL_W = 70;
  const GIRL_H = 70;

  return (
    <div className="road-section">
      <p className="road-days">{daysLeft} giorni al 27 agosto</p>

      <svg
        viewBox="0 0 1000 190"
        preserveAspectRatio="xMidYMid meet"
        className="road-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Split road at boy's x position */}
          <clipPath id="cp-past">
            <rect x="0" y="0" width={boyPos.x} height="190" />
          </clipPath>
          <clipPath id="cp-future">
            <rect x={boyPos.x} y="0" width="1000" height="190" />
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

        {/* ── Date labels ── */}
        <text x="70"  y="172" textAnchor="middle" className="road-label">23 GIU</text>
        <text x="940" y="172" textAnchor="middle" className="road-label">27 AGO</text>

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
              y={-GIRL_H}
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
              y={-BOY_H}
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

  return (
    <div className="site-wrapper">
      <div
        ref={glowRef}
        className="glow-cursor"
        style={{ left: pos.x, top: pos.y, opacity: visible ? 1 : 0 }}
      />

      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">Made with 💕 by Samu</span>
          <h1 className="hero-title">{phrase}</h1>
        </div>
      </section>

      <Road />
    </div>
  );
}
