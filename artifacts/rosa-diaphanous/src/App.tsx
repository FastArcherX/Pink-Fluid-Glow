import {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import type { CSSProperties } from "react";
import phrases from "./phrases.json";
import girlAvatar from "@assets/ChatGPT_Image_3_lug_2026__01_58_27-removebg-preview_1784160643734.png";
import boyAvatar from "@assets/ChatGPT_Image_15_lug_2026__15_32_52-removebg-preview_1784160650131.png";
import bgFloral from "@assets/ChatGPT_Image_16_lug_2026,_02_47_11_1784162852061.png";

function pickPhrase(): string {
  const HISTORY_KEY = "rd_phrase_history";
  const WINDOW = Math.floor(phrases.length * 0.6);
  let history: number[] = [];
  try {
    history = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }

  const candidates = phrases
    .map((_, i) => i)
    .filter((i) => !history.includes(i));

  const pool = candidates.length > 0 ? candidates : phrases.map((_, i) => i);
  const picked = pool[Math.floor(Math.random() * pool.length)];

  history = [...history, picked].slice(-WINDOW);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }

  return phrases[picked];
}

const phrase = pickPhrase();

/* ── Curtain parameters ───────────────────────────────────── */
const FLOWER_SRCS = [1, 2, 3, 4, 5, 7, 9].map((n) => `/flowers/flower${n}.png`);

function sr(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const COLS = 14,
  ROWS = 11;
const CURTAIN_TILES = (() => {
  const tiles = [];
  let k = 0;
  const cw = 110 / COLS;
  const ch = 110 / ROWS;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      tiles.push({
        id: k,
        src: FLOWER_SRCS[Math.floor(sr(k + 7) * FLOWER_SRCS.length)],
        x: col * cw - 12 + sr(k) * cw * 0.9,
        y: row * ch - 12 + sr(k + 200) * ch * 0.9,
        size: 155 + sr(k + 400) * 115,
        rot: sr(k + 600) * 360,
        fallDx: (sr(k + 800) - 0.5) * 220,
        fallDy: 110 + sr(k + 1000) * 30,
        dur: 2600 + sr(k + 1200) * 1600,
        delay: sr(k + 1400) * 1000,
      });
      k++;
    }
  }
  for (let j = 0; j < 20; j++) {
    tiles.push({
      id: k,
      src: FLOWER_SRCS[Math.floor(sr(k + 11) * FLOWER_SRCS.length)],
      x: sr(k) * 110 - 5,
      y: sr(k + 300) * 15 - 20,
      size: 160 + sr(k + 700) * 100,
      rot: sr(k + 900) * 360,
      fallDx: (sr(k + 1100) - 0.5) * 200,
      fallDy: 112 + sr(k + 1300) * 28,
      dur: 2600 + sr(k + 1500) * 1600,
      delay: sr(k + 1700) * 1000,
    });
    k++;
  }
  for (let j = 0; j < 20; j++) {
    tiles.push({
      id: k,
      src: FLOWER_SRCS[Math.floor(sr(k + 13) * FLOWER_SRCS.length)],
      x: sr(k + 200) * 15 - 20,
      y: sr(k) * 110 - 5,
      size: 160 + sr(k + 600) * 100,
      rot: sr(k + 800) * 360,
      fallDx: (sr(k + 1000) - 0.5) * 200,
      fallDy: 112 + sr(k + 1200) * 28,
      dur: 2600 + sr(k + 1400) * 1600,
      delay: sr(k + 1600) * 1000,
    });
    k++;
  }
  return tiles;
})();

interface FlowerCurtainProps {
  onFall: () => void;
  unlockMusic: () => void;
  onReady: () => void;
}

function FlowerCurtain({ onFall, unlockMusic, onReady }: FlowerCurtainProps) {
  const [phase, setPhase] = useState<"show" | "fall" | "done">("show");
  const loadedCount = useRef(0);
  const total = CURTAIN_TILES.length;

  const handleLoad = useRef(() => {
    loadedCount.current += 1;
    if (loadedCount.current >= total) {
      onReady();
    }
  }).current;

  const handleUnlock = () => {
    if (phase !== "show") return;

    try {
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      console.log("AudioContext fallback bypass", e);
    }

    unlockMusic();
    setPhase("fall");
    onFall();

    window.setTimeout(() => setPhase("done"), 5200);
  };

  if (phase === "done") return null;

  return (
    <div
      className="flower-curtain"
      aria-hidden="false"
      onClick={handleUnlock}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "auto",
      }}
    >
      {CURTAIN_TILES.map((f) => (
        <img
          key={f.id}
          src={f.src}
          draggable={false}
          onLoad={handleLoad}
          onError={handleLoad}
          style={{
            position: "absolute",
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.size,
            height: f.size,
            objectFit: "contain",
            transform:
              phase === "fall"
                ? `translate3d(${f.fallDx}px, ${f.fallDy}vh, 0) rotate(${f.rot + sr(f.id) * 180}deg)`
                : `rotate(${f.rot}deg)`,
            transition:
              phase === "fall"
                ? `transform ${f.dur}ms cubic-bezier(.3,0,.7,1) ${f.delay}ms`
                : "none",
          }}
        />
      ))}
      {phase === "show" && loadedCount.current >= total && (
        <button
          type="button"
          className="flower-curtain-prompt"
          onClick={handleUnlock}
          aria-label="Clicca per sbloccare il sito e avviare la musica"
        >
          <span>Clicca il sipario per sbloccare la musica</span>
          <strong>e entrare</strong>
        </button>
      )}
    </div>
  );
}

/* ── Petal rain ───────────────────────────────────────────── */
const PETAL_COUNT = 90;
const PETALS = Array.from({ length: PETAL_COUNT }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: 10 + Math.random() * 22,
  duration: 8 + Math.random() * 14,
  delay: -(Math.random() * 22),
  drift: (Math.random() - 0.5) * 120,
  spin: (Math.random() - 0.5) * 600,
  opacity: 0.35 + Math.random() * 0.5,
  hue: Math.random() > 0.5 ? "#f9b8c8" : "#f7d0da",
}));

function PetalRain() {
  return (
    <div className="petal-container" aria-hidden="true">
      {PETALS.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 40 40"
          width={p.size}
          height={p.size}
          style={
            {
              position: "absolute",
              left: `${p.left}%`,
              top: "-8%",
              opacity: p.opacity,
              animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as CSSProperties
          }
        >
          <ellipse
            cx="20"
            cy="25"
            rx="10"
            ry="16"
            fill={p.hue}
            transform="rotate(-20,20,20)"
          />
          <ellipse
            cx="20"
            cy="25"
            rx="10"
            ry="16"
            fill={p.hue}
            transform="rotate(20,20,20)"
            opacity="0.7"
          />
        </svg>
      ))}
    </div>
  );
}

/* ── Static Maps & Constants ───────────────────────────────── */
const ROAD =
  "M 70,108 C 160,72 270,138 390,102 C 510,66 610,132 730,98 C 830,68 890,112 940,102";

const HEARTS = [
  { x: 164, y: 58, s: 10, d: 0.0 },
  { x: 295, y: 145, s: 7, d: 0.6 },
  { x: 428, y: 52, s: 11, d: 1.1 },
  { x: 570, y: 148, s: 8, d: 0.3 },
  { x: 708, y: 50, s: 9, d: 0.9 },
  { x: 845, y: 130, s: 7, d: 0.5 },
];

const TARGET = new Date("2026-08-27T23:59:59").getTime();

function useCountdown() {
  const calc = () => {
    const diff = Math.max(0, TARGET - Date.now());
    return {
      days: Math.floor(diff / 864e5),
      hours: Math.floor((diff % 864e5) / 36e5),
      minutes: Math.floor((diff % 36e5) / 6e4),
      seconds: Math.floor((diff % 6e4) / 1e3),
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
    { value: days, label: "DAYS" },
    { value: hours, label: "HOURS" },
    { value: minutes, label: "MINUTES" },
    { value: seconds, label: "SECONDS" },
  ];
  return (
    <div className="countdown-block">
      <div className="countdown-wrap">
        {units.map(({ value, label }) => (
          <div key={label} className="countdown-card">
            <span className="countdown-num">
              {label === "DAYS" ? value : pad(value)}
            </span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </div>
      <p className="countdown-subtitle">Back where I belong on August 27 ♡</p>
    </div>
  );
}

function useMouseGlow() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const mv = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const ml = () => setVisible(false);
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseleave", ml);
    return () => {
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("mouseleave", ml);
    };
  }, []);
  return { pos, visible };
}

/* ── Vinyl Player ─────────────────────────────────────────── */
const PLAYLIST_URL =
  "https://open.spotify.com/playlist/0SsmYjVt0946avI5nqxSCi?si=5d0d0fec62fe40f7&pt=eb666271fcd47da5ee3c02c6e65f9921";
const SPOTIFY_URI = "spotify:playlist:0SsmYjVt0946avI5nqxSCi";
const SPOTIFY_IFRAME_API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

interface VinylPlayerProps {
  playing: boolean;
  onToggle: () => void;
}

function VinylPlayer({ playing, onToggle }: VinylPlayerProps) {
  return (
    <div className="vinyl-wrapper">
      <div
        className={`vinyl-disc${playing ? " spinning" : ""}`}
        onClick={onToggle}
        style={{ cursor: "pointer" }}
      >
        <svg viewBox="0 0 130 130" width="100%" height="100%">
          <circle cx="65" cy="65" r="63" fill="#1c1218" />
          {[20, 28, 36, 44, 52].map((r) => (
            <circle
              key={r}
              cx="65"
              cy="65"
              r={r + 10}
              fill="none"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="1.2"
            />
          ))}
          <ellipse
            cx="48"
            cy="40"
            rx="18"
            ry="10"
            fill="rgba(255,255,255,0.035)"
            transform="rotate(-30,48,40)"
          />
          <circle cx="65" cy="65" r="22" fill="#c9748a" />
          <circle
            cx="65"
            cy="65"
            r="20"
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="0.7"
          />
          <circle
            cx="65"
            cy="65"
            r="15"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.5"
          />
          <circle cx="65" cy="65" r="3.5" fill="#1c1218" />
        </svg>
        <span className="vinyl-overlay">{playing ? "⏸" : "▶"}</span>
      </div>
      <p className="vinyl-label">
        {playing ? "Now Playing ♪" : "Play Our Melody"}
      </p>
    </div>
  );
}

/* ── Road Section ────────────────────────────────────────────── */
function Road({
  playing,
  onToggle,
}: {
  playing: boolean;
  onToggle: () => void;
}) {
  const START = new Date("2026-06-23T00:00:00").getTime();
  const END = new Date("2026-08-27T23:59:59").getTime();
  const now = Date.now();
  const progress = Math.min(1, Math.max(0, (now - START) / (END - START)));

  const pathRef = useRef<SVGPathElement>(null);
  const [boyPos, setBoyPos] = useState({ x: 70, y: 108 });

  useLayoutEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    const pt = pathRef.current.getPointAtLength(progress * len);
    setBoyPos({ x: pt.x, y: pt.y });
  }, [progress]);

  const GIRL_X = 940;
  const GIRL_Y = 102;
  const BOY_W = 108;
  const BOY_H = 108;
  const GIRL_W = 120;
  const GIRL_H = 120;

  return (
    <div className="road-section">
      <VinylPlayer playing={playing} onToggle={onToggle} />
      <div className="flower-spinner-wrapper">
        <img
          src="/flowers/flower2.png"
          alt=""
          className={`flower-spinner-img${playing ? " spinning" : ""}`}
          aria-hidden="true"
        />
      </div>
      <div className="road-top-row">
        <CountdownDisplay />
      </div>
      <svg
        viewBox="0 0 1000 210"
        preserveAspectRatio="xMidYMid meet"
        className="road-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="cp-past">
            <rect x="0" y="0" width={boyPos.x} height="210" />
          </clipPath>
          <clipPath id="cp-future">
            <rect x={boyPos.x} y="0" width="1000" height="210" />
          </clipPath>
          <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="3"
              floodColor="rgba(60,20,30,0.18)"
            />
          </filter>
        </defs>

        <path d={ROAD} ref={pathRef} fill="none" stroke="none" />
        <path
          d={ROAD}
          className="road-path road-future"
          clipPath="url(#cp-future)"
        />
        <path
          d={ROAD}
          className="road-path road-past"
          clipPath="url(#cp-past)"
        />

        <circle cx="70" cy="108" r="4" className="dot-past" />
        <circle cx="940" cy="102" r="4" className="dot-future" />
        <circle cx={boyPos.x} cy={boyPos.y} r="4" className="dot-past" />

        {HEARTS.map((h, i) => (
          <text
            key={i}
            x={h.x}
            y={h.y}
            fontSize={h.s}
            textAnchor="middle"
            className="heart-float"
            style={{ animationDelay: `${h.d}s` }}
          >
            ♥
          </text>
        ))}

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
      <div className="playlist-section">
        <p className="playlist-tagline">
          ♪ As our story begins we'll need a soundtrack... let's build it
          together ♪
        </p>
        <a
          href={PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="playlist-btn"
        >
          ♡ Build It With Me ♡
        </a>
      </div>
    </div>
  );
}

/* ── Main App ────────────────────────────────────────────────── */
const PHRASE_INTERVAL_MS = 60_000;
const ERASE_MS = 38;
const TYPE_MS = 58;

export default function App() {
  const { pos, visible } = useMouseGlow();
  const glowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const [curtainImagesLoaded, setCurtainImagesLoaded] = useState(false);
  const [siteReady, setSiteReady] = useState(false);

  const embedRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);

  // Inizializzazione controllore passivo
  useEffect(() => {
    let alive = true;

    const attachController = (IFrameAPI: any) => {
      if (!alive || !embedRef.current) return;

      IFrameAPI.createController(
        embedRef.current,
        { uri: SPOTIFY_URI, width: 300, height: 80 },
        (controller: any) => {
          if (!alive) {
            controller.destroy?.();
            return;
          }
          controllerRef.current = controller;

          controller.addListener?.("playback_update", (e: any) => {
            // Aggiorna lo stato nel caso in cui finisca la playlist
            if (e.data.isPaused && e.data.position === 0) {
              setPlaying(false);
            }
          });
        },
      );
    };

    const previousCallback = (window as any).onSpotifyIframeApiReady;
    (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
      if (typeof previousCallback === "function") {
        previousCallback(IFrameAPI);
      }
      attachController(IFrameAPI);
    };

    const existingScript = document.querySelector(
      `script[src="${SPOTIFY_IFRAME_API_SRC}"]`,
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.async = true;
      script.src = SPOTIFY_IFRAME_API_SRC;
      document.body.appendChild(script);
    }

    return () => {
      alive = false;
      (window as any).onSpotifyIframeApiReady = previousCallback;
    };
  }, []);

  // Gestione pulita del Play/Pause
  const handleToggle = useCallback(() => {
    if (!controllerRef.current) return;

    if (playing) {
      controllerRef.current.togglePlay?.();
      setPlaying(false);
    } else {
      controllerRef.current.resume?.();
      setPlaying(true);
    }
  }, [playing]);

  // Trigger dal sipario
  const unlockMusic = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.resume?.();
      setPlaying(true);
    } else {
      setTimeout(() => {
        controllerRef.current?.resume?.();
        setPlaying(true);
      }, 600);
    }
  }, []);

  const initialPhrase = useRef(pickPhrase()).current;
  const [displayText, setDisplayText] = useState(initialPhrase);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.title = "Miss U Iasmi";
    let favicon = document.querySelector(
      "link[rel~='icon']",
    ) as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = "/flowers/flower1.png";
  }, []);

  const cancelAnim = () => {
    if (animRef.current !== null) {
      clearTimeout(animRef.current);
      animRef.current = null;
    }
  };

  useEffect(() => {
    if (!curtainImagesLoaded) return;

    const measureFontSize = (text: string): number => {
      const el = measureRef.current;
      if (!el) return 104;
      el.textContent = text;
      let s = 104;
      el.style.fontSize = s + "px";
      const lineH = parseFloat(getComputedStyle(el).lineHeight);
      while (el.scrollHeight > Math.ceil(lineH * 2 + 8) && s > 28) {
        s -= 1;
        el.style.fontSize = s + "px";
      }
      el.textContent = "";
      return s;
    };

    if (titleRef.current) {
      const initialFs = measureFontSize(displayText);
      titleRef.current.style.fontSize = initialFs + "px";
    }

    const runTypewriter = (fromText: string, toText: string) => {
      cancelAnim();
      let text = fromText;

      const eraseStep = () => {
        if (text.length === 0) {
          const fs = measureFontSize(toText);
          if (titleRef.current) titleRef.current.style.fontSize = fs + "px";
          setDisplayText("");
          animRef.current = setTimeout(typeStep, TYPE_MS);
          return;
        }
        text = text.slice(0, -1);
        setDisplayText(text);
        animRef.current = setTimeout(eraseStep, ERASE_MS);
      };

      let typeIdx = 0;
      const typeStep = () => {
        typeIdx++;
        setDisplayText(toText.slice(0, typeIdx));
        if (typeIdx < toText.length) {
          animRef.current = setTimeout(typeStep, TYPE_MS);
        }
      };

      animRef.current = setTimeout(eraseStep, ERASE_MS);
    };

    const id = setInterval(() => {
      const next = pickPhrase();
      setDisplayText((cur) => {
        runTypewriter(cur, next);
        return cur;
      });
    }, PHRASE_INTERVAL_MS);

    return () => {
      clearInterval(id);
      cancelAnim();
    };
  }, [curtainImagesLoaded, displayText]);

  const onFall = useRef(() => setSiteReady(true)).current;
  const onCurtainReady = useCallback(() => setCurtainImagesLoaded(true), []);

  return (
    <>
      <FlowerCurtain
        onFall={onFall}
        unlockMusic={unlockMusic}
        onReady={onCurtainReady}
      />

      {curtainImagesLoaded && (
        <>
          {siteReady && <PetalRain />}
          <div
            className="site-wrapper"
            style={{
              backgroundImage: `url(${bgFloral})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center top",
              visibility: "visible",
              pointerEvents: siteReady ? "auto" : "none",
            }}
          >
            <div
              ref={glowRef}
              className="glow-cursor"
              style={{ left: pos.x, top: pos.y, opacity: visible ? 1 : 0 }}
            />
            <div
              ref={measureRef}
              aria-hidden="true"
              style={{
                position: "absolute",
                visibility: "hidden",
                pointerEvents: "none",
                maxWidth: "90vw",
                lineHeight: 1.25,
                fontFamily: "var(--font-sans)",
                fontWeight: 300,
                fontStyle: "italic",
              }}
            />
            <section className="hero">
              <div className="hero-inner">
                <span className="eyebrow">Made with 💕 by your Samu</span>
                <div className="hero-title-wrap">
                  <h1 ref={titleRef} className="hero-title">
                    {displayText.split("\n").map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                    <span className="typewriter-cursor" aria-hidden="true">
                      |
                    </span>
                  </h1>
                </div>
              </div>
            </section>

            <Road playing={playing} onToggle={handleToggle} />
          </div>
        </>
      )}

      {/* 
        SOLUZIONE DEFINITIVA COMPATIBILITÀ:
        L'iframe è montato a pieno schermo ma posizionato DIETRO a tutto il layout (z-index: -1).
        Ha un'opacità minima (0.001) e pointer-events: none, così è visibile tecnicamente per Spotify
        ma non interferisce né visivamente né a livello di click con gli elementi soprastanti.
      */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          opacity: 0.001,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div ref={embedRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </>
  );
}
