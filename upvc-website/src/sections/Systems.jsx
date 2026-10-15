import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import "./Systems.css";

const products = [
  {
    id: "01",
    key: "sliding",
    category: "GEALAN PRIMA",
    title: "Sliding",
    subtitle: "Move. Open. Connect.",
    description:
      "A flexible sliding system designed around multiple shutter configurations, including mesh options for windows and doors.",
    image: "/images/prima-sliding.jpg",

    features: [
      "2 Sliding Shutters",
      "2 Sliding Shutters + Mesh",
      "3 Sliding Shutters + Mesh",
    ],
  },

  {
    id: "02",
    key: "casement",
    category: "GEALAN PRIMA",
    title: "Casement",
    subtitle: "Open naturally.",
    description:
      "Practical casement configurations for everyday ventilation, available in single and double shutter formats with grill and mesh options.",
    image: "/images/prima-casement.jpg",

    features: ["Single Shutter", "Double Shutter + Mullion", "Grill & Mesh"],
  },

  {
    id: "03",
    key: "combination",
    category: "GEALAN PRIMA",
    title: "Sliding & Casement",
    subtitle: "Two opening styles. One system.",
    description:
      "Combination windows bringing sliding and casement configurations together for flexible architectural applications.",
    image: "/images/prima-combination.jpg",

    features: ["Combination Windows"],
  },

  {
    id: "04",
    key: "supra",
    category: "GEALAN",
    title: "SUPRA",
    subtitle: "A class of its own.",
    description:
      "The 64 mm GEALAN SUPRA series is designed for larger-than-usual sliding windows and doors and applications requiring specialised configurations.",
    image: "/images/supra.jpg",

    features: [
      "Monorail + 1 Shutter",
      "2 Sliding Shutters",
      "2 Sliding Shutters + Mesh",
      "3 Sliding Shutters + Mesh",
      "Government Projects",
      "Villas & Independent Houses",
    ],
  },

  {
    id: "05",
    key: "alta",
    category: "GEALAN",
    title: "Alta",
    subtitle: "The innovative sliding system.",
    description:
      "A compact system combining space-saving sliding solutions with configurations designed for smaller window applications.",
    image: "/images/selecta.jpg",

    features: [
      "Ventilators",
      "Ventilators with Louvers",
      "Kitchen Windows",
      "Windows under 16 sq.ft.",
      "Clip-on Frame for Mesh",
    ],
  },
];

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 45,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const imageVariants = {
  hidden: {
    opacity: 0,
    scale: 1.08,
  },

  visible: {
    opacity: 1,
    scale: 1,

    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Systems() {
  return (
    <section className="systems" id="systems">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="systems-header">
        <motion.div
          className="systems-header-left"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="systems-label">
            <span className="systems-label-line" />
            <span>OUR SYSTEMS</span>
          </div>

          <h2>
            Windows that
            <br />
            <em>fit the way you live.</em>
          </h2>
        </motion.div>

        <motion.div
          className="systems-header-right"
          initial={{
            opacity: 0,
            y: 25,
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
            delay: 0.1,
          }}
        >
          <p>
            Explore GEALAN window and door systems across sliding, casement and
            combination configurations — each designed for different
            architectural requirements.
          </p>

          <span>05 SYSTEMS · MULTIPLE CONFIGURATIONS</span>
        </motion.div>
      </div>

      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}

      <div className="systems-grid">
        {products.map((product, index) => (
          <ProductCard key={product.key} product={product} index={index} />
        ))}
      </div>

      {/* =====================================================
          DUAL COLOUR USP
      ===================================================== */}

      <motion.div
        className="systems-usp"
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
          amount: 0.25,
        }}
        transition={{
          duration: 0.7,
        }}
      >
        <div className="systems-usp-colours">
          <span className="usp-colour usp-dark" />
          <span className="usp-colour usp-light" />
        </div>

        <div className="systems-usp-text">
          <span>YOUR COLOUR. YOUR SIDE.</span>

          <strong>Different colour inside. Different colour outside.</strong>
        </div>

        <a href="#quote">
          Explore colour possibilities
          <ArrowUpRight size={15} />
        </a>
      </motion.div>
    </section>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ product, index }) {
  return (
    <motion.article
      className={`system-card system-card-${index + 1}`}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        delay: index * 0.08,
      }}
    >
      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div className="system-card-visual">
        <div className="system-card-number">{product.id}</div>

        <motion.div
          className="product-image-wrapper"
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.2,
          }}
        >
          <img
            src={product.image}
            alt={`${product.category} ${product.title} window system`}
            className="system-product-image"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </motion.div>

        <div className="system-card-overlay" />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="system-card-content">
        <div className="system-card-heading">
          <div>
            <span className="system-card-category">{product.category}</span>

            <h3>{product.title}</h3>
          </div>

          <span className="system-card-index">{product.id}</span>
        </div>

        <h4>{product.subtitle}</h4>

        <p>{product.description}</p>

        {/* =================================================
            CONFIGURATIONS
        ================================================= */}

        <div className="system-features-title">SYSTEM CONFIGURATIONS</div>

        <div className="system-card-features">
          {product.features.map((feature) => (
            <span key={feature} className="system-feature">
              {feature}
            </span>
          ))}
        </div>

        {/* =================================================
            BOTTOM
        ================================================= */}

        <a
          href="#openings"
          className="system-card-bottom"
          aria-label={`View ${product.title} opening system`}
        >
          <span>VIEW SYSTEM</span>

          <ArrowUpRight size={15} />
        </a>
      </div>
    </motion.article>
  );
}
