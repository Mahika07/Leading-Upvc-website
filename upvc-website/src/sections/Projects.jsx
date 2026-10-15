import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Leaf, ShieldCheck, Volume2 } from "lucide-react";

import "./Projects.css";

/* =========================================================
   PROJECTS — featured project

   IMAGES (in /public/images/)
     projects-arch.jpg     tall crop of the arched window (600 x 1431)
     projects-poster.jpg   full poster, used for the download link

   To add more projects later, turn FEATURED into an array and
   map over it; the layout is built for one at a time.
========================================================= */

const EASE = [0.22, 1, 0.36, 1];

const FEATURED = {
  title: "Architecture deserves",
  titleEm: "an original.",
  lead: "Contemporary arched windows. Timeless beauty. German precision.",
  leadEm: "Built to inspire",
  leadEnd: " for generations.",
  /* confirm these are products you actually supply before publishing */
  caption: "Arched frame with top-hung vents above a sliding door.",
  alt: "Arched wooden-finish window with top-hung vents above a sliding glass door, lit at dusk",
};

const BENEFITS = [
  { icon: Volume2, label: "Acoustic comfort" },
  { icon: Leaf, label: "Energy efficiency" },
  { icon: ShieldCheck, label: "Security you trust" },
];

export default function Projects() {
  const reduceMotion = useReducedMotion();

  /* watch the unclipped wrapper: a fully clipped element never counts as
     "in view", so the arch itself can not be the thing that is observed */
  const figureRef = useRef(null);
  const figureIn = useInView(figureRef, { once: true, amount: 0.15 });
  const showArch = figureIn || reduceMotion;

  const copyIn = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section className="projects" id="projects">
      <div className="projects-inner">
        {/* ---------- copy ---------- */}
        <div className="projects-copy">
          <motion.p className="projects-kicker" {...copyIn(0)}>
            Featured project
          </motion.p>

          <motion.h2 className="projects-title" {...copyIn(0.1)}>
            {FEATURED.title}
            <br />
            <em>{FEATURED.titleEm}</em>
          </motion.h2>

          <motion.p className="projects-lead" {...copyIn(0.2)}>
            {FEATURED.lead}
            <br />
            <span>{FEATURED.leadEm}</span>
            {FEATURED.leadEnd}
          </motion.p>

          <motion.ul className="projects-benefits" {...copyIn(0.3)}>
            {BENEFITS.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span className="projects-benefit-icon">
                  <Icon size={20} strokeWidth={1.4} />
                </span>
                {label}
              </li>
            ))}
          </motion.ul>

          <motion.div className="projects-actions" {...copyIn(0.4)}>
            <a href="#quote" className="projects-cta">
              Request a quote
              <ArrowUpRight size={16} />
            </a>
          </motion.div>
        </div>

        {/* ---------- arched image (the one reveal) ---------- */}
        <figure ref={figureRef} className="projects-figure">
          <motion.div
            className="projects-arch"
            initial={reduceMotion ? false : { clipPath: "inset(100% 0 0 0)" }}
            animate={{
              clipPath: showArch ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
            }}
            transition={{ duration: 1.5, ease: EASE }}
          >
            <img
              src="/images/projects-arch.jpg"
              alt={FEATURED.alt}
              width="600"
              height="1431"
              loading="lazy"
              draggable={false}
            />
          </motion.div>
        </figure>
      </div>
    </section>
  );
}
