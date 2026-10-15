import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import "./Hero.css";

export default function Hero() {
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  /* =========================================
     DOOR OPENING
  ========================================= */

  const leftDoorX = useTransform(scrollYProgress, [0, 0.65], ["0%", "-105%"]);

  const rightDoorX = useTransform(scrollYProgress, [0, 0.65], ["0%", "105%"]);

  /* =========================================
     OPEN VIEW
  ========================================= */

  const openViewOpacity = useTransform(scrollYProgress, [0.42, 0.68], [0, 1]);

  const openViewScale = useTransform(scrollYProgress, [0.35, 1], [1.04, 1.18]);

  /* =========================================
     HERO CONTENT
  ========================================= */

  const contentOpacity = useTransform(scrollYProgress, [0, 0.42], [1, 0]);

  const contentX = useTransform(scrollYProgress, [0, 0.5], ["0%", "-30%"]);

  /* =========================================
     SCROLL INDICATOR
  ========================================= */

  const scrollOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);

  /* =========================================
     REVEAL MESSAGE
  ========================================= */

  const revealOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  const revealY = useTransform(scrollYProgress, [0, 0.2], [25, 0]);

  return (
    <section ref={heroRef} className="hero" id="home">
      <div className="hero-sticky">
        {/* =====================================
            FAINT BACKGROUND
        ===================================== */}

        <div className="hero-faint-image" />

        {/* =====================================
            OPEN VIEW
        ===================================== */}

        <motion.div
          className="open-view"
          style={{
            opacity: openViewOpacity,
            scale: openViewScale,
          }}
        >
          <img src="/images/open-view.png" alt="Architectural outdoor view" />
        </motion.div>

        {/* =====================================
            OPEN VIEW OVERLAY
        ===================================== */}

        <motion.div
          className="open-view-overlay"
          style={{
            opacity: openViewOpacity,
          }}
        />

        {/* =====================================
            FRENCH DOORS
        ===================================== */}

        <div className="door-area">
          <motion.div
            className="door-panel door-panel-left"
            style={{
              x: leftDoorX,
            }}
          />

          <motion.div
            className="door-panel door-panel-right"
            style={{
              x: rightDoorX,
            }}
          />
        </div>

        {/* =====================================
            HERO CONTENT
        ===================================== */}

        <motion.div
          className="hero-content"
          style={{
            opacity: contentOpacity,
            x: contentX,
          }}
        >
          {/* =================================
              TOP BRAND LINE
          ================================= */}

          <div className="hero-topline">
            <span className="hero-dot" />

            <span>GERMAN ENGINEERING</span>
          </div>

          {/* =================================
              COMPANY POSITIONING
          ================================= */}

          <p className="hero-eyebrow">LEADING uPVC DOORS & WINDOWS | GEALAN</p>

          {/* =================================
              MAIN HEADING
          ================================= */}

          <h1>
            Designed in
            <br />
            <em>Germany.</em>
            <br />
            Made for living.
          </h1>

          {/* =================================
              DESCRIPTION
          ================================= */}

          <p className="hero-description">
            Premium uPVC window and door systems engineered for thermal comfort,
            sound insulation, security and timeless architectural design.
          </p>

          {/* =================================
              ACTIONS
          ================================= */}

          <div className="hero-actions">
            <a href="#systems" className="hero-button">
              Explore systems
              <ArrowUpRight size={16} />
            </a>

            <a href="#quote" className="hero-text-link">
              Get a quote
            </a>
          </div>
        </motion.div>

        {/* =====================================
            SCROLL INDICATOR
        ===================================== */}

        <motion.div
          className="hero-scroll"
          style={{
            opacity: scrollOpacity,
          }}
        >
          <span>SCROLL TO OPEN</span>

          <ArrowDown size={14} />
        </motion.div>

        {/* =====================================
            REVEALED MESSAGE
        ===================================== */}

        <motion.div
          className="hero-reveal"
          style={{
            opacity: revealOpacity,
            y: revealY,
          }}
        >
          <span>PRECISION · PERFORMANCE · POSSIBILITY</span>

          <h2>
            Leading UPVC
            <br />
            <em>Doors & Windows</em>
          </h2>
        </motion.div>

        {/* =====================================
            PAGE NUMBER
        ===================================== */}

        <div className="hero-number">
          <span>01</span>

          <div />

          <span>12</span>
        </div>
      </div>
    </section>
  );
}
