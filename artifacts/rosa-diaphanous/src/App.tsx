import { useEffect, useRef, useState } from "react";
import phrases from "./phrases.json";

const phrase = phrases[Math.floor(Math.random() * phrases.length)];

function useMouseGlow() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return { pos, visible };
}

function Road() {
  const START = new Date("2026-07-02T00:00:00").getTime();
  const END = new Date("2026-08-27T23:59:59").getTime();
  const now = Date.now();
  const progress = Math.min(1, Math.max(0, (now - START) / (END - START)));

  const roadY = 62;
  const startX = 80;
  const endX = 920;
  const progressX = startX + progress * (endX - startX);

  const daysTotal = Math.round((END - START) / 864e5);
  const daysPassed = Math.floor((now - START) / 864e5);
  const daysLeft = Math.max(0, daysTotal - daysPassed);

  return (
    <div className="road-section">
      <p className="road-days">{daysLeft} giorni al 27 agosto</p>

      <svg
        viewBox="0 0 1000 130"
        preserveAspectRatio="xMidYMid meet"
        className="road-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="cp-past">
            <rect x="0" y="0" width={progressX} height="130" />
          </clipPath>
          <clipPath id="cp-future">
            <rect x={progressX} y="0" width="1000" height="130" />
          </clipPath>
        </defs>

        {/* Past segment — darker */}
        <line
          x1={startX} y1={roadY} x2={endX} y2={roadY}
          className="road-line road-past"
          strokeWidth="5"
          strokeLinecap="round"
          clipPath="url(#cp-past)"
        />

        {/* Future segment — lighter */}
        <line
          x1={startX} y1={roadY} x2={endX} y2={roadY}
          className="road-line road-future"
          strokeWidth="5"
          strokeLinecap="round"
          clipPath="url(#cp-future)"
        />

        {/* Endpoint dots */}
        <circle cx={startX} cy={roadY} r="5" className="dot-past" />
        <circle cx={endX} cy={roadY} r="5" className="dot-future" />

        {/* Date labels */}
        <text x={startX} y={roadY + 26} textAnchor="middle" className="road-label">2 LUG</text>
        <text x={endX} y={roadY + 26} textAnchor="middle" className="road-label">27 AGO</text>

        {/* Avatar 1 — at start, walks left-right */}
        <g transform={`translate(${startX}, ${roadY - 52})`}>
          <g className="avatar-walk">
            <circle cx="0" cy="20" r="19" fill="#e0a8b8" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
            <circle cx="-6.5" cy="16" r="2.8" fill="white" />
            <circle cx="6.5" cy="16" r="2.8" fill="white" />
            <path d="M-6 25 Q0 31 6 25" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* Avatar 2 — at current progress, wobbles */}
        <g transform={`translate(${progressX}, ${roadY - 52})`}>
          <g className="avatar-wobble">
            <circle cx="0" cy="20" r="19" fill="#b06878" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
            <circle cx="-6.5" cy="16" r="2.8" fill="white" />
            <circle cx="6.5" cy="16" r="2.8" fill="white" />
            <path d="M-6 25 Q0 31 6 25" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}

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
          <h1 className="hero-title">
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
