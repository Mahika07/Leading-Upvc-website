import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Menu,
  Search,
  X,
} from "lucide-react";

import "./Navbar.css";

/* =========================================================
   NAVBAR

   Floating glass bar that sits over the hero.
   - Products / Technology / Colours open dropdowns (hover on
     desktop, tap on touch, Esc or outside click closes)
   - Search icon opens a quick "jump to section" search
   - Hamburger opens a side menu listing every section
   - Optional: hides while scrolling down (HIDE_ON_SCROLL_DOWN)
   - Highlights the section you are currently in

   Section ids it links to (already in your project):
     legacy, systems, technology, openings, colours, hardware
   Still to add when you build them:
     projects, contact (the Contact section I gave you has
     id="contact")
   Links to an id that does not exist yet simply do nothing.
========================================================= */

const EASE = [0.22, 1, 0.36, 1];

/* true  = bar slides away when scrolling down, returns when scrolling up
   false = bar stays visible on every section */
const HIDE_ON_SCROLL_DOWN = false;

const NAV = [
  { id: "about", label: "About", href: "#legacy", sections: ["legacy"] },
  {
    id: "products",
    label: "Products",
    href: "#systems",
    sections: ["systems", "openings"],
    children: [
      {
        label: "Prima",
        note: "Sliding, casement & combination",
        href: "#systems",
      },
      { label: "Supra", note: "64 mm sliding series", href: "#systems" },
      { label: "Alta", note: "Window & door system", href: "#systems" },
      {
        label: "Opening types",
        note: "Explore every window & door type",
        href: "#openings",
      },
    ],
  },
  {
    id: "technology",
    label: "Technology",
    href: "#technology",
    sections: ["technology"],
    children: [
      { label: "Thermal comfort", href: "#technology" },
      { label: "Sound insulation", href: "#technology" },
      { label: "Weather protection", href: "#technology" },
      { label: "Security", href: "#technology" },
    ],
  },
  {
    id: "colours",
    label: "Colours",
    href: "#colours",
    sections: ["colours", "hardware"],
    children: [
      {
        label: "Colour collection",
        note: "Exterior & interior finishes",
        href: "#colours",
      },
      {
        label: "Dual-colour",
        note: "Different colour inside and outside",
        href: "#colours",
      },
      {
        label: "Hardware finishes",
        note: "Handles, locking & hinges",
        href: "#hardware",
      },
    ],
  },
  {
    label: "Why us",
    href: "#performance",
    keywords: "performance",
    sections: ["performance"],
  },

  { id: "contact", label: "Contact", href: "#contact", sections: ["contact"] },
];

/* side menu + search index */
const SECTIONS = [
  { label: "Home", href: "#top", keywords: "top start hero" },
  {
    label: "About",
    href: "#legacy",
    keywords: "legacy history heritage german engineering",
  },
  {
    label: "Systems",
    href: "#systems",
    keywords: "prima supra alta sliding casement combination profile",
  },
  {
    label: "Technology",
    href: "#technology",
    keywords:
      "thermal sound insulation weather security glazing gasket reinforcement",
  },
  {
    label: "Openings",
    href: "#openings",
    keywords: "window door tilt turn casement sliding fold lift slide french",
  },
  {
    label: "Colours",
    href: "#colours",
    keywords:
      "colour color dual exterior interior wood oak anthracite white black walnut",
  },
  {
    label: "Hardware",
    href: "#hardware",
    keywords: "handle locking lock hinge finish bronze",
  },
  {
    label: "Why us",
    href: "#performance",
    keywords: "performance",
  },
  {
    label: "Contact",
    href: "#contact",
    keywords: "quote enquiry get in touch form",
  },
];

const ALL_IDS = [
  "legacy",
  "systems",
  "technology",
  "openings",
  "colours",
  "hardware",
  "Why us",
  "contact",
];

/* which section is in the middle of the screen */
function useActiveSection(ids) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);

    if (!els.length) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [ids]);

  return active;
}

export default function Navbar() {
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const closeTimer = useRef(null);

  const reduceMotion = useReducedMotion();
  const activeSection = useActiveSection(ALL_IDS);

  const [openId, setOpenId] = useState(null); // open dropdown
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [hidden, setHidden] = useState(false);

  /* ---------- scroll behaviour ---------- */

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;

    setScrolled(y > 30);
    setPastHero(y > 300);

    if (menuOpen || searchOpen || openId) {
      setHidden(false);
      return;
    }

    if (!HIDE_ON_SCROLL_DOWN) return;

    if (y > prev && y > 240) setHidden(true);
    else if (y < prev) setHidden(false);
  });

  /* ---------- close helpers ---------- */

  const closeAll = () => {
    setOpenId(null);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const openDrop = (id) => {
    clearTimeout(closeTimer.current);
    setSearchOpen(false);
    setOpenId(id);
  };

  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenId(null), 140);
  };

  /* Escape closes everything, clicking outside closes dropdown + search */
  useEffect(() => {
    if (!openId && !searchOpen && !menuOpen) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") closeAll();
    };

    const onDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setOpenId(null);
        setSearchOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [openId, searchOpen, menuOpen]);

  /* lock page scroll while the side menu is open */
  useEffect(() => {
    if (!menuOpen) return undefined;

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
    else setQuery("");
  }, [searchOpen]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  /* ---------- navigation ---------- */

  const goTo = (e, href) => {
    e.preventDefault();
    closeAll();

    setTimeout(() => {
      const behavior = reduceMotion ? "auto" : "smooth";

      if (href === "#top") {
        window.scrollTo({ top: 0, behavior });
        return;
      }

      document
        .querySelector(href)
        ?.scrollIntoView({ behavior, block: "start" });
    }, 60);
  };

  /* ---------- search ---------- */

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return SECTIONS.slice(1, 6);

    return SECTIONS.filter((s) =>
      `${s.label} ${s.keywords}`.toLowerCase().includes(q),
    );
  }, [query]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (results[0]) goTo(e, results[0].href);
  };

  /* ---------- render ---------- */

  const isActive = (item) => pastHero && item.sections.includes(activeSection);

  return (
    <>
      <motion.header
        ref={headerRef}
        className={`nb ${scrolled ? "is-scrolled" : ""}`}
        initial={reduceMotion ? false : { y: -40, opacity: 0 }}
        animate={{ y: hidden ? "-140%" : 0, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
      >
        <div className="nb-bar">
          {/* ---------- logo ---------- */}
          <a
            className="nb-logo"
            href="#top"
            onClick={(e) => goTo(e, "#top")}
            aria-label="GEALAN, back to top"
          >
            <strong>Leading Gears India Pvt Ltd</strong>
            <i />
            <span>
              GERMAN
              <br />
              ENGINEERING
            </span>
          </a>

          {/* ---------- links ---------- */}
          <nav className="nb-links" aria-label="Main">
            {NAV.map((item) => {
              const hasMenu = Boolean(item.children);
              const open = openId === item.id;

              return (
                <div
                  key={item.id}
                  className={`nb-item ${isActive(item) ? "is-active" : ""} ${open ? "is-open" : ""}`}
                  onMouseEnter={hasMenu ? () => openDrop(item.id) : undefined}
                  onMouseLeave={hasMenu ? scheduleClose : undefined}
                >
                  {hasMenu ? (
                    <button
                      type="button"
                      className="nb-link"
                      aria-expanded={open}
                      aria-haspopup="true"
                      onClick={() =>
                        open ? setOpenId(null) : openDrop(item.id)
                      }
                    >
                      {item.label}
                      <ChevronDown size={15} className="nb-chevron" />
                    </button>
                  ) : (
                    <a
                      className="nb-link"
                      href={item.href}
                      onClick={(e) => goTo(e, item.href)}
                    >
                      {item.label}
                    </a>
                  )}

                  <AnimatePresence>
                    {hasMenu && open && (
                      <motion.div
                        className="nb-drop"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                      >
                        {item.children.map((child) => (
                          <a
                            key={child.label}
                            className="nb-drop-link"
                            href={child.href}
                            onClick={(e) => goTo(e, child.href)}
                          >
                            <span>
                              <strong>{child.label}</strong>
                              {child.note && <small>{child.note}</small>}
                            </span>
                            <ArrowUpRight size={15} />
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* ---------- right side ---------- */}
          <div className="nb-right">
            <button
              type="button"
              className="nb-icon"
              aria-label={searchOpen ? "Close search" : "Search the site"}
              aria-expanded={searchOpen}
              onClick={() => {
                setOpenId(null);
                setSearchOpen((v) => !v);
              }}
            >
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>

            <a
              className="nb-cta"
              href="#contact"
              onClick={(e) => goTo(e, "#contact")}
            >
              Get a Quote
              <ArrowRight size={16} />
            </a>

            <button
              type="button"
              className="nb-icon nb-burger"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="nb-panel"
              onClick={() => {
                setOpenId(null);
                setSearchOpen(false);
                setMenuOpen(true);
              }}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* ---------- search panel ---------- */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="nb-search"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <form onSubmit={onSearchSubmit} role="search">
                <Search size={18} />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search systems, colours, hardware..."
                  aria-label="Search the site"
                />
              </form>

              <ul>
                {results.length === 0 && (
                  <li className="nb-search-empty">
                    No matching section found.
                  </li>
                )}

                {results.map((r) => (
                  <li key={r.label}>
                    <a href={r.href} onClick={(e) => goTo(e, r.href)}>
                      {r.label}
                      <ArrowUpRight size={15} />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ---------- side menu ---------- */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              className="nb-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              key="panel"
              id="nb-panel"
              className="nb-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE }}
            >
              <div className="nb-panel-head">
                <span>MENU</span>
                <button
                  type="button"
                  className="nb-icon"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <ul className="nb-panel-list">
                {SECTIONS.map((s, i) => (
                  <motion.li
                    key={s.label}
                    initial={reduceMotion ? false : { opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.15 + i * 0.05,
                      ease: EASE,
                    }}
                  >
                    <a href={s.href} onClick={(e) => goTo(e, s.href)}>
                      <small>{String(i + 1).padStart(2, "0")}</small>
                      {s.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <a
                className="nb-cta nb-panel-cta"
                href="#contact"
                onClick={(e) => goTo(e, "#contact")}
              >
                Get a Quote
                <ArrowRight size={16} />
              </a>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
