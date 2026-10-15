import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, ChevronLeft, ChevronRight, House, Sun } from "lucide-react";

import "./Colours.css";

/* =========================================================
   COLOUR DATA
   Source: the GEALAN "Colour Options" card (Prima & Supra).
   The hex values were sampled from a photo of that card and
   white-balanced, so they are close on-screen matches, not
   official decor / RAL codes. Replace them with your real
   codes if you have them.

   `finish` decides the surface treatment:
     solid | texture | wood | woodlight
========================================================= */

const exteriorColours = [
  { id: "white", name: "White", hex: "#f3f4f3", finish: "solid" },
  {
    id: "anthracite",
    name: "Anthracite Grey",
    hex: "#424853",
    finish: "solid",
  },
  { id: "black-smooth", name: "Black Smooth", hex: "#272c2e", finish: "solid" },
  {
    id: "black-texture",
    name: "Black Texture",
    hex: "#272c2e",
    finish: "texture",
  },
  { id: "walnut", name: "Walnut", hex: "#393025", finish: "wood" },
  { id: "golden-oak", name: "Golden Oak", hex: "#8f5726", finish: "wood" },
  { id: "rustic-oak", name: "Rustic Oak", hex: "#443b30", finish: "wood" },
  { id: "mahogany", name: "Mahogany", hex: "#292626", finish: "wood" },
  {
    id: "coriander-oak",
    name: "Coriander Oak",
    hex: "#a99259",
    finish: "wood",
  },
];

/*
 * The card lists no interior-only colours, so the interior offers a white
 * (not on the card, kept so "different inside" still reads) plus the same
 * decors as the exterior.
 */
const interiorColours = [
  { id: "white", name: "White", hex: "#f3f4f3", finish: "solid" },
  {
    id: "anthracite",
    name: "Anthracite Grey",
    hex: "#424853",
    finish: "solid",
  },
  { id: "black-smooth", name: "Black Smooth", hex: "#272c2e", finish: "solid" },
  {
    id: "black-texture",
    name: "Black Texture",
    hex: "#272c2e",
    finish: "texture",
  },
  { id: "walnut", name: "Walnut", hex: "#393025", finish: "wood" },
  { id: "golden-oak", name: "Golden Oak", hex: "#8f5726", finish: "wood" },
  { id: "rustic-oak", name: "Rustic Oak", hex: "#443b30", finish: "wood" },
  { id: "mahogany", name: "Mahogany", hex: "#292626", finish: "wood" },
  {
    id: "coriander-oak",
    name: "Coriander Oak",
    hex: "#a99259",
    finish: "wood",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// blend a #rrggbb colour towards white (255) or black (0)
const mix = (hex, target, amount) => {
  const n = parseInt(hex.slice(1), 16);
  const channel = (c) => Math.round(c + (target - c) * amount);

  return `rgb(${channel(n >> 16)},${channel((n >> 8) & 255)},${channel(n & 255)})`;
};

// CSS custom properties consumed by .cd-surface
const colourVars = (colour) => ({
  "--c": colour.hex,
  "--c-hi": mix(colour.hex, 255, 0.22),
  "--c-lo": mix(colour.hex, 0, 0.3),
});

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/* ---- scroll sweep settings ---- */
const SPLIT_START = 94; // % : almost all exterior when the section enters
const SPLIT_END = 50; // % : settles on the middle of the window
const TURN_START = -32; // deg : window starts turned away, then squares up

/* =========================================================
   SECTION
========================================================= */

export default function Colours() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const swatchesRef = useRef(null);

  const reduceMotion = useReducedMotion();

  const [exterior, setExterior] = useState(exteriorColours[0]);
  const [interior, setInterior] = useState(interiorColours[0]);
  const [nudge, setNudge] = useState(false);
  const [ariaSplit, setAriaSplit] = useState(SPLIT_START);

  /* ---------- the split + window rotation ---------- */

  const split = useMotionValue(SPLIT_START); // seam position, % of stage width
  const sweep = useMotionValue(TURN_START); // scroll-driven turn, degrees
  const userControl = useRef(false); // once you drag, scroll stops steering

  // the window also swivels slightly as you drag the seam
  const rotateY = useTransform([split, sweep], ([s, w]) => w + (50 - s) * 0.1);

  const exteriorClip = useTransform(split, (v) => `inset(0 ${100 - v}% 0 0)`);
  const interiorClip = useTransform(split, (v) => `inset(0 0 0 ${v}%)`);
  const seamLeft = useTransform(split, (v) => `${v}%`);

  useMotionValueEvent(split, "change", (v) => {
    const rounded = Math.round(v);

    setAriaSplit((current) => (current === rounded ? current : rounded));
  });

  /* ---------- scroll-driven reveal ---------- */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 0.1"],
  });

  const applyProgress = (progress) => {
    if (userControl.current || reduceMotion) return;

    const t = easeOutCubic(clamp(progress, 0, 1));

    split.set(SPLIT_START + (SPLIT_END - SPLIT_START) * t);
    sweep.set(TURN_START * (1 - t));
  };

  useMotionValueEvent(scrollYProgress, "change", applyProgress);

  useEffect(() => {
    if (reduceMotion) {
      split.set(SPLIT_END);
      sweep.set(0);
      return;
    }

    applyProgress(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  /* ---------- dragging the seam ---------- */

  const takeControl = () => {
    if (userControl.current) return;

    userControl.current = true;
    animate(sweep, 0, { duration: 0.6, ease: "easeOut" });
  };

  const moveSeam = (clientX) => {
    const rect = stageRef.current.getBoundingClientRect();

    split.set(clamp(((clientX - rect.left) / rect.width) * 100, 5, 95));
  };

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    takeControl();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
    moveSeam(event.clientX);
  };

  const onPointerMove = (event) => {
    if (!event.currentTarget.classList.contains("is-dragging")) return;

    moveSeam(event.clientX);
  };

  const endDrag = (event) => {
    event.currentTarget.classList.remove("is-dragging");
  };

  const onHandleKeyDown = (event) => {
    const keys = {
      ArrowLeft: -3,
      ArrowRight: 3,
      ArrowDown: -3,
      ArrowUp: 3,
      PageDown: -10,
      PageUp: 10,
    };

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      takeControl();
      split.set(event.key === "Home" ? 5 : 95);
      return;
    }

    if (!(event.key in keys)) return;

    event.preventDefault();
    takeControl();
    split.set(clamp(split.get() + keys[event.key], 5, 95));
  };

  /* ---------- "Explore colours" ---------- */

  const exploreColours = () => {
    swatchesRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "end",
    });

    setNudge(true);
    window.setTimeout(() => setNudge(false), 1600);
  };

  return (
    <section ref={sectionRef} className="colours" id="colours">
      {/* =====================================================
          STAGE : two identical windows, one per identity,
          each clipped to its own side of the seam
      ===================================================== */}
      <div
        ref={stageRef}
        className="cd-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <motion.div
          className="cd-world cd-world-exterior"
          style={{ clipPath: exteriorClip }}
        >
          <div className="cd-scene" />
          <div className="cd-window-pos">
            <Window colour={exterior} side="exterior" rotateY={rotateY} />
          </div>
        </motion.div>

        <motion.div
          className="cd-world cd-world-interior"
          style={{ clipPath: interiorClip }}
        >
          <div className="cd-scene" />
          <div className="cd-window-pos">
            <Window colour={interior} side="interior" rotateY={rotateY} />
          </div>
        </motion.div>

        {/* keeps the headline readable whichever side is behind it */}
        <div className="cd-shade" />

        {/* ---------------- callouts ---------------- */}
        <div className="cd-callout cd-callout-exterior">
          <div className="cd-callout-card">
            <Sun size={20} strokeWidth={1.5} />
            <div>
              <span>EXTERIOR COLOUR</span>
              <strong>{exterior.name}</strong>
            </div>
          </div>
          <i className="cd-callout-line" />
          <i className="cd-callout-dot" />
        </div>

        <div className="cd-callout cd-callout-interior">
          <div className="cd-callout-card">
            <House size={20} strokeWidth={1.5} />
            <div>
              <span>INTERIOR COLOUR</span>
              <strong>{interior.name}</strong>
            </div>
          </div>
          <i className="cd-callout-line" />
          <i className="cd-callout-dot" />
        </div>

        {/* ---------------- seam + handle ---------------- */}
        <motion.div className="cd-seam" style={{ left: seamLeft }}>
          <button
            type="button"
            className="cd-handle"
            role="slider"
            aria-orientation="horizontal"
            aria-valuemin={5}
            aria-valuemax={95}
            aria-valuenow={ariaSplit}
            aria-valuetext={`${ariaSplit}% exterior`}
            aria-label="Compare exterior and interior. Drag, or use the arrow keys."
            onKeyDown={onHandleKeyDown}
          >
            <ChevronLeft size={15} />
            <ChevronRight size={15} />
          </button>
        </motion.div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div className="cd-inner">
        <motion.div
          className="cd-intro"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="cd-label">
            <span />
            COLOUR &amp; DESIGN
          </div>

          <h2>
            One window.
            <br />
            <em>Two identities.</em>
          </h2>

          <p>
            Different on the outside. Different on the inside. Match your
            home&rsquo;s architecture on the exterior and your interior style at
            home &mdash; with GEALAN&rsquo;s dual-colour technology.
          </p>

          <button type="button" className="cd-explore" onClick={exploreColours}>
            <span className="cd-explore-icon">
              <ArrowDown size={16} />
            </span>
            EXPLORE COLOURS
          </button>
        </motion.div>

        <div
          ref={swatchesRef}
          className={`cd-swatches ${nudge ? "is-nudged" : ""}`}
          id="colour-swatches"
        >
          <SwatchGroup
            title="Exterior colours"
            colours={exteriorColours}
            selected={exterior}
            onSelect={setExterior}
            className="cd-group-exterior"
          />

          <SwatchGroup
            title="Interior colours"
            colours={interiorColours}
            selected={interior}
            onSelect={setInterior}
            className="cd-group-interior"
          />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SWATCH GROUP
========================================================= */

function SwatchGroup({ title, colours, selected, onSelect, className }) {
  return (
    <div className={`cd-group ${className}`}>
      <div className="cd-group-head">
        <span className="cd-group-title">{title}</span>
        <span className="cd-group-line" />
        <span className="cd-group-name">{selected.name}</span>
      </div>

      <div className="cd-group-list" role="group" aria-label={title}>
        {colours.map((colour) => (
          <button
            key={colour.id}
            type="button"
            className={`cd-swatch finish-${colour.finish} ${
              colour.id === selected.id ? "is-active" : ""
            }`}
            style={colourVars(colour)}
            aria-pressed={colour.id === selected.id}
            onClick={() => onSelect(colour)}
          >
            <span className="cd-swatch-chip cd-surface" />
            <span className="cd-swatch-name">{colour.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   THE WINDOW
   Built from CSS so it can be recoloured live. The stacked
   "slabs" behind the frame give it real thickness when it turns.
========================================================= */

const SLABS = 6;

function Window({ colour, side, rotateY }) {
  return (
    <motion.div
      className={`cd-window cd-window-${side} finish-${colour.finish}`}
      style={{
        ...colourVars(colour),
        rotateY,
        transformPerspective: 1500,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: SLABS }).map((_, i) => (
        <span
          key={i}
          className="cd-slab cd-surface"
          style={{
            transform: `translateZ(${-(i + 1) * 4}px)`,
            filter: `brightness(${1 - (i + 1) * 0.07})`,
          }}
        />
      ))}

      <div className="cd-frame cd-surface">
        <div className="cd-sash cd-surface">
          <div className="cd-glass" />
        </div>

        {/* the lever is only visible from inside */}
        {side === "interior" && <span className="cd-lever" />}
      </div>
    </motion.div>
  );
}
