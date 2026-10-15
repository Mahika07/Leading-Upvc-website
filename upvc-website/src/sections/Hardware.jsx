import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";

import "./Hardware.css";

/* =========================================================
   SECTION 8 — O.B.E.N. PREMIUM HARDWARE

   IMAGES (all in /public/images/hardware/)
     window.png                       main window, 4:5 portrait
     handle-{finish}.png              close-up, transparent bg
     locking-{finish}.png             close-up, transparent bg
     hinge-{finish}.png               close-up, transparent bg
   finish = white | black | anthracite | silver | bronze

   Only the *-bronze.png close-ups are required. If a finish
   image is missing, the bronze one is shown with a CSS colour
   approximation, so the selector always works.
========================================================= */

const IMG = "/images/hardware";
const WINDOW_SRC = `${IMG}/window.png`;
const DEFAULT_FINISH = "bronze";

const FINISHES = [
  { id: "white", name: "White", hex: "#f5f4f1" },
  { id: "black", name: "Black", hex: "#1c1c1d" },
  { id: "anthracite", name: "Anthracite", hex: "#4b5056" },
  { id: "silver", name: "Silver", hex: "#c4c7cb" },
  { id: "bronze", name: "Bronze", hex: "#7b4526" },
];

/*
 * hot  : hotspot position on window.png, in % of the image (x from left, y from top)
 * zoom : how far the stage pushes in when the hotspot is clicked
 * Nudge x / y until each dot sits exactly on your real handle / lock / hinge.
 */
const PARTS = [
  {
    id: "handle",
    no: "01",
    label: "Handle",
    sub: "Precision in your hand.",
    title: ["Precision in your ", "hand."],
    text: "Ergonomic handles designed to complement the window's architectural finish. Smooth operation with a premium feel.",
    caption: ["Precision control", "Ergonomic operation"],
    hot: { x: 33, y: 57, side: "left" },
    zoom: 2.4,
  },
  {
    id: "locking",
    no: "02",
    label: "Locking",
    sub: "Security where it matters.",
    title: ["Security where it ", "matters."],
    text: "Integrated locking hardware supporting secure everyday operation.",
    caption: ["Everyday security", "Integrated locking"],
    hot: { x: 52, y: 55, side: "right" },
    zoom: 2.2,
  },
  {
    id: "hinge",
    no: "03",
    label: "Hinges",
    sub: "Smooth movement.",
    title: ["Smooth ", "movement."],
    text: "Hardware engineered around reliable opening and closing, built for lasting performance.",
    caption: ["Reliable motion", "Smooth opening and closing"],
    hot: { x: 7, y: 27, side: "right" },
    zoom: 2.4,
  },
];

// short label shown on the hotspot pill
const HOT_LABEL = { handle: "Handle", locking: "Locking", hinge: "Hinge" };

const partSrc = (partId, finishId) => `${IMG}/${partId}-${finishId}.png`;

const ALL_SRCS = PARTS.flatMap((p) => FINISHES.map((f) => partSrc(p.id, f.id)));

/* ---------- which finish images actually exist ---------- */

function useAvailableImages(srcs) {
  const [ok, setOk] = useState(() => new Set());

  useEffect(() => {
    let live = true;

    srcs.forEach((src) => {
      const img = new Image();

      img.onload = () => {
        if (live) setOk((prev) => new Set(prev).add(src));
      };
      img.src = src;
    });

    return () => {
      live = false;
    };
  }, [srcs]);

  return ok;
}

function resolveImage(partId, finishId, ok) {
  const exact = partSrc(partId, finishId);

  if (ok.has(exact)) return { src: exact, tint: null };

  return {
    src: partSrc(partId, DEFAULT_FINISH),
    tint: finishId === DEFAULT_FINISH ? null : finishId,
  };
}

function PartImage({ partId, finishId, ok, alt = "" }) {
  const { src, tint } = resolveImage(partId, finishId, ok);

  return (
    <motion.img
      key={`${partId}-${finishId}`}
      className={`hw-part-img ${tint ? `tint-${tint}` : ""}`}
      src={src}
      alt={alt}
      draggable={false}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    />
  );
}

/* =========================================================
   SECTION
========================================================= */

export default function Hardware() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);

  const reduceMotion = useReducedMotion();
  const stageInView = useInView(stageRef, { once: true, amount: 0.35 });

  const [activeId, setActiveId] = useState("handle");
  const [zoomed, setZoomed] = useState(false);
  const [finishId, setFinishId] = useState(DEFAULT_FINISH);

  const ok = useAvailableImages(ALL_SRCS);

  const active = PARTS.find((p) => p.id === activeId);
  const finish = FINISHES.find((f) => f.id === finishId);
  const activeIndex = PARTS.findIndex((p) => p.id === activeId);

  /* ---------- scroll: hardware drifts toward the viewer ---------- */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const driftScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.94, 1.03, 1.08],
  );
  const driftRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-6, 0, 6]);
  const driftY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  /* ---------- selecting a part ---------- */

  const selectPart = (id) => {
    if (id === activeId && zoomed) {
      setZoomed(false);
      return;
    }

    setActiveId(id);
    setZoomed(true);
  };

  const step = (dir) => {
    const next = PARTS[(activeIndex + dir + PARTS.length) % PARTS.length];

    setActiveId(next.id);
    setZoomed(true);
  };

  const scrollToCards = () => {
    document.getElementById("hardware-cards")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  };

  /* zoom target: bring the hotspot toward the middle of the stage */
  const zoomTarget = zoomed
    ? {
        scale: active.zoom,
        x: `${(50 - active.hot.x) * active.zoom * 0.75}%`,
        y: `${(50 - active.hot.y) * active.zoom * 0.75}%`,
      }
    : { scale: 1, x: "0%", y: "0%" };

  return (
    <section ref={sectionRef} className="hw" id="hardware">
      <div className="hw-inner">
        <div className="hw-top">
          {/* ---------------- intro ---------------- */}
          <motion.div
            className="hw-intro"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="hw-brand">O.B.E.N.</div>

            <h2 className="hw-title">
              The detail
              <br />
              you <em>touch.</em>
            </h2>

            <p>
              Precision hardware designed to complement the performance and
              appearance of your window system. Smooth, secure and built for
              everyday use.
            </p>

            <button type="button" className="hw-cta" onClick={scrollToCards}>
              Explore Hardware
              <ArrowRight size={15} />
            </button>
          </motion.div>

          {/* ---------------- stage ---------------- */}
          <div ref={stageRef} className="hw-stage-wrap">
            {/* layer 1: entrance (fade / scale / rise) */}
            <motion.div
              className="hw-enter"
              initial={
                reduceMotion ? false : { opacity: 0, scale: 0.85, y: 80 }
              }
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* layer 2: scroll drift */}
              <motion.div
                className="hw-drift"
                style={
                  reduceMotion
                    ? undefined
                    : {
                        scale: driftScale,
                        rotateY: driftRotate,
                        y: driftY,
                        transformPerspective: 1200,
                      }
                }
              >
                <div className="hw-stage">
                  <span className="hw-floor" />

                  {/* layer 3: click-to-zoom */}
                  <motion.div
                    className="hw-zoom"
                    animate={zoomTarget}
                    transition={{
                      duration: reduceMotion ? 0 : 0.9,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <img
                      className="hw-window"
                      src={WINDOW_SRC}
                      alt="uPVC casement window with premium hardware"
                      draggable={false}
                    />

                    {PARTS.map((part, i) => {
                      const isActive = zoomed && part.id === activeId;
                      const hotScale = !stageInView
                        ? 0.4
                        : zoomed
                          ? 1 / active.zoom
                          : 1;

                      return (
                        <div
                          key={part.id}
                          className="hw-anchor"
                          style={{
                            left: `${part.hot.x}%`,
                            top: `${part.hot.y}%`,
                          }}
                        >
                          <motion.button
                            type="button"
                            className={`hw-hot ${isActive ? "is-active" : ""}`}
                            data-side={part.hot.side}
                            aria-pressed={isActive}
                            aria-label={`${HOT_LABEL[part.id]} hardware`}
                            onClick={() => selectPart(part.id)}
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{
                              opacity: stageInView ? 1 : 0,
                              scale: hotScale,
                            }}
                            transition={{
                              duration: 0.5,
                              delay:
                                stageInView && !zoomed ? 0.9 + i * 0.28 : 0,
                              ease: "easeOut",
                            }}
                          >
                            <span className="hw-hot-label">
                              {HOT_LABEL[part.id]}
                            </span>
                          </motion.button>
                        </div>
                      );
                    })}
                  </motion.div>

                  {/* zoom caption */}
                  <AnimatePresence>
                    {zoomed && (
                      <motion.div
                        key={active.id}
                        className="hw-caption"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <span className="hw-caption-tag">{active.label}</span>
                        <strong>{active.caption[0]}</strong>
                        <small>{active.caption[1]}</small>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {zoomed && (
                      <motion.button
                        type="button"
                        className="hw-reset"
                        onClick={() => setZoomed(false)}
                        aria-label="Reset view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <X size={15} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* ---------------- detail panel ---------------- */}
          <aside className="hw-panel" aria-live="polite">
            <div className="hw-panel-head">
              <span className="hw-no">{active.no}</span>
              <i className="hw-rule" />
              <span className="hw-tag">{active.label.toUpperCase()}</span>

              <div className="hw-arrows">
                <button
                  type="button"
                  aria-label="Previous hardware"
                  onClick={() => step(-1)}
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  aria-label="Next hardware"
                  onClick={() => step(1)}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className="hw-panel-body">
              <div className="hw-panel-media">
                <PartImage
                  partId={active.id}
                  finishId={finishId}
                  ok={ok}
                  alt={`${active.label} in ${finish.name}`}
                />
              </div>

              <div className="hw-panel-copy">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                  >
                    <h3>
                      {active.title[0]}
                      <em>{active.title[1]}</em>
                    </h3>
                    <p>{active.text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="hw-finish">
              <div className="hw-finish-head">
                <span>FINISH OPTIONS</span>
                <strong>{finish.name}</strong>
              </div>

              <div
                className="hw-finish-list"
                role="group"
                aria-label="Hardware finish"
              >
                {FINISHES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`hw-swatch ${f.id === finishId ? "is-active" : ""}`}
                    style={{ "--sw": f.hex }}
                    aria-pressed={f.id === finishId}
                    onClick={() => setFinishId(f.id)}
                  >
                    <i />
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ---------------- hardware cards ---------------- */}
        <div className="hw-cards" id="hardware-cards">
          {PARTS.map((part, i) => (
            <motion.button
              key={part.id}
              type="button"
              className={`hw-card ${part.id === activeId ? "is-active" : ""}`}
              aria-pressed={part.id === activeId}
              onClick={() => selectPart(part.id)}
              initial={reduceMotion ? false : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: "easeOut" }}
            >
              <div className="hw-card-copy">
                <span className="hw-card-no">{part.no}</span>
                <h4>{part.label}</h4>
                <p>{part.sub}</p>
                <span className="hw-card-arrow">
                  <ArrowRight size={13} />
                </span>
              </div>

              <div className="hw-card-media">
                <PartImage
                  partId={part.id}
                  finishId={finishId}
                  ok={ok}
                  alt=""
                />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
