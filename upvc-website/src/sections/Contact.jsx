import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronDown,
  Gem,
  Headset,
  House,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";

import "./Contact.css";

/* =========================================================
   SECTION 11 — CONTACT / FINAL BRAND STATEMENT

   IMAGE (in /public/images/)
     contact-bg.jpg    16:9 landscape, bright interior with a
                       sliding glass door (see prompt)
========================================================= */

const EASE = [0.22, 1, 0.36, 1];

const FEATURES = [
  { icon: Gem, title: "Premium Quality", text: "German Engineering" },
  { icon: House, title: "For Every Space", text: "Homes, Villas & Commercial" },
  {
    icon: Headset,
    title: "Expert Support",
    text: "From Selection to Installation",
  },
];

/* ---------------------------------------------------------
   EDIT THESE: your real contact details
--------------------------------------------------------- */
const CONTACT_INFO = {
  phone: "+91 9893690590, +91 9993610000, +91 9425306420",
  email: "leadinggears@gmail.com",
  location:
    "Leading Gears India Pvt Ltd, 9B/2, Industrial Area No. 1, Dewas, Madhya Pradesh 455001",
};

const DETAILS = [
  {
    icon: Phone,
    label: "Call us",
    value: CONTACT_INFO.phone,
    href: `tel:${CONTACT_INFO.phone.replace(/[^\d+]/g, "")}`,
  },
  {
    icon: Mail,
    label: "Email us",
    value: CONTACT_INFO.email,
    href: `mailto:${CONTACT_INFO.email}`,
  },
  {
    icon: MapPin,
    label: "Visit us",
    value: CONTACT_INFO.location,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.location)}`,
    external: true,
  },
];

const FIELDS = [
  {
    name: "name",
    label: "Full Name",
    icon: User,
    type: "text",
    autoComplete: "name",
  },
  {
    name: "phone",
    label: "Phone Number",
    icon: Phone,
    type: "tel",
    autoComplete: "tel",
  },
  {
    name: "email",
    label: "Email Address",
    icon: Mail,
    type: "email",
    autoComplete: "email",
  },
  {
    name: "city",
    label: "City / Location",
    icon: MapPin,
    type: "text",
    autoComplete: "address-level2",
  },
];

const PROJECT_TYPES = [
  "Home / Apartment",
  "Villa",
  "Commercial",
  "Renovation / Replacement",
  "New Build",
];

const NAV_LINKS = [
  { label: "Products", href: "#systems" },
  { label: "Technology", href: "#technology" },
  { label: "Colours", href: "#colours" },
  { label: "Hardware", href: "#hardware" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

/* Simple stroke icons, so no extra icon package is needed */
const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    svg: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    svg: (
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    svg: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    svg: (
      <>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </>
    ),
  },
  {
    label: "Pinterest",
    href: "#",
    svg: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M10.5 20.5 12.5 12" />
        <path d="M9.5 11c0-2 1.4-3.5 3.3-3.5 1.8 0 3 1.2 3 3 0 2-1.2 3.5-2.8 3.5-1 0-1.6-.6-1.8-1.3" />
      </>
    ),
  },
];

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  city: "",
  type: "",
  message: "",
};

/* ---------------------------------------------------------
   Send this enquiry to the custom Node.js email backend.
   Set BACKEND_API_BASE_URL in the React project's .env if the API
   is hosted somewhere other than the local development URL.
--------------------------------------------------------- */
async function submitEnquiry(values) {
  const apiBase = (
    import.meta.env.BACKEND_API_BASE_URL || "http://localhost:5000"
  ).replace(/\/$/, "");
  const response = await fetch(`${apiBase}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      result.message || "We couldn't send your enquiry. Please try again.",
    );
  }
  return result;
}

function validate(v) {
  if (!v.name.trim()) return "Please enter your name.";
  if (v.phone.replace(/\D/g, "").length < 7)
    return "Please enter a valid phone number.";
  if (!/^\S+@\S+\.\S+$/.test(v.email))
    return "Please enter a valid email address.";
  return "";
}

/* =========================================================
   SECTION
========================================================= */

export default function Contact() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const cardRef = useRef(null);
  const footerRef = useRef(null);
  const nameRef = useRef(null);

  const reduceMotion = useReducedMotion();

  const textIn = useInView(textRef, { once: true, amount: 0.35 });
  const cardIn = useInView(cardRef, { once: true, amount: 0.25 });
  const footerIn = useInView(footerRef, { once: true, amount: 0.4 });

  const showText = textIn || reduceMotion;
  const showCard = cardIn || reduceMotion;
  const showFooter = footerIn || reduceMotion;

  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");

  /* slow parallax on the background photo */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  /* ---------- motion helpers ---------- */

  const fade = (show, delay = 0, y = 24) => ({
    initial: reduceMotion ? false : { opacity: 0, y },
    animate: show ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  const line = (delay) => ({
    initial: reduceMotion ? false : { y: "110%", opacity: 0 },
    animate: showText ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 },
    transition: { duration: 1, delay, ease: EASE },
  });

  /* ---------- form ---------- */

  const onChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const problem = validate(values);

    if (problem) {
      setError(problem);
      return;
    }

    setStatus("sending");

    try {
      await submitEnquiry(values);
      setStatus("sent");
    } catch (submitError) {
      setStatus("idle");
      setError(
        submitError.message || "Something went wrong. Please try again.",
      );
    }
  };

  const resetForm = () => {
    setValues(EMPTY);
    setStatus("idle");
    setError("");
  };

  const focusForm = () => {
    cardRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });

    setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 650);
  };

  const firstName = values.name.trim().split(" ")[0];

  return (
    <section ref={sectionRef} className="contact" id="contact">
      {/* ================= HERO / FORM ================= */}
      <div className="contact-main">
        <motion.div
          className="contact-photo"
          style={reduceMotion ? undefined : { y: photoY }}
        >
          <img src="/images/contact-bg.jpg" alt="" draggable={false} />
        </motion.div>
        <div className="contact-veil" />

        <div className="contact-inner">
          <div className="contact-crumb">
            <span>11</span>
            <i />
            <span>CONTACT</span>
            <b />
          </div>

          <div className="contact-grid">
            {/* ---------- brand statement ---------- */}
            <div ref={textRef} className="contact-copy">
              <motion.div className="contact-brand" {...fade(showText, 0, 14)}>
                <strong>GEALAN</strong>
                <span>GERMAN ENGINEERING</span>
              </motion.div>

              <h2 className="contact-title">
                <span className="contact-mask">
                  <motion.span className="contact-line" {...line(0.3)}>
                    Built around
                  </motion.span>
                </span>
                <span className="contact-mask">
                  <motion.span className="contact-line" {...line(0.5)}>
                    <em>better living.</em>
                  </motion.span>
                </span>
              </h2>

              <motion.p className="contact-lead" {...fade(showText, 0.8)}>
                Premium uPVC windows &amp; doors designed for contemporary homes
                and architectural spaces. Let&apos;s bring your vision to life.
              </motion.p>

              <motion.button
                type="button"
                className="contact-cta"
                onClick={focusForm}
                {...fade(showText, 1, 44)}
              >
                Request a Quote
                <ArrowUpRight size={16} />
              </motion.button>

              <ul className="contact-details">
                {DETAILS.map((d, i) => {
                  const Icon = d.icon;

                  return (
                    <motion.li
                      key={d.label}
                      {...fade(showText, 1.1 + i * 0.1, 16)}
                    >
                      <a
                        href={d.href}
                        {...(d.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        <span className="contact-detail-icon">
                          <Icon size={17} strokeWidth={1.6} />
                        </span>
                        <span className="contact-detail-text">
                          <small>{d.label}</small>
                          <strong>{d.value}</strong>
                        </span>
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            {/* ---------- enquiry form ---------- */}
            <motion.div
              ref={cardRef}
              className="contact-card"
              initial={reduceMotion ? false : { opacity: 0, x: 48 }}
              animate={showCard ? { opacity: 1, x: 0 } : { opacity: 0, x: 48 }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
            >
              {status === "sent" ? (
                <div className="contact-sent" role="status">
                  <span className="contact-sent-icon">
                    <Check size={22} />
                  </span>
                  <h3>Thank you{firstName ? `, ${firstName}` : ""}.</h3>
                  <p>
                    Your enquiry has been received. Our team will get back to
                    you with the right solution.
                  </p>
                  <button
                    type="button"
                    className="contact-link"
                    onClick={resetForm}
                  >
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <div className="contact-card-head">
                    <h3>Get in Touch</h3>
                    <i />
                  </div>

                  <p className="contact-card-text">
                    Tell us about your project and our team will get back to you
                    with the right solution.
                  </p>

                  <div className="contact-fields">
                    {FIELDS.map((f, i) => {
                      const Icon = f.icon;

                      return (
                        <label key={f.name} className="contact-field">
                          <span className="contact-sr">{f.label}</span>
                          <Icon size={17} strokeWidth={1.6} />
                          <input
                            ref={i === 0 ? nameRef : undefined}
                            name={f.name}
                            type={f.type}
                            autoComplete={f.autoComplete}
                            placeholder={f.label}
                            value={values[f.name]}
                            onChange={onChange}
                          />
                        </label>
                      );
                    })}

                    <label className="contact-field contact-select">
                      <span className="contact-sr">Project Type</span>
                      <Building2 size={17} strokeWidth={1.6} />
                      <select
                        name="type"
                        value={values.type}
                        onChange={onChange}
                        className={values.type ? "has-value" : ""}
                      >
                        <option value="">Project Type</option>
                        {PROJECT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="contact-chevron" />
                    </label>

                    <label className="contact-field contact-area">
                      <span className="contact-sr">
                        Your Message (Optional)
                      </span>
                      <MessageSquare size={17} strokeWidth={1.6} />
                      <textarea
                        name="message"
                        rows={3}
                        placeholder="Your Message (Optional)"
                        value={values.message}
                        onChange={onChange}
                      />
                    </label>
                  </div>

                  <p className="contact-error" role="alert">
                    {error}
                  </p>

                  <button
                    type="submit"
                    className="contact-submit"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? "Sending..." : "Send Enquiry"}
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer ref={footerRef} className="contact-footer">
        <motion.div
          className="contact-rule"
          initial={reduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: showFooter ? 1 : 0 }}
          transition={{ duration: 1.4, ease: EASE }}
        />

        <div className="contact-footer-inner">
          <div className="contact-footer-row">
            <motion.div className="contact-logo" {...fade(showFooter, 0.2, 14)}>
              <strong>LEADING UPVC | GEALAN</strong>
              <span>GERMAN ENGINEERING</span>
            </motion.div>

            <nav className="contact-nav" aria-label="Footer">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  {...fade(showFooter, 0.4 + i * 0.09, 14)}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <motion.div
              className="contact-socials"
              {...fade(showFooter, 0.9, 14)}
            >
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}>
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {s.svg}
                  </svg>
                </a>
              ))}
            </motion.div>
          </div>

          <motion.div className="contact-legal" {...fade(showFooter, 1.1, 8)}>
            <span>© 2026 GEALAN-inspired website. All rights reserved.</span>
            <span>WINDOWS FOR A BRIGHTER TOMORROW.</span>
          </motion.div>
        </div>
      </footer>
    </section>
  );
}
