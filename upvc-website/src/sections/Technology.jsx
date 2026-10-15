import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Leaf,
  Rotate3D,
  ShieldCheck,
  Sun,
  Volume2,
  Wind,
} from "lucide-react";

import "./Technology.css";

/* =========================================================
   DATA
========================================================= */

const features = [
  {
    icon: Sun,
    title: "Thermal Comfort",
    text: "Helps maintain a comfortable indoor environment.",
  },
  {
    icon: Volume2,
    title: "Sound Insulation",
    text: "Designed to help reduce external noise.",
  },
  {
    icon: Wind,
    title: "Weather Protection",
    text: "Engineered sealing helps protect against weather.",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    text: "Robust construction for long-term reliability.",
  },
  {
    icon: Leaf,
    title: "Low Maintenance",
    text: "uPVC construction designed for everyday convenience.",
  },
];

const components = [
  {
    id: "profile",
    title: "Full Profile",
    description: "The complete engineered uPVC profile structure.",
  },
  {
    id: "glazing",
    title: "Glazing",
    description: "The glazing area forms the visual connection to the outside.",
  },
  {
    id: "reinforcement",
    title: "Reinforcement",
    description: "Internal reinforcement supports structural stability.",
  },
  {
    id: "gasket",
    title: "Sealing Gasket",
    description:
      "Sealing elements help protect against weather, dust and noise.",
  },
  {
    id: "section",
    title: "Profile Section",
    description: "Explore the complete cross-sectional construction.",
  },
];

/*
 * Callouts around the model. `id` links each one to the component
 * selector, so picking a component highlights its callout too.
 */
const callouts = [
  {
    id: "reinforcement",
    side: "left",
    className: "callout-reinforcement",
    title: "Reinforcement",
    text: "Internal reinforcement for added strength and stability.",
  },
  {
    id: "glazing",
    side: "right",
    className: "callout-glazing",
    title: "Glazing",
    text: "The glazing area connects the interior with the outside.",
  },
  {
    id: "gasket",
    side: "right",
    className: "callout-gasket",
    title: "Sealing Gasket",
    text: "Optimised sealing against weather, dust and noise.",
  },
  {
    id: "profile",
    side: "left",
    className: "callout-profile",
    title: "uPVC Profile",
    text: "Precisely engineered geometry forms the system foundation.",
  },
];

/*
 * Pulsing hotspots, placed in % of the profile image. They live INSIDE
 * the rotating element so they stay glued to the right spot while the
 * model turns.
 */
const hotspots = {
  profile: { left: 46, top: 84 },
  glazing: { left: 41, top: 16 },
  reinforcement: { left: 33, top: 58 },
  gasket: { left: 66, top: 68 },
};

/* =========================================================
   ROTATION SETTINGS
========================================================= */

const SWEEP_AMPLITUDE = 34; // degrees either side of centre
const SWEEP_SPEED = 0.55; // radians / second  (~11s per full sweep)
const MAX_YAW = 80; // limit while dragging
const RESUME_DELAY = 1.4; // seconds to hold a dragged pose before auto-rotate resumes

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/* =========================================================
   SECTION
========================================================= */

export default function Technology() {
  const [activeId, setActiveId] = useState("profile");

  const active = components.find((item) => item.id === activeId);

  return (
    <section className="technology" id="technology">
      <div className="technology-background" />
      <div className="technology-background-overlay" />

      <div className="tech-inner">
        {/* ---------------- TOP BAR ---------------- */}
        <div className="tech-topbar">
          <div className="tech-brand-label">
            <span />
            GEALAN TECHNOLOGY
          </div>
        </div>

        {/* ---------------- LEFT ---------------- */}
        <motion.div
          className="tech-left"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2>
            Engineered
            <br />
            <em>from within.</em>
          </h2>

          <p className="tech-lede">
            A window is more than what you see. Its performance begins inside
            the profile — through carefully engineered design, sealing and
            construction.
          </p>

          <ul className="tech-features">
            {features.map(({ icon: Icon, title, text }) => (
              <li className="tech-feature" key={title}>
                <span className="tech-feature-icon">
                  <Icon size={18} strokeWidth={1.7} />
                </span>

                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <a className="tech-link" href="#performance">
            Explore performance
            <ArrowUpRight size={15} />
          </a>
        </motion.div>

        {/* ---------------- CENTRE: ROTATING MODEL ---------------- */}
        <RotatingProfile activeId={activeId} activeText={active?.description} />

        {/* ---------------- RIGHT: COMPONENT SELECTOR ---------------- */}
        <motion.aside
          className="tech-rail"
          aria-label="Explore the components"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <p className="tech-rail-title">
            Explore
            <strong>the components</strong>
          </p>

          <div className="tech-rail-list">
            {components.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`tech-rail-item ${
                  activeId === item.id ? "is-active" : ""
                }`}
                aria-pressed={activeId === item.id}
                onClick={() => setActiveId(item.id)}
              >
                <span className="tech-rail-number">{index + 1}</span>
                <span className={`tech-thumb thumb-${item.id}`} />
                <span className="tech-rail-label">{item.title}</span>
              </button>
            ))}
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

/* =========================================================
   ROTATING PROFILE (turntable + image)
   Rotation is driven by requestAnimationFrame and written
   straight to the DOM, so React never re-renders per frame.
========================================================= */

function RotatingProfile({ activeId, activeText }) {
  const stageRef = useRef(null);
  const spinRef = useRef(null);
  const ringRef = useRef(null);
  const shadowRef = useRef(null);

  // Mutable rotation state shared by the animation loop and pointer handlers
  const motionState = useRef({
    yaw: 0, // current rendered angle
    dragYaw: 0, // angle requested by the user
    hold: 0, // seconds to hold a user pose before auto-rotate resumes
    dragging: false,
    startX: 0,
    startYaw: 0,
  });

  /* ---------- animation loop ---------- */
  useEffect(() => {
    const stage = stageRef.current;
    const spin = spinRef.current;
    const ring = ringRef.current;
    const shadow = shadowRef.current;

    if (!stage || !spin) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const s = motionState.current;

    let raf = 0;
    let last = performance.now();
    let phase = 0;
    let ringAngle = 0;

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      /* --- decide where we want to be --- */
      let target;

      if (s.dragging) {
        target = s.dragYaw;
      } else if (s.hold > 0) {
        s.hold -= dt;
        target = s.dragYaw;
      } else if (reduceMotion) {
        target = s.dragYaw;
      } else {
        phase += dt * SWEEP_SPEED;
        target = SWEEP_AMPLITUDE * Math.sin(phase);
      }

      /* --- ease towards it (snappy while dragging, floaty otherwise) --- */
      const stiffness = s.dragging ? 18 : 3.5;
      s.yaw += (target - s.yaw) * (1 - Math.exp(-dt * stiffness));

      /* --- apply --- */
      const bob = reduceMotion ? 0 : Math.sin(phase * 1.7) * 4;

      spin.style.transform = `perspective(1600px) translateY(${bob}px) rotateY(${s.yaw}deg)`;

      if (ring) {
        ringAngle += dt * 14;
        ring.style.transform = `rotate(${ringAngle - s.yaw * 1.2}deg)`;
      }

      if (shadow) {
        const squeeze = 1 - 0.14 * Math.abs(Math.sin((s.yaw * Math.PI) / 180));
        shadow.style.transform = `translateX(-50%) scaleX(${squeeze})`;
      }

      raf = requestAnimationFrame(loop);
    };

    // Only animate while the section is on screen
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);

      if (entry.isIntersecting) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });

    observer.observe(stage);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  /* ---------- drag to rotate ---------- */
  const onPointerDown = (event) => {
    const s = motionState.current;

    s.dragging = true;
    s.startX = event.clientX;
    s.startYaw = s.yaw;
    s.dragYaw = s.yaw;

    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
  };

  const onPointerMove = (event) => {
    const s = motionState.current;

    if (!s.dragging) return;

    s.dragYaw = clamp(
      s.startYaw + (event.clientX - s.startX) * 0.35,
      -MAX_YAW,
      MAX_YAW,
    );
  };

  const endDrag = (event) => {
    const s = motionState.current;

    if (!s.dragging) return;

    s.dragging = false;
    s.hold = RESUME_DELAY;

    event.currentTarget.classList.remove("is-dragging");
  };

  /* ---------- keyboard: ← → ---------- */
  const onKeyDown = (event) => {
    const s = motionState.current;

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();

    const step = event.key === "ArrowLeft" ? -12 : 12;

    s.dragYaw = clamp(s.yaw + step, -MAX_YAW, MAX_YAW);
    s.hold = RESUME_DELAY * 2;
  };

  return (
    <div
      ref={stageRef}
      className="tech-stage"
      data-active={activeId}
      tabIndex={0}
      role="group"
      aria-label="Rotating uPVC profile. Drag, or use the left and right arrow keys, to rotate."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    >
      <div className="tech-glow" />

      {/* ---------------- TURNTABLE ---------------- */}
      <div className="tech-turntable" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="tech-disc-layer"
            style={{ transform: `translateZ(${-i * 3}px)` }}
          />
        ))}

        <span className="tech-disc-top">
          <span ref={ringRef} className="tech-ring" />
        </span>
      </div>

      <div ref={shadowRef} className="tech-shadow" aria-hidden="true" />

      {/* ---------------- MODEL ---------------- */}
      <div className="tech-model">
        <div ref={spinRef} className="tech-spin">
          <img
            className={`tech-profile-img ${
              activeId === "section" ? "is-section" : ""
            }`}
            src="/images/profile-3d.png"
            alt="Cross-section of a GEALAN uPVC window profile showing the glazing, steel reinforcement and sealing gasket"
            draggable={false}
          />

          {Object.entries(hotspots).map(([id, position]) => (
            <span
              key={id}
              className={`tech-hotspot ${activeId === id ? "is-active" : ""}`}
              style={{ left: `${position.left}%`, top: `${position.top}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* ---------------- CALLOUTS ---------------- */}
      {callouts.map((callout) => (
        <div
          key={callout.id}
          className={`tech-callout ${callout.className} side-${callout.side} ${
            activeId === callout.id ? "is-active" : ""
          }`}
        >
          <div className="callout-card">
            <span className={`tech-thumb thumb-${callout.id}`} />

            <div>
              <strong>{callout.title}</strong>
              <p>{callout.text}</p>
            </div>
          </div>

          <span className="callout-line" />
          <span className="callout-dot" />
        </div>
      ))}

      {/* ---------------- DRAG LABEL ---------------- */}
      <div className="tech-drag">
        <span className="tech-drag-label">
          <Rotate3D size={15} />
          Drag to rotate
        </span>

        <span className="tech-drag-note" aria-live="polite">
          {activeText}
        </span>
      </div>
    </div>
  );
}
