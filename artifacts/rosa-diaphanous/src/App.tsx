import { useEffect, useRef, useState } from "react";

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

export default function App() {
  const { pos, visible } = useMouseGlow();
  const glowRef = useRef<HTMLDivElement>(null);

  return (
    <div className="site-wrapper">
      {/* Cursor glow overlay */}
      <div
        ref={glowRef}
        className="glow-cursor"
        style={{
          left: pos.x,
          top: pos.y,
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Hero section */}
      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">Collezione 2026</span>
          <h1 className="hero-title">
            Rosa<br />Diaphanous
          </h1>
          <p className="hero-sub">
            Una luce che esiste soltanto quando la cerchi.
          </p>
          <a href="#discover" className="cta-btn">Scopri</a>
        </div>
      </section>

      {/* Feature section */}
      <section className="features" id="discover">
        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-num">01</div>
            <h3>Materia</h3>
            <p>Tessuti selezionati per la loro trasparenza naturale, dove la luce diventa parte del disegno.</p>
          </article>
          <article className="feature-card">
            <div className="feature-num">02</div>
            <h3>Colore</h3>
            <p>Il rosa antico incontra il diafano — due toni che respirano insieme come alba e nebbia.</p>
          </article>
          <article className="feature-card">
            <div className="feature-num">03</div>
            <h3>Silhouette</h3>
            <p>Forme fluide, mai rigide. Ogni linea segue il corpo come segue la luce — senza sforzo.</p>
          </article>
        </div>
      </section>

      {/* Quote section */}
      <section className="quote-section">
        <blockquote>
          <p>"La bellezza vera non illumina — filtra."</p>
          <cite>— Atelier Diaphanous</cite>
        </blockquote>
      </section>

      {/* Gallery section */}
      <section className="gallery-section">
        <div className="gallery-grid">
          <div className="gallery-block tall" />
          <div className="gallery-block" />
          <div className="gallery-block wide" />
          <div className="gallery-block" />
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <span>© 2026 Atelier Diaphanous</span>
        <nav>
          <a href="#">Contatti</a>
          <a href="#">Instagram</a>
          <a href="#">Privacy</a>
        </nav>
      </footer>
    </div>
  );
}
