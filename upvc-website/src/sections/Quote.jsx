import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Gem,
  Hand,
  Hash,
  Headset,
  House,
  Info,
  LayoutGrid,
  LoaderCircle,
  Minus,
  Palette,
  Pencil,
  PanelBottom,
  Plus,
  Ruler,
  Scan,
  Maximize2,
} from "lucide-react";

import "./Quote.css";

/* =========================================================
   SETTINGS
========================================================= */

/*
 * Quote API endpoint.
 * Local development: Node backend at http://localhost:5000
 * Production: set VITE_API_BASE_URL to your deployed backend base URL.
 *
 * Example production .env:
 * VITE_API_BASE_URL=https://your-api-domain.com
 */
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

const QUOTE_ENDPOINT = `${API_BASE_URL}/api/quote`;

const SIZE_LIMITS = {
  width: { min: 500, max: 4000 },
  height: { min: 500, max: 3000 },
  step: 50,
};

const DEFAULTS = {
  system: "casement",
  configIndex: 1,
  colour: "brown",
  width: 1200,
  height: 1500,
  qty: 2,
  side: "exterior",
  view: "front",
};

/* =========================================================
   DATA
========================================================= */

const cfg = (label, kinds, extra = {}) => ({ label, kinds, ...extra });

/*
 * Every system has 4 configurations (same index = same slot), so switching
 * system keeps the visitor's choice roughly where it was.
 * kinds: turn | tt | fixed | slide | lift | fold | vs
 */
const systems = [
  {
    id: "casement",
    label: "Casement",
    configs: [
      cfg("Single", ["turn"]),
      cfg("Double", ["turn", "turn"]),
      cfg("Triple", ["turn", "turn", "turn"]),
      cfg("Combination", ["turn", "turn"], { transom: true }),
    ],
  },
  {
    id: "sliding",
    label: "Sliding",
    configs: [
      cfg("2 Panel", ["slide", "slide"]),
      cfg("3 Panel", ["slide", "slide", "slide"]),
      cfg("Large opening", ["slide", "slide", "slide", "slide"]),
      cfg("Combination", ["fixed", "slide", "slide"]),
    ],
  },
  {
    id: "tilt-turn",
    label: "Tilt & Turn",
    configs: [
      cfg("Single", ["tt"]),
      cfg("Double", ["tt", "tt"]),
      cfg("Triple", ["tt", "tt", "tt"]),
      cfg("Combination", ["tt", "fixed"]),
    ],
  },
  {
    id: "lift-slide",
    label: "Lift & Slide",
    configs: [
      cfg("Double", ["fixed", "lift"]),
      cfg("Triple", ["fixed", "lift", "fixed"]),
      cfg("Large opening", ["fixed", "lift", "lift", "fixed"]),
      cfg("Combination", ["fixed", "lift"], { transom: true }),
    ],
  },
  {
    id: "slide-fold",
    label: "Slide & Fold",
    configs: [
      cfg("3 Panel", ["fold", "fold", "fold"]),
      cfg("4 Panel", ["fold", "fold", "fold", "fold"]),
      cfg("5 Panel", ["fold", "fold", "fold", "fold", "fold"]),
      cfg("6 Panel", ["fold", "fold", "fold", "fold", "fold", "fold"]),
    ],
  },
  {
    id: "vertical",
    label: "Vertical Slider",
    configs: [
      cfg("Single", ["vs"]),
      cfg("Double", ["vs", "vs"]),
      cfg("Triple", ["vs", "vs", "vs"]),
      cfg("Combination", ["vs", "fixed"]),
    ],
  },
];

/*
 * `custom` takes whatever the visitor picks with the colour picker.
 * Hex values are on-screen approximations, not decor / RAL codes.
 */
const baseColours = [
  { id: "white", name: "White", hex: "#f1f2f2", finish: "solid" },
  { id: "brown", name: "Brown", hex: "#7b4626", finish: "wood" },
  { id: "anthracite", name: "Anthracite", hex: "#424853", finish: "solid" },
  { id: "black", name: "Black", hex: "#25292b", finish: "solid" },
  { id: "golden-oak", name: "Golden Oak", hex: "#a9692b", finish: "wood" },
  { id: "walnut", name: "Walnut", hex: "#4c3426", finish: "wood" },
  { id: "mahogany", name: "Mahogany", hex: "#552620", finish: "wood" },
  { id: "custom", name: "Custom", hex: "#6f8fa8", finish: "solid" },
];

const projectTypes = [
  "Residential",
  "Commercial",
  "Builder / Developer",
  "Architect / Consultant",
];

const steps = [
  { id: "system", label: "SYSTEM" },
  { id: "colour", label: "COLOUR" },
  { id: "size", label: "SIZE" },
  { id: "details", label: "DETAILS" },
];

const views = [
  { id: "front", label: "Front", icon: Maximize2 },
  { id: "angle", label: "Angle", icon: Box },
  { id: "corner", label: "Corner", icon: Scan },
  { id: "handle", label: "Handle", icon: Hand },
  { id: "base", label: "Base", icon: PanelBottom },
];

const perks = [
  {
    icon: House,
    title: "Tailored to your space",
    text: "Choose system, size and style",
  },
  { icon: Gem, title: "Premium quality", text: "German engineering" },
  {
    icon: Headset,
    title: "Expert support",
    text: "Get guidance from our team",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const pad = (n) => String(n).padStart(2, "0");

const mix = (hex, target, amount) => {
  const n = parseInt(hex.slice(1), 16);
  const channel = (c) => Math.round(c + (target - c) * amount);

  return `rgb(${channel(n >> 16)},${channel((n >> 8) & 255)},${channel(n & 255)})`;
};

/*
 * Eases an array of numbers towards a target. Only runs while something is
 * still moving. Used so the preview morphs when size or camera changes.
 */
function useTween(target, speed = 7) {
  const reduce = useReducedMotion();
  const key = target.join(",");
  const [value, setValue] = useState(target);
  const state = useRef({ value: target, target });

  useEffect(() => {
    state.current.target = target;

    if (reduce) {
      state.current.value = target;
      setValue(target);
      return undefined;
    }

    let raf = 0;
    let last = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const k = 1 - Math.exp(-dt * speed);
      let moving = false;

      const next = state.current.value.map((n, i) => {
        const delta = state.current.target[i] - n;

        if (Math.abs(delta) < 0.05) return state.current.target[i];

        moving = true;
        return n + delta * k;
      });

      state.current.value = next;
      setValue(next);

      if (moving) raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reduce]);

  return value;
}

/* =========================================================
   WINDOW LAYOUT  (pure geometry, shared by drawing + camera)
   Drawn in a 1000-unit-wide space; height follows the size inputs.
========================================================= */

const FRAME = 46;
const SASH = 34;
const SPAN = 1000;

function buildLayout(systemId, config, hh) {
  const ix = FRAME;
  const iy = FRAME;
  const iw = SPAN - FRAME * 2;
  const ih = hh - FRAME * 2;

  const transomH = config.transom ? Math.round(ih * 0.24) : 0;
  const by = iy + transomH;
  const bh = ih - transomH;

  const panes = [];
  let handle = null;

  if (transomH) {
    panes.push({ kind: "fixed", x: ix, y: iy, w: iw, h: transomH, thin: true });
  }

  const kinds = config.kinds;
  const n = kinds.length;
  const overlaps = systemId === "sliding" || systemId === "lift-slide";
  const overlap = overlaps ? 20 : 0;
  const pw = (iw + overlap * (n - 1)) / n;

  kinds.forEach((kind, i) => {
    const x = ix + i * (pw - overlap);
    const pane = { kind, x, y: by, w: pw, h: bh, i, n };

    if (kind === "turn" || kind === "tt") {
      pane.hinge = n === 1 ? "left" : i < n / 2 ? "left" : "right";
      pane.handle = {
        x: pane.hinge === "left" ? x + pw - SASH / 2 : x + SASH / 2,
        y: by + bh / 2,
      };
    }

    if (kind === "slide" || kind === "lift") {
      pane.dir = i % 2 === 0 ? 1 : -1;
      pane.handle = {
        x: i % 2 === 0 ? x + pw - SASH / 2 : x + SASH / 2,
        y: by + bh * (kind === "lift" ? 0.55 : 0.5),
      };
    }

    if (kind === "fold" && i === 0) {
      pane.handle = { x: x + pw - SASH / 2, y: by + bh / 2 };
    }

    if (kind === "vs") {
      pane.handle = { x: x + pw / 2, y: by + bh / 2 + 6 };
    }

    if (pane.handle && !handle) handle = pane.handle;

    panes.push(pane);
  });

  return { panes, handle, inner: { x: ix, y: iy, w: iw, h: ih } };
}

/* camera = the SVG viewBox, so zooming stays perfectly sharp */
function cameraFor(view, hh, handle) {
  const base = [-110, -90, SPAN + 150, hh + 130, hh];

  if (view === "corner") return [-24, -24, 330, 412, hh];

  if (view === "handle" && handle) {
    return [handle.x - 170, handle.y - 212, 340, 425, hh];
  }

  if (view === "base") return [330, hh - 300, 340, 425, hh];

  return base;
}

/* =========================================================
   DRAWING PARTS
========================================================= */

function Profile({ x, y, w, h, r = 3, bevel = 4 }) {
  return (
    <g>
      <rect className="qc-fill" x={x} y={y} width={w} height={h} rx={r} />
      <rect
        className="qc-grain"
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        fill="url(#qcGrain)"
      />
      <rect x={x} y={y} width={w} height={h} rx={r} fill="url(#qcSheen)" />
      <rect
        x={x + bevel}
        y={y + bevel}
        width={Math.max(w - bevel * 2, 0)}
        height={Math.max(h - bevel * 2, 0)}
        rx={r}
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.6"
      />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        fill="none"
        stroke="rgba(0,0,0,0.42)"
        strokeWidth="2"
      />
    </g>
  );
}

function Glass({ x, y, w, h, side }) {
  return (
    <g>
      <rect x={x - 5} y={y - 5} width={w + 10} height={h + 10} fill="#0c0e10" />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={side === "interior" ? "url(#qcView)" : "url(#qcSky)"}
      />
      <rect x={x} y={y} width={w} height={h} fill="url(#qcGloss)" />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="2"
      />
    </g>
  );
}

function Handle({ x, y, big = false }) {
  const s = big ? 1.25 : 1;

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#qcSmall)">
      <rect
        x="-11"
        y="-38"
        width="22"
        height="58"
        rx="10"
        fill="url(#qcSteel)"
        stroke="rgba(0,0,0,0.35)"
      />
      <rect
        x="-7"
        y="-14"
        width="14"
        height="52"
        rx="7"
        fill="url(#qcSteel)"
        stroke="rgba(0,0,0,0.35)"
      />
      <circle cx="0" cy="-20" r="6" fill="#e4e8ea" stroke="rgba(0,0,0,0.3)" />
    </g>
  );
}

function Hinges({ pane }) {
  const x = pane.hinge === "left" ? pane.x - 4 : pane.x + pane.w - 8;

  return [0.16, 0.84].map((t) => (
    <rect
      key={t}
      x={x}
      y={pane.y + pane.h * t - 24}
      width="12"
      height="48"
      rx="3"
      fill="url(#qcSteel)"
      stroke="rgba(0,0,0,0.4)"
    />
  ));
}

function Arrow({ x, y, dir = 1, vertical = false }) {
  const d = vertical
    ? `M0 -34 V34 M${-12 * dir} ${26 * dir} L0 ${38 * dir} L${12 * dir} ${26 * dir}`
    : `M-34 0 H34 M${26 * dir} -12 L${38 * dir} 0 L${26 * dir} 12`;

  return (
    <path
      d={d}
      transform={`translate(${x} ${y})`}
      fill="none"
      stroke="rgba(255,255,255,0.85)"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/* ---------------- one pane ---------------- */

function Pane({ pane, side }) {
  const { kind, x, y, w, h } = pane;

  /* fixed lights get a slimmer profile */
  if (kind === "fixed") {
    const b = pane.thin ? 16 : 22;

    return (
      <g>
        <Profile x={x} y={y} w={w} h={h} />
        <Glass x={x + b} y={y + b} w={w - b * 2} h={h - b * 2} side={side} />
      </g>
    );
  }

  /* vertical slider: two stacked sashes meeting in the middle */
  if (kind === "vs") {
    const half = h / 2 + 12;

    return (
      <g>
        <Profile x={x} y={y} w={w} h={half} />
        <Glass
          x={x + SASH}
          y={y + SASH}
          w={w - SASH * 2}
          h={half - SASH * 1.6}
          side={side}
        />
        <Profile x={x} y={y + h - half} w={w} h={half} />
        <Glass
          x={x + SASH}
          y={y + h - half + SASH * 0.6}
          w={w - SASH * 2}
          h={half - SASH * 1.6}
          side={side}
        />
        <Arrow x={x + w / 2} y={y + h * 0.28} dir={-1} vertical />
        <Arrow x={x + w / 2} y={y + h * 0.74} dir={1} vertical />
        <Handle x={x + w / 2} y={y + h / 2 + 4} />
      </g>
    );
  }

  /* accordion panels lean slightly alternate ways */
  if (kind === "fold") {
    const lean = pane.i % 2 === 0 ? 5 : -5;
    const cx = x + w / 2;
    const cy = y + h / 2;

    return (
      <g
        transform={`translate(${cx} ${cy}) skewY(${lean}) translate(${-cx} ${-cy})`}
      >
        <Profile x={x} y={y} w={w} h={h} />
        <Glass
          x={x + SASH * 0.8}
          y={y + SASH}
          w={w - SASH * 1.6}
          h={h - SASH * 2}
          side={side}
        />
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill={pane.i % 2 ? "rgba(0,0,0,0.1)" : "none"}
          pointerEvents="none"
        />
        {pane.handle && <Handle x={pane.handle.x} y={pane.handle.y} />}
      </g>
    );
  }

  /* everything else is a framed sash with glass */
  const gx = x + SASH;
  const gy = y + SASH;
  const gw = w - SASH * 2;
  const gh = h - SASH * 2;

  return (
    <g>
      <Profile x={x} y={y} w={w} h={h} />
      <Glass x={gx} y={gy} w={gw} h={gh} side={side} />

      {(kind === "turn" || kind === "tt") && (
        <>
          <path
            d={
              pane.hinge === "left"
                ? `M${gx + gw} ${gy} L${gx} ${gy + gh / 2} L${gx + gw} ${gy + gh}`
                : `M${gx} ${gy} L${gx + gw} ${gy + gh / 2} L${gx} ${gy + gh}`
            }
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {kind === "tt" && (
            <path
              d={`M${gx} ${gy} L${gx + gw / 2} ${gy + gh} L${gx + gw} ${gy}`}
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="3"
              strokeDasharray="12 10"
              strokeLinejoin="round"
            />
          )}

          <Hinges pane={pane} />
          <Handle x={pane.handle.x} y={pane.handle.y} />
        </>
      )}

      {(kind === "slide" || kind === "lift") && (
        <>
          <Arrow x={gx + gw / 2} y={gy + gh / 2} dir={pane.dir} />
          <Handle x={pane.handle.x} y={pane.handle.y} big={kind === "lift"} />
        </>
      )}
    </g>
  );
}

/* =========================================================
   THE LIVE WINDOW
========================================================= */

function WindowArt({
  systemId,
  config,
  hhTarget,
  view,
  side,
  widthMm,
  heightMm,
}) {
  const finalLayout = buildLayout(systemId, config, hhTarget);
  const target = cameraFor(view, hhTarget, finalLayout.handle);
  const now = useTween(target);

  const hh = now[4];
  const layout = buildLayout(systemId, config, hh);
  const showDims = view === "front" || view === "angle";

  const drawOrder = [...layout.panes].sort((a, b) => {
    const rank = (p) => (p.kind === "slide" || p.kind === "lift" ? 1 : 0);

    return rank(a) - rank(b);
  });

  return (
    <svg
      className="qc-svg"
      viewBox={now.slice(0, 4).join(" ")}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${config.label} ${systemId.replace("-", " ")} window, ${widthMm} by ${heightMm} millimetres`}
    >
      <defs>
        <linearGradient id="qcSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>

        <linearGradient id="qcGloss" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.52" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.66" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="qcSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9c9e0" />
          <stop offset="0.55" stopColor="#6f93ac" />
          <stop offset="1" stopColor="#3f586a" />
        </linearGradient>

        <linearGradient id="qcSteel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d959b" />
          <stop offset="0.3" stopColor="#f4f6f7" />
          <stop offset="0.6" stopColor="#c3c9ce" />
          <stop offset="1" stopColor="#7c848b" />
        </linearGradient>

        <pattern
          id="qcGrain"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(90)"
        >
          <rect width="16" height="16" fill="none" />
          <path
            d="M0 3H16"
            stroke="#000"
            strokeOpacity="0.2"
            strokeWidth="1.2"
          />
          <path
            d="M0 9H16"
            stroke="#fff"
            strokeOpacity="0.09"
            strokeWidth="2"
          />
          <path
            d="M0 13H16"
            stroke="#000"
            strokeOpacity="0.12"
            strokeWidth="0.8"
          />
        </pattern>

        <pattern
          id="qcView"
          patternUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={SPAN}
          height={hh}
        >
          <image
            href="/images/mid-view.png"
            x="0"
            y="0"
            width={SPAN}
            height={hh}
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>

        <filter id="qcSmall" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#000"
            floodOpacity="0.35"
          />
        </filter>
      </defs>

      {/* outer frame, then the panes sit inside it */}
      <Profile x={0} y={0} w={SPAN} h={hh} r={4} bevel={6} />

      {drawOrder.map((pane, i) => (
        <Pane key={`${pane.kind}-${i}`} pane={pane} side={side} />
      ))}

      {/* dimension lines */}
      <g className={`qc-dims ${showDims ? "is-on" : ""}`}>
        <path d={`M0 -52 H${SPAN} M0 -64 V-40 M${SPAN} -64 V-40`} />
        <text x={SPAN / 2} y="-68" textAnchor="middle">
          {widthMm} mm
        </text>

        <path d={`M-62 0 V${hh} M-74 0 H-50 M-74 ${hh} H-50`} />
        <text
          x="-80"
          y={hh / 2}
          textAnchor="middle"
          transform={`rotate(-90 -80 ${hh / 2})`}
        >
          {heightMm} mm
        </text>
      </g>
    </svg>
  );
}

/* =========================================================
   SMALL ICONS
========================================================= */

const systemIcons = {
  casement: (
    <>
      <rect x="30" y="7" width="60" height="76" />
      <rect x="36" y="13" width="48" height="64" />
      <path d="M84 13 36 45 84 77" />
    </>
  ),
  sliding: (
    <>
      <rect x="8" y="18" width="104" height="54" />
      <rect x="8" y="18" width="56" height="54" />
      <rect x="56" y="18" width="56" height="54" />
      <path d="M72 45h26m-6-5 6 5-6 5" />
    </>
  ),
  "tilt-turn": (
    <>
      <rect x="30" y="7" width="60" height="76" />
      <rect x="36" y="13" width="48" height="64" />
      <path d="M84 13 36 45 84 77" />
      <path d="M36 13 60 77 84 13" strokeDasharray="3 4" />
    </>
  ),
  "lift-slide": (
    <>
      <rect x="8" y="14" width="104" height="62" />
      <rect x="8" y="14" width="60" height="62" />
      <rect x="52" y="14" width="60" height="62" />
      <path d="M76 52h24m-6-5 6 5-6 5" />
      <path d="M90 38V26m-5 5 5-5 5 5" />
    </>
  ),
  "slide-fold": (
    <>
      <path d="M8 14 34 22v46L8 76Z" />
      <path d="M34 22 60 14v62L34 68Z" />
      <path d="M60 14 86 22v46L60 76Z" />
      <path d="M86 22 112 14v62L86 68Z" />
    </>
  ),
  vertical: (
    <>
      <rect x="30" y="6" width="60" height="78" />
      <rect x="30" y="6" width="60" height="44" />
      <rect x="30" y="40" width="60" height="44" />
      <path d="M60 56v18m-5-6 5 6 5-6" />
    </>
  ),
};

function Line({ children }) {
  return (
    <svg
      className="qc-line-icon"
      viewBox="0 0 120 90"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* configuration thumbnail: panes in a row, optional transom */
function ConfigIcon({ config }) {
  const kinds = config.kinds;
  const n = kinds.length;
  const x0 = 22;
  const w = 76;
  const top = config.transom ? 34 : 14;
  const pw = w / n;

  return (
    <Line>
      <rect x={x0 - 6} y="8" width={w + 12} height="74" />
      {config.transom && <path d={`M${x0 - 6} 32H${x0 + w + 6}`} />}
      {kinds.map((kind, i) => (
        <g key={i}>
          <rect
            x={x0 + i * pw}
            y={top}
            width={pw}
            height={72 - top + 8}
            strokeDasharray={kind === "fixed" ? "4 4" : undefined}
          />
        </g>
      ))}
    </Line>
  );
}

/* =========================================================
   RADIO TILES (keyboard friendly)
========================================================= */

function useRadioKeys(count, onPick) {
  const refs = useRef([]);

  const onKeyDown = (event, index) => {
    let next = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % count;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + count) % count;
    if (next === null) return;

    event.preventDefault();
    onPick(next);
    refs.current[next]?.focus();
  };

  return { refs, onKeyDown };
}

/* =========================================================
   SECTION
========================================================= */

export default function Quote() {
  const reduceMotion = useReducedMotion();

  const groupRefs = useRef({});
  const panelRef = useRef(null);
  const nameRef = useRef(null);
  const customRef = useRef(null);

  /* ---------- the configuration ---------- */
  const [systemId, setSystemId] = useState(DEFAULTS.system);
  const [configIndex, setConfigIndex] = useState(DEFAULTS.configIndex);
  const [colourId, setColourId] = useState(DEFAULTS.colour);
  const [customHex, setCustomHex] = useState("#6f8fa8");
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [qty, setQty] = useState(DEFAULTS.qty);

  /* typed text while editing, committed (clamped) on blur */
  const [draft, setDraft] = useState({
    width: String(DEFAULTS.width),
    height: String(DEFAULTS.height),
  });

  /* ---------- the preview ---------- */
  const [side, setSide] = useState(DEFAULTS.side);
  const [view, setView] = useState(DEFAULTS.view);

  /* ---------- progress + form ---------- */
  const [touched, setTouched] = useState({
    system: false,
    colour: false,
    size: false,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    type: projectTypes[0],
    company: "",
  });
  const [errors, setErrors] = useState({});

  const system = systems.find((item) => item.id === systemId);
  const config = system.configs[configIndex];

  const colours = baseColours.map((item) =>
    item.id === "custom" ? { ...item, hex: customHex } : item,
  );
  const colour = colours.find((item) => item.id === colourId);

  /* aspect of the drawn window follows the size inputs */
  const hhTarget = clamp((1000 * height) / width, 520, 1500);

  /* ---------- progress ---------- */
  const submitted = status === "sent";
  const done = [touched.system, touched.colour, touched.size, submitted];
  const firstOpen = done.findIndex((flag) => !flag);
  const current = formOpen && !submitted ? 3 : firstOpen === -1 ? 3 : firstOpen;

  const touch = (key) =>
    setTouched((state) => (state[key] ? state : { ...state, [key]: true }));

  /* ---------- handlers ---------- */
  const pickSystem = (index) => {
    setSystemId(systems[index].id);
    touch("system");
  };

  const pickConfig = (index) => {
    setConfigIndex(index);
    touch("system");
  };

  const pickColour = (index) => {
    const next = colours[index];

    if (next.id === "custom") {
      // open the native picker; the choice is applied on change
      setColourId("custom");
      touch("colour");
      const picker = customRef.current;

      if (picker) {
        try {
          if (typeof picker.showPicker === "function") picker.showPicker();
          else picker.click();
        } catch {
          picker.click();
        }
      }

      return;
    }

    setColourId(next.id);
    touch("colour");
  };

  const commitSize = (key) => {
    const limits = SIZE_LIMITS[key];
    const parsed = parseInt(draft[key], 10);
    const value = clamp(
      Number.isFinite(parsed) ? parsed : key === "width" ? width : height,
      limits.min,
      limits.max,
    );

    if (key === "width") setWidth(value);
    else setHeight(value);

    setDraft((d) => ({ ...d, [key]: String(value) }));
    touch("size");
  };

  const nudgeSize = (key, delta) => {
    const limits = SIZE_LIMITS[key];
    const base = key === "width" ? width : height;
    const value = clamp(
      base + delta * SIZE_LIMITS.step,
      limits.min,
      limits.max,
    );

    if (key === "width") setWidth(value);
    else setHeight(value);

    setDraft((d) => ({ ...d, [key]: String(value) }));
    touch("size");
  };

  const onSizeInput = (key, text) => {
    const clean = text.replace(/[^\d]/g, "").slice(0, 4);

    setDraft((d) => ({ ...d, [key]: clean }));

    // preview follows while typing, as long as the number is sensible
    const parsed = parseInt(clean, 10);
    const limits = SIZE_LIMITS[key];

    if (
      Number.isFinite(parsed) &&
      parsed >= limits.min &&
      parsed <= limits.max
    ) {
      if (key === "width") setWidth(parsed);
      else setHeight(parsed);
      touch("size");
    }
  };

  const changeQty = (delta) => {
    setQty((q) => clamp(q + delta, 1, 99));
    touch("size");
  };

  const cycleView = (delta) => {
    const index = views.findIndex((item) => item.id === view);

    setView(views[(index + delta + views.length) % views.length].id);
  };

  /* ---------- stepper + edit ---------- */
  const scrollTo = (el) =>
    el?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });

  const goStep = (index) => {
    if (index === 3) {
      openForm();
      return;
    }

    scrollTo(groupRefs.current[steps[index].id]);
  };

  const openForm = () => {
    setTouched({ system: true, colour: true, size: true });
    setFormOpen(true);

    window.setTimeout(
      () => nameRef.current?.focus({ preventScroll: true }),
      reduceMotion ? 0 : 450,
    );
  };

  const editConfig = () => {
    setFormOpen(false);
    setStatus((s) => (s === "sent" ? "idle" : s));
    scrollTo(panelRef.current);
  };

  const startOver = () => {
    setStatus("idle");
    setFormOpen(false);
    setTouched({ system: false, colour: false, size: false });
    setValues({
      name: "",
      phone: "",
      email: "",
      city: "",
      type: projectTypes[0],
      company: "",
    });
    setErrors({});
  };

  /* ---------- form ---------- */
  const setField = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    const digits = values.phone.replace(/\D/g, "");

    if (values.name.trim().length < 2) next.name = "Please enter your name";
    if (digits.length < 10 || digits.length > 13)
      next.phone = "Enter a valid phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      next.email = "Enter a valid email";
    if (values.city.trim().length < 2) next.city = "Please enter your city";

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();

    if (values.company) return; // honeypot: real people leave this empty
    if (!validate()) return;

    setStatus("sending");

    const payload = {
      // Top-level fields for backend validation
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      city: values.city.trim(),
      projectType: values.type,

      // Keep the nested contact object too
      contact: {
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        city: values.city.trim(),
        projectType: values.type,
      },

      configuration: {
        system: system.label,
        colour: colour.id === "custom" ? `Custom (${customHex})` : colour.name,
        configuration: config.label,
        widthMm: width,
        heightMm: height,
        quantity: qty,
      },

      sentAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(QUOTE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      let responseBody = null;
      try {
        responseBody = await response.json();
      } catch {
        // The API may return an empty or non-JSON response.
      }

      if (!response.ok) {
        const message =
          responseBody?.message ||
          responseBody?.error ||
          `The server returned HTTP ${response.status}.`;
        throw new Error(message);
      }

      setStatus("sent");
    } catch (error) {
      console.error("[Quote] send failed", error);
      setStatus("error");
    }
  };

  /* ---------- radio key helpers ---------- */
  const systemKeys = useRadioKeys(systems.length, pickSystem);
  const configKeys = useRadioKeys(system.configs.length, pickConfig);
  const colourKeys = useRadioKeys(colours.length, pickColour);

  const colourStyle = {
    "--qc-c": colour.hex,
    "--qc-grain": colour.finish === "wood" ? 1 : 0,
  };

  const rise = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, delay, ease: "easeOut" },
  });

  return (
    <section className="quote" id="quote">
      <div className="qc-inner">
        {/* =====================================================
            INTRO
        ===================================================== */}
        <motion.div className="qc-intro" {...rise()}>
          <h2>
            Built for
            <br />
            your space.
            <br />
            <em>Configured by you.</em>
          </h2>

          <p>
            Tell us what you&rsquo;re looking for and we&rsquo;ll help you find
            the right GEALAN system for your project.
          </p>

          <ul className="qc-perks">
            {perks.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="qc-icon-box">
                  <Icon size={20} strokeWidth={1.5} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* =====================================================
            CONFIGURATOR PANEL
        ===================================================== */}
        <motion.div ref={panelRef} className="qc-panel" {...rise(0.1)}>
          {/* ---------------- progress ---------------- */}
          <ol className="qc-steps" aria-label="Quote progress">
            {steps.map((step, index) => {
              const isDone = done[index];
              const isCurrent = index === current;

              return (
                <li
                  key={step.id}
                  className={`${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => goStep(index)}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <span className="qc-step-dot">
                      {isDone ? (
                        <Check size={15} strokeWidth={2.4} />
                      ) : (
                        pad(index + 1)
                      )}
                    </span>
                    <span className="qc-step-label">{step.label}</span>
                  </button>

                  {index < steps.length - 1 && (
                    <span className="qc-step-track" aria-hidden="true">
                      <i style={{ transform: `scaleX(${isDone ? 1 : 0})` }} />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="qc-panel-body">
            {/* ---------------- controls ---------------- */}
            <div className="qc-controls">
              {/* 1 system */}
              <div
                className="qc-group"
                ref={(el) => {
                  groupRefs.current.system = el;
                }}
              >
                <h3>
                  <span>1</span>Choose System
                </h3>

                <div
                  className="qc-tiles qc-tiles-3"
                  role="radiogroup"
                  aria-label="System"
                >
                  {systems.map((item, index) => (
                    <button
                      key={item.id}
                      ref={(el) => {
                        systemKeys.refs.current[index] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={item.id === systemId}
                      tabIndex={item.id === systemId ? 0 : -1}
                      className={`qc-tile ${item.id === systemId ? "is-active" : ""}`}
                      onClick={() => pickSystem(index)}
                      onKeyDown={(e) => systemKeys.onKeyDown(e, index)}
                    >
                      <Line>{systemIcons[item.id]}</Line>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2 colour */}
              <div
                className="qc-group"
                ref={(el) => {
                  groupRefs.current.colour = el;
                }}
              >
                <h3>
                  <span>2</span>Choose Colour
                </h3>

                <div
                  className="qc-colours"
                  role="radiogroup"
                  aria-label="Colour"
                >
                  {colours.map((item, index) => (
                    <button
                      key={item.id}
                      ref={(el) => {
                        colourKeys.refs.current[index] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={item.id === colourId}
                      tabIndex={item.id === colourId ? 0 : -1}
                      className={`qc-swatch finish-${item.finish} ${item.id === "custom" ? "is-custom" : ""} ${item.id === colourId ? "is-active" : ""}`}
                      style={{
                        "--sw": item.hex,
                        "--sw-hi": mix(item.hex, 255, 0.24),
                        "--sw-lo": mix(item.hex, 0, 0.3),
                      }}
                      onClick={() => pickColour(index)}
                      onKeyDown={(e) => colourKeys.onKeyDown(e, index)}
                    >
                      <span className="qc-swatch-dot" />
                      <span className="qc-swatch-name">{item.name}</span>
                    </button>
                  ))}

                  {/* the native colour picker behind the "Custom" swatch */}
                  <input
                    ref={customRef}
                    className="qc-color-input"
                    type="color"
                    value={customHex}
                    aria-label="Pick a custom colour"
                    tabIndex={-1}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      setColourId("custom");
                      touch("colour");
                    }}
                  />
                </div>
              </div>

              {/* 3 configuration */}
              <div className="qc-group">
                <h3>
                  <span>3</span>Configuration
                </h3>

                <div
                  className="qc-tiles qc-tiles-4"
                  role="radiogroup"
                  aria-label="Configuration"
                >
                  {system.configs.map((item, index) => (
                    <button
                      key={`${system.id}-${item.label}`}
                      ref={(el) => {
                        configKeys.refs.current[index] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={index === configIndex}
                      tabIndex={index === configIndex ? 0 : -1}
                      className={`qc-tile qc-tile-small ${index === configIndex ? "is-active" : ""}`}
                      onClick={() => pickConfig(index)}
                      onKeyDown={(e) => configKeys.onKeyDown(e, index)}
                    >
                      <ConfigIcon config={item} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 size */}
              <div
                className="qc-group"
                ref={(el) => {
                  groupRefs.current.size = el;
                }}
              >
                <h3>
                  <span>4</span>Size (Approx.)
                </h3>

                <div className="qc-size">
                  {["width", "height"].map((key) => (
                    <div className="qc-field" key={key}>
                      <label htmlFor={`qc-${key}`}>
                        {key === "width" ? "Width" : "Height"} (mm)
                      </label>

                      <div className="qc-stepper">
                        <input
                          id={`qc-${key}`}
                          type="text"
                          inputMode="numeric"
                          value={draft[key]}
                          onChange={(e) => onSizeInput(key, e.target.value)}
                          onBlur={() => commitSize(key)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitSize(key);
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              nudgeSize(key, 1);
                            }
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              nudgeSize(key, -1);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => nudgeSize(key, 1)}
                          aria-label={`Increase ${key}`}
                        >
                          <Plus size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => nudgeSize(key, -1)}
                          aria-label={`Decrease ${key}`}
                        >
                          <Minus size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5 quantity */}
              <div className="qc-group">
                <h3>
                  <span>5</span>Quantity
                </h3>

                <div className="qc-qty">
                  <button
                    type="button"
                    onClick={() => changeQty(-1)}
                    aria-label="Decrease quantity"
                    disabled={qty <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <output aria-live="polite">{qty}</output>
                  <button
                    type="button"
                    onClick={() => changeQty(1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* ---------------- live preview ---------------- */}
            <div className="qc-preview-col">
              <div className="qc-preview" style={colourStyle} data-side={side}>
                <div className="qc-backdrop qc-backdrop-exterior" />
                <div className="qc-backdrop qc-backdrop-interior" />

                <div className="qc-toggle" role="group" aria-label="View from">
                  {["exterior", "interior"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={side === item ? "is-active" : ""}
                      aria-pressed={side === item}
                      onClick={() => setSide(item)}
                    >
                      {item === "exterior" ? "Exterior" : "Interior"}
                    </button>
                  ))}
                </div>

                <span className="qc-badge" aria-hidden="true">
                  &times; {qty}
                </span>

                <motion.div
                  className="qc-stage"
                  animate={{
                    rotateY: view === "angle" ? -20 : 0,
                    rotateX: view === "angle" ? 3 : 0,
                  }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                  }
                  style={{ transformPerspective: 1500 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${systemId}-${configIndex}`}
                      className="qc-stage-inner"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: reduceMotion ? 0 : 0.28 }}
                    >
                      <WindowArt
                        systemId={systemId}
                        config={config}
                        hhTarget={hhTarget}
                        view={view}
                        side={side}
                        widthMm={width}
                        heightMm={height}
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                <button
                  type="button"
                  className="qc-nav qc-nav-prev"
                  onClick={() => cycleView(-1)}
                  aria-label="Previous view"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="qc-nav qc-nav-next"
                  onClick={() => cycleView(1)}
                  aria-label="Next view"
                >
                  <ChevronRight size={18} />
                </button>

                <p className="qc-caption" aria-live="polite">
                  {system.label} <i>/</i> {config.label} <i>/</i> {colour.name}
                </p>
              </div>

              <div className="qc-views" role="group" aria-label="Preview views">
                {views.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={view === id ? "is-active" : ""}
                    aria-pressed={view === id}
                    onClick={() => setView(id)}
                  >
                    <Icon size={18} strokeWidth={1.6} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            SUMMARY + REQUEST
        ===================================================== */}
        <motion.aside className="qc-side" {...rise(0.2)}>
          <div className="qc-summary">
            <div className="qc-summary-head">
              <h3>Your Configuration</h3>
              <button type="button" onClick={editConfig}>
                <Pencil size={14} />
                Edit
              </button>
            </div>

            <dl>
              {[
                [Box, "System", system.label],
                [
                  Palette,
                  "Colour",
                  colour.id === "custom" ? `Custom ${customHex}` : colour.name,
                ],
                [LayoutGrid, "Configuration", config.label],
                [Ruler, "Size", `${width} × ${height} mm`],
                [Hash, "Quantity", String(qty)],
              ].map(([Icon, label, value]) => (
                <div key={label}>
                  <dt>
                    <Icon size={16} strokeWidth={1.5} />
                    {label}
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ---------------- request ---------------- */}
          <div className="qc-request">
            <AnimatePresence mode="wait" initial={false}>
              {!formOpen && (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3>Request a Quote</h3>
                  <p>
                    Happy with your configuration? Send it to our team and
                    we&rsquo;ll get back to you shortly.
                  </p>

                  <button type="button" className="qc-cta" onClick={openForm}>
                    REQUEST A QUOTE
                    <ArrowUpRight size={17} />
                  </button>
                </motion.div>
              )}

              {formOpen && status !== "sent" && (
                <motion.form
                  key="form"
                  className="qc-form"
                  onSubmit={submit}
                  noValidate
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <h3>Request a Quote</h3>
                  <p>
                    Fill in your details and our team will get back to you
                    shortly.
                  </p>

                  {/* honeypot */}
                  <input
                    className="qc-hp"
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={values.company}
                    onChange={(e) => setField("company", e.target.value)}
                  />

                  <FormField label="Full Name" error={errors.name} id="qc-name">
                    <input
                      ref={nameRef}
                      id="qc-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your name"
                      value={values.name}
                      aria-invalid={!!errors.name}
                      onChange={(e) => setField("name", e.target.value)}
                    />
                  </FormField>

                  <div className="qc-form-row">
                    <FormField
                      label="Phone Number"
                      error={errors.phone}
                      id="qc-phone"
                    >
                      <input
                        id="qc-phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="Phone number"
                        value={values.phone}
                        aria-invalid={!!errors.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                      />
                    </FormField>

                    <FormField
                      label="Email Address"
                      error={errors.email}
                      id="qc-email"
                    >
                      <input
                        id="qc-email"
                        type="email"
                        autoComplete="email"
                        placeholder="Your email"
                        value={values.email}
                        aria-invalid={!!errors.email}
                        onChange={(e) => setField("email", e.target.value)}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="City / Location"
                    error={errors.city}
                    id="qc-city"
                  >
                    <input
                      id="qc-city"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="Enter your city"
                      value={values.city}
                      aria-invalid={!!errors.city}
                      onChange={(e) => setField("city", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Project Type" id="qc-type">
                    <div className="qc-select">
                      <select
                        id="qc-type"
                        value={values.type}
                        onChange={(e) => setField("type", e.target.value)}
                      >
                        {projectTypes.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} aria-hidden="true" />
                    </div>
                  </FormField>

                  {status === "error" && (
                    <p className="qc-error-banner" role="alert">
                      Something went wrong. Please try again, or call us
                      directly.
                    </p>
                  )}

                  <button
                    type="submit"
                    className="qc-cta"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? (
                      <>
                        SENDING
                        <LoaderCircle size={17} className="qc-spin" />
                      </>
                    ) : (
                      <>
                        SEND REQUEST
                        <ArrowUpRight size={17} />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {formOpen && status === "sent" && (
                <motion.div
                  key="sent"
                  className="qc-sent"
                  role="status"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <CircleCheck size={34} strokeWidth={1.4} />
                  <h3>Thank you, {values.name.split(" ")[0]}.</h3>
                  <p>
                    We&rsquo;ve received your {system.label.toLowerCase()}{" "}
                    request ({config.label.toLowerCase()}, {width} &times;{" "}
                    {height} mm, &times; {qty}). Our team will contact you
                    shortly.
                  </p>
                  <button type="button" className="qc-link" onClick={startOver}>
                    Configure another
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function FormField({ label, error, id, children }) {
  return (
    <div className={`qc-field qc-form-field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="qc-field-error">{error}</span>}
    </div>
  );
}
