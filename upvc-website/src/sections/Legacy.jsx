import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import "./Legacy.css";

const milestones = [
  {
    year: "1921",
    title: "The Beginning",
    description:
      "GEALAN's history begins with its foundation in Germany, establishing the heritage behind its profile systems.",
  },
  {
    year: "1968",
    title: "Profile Extrusion",
    description:
      "GEALAN moves into PVC-U profile extrusion, building the foundation for its window and door systems.",
  },
  {
    year: "1979",
    title: "The GEALAN Name",
    description:
      "The GEALAN product name becomes the company name, strengthening the identity of the brand.",
  },
  {
    year: "2021",
    title: "GEALAN India",
    description:
      "GEALAN India operations begin, bringing the brand's German heritage and profile systems closer to the Indian market.",
  },
];

const reveal = {
  hidden: {
    opacity: 0,
    y: 45,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Legacy() {
  return (
    <section className="legacy" id="legacy">
      {/* =========================================
          HEADER
      ========================================= */}

      <div className="legacy-header">
        <motion.div
          className="legacy-heading"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <span className="legacy-eyebrow">GERMAN HERITAGE · SINCE 1921</span>

          <h3>
            A century of
            <br></br>
            <em>German innovation.</em>
          </h3>
        </motion.div>

        <motion.div
          className="legacy-intro"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p>
            From its beginnings in Germany to its presence in India, GEALAN has
            built its reputation around innovative profile systems for windows
            and doors.
          </p>

          <span className="legacy-label">
            PRECISION · EXPERIENCE · INNOVATION
          </span>
        </motion.div>
      </div>

      {/* =========================================
          TIMELINE
      ========================================= */}

      <div className="legacy-timeline">
        <div className="legacy-line">
          <motion.div
            className="legacy-line-progress"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 1.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>

        <div className="legacy-items">
          {milestones.map((item, index) => (
            <motion.article
              className="legacy-item"
              key={item.year}
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.35,
              }}
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="legacy-dot">
                <span />
              </div>

              <span className="legacy-year">{item.year}</span>

              <div className="legacy-item-content">
                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* =========================================
          BOTTOM STATEMENT
      ========================================= */}

      <motion.div
        className="legacy-bottom"
        initial={{
          opacity: 0,
          y: 30,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.3,
        }}
        transition={{
          duration: 0.8,
        }}
      >
        <div className="legacy-stat">
          <strong>100+</strong>

          <span>
            YEARS OF
            <br />
            HISTORY
          </span>
        </div>

        <div className="legacy-bottom-text">
          <p>
            German heritage.
            <br />
            Modern possibilities.
          </p>
        </div>

        <a href="#systems" className="legacy-link">
          Explore systems
          <ArrowUpRight size={16} />
        </a>
      </motion.div>
    </section>
  );
}
