import { useEffect, useRef, useState } from "react";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowLeftRight,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Expand,
  Gauge,
  House,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Settings,
  ShieldCheck,
  Sparkles,
  Wind,
} from "lucide-react";

import "./Openings.css";

/* =========================================================



 OPENING SYSTEMS DATA







 `video` is the animation shown in the big centre stage.



 Drop your files into public/videos/ using these names



 (or change the paths below). MP4 (H.264) works everywhere;



 keep them muted, looping and short.







 Until a video has loaded, the stage shows a line drawing of



 the opening type instead, so nothing ever looks broken.



========================================================= */

const openings = [
  {
    id: "casement",

    title: "Casement Windows",

    video: "/videos/casement.mp4",

    image: "/images/Casement Window.png",

    description:
      "Classic, versatile and reliable. Casement windows open outward or inward for excellent ventilation and a clear, unobstructed view.",

    features: [
      { icon: Wind, text: "Wide opening for maximum ventilation" },

      { icon: Sparkles, text: "Clean, timeless design" },

      { icon: ShieldCheck, text: "Strong and durable construction" },
    ],
  },

  {
    id: "sliding",

    title: "Sliding Windows",

    video: "/videos/sliding.mp4",

    image: "/images/Sliding Window.png",

    description:
      "Sashes glide along a track, so nothing swings into the room. A practical choice where space is tight or the opening is wide.",

    features: [
      { icon: ArrowLeftRight, text: "Smooth, effortless horizontal glide" },

      { icon: Maximize2, text: "Large, uninterrupted glass area" },

      { icon: Minimize2, text: "Space-saving, no swing clearance" },
    ],
  },

  {
    id: "vertical",

    title: "Vertical Sliding",

    video: "/videos/vertical-sliding.mp4",

    image: "/images/Vertical Sliding.png",

    description:
      "Sashes move up and down inside the frame, giving controlled ventilation from the top, the bottom or both.",

    features: [
      { icon: ArrowUpDown, text: "Smooth vertical movement" },

      { icon: Wind, text: "Flexible top or bottom ventilation" },

      { icon: Minimize2, text: "Compact, space-saving operation" },
    ],
  },

  {
    id: "lift-slide",

    title: "Lift & Slide",

    video: "/videos/lift-slide.mp4",

    image: "/images/Lift & Slide.png",

    description:
      "The sash lifts slightly before it glides, making large, heavy panels easy to move. Made for wide openings that connect indoors and out.",

    features: [
      { icon: Gauge, text: "Effortless operation for heavy panels" },

      { icon: Maximize2, text: "Generous openings and wide views" },

      { icon: ShieldCheck, text: "Stable and secure when closed" },
    ],
  },

  {
    id: "slide-fold",

    title: "Slide & Fold",

    video: "/videos/slide-fold.mp4",

    image: "/images/Slide & Fold.png",

    description:
      "Panels slide along a track and fold together like a concertina, opening up an entire wall to the outside.",

    features: [
      { icon: Expand, text: "Opens up an entire wall" },

      { icon: Layers, text: "Panels stack neatly when folded" },

      { icon: Sparkles, text: "Seamless indoor–outdoor flow" },
    ],
  },

  {
    id: "tilt-turn",

    title: "Tilt & Turn",

    video: "/videos/tilt-turn.mp4",

    image: "/images/Tilt-and-Turn.png",

    description:
      "One handle, two ways to open: turn the sash inward like a door, or tilt it from the top for secure, draught-free ventilation.",

    features: [
      { icon: DoorOpen, text: "Two opening modes, one handle" },

      { icon: Wind, text: "Tilt position for gentle ventilation" },

      { icon: Sparkles, text: "Easy to clean from the inside" },
    ],
  },
];

const intro = [
  { icon: House, text: "Designed for modern living" },

  { icon: Settings, text: "Smooth operation" },

  { icon: ShieldCheck, text: "Durable performance" },
];

const pad = (n) => String(n).padStart(2, "0");

/* =========================================================



 SECTION



========================================================= */

export default function Openings() {
  const sectionRef = useRef(null);

  const listRef = useRef(null);

  const tabRefs = useRef([]);

  const videoRefs = useRef([]);

  const reduceMotion = useReducedMotion();

  const inView = useInView(sectionRef, { amount: 0.2 }); // `direction` lets the text panel slide the way you're navigating

  const [{ index, direction }, setNav] = useState({ index: 0, direction: 1 }); // which videos have actually loaded data

  const [ready, setReady] = useState({}); // autoplay unless the visitor prefers reduced motion

  const [playing, setPlaying] = useState(() =>
    typeof window === "undefined"
      ? true
      : !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const active = openings[index];

  const total = openings.length; /* ---------- navigation ---------- */

  const goTo = (next) =>
    setNav((current) => ({
      index: next,

      direction: next >= current.index ? 1 : -1,
    }));

  const step = (delta) => goTo((index + delta + total) % total);

  const onTabKeyDown = (event) => {
    let next = null;

    if (event.key === "ArrowRight") next = (index + 1) % total;

    if (event.key === "ArrowLeft") next = (index - 1 + total) % total;

    if (event.key === "Home") next = 0;

    if (event.key === "End") next = total - 1;

    if (next === null) return;

    event.preventDefault();

    goTo(next);

    tabRefs.current[next]?.focus();
  }; /* ---------- video playback ---------- */ // restart the newly selected animation from the beginning

  useEffect(() => {
    const video = videoRefs.current[index];

    if (!video) return;

    try {
      video.currentTime = 0;
    } catch {
      /* metadata not loaded yet; it will start from 0 anyway */
    }
  }, [index]); // only the selected video plays, and only while the section is on screen

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;

      if (i === index && playing && inView) {
        const attempt = video.play();

        if (attempt && attempt.catch) attempt.catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [
    index,
    playing,
    inView,
  ]); /* ---------- keep the chosen card visible in the mobile scroll row ---------- */

  useEffect(() => {
    const list = listRef.current;

    const tab = tabRefs.current[index];

    if (!list || !tab || list.scrollWidth <= list.clientWidth) return;

    list.scrollTo({
      left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2,

      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [index, reduceMotion]);

  const markReady = (id) =>
    setReady((current) => (current[id] ? current : { ...current, [id]: true }));

  const offset = reduceMotion ? 0 : 28;

  const panelVariants = {
    enter: (d) => ({ opacity: 0, x: d * offset }),

    center: { opacity: 1, x: 0 },

    exit: (d) => ({ opacity: 0, x: d * -offset }),
  };

  return (
    <section ref={sectionRef} className="openings" id="openings">
      {" "}
      <div className="openings-inner">
        {/* ---------------- INTRO ---------------- */}{" "}
        <motion.div
          className="openings-intro"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {" "}
          <div className="openings-label">
            <span className="openings-label-line" /> OPENING SYSTEMS{" "}
          </div>{" "}
          <h2>
            How it opens. <br /> <em>Six ways to shape your space.</em>{" "}
          </h2>{" "}
          <p>
            Different spaces call for different solutions. Explore the opening
            systems and see how each window or door type moves — designed for
            everyday convenience and lasting performance.{" "}
          </p>{" "}
          <ul className="openings-intro-list">
            {" "}
            {intro.map(({ icon: Icon, text }) => (
              <li key={text}>
                {" "}
                <span className="openings-icon-box">
                  <Icon size={19} strokeWidth={1.6} />{" "}
                </span>
                {text}{" "}
              </li>
            ))}{" "}
          </ul>{" "}
        </motion.div>
        {/* ---------------- STAGE: ANIMATED VIDEO ---------------- */}{" "}
        <motion.div
          className="openings-stage"
          role="tabpanel"
          id="openings-panel"
          aria-label={`${active.title} animation`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, delay: 0.1 }}
        >
          {" "}
          <span className="openings-stage-number">{pad(index + 1)}</span>
          {/* shown while the selected video is loading (or missing) */}{" "}
          <div
            className={`openings-fallback ${
              ready[active.id] ? "is-hidden" : ""
            }`}
            aria-hidden="true"
          >
            {" "}
            <img
              className="openings-fallback-image"
              src={active.image}
              alt=""
            />{" "}
          </div>{" "}
          {openings.map((item, i) => (
            <video
              key={item.id}
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              className={`openings-video ${
                i === index && ready[item.id] ? "is-visible" : ""
              }`}
              src={item.video}
              muted
              loop
              playsInline
              preload={i === index ? "auto" : "metadata"}
              aria-hidden="true"
              tabIndex={-1}
              onLoadedData={() => markReady(item.id)}
              onError={() =>
                console.warn(`Openings: could not load ${item.video}`)
              }
            />
          ))}{" "}
          <button
            type="button"
            className="openings-play"
            onClick={() => setPlaying((value) => !value)}
            aria-label={playing ? "Pause animation" : "Play animation"}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
          </button>{" "}
        </motion.div>
        {/* ---------------- PANEL: DETAILS ---------------- */}{" "}
        <div className="openings-panel">
          {" "}
          <div className="openings-counter" aria-hidden="true">
            <b>{pad(index + 1)}</b> / {pad(total)}{" "}
          </div>{" "}
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            {" "}
            <motion.div
              key={active.id}
              custom={direction}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h3>{active.title}</h3>
              <span className="openings-rule" />{" "}
              <p className="openings-description">{active.description}</p>{" "}
              <ul className="openings-features">
                {" "}
                {active.features.map(({ icon: Icon, text }) => (
                  <li key={text}>
                    {" "}
                    <span className="openings-icon-box">
                      <Icon size={18} strokeWidth={1.6} />{" "}
                    </span>
                    {text}{" "}
                  </li>
                ))}{" "}
              </ul>{" "}
            </motion.div>{" "}
          </AnimatePresence>{" "}
          {/* <div className="openings-controls">



  <button



   type="button"



   className="openings-arrow"



   onClick={() => step(-1)}



   aria-label="Previous opening type"



  >



   <ChevronLeft size={17} />



  </button>







  <div className="openings-dots">



   {openings.map((item, i) => (



    <button



     key={item.id}



     type="button"



     className={i === index ? "is-active" : ""}



     onClick={() => goTo(i)}



     aria-label={`Show ${item.title}`}



     aria-current={i === index}



    />



   ))}



  </div>







  <button



   type="button"



   className="openings-arrow"



   onClick={() => step(1)}



   aria-label="Next opening type"



  >



   <ChevronRight size={17} />



  </button>



 </div> */}{" "}
        </div>
        {/* ---------------- SELECTOR CARDS ---------------- */}{" "}
        <div
          ref={listRef}
          className="openings-cards"
          role="tablist"
          aria-label="Opening systems"
          onKeyDown={onTabKeyDown}
        >
          {" "}
          {openings.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls="openings-panel"
              tabIndex={i === index ? 0 : -1}
              className={`openings-card ${i === index ? "is-active" : ""}`}
              onClick={() => goTo(i)}
            >
              {" "}
              <span className="openings-card-visual">
                {" "}
                <img
                  className="openings-card-image"
                  src={item.image}
                  alt=""
                  loading="lazy"
                />{" "}
              </span>
              <span className="openings-card-label">{item.title}</span>
              <span className="openings-card-bar" />{" "}
            </button>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
