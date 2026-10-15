import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ShieldCheck,
  Volume2,
  CloudRain,
  Sun,
  Leaf,
  Sparkles,
} from "lucide-react";
import "./Performance.css";

const performanceCards = [
  {
    id: "01",
    title: "Thermal",
    titleAccent: "Comfort",
    description:
      "Helps maintain comfortable indoor conditions throughout the year.",
    image: "/images/thermal-comfort.jpg",
    icon: Sun,
  },
  {
    id: "02",
    title: "Sound",
    titleAccent: "Insulation",
    description: "Helps create quieter, more peaceful living spaces.",
    image: "/images/sound-insulation.jpg",
    icon: Volume2,
  },
  {
    id: "03",
    title: "Weather",
    titleAccent: "Protection",
    description:
      "Designed to help protect against rain, wind, dust and changing weather conditions.",
    image: "/images/weather-protection.jpg",
    icon: CloudRain,
  },
  {
    id: "04",
    title: "Security",
    titleAccent: "",
    description:
      "Robust window and door configurations designed with security in mind.",
    image: "/images/security.jpg",
    icon: ShieldCheck,
  },
  {
    id: "05",
    title: "Energy",
    titleAccent: "Efficiency",
    description:
      "Designed to support comfortable interiors and responsible energy use.",
    image: "/images/energy-efficiency.jpg",
    icon: Leaf,
  },
  {
    id: "06",
    title: "Low",
    titleAccent: "Maintenance",
    description:
      "Durable uPVC construction designed for everyday convenience and easy care.",
    image: "/images/low-maintenance.jpg",
    icon: Sparkles,
  },
];

export default function Performance() {
  return (
    <section className="performance" id="performance">
      <div className="performance-inner">
        {/* LEFT CONTENT */}
        <motion.div
          className="performance-intro"
          initial={{ opacity: 0, y: 55 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <h2>
            More comfort.
            <br />
            Less <em>compromise.</em>
          </h2>

          <p className="performance-description">
            Engineered for the way you live. Our uPVC windows and doors are
            designed around everyday comfort, helping create quieter, more
            secure and more comfortable spaces.
          </p>

          <a href="#quote" className="performance-button">
            <span>Discover the difference</span>
            <ArrowUpRight size={18} />
          </a>

          <div className="performance-footer-label">
            <span>GERMAN ENGINEERING</span>
            <i />
            <span>EVERYDAY COMFORT</span>
          </div>
        </motion.div>

        {/* RIGHT CARDS */}
        <div className="performance-grid">
          {performanceCards.map((card, index) => (
            <PerformanceCard key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <motion.div
        className="performance-bottom"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 0.8,
          delay: 0.15,
        }}
      >
        <div className="performance-bottom-small">
          BUILT AROUND
          <br />
          YOUR SPACE.
        </div>

        <div className="performance-bottom-title">
          A smarter choice
          <br />
          for a <em>more comfortable</em> tomorrow.
        </div>

        <a href="#quote" className="performance-bottom-button">
          <span>Get a Quote</span>
          <ArrowUpRight size={18} />
        </a>
      </motion.div>
    </section>
  );
}

function PerformanceCard({ card, index }) {
  const Icon = card.icon;

  return (
    <motion.article
      className="performance-card"
      initial={{
        opacity: 0,
        y: 45,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.65,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="performance-card-content">
        <div className="performance-card-top">
          <span className="performance-card-number">{card.id}</span>

          <div className="performance-card-icon">
            <Icon size={21} strokeWidth={1.6} />
          </div>
        </div>

        <div className="performance-card-copy">
          <h3>
            {card.title}
            {card.titleAccent && (
              <>
                <br />
                <span>{card.titleAccent}</span>
              </>
            )}
          </h3>

          <p>{card.description}</p>
        </div>
      </div>

      <div className="performance-card-image">
        <img
          src={card.image}
          alt={`${card.title} ${card.titleAccent} performance`}
          loading="lazy"
        />

        <div className="performance-card-image-overlay" />
      </div>
    </motion.article>
  );
}
