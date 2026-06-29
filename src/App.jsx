import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import ParticleBackground from "./ParticleBackground";

const C = {
  bg: "#09090b",
  surface: "#111114",
  raised: "#18181c",
  hover: "#202026",
  border: "rgba(255,255,255,0.12)",
  borderHi: "rgba(255,255,255,0.22)",
  text: "#f0f0f0",
  textSub: "#a8a8b3",
  textMeta: "#72728a",
  accent: "#d4a853",
  green: "#4ade80",
  ease: [0.22, 1, 0.36, 1],
};

// Premium easing for scroll-reveal (no bounce, cinematic)
const REVEAL_EASE = [0.25, 0.46, 0.45, 0.94];

// Core scroll-reveal variant factory
// label → heading → paragraph stagger: 0ms, 120ms, 240ms
const revealVariants = (delay = 0) => ({
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(2px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      delay,
      ease: REVEAL_EASE,
    },
  },
});

// Convenience wrapper: animates once when entering viewport
const Reveal = ({ children, delay = 0, style, className }) => (
  <motion.div
    variants={revealVariants(delay)}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-6%" }}
    style={{ willChange: "transform, opacity", ...style }}
    className={className}
  >
    {children}
  </motion.div>
);

const RESUME_PATH = "/resume/Shivam_Kumar_Resume.pdf";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&family=Inter:wght@400;500&family=DM+Mono:wght@400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: ${C.bg};
      color: ${C.text};
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    ::selection { background: ${C.accent}; color: #000; }
    ::-webkit-scrollbar { width: 2px; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }
    a { color: inherit; text-decoration: none; }
    video { display: block; }
    button { font-family: inherit; cursor: pointer; }

    @keyframes pulseDot {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:.5; transform:scale(.75); }
    }
    @keyframes blink {
      0%,100% { opacity:1; }
      50%      { opacity:0; }
    }
    @keyframes shimmer {
      0%{background-position:200% 0}
      100%{background-position:-200% 0}
    }

    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }

    .nav-links  { display: flex !important; }
    .mob-menu   { display: none !important; }

    .zinc-grid  { grid-template-columns: 1fr 290px; }
    .two-col    { grid-template-columns: 1fr 1fr; }

    .section-pad { padding: 120px 48px; }
    .hero-pad    { padding: 120px 48px 80px; }

    @media (max-width: 960px) {
      .zinc-grid  { grid-template-columns: 1fr !important; }
      .two-col    { grid-template-columns: 1fr !important; }
      .nav-links  { display: none !important; }
      .mob-menu   { display: flex !important; }
      .section-pad { padding: 80px 32px !important; }
      .hero-pad    { padding: 100px 32px 60px !important; }
      .zinc-phone-col { justify-content: center !important; }
      .zinc-left-col  { margin-left: auto !important; margin-right: auto !important; }
      .stats-row { gap: 28px !important; }
      .contact-footer { flex-direction: column !important; align-items: flex-start !important; }
      .resume-row { flex-direction: column !important; gap: 24px !important; align-items: flex-start !important; }
    }

    @media (max-width: 600px) {
      .section-pad { padding: 64px 20px !important; }
      .hero-pad    { padding: 88px 20px 48px !important; }
      .nav-header  { padding: 0 20px !important; }
      .mob-drawer  { padding: 20px 20px !important; }
      .btn-row     { flex-direction: column !important; width: 100% !important; }
      .btn-row > * { width: 100% !important; text-align: center !important; justify-content: center !important; }
      .stats-row   { gap: 20px !important; flex-wrap: wrap !important; }
      .zinc-phone-wrap { width: 100% !important; display: flex !important; justify-content: center !important; }
      .case-grid   { grid-template-columns: 1fr !important; }
      .motion-grid { grid-template-columns: 1fr !important; }
      .chip-row    { gap: 6px !important; }
      .tab-row     { gap: 6px !important; flex-wrap: wrap !important; }
      .about-details > div { flex-direction: column !important; gap: 4px !important; }
      .about-details > div span:last-child { text-align: left !important; }
    }

    @media (min-width: 961px) and (max-width: 1100px) {
      .section-pad { padding: 100px 40px !important; }
      .hero-pad    { padding: 110px 40px 70px !important; }
      .zinc-grid   { gap: 40px !important; }
    }
  `}</style>
);

const SectionLabel = ({ children, style }) => (
  <p
    style={{
      fontFamily: "'DM Mono',monospace",
      fontSize: "11px",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: C.textMeta,
      marginBottom: "16px",
      ...style,
    }}
  >
    {children}
  </p>
);

const Divider = ({ style }) => (
  <div style={{ height: "1px", background: C.border, ...style }} />
);

const BtnPrimary = ({ children, href, onClick, download, style }) => {
  const s = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter',sans-serif",
    fontSize: "15px",
    fontWeight: 500,
    padding: "13px 28px",
    borderRadius: "8px",
    background: C.text,
    color: "#09090b",
    border: "none",
    transition: "opacity 0.2s",
    whiteSpace: "nowrap",
    ...style,
  };
  const hov = (e) => (e.currentTarget.style.opacity = "0.85");
  const lv = (e) => (e.currentTarget.style.opacity = "1");
  if (href)
    return (
      <a
        href={href}
        download={download}
        target={download ? undefined : "_blank"}
        rel="noopener noreferrer"
        style={s}
        onMouseEnter={hov}
        onMouseLeave={lv}
      >
        {children}
      </a>
    );
  return (
    <button onClick={onClick} style={s} onMouseEnter={hov} onMouseLeave={lv}>
      {children}
    </button>
  );
};

const BtnOutline = ({ children, href, onClick, target, download, style }) => {
  const [hov, setHov] = useState(false);
  const s = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter',sans-serif",
    fontSize: "15px",
    fontWeight: 400,
    padding: "12px 24px",
    borderRadius: "8px",
    border: `1.5px solid ${hov ? C.borderHi : C.border}`,
    color: hov ? C.text : C.textSub,
    background: "transparent",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    ...style,
  };
  const p = {
    style: s,
    onMouseEnter: () => setHov(true),
    onMouseLeave: () => setHov(false),
  };
  if (href)
    return (
      <a
        href={href}
        download={download}
        target={target}
        rel="noopener noreferrer"
        {...p}
      >
        {children}
      </a>
    );
  return (
    <button onClick={onClick} {...p}>
      {children}
    </button>
  );
};

const NavResume = () => {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={RESUME_PATH}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: "'DM Mono',monospace",
        fontSize: "11px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "7px 16px",
        borderRadius: "5px",
        border: `1.5px solid ${hov ? C.borderHi : C.border}`,
        color: hov ? C.text : C.textSub,
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      Resume ↗
    </a>
  );
};

const TabBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: "'DM Mono',monospace",
      fontSize: "12px",
      letterSpacing: "0.05em",
      padding: "10px 24px",
      borderRadius: "6px",
      border: `1.5px solid ${active ? "rgba(255,255,255,0.9)" : C.border}`,
      background: active ? "rgba(255,255,255,0.12)" : "transparent",
      color: active ? "#ffffff" : C.textSub,
      transition: "all 0.2s",
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      boxShadow: active
        ? "0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.15)"
        : "none",
    }}
  >
    {label}
  </button>
);

const Chip = ({ children }) => (
  <span
    style={{
      fontFamily: "'DM Mono',monospace",
      fontSize: "11px",
      letterSpacing: "0.04em",
      color: C.textSub,
      border: `1.5px solid ${C.border}`,
      borderRadius: "5px",
      padding: "5px 11px",
      display: "inline-block",
    }}
  >
    {children}
  </span>
);

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: C.ease },
  },
});

const useTypewriter = (words) => {
  const [wi, setWi] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  const [ci, setCi] = useState(0);
  useEffect(() => {
    const word = words[wi],
      speed = del ? 30 : 65;
    const t = setTimeout(() => {
      if (!del) {
        if (ci < word.length) {
          setText(word.slice(0, ci + 1));
          setCi((c) => c + 1);
        } else setTimeout(() => setDel(true), 1900);
      } else {
        if (ci > 0) {
          setText(word.slice(0, ci - 1));
          setCi((c) => c - 1);
        } else {
          setDel(false);
          setWi((w) => (w + 1) % words.length);
        }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [ci, del, wi]);
  return text;
};

/* ═══ NAV ═══ */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const linkStyle = {
    fontFamily: "'Inter',sans-serif",
    fontSize: "14px",
    fontWeight: 400,
    color: C.textSub,
    transition: "color 0.2s",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
  };
  const hov = (e) => (e.target.style.color = C.text);
  const lv = (e) => (e.target.style.color = C.textSub);
  const navLinks = [
    ["#zinc", "ZINC"],
    ["#motion", "Motion Work"],
    ["#about", "About"],
    ["#contact", "Contact"],
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="nav-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          background: scrolled ? "rgba(9,9,11,0.9)" : "transparent",
          borderBottom: scrolled
            ? `1px solid ${C.border}`
            : "1px solid transparent",
          transition: "background 0.35s, border-color 0.35s",
        }}
      >
        <a
          href="#top"
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: C.text,
          }}
        >
          Shivam
        </a>
        <nav
          className="nav-links"
          style={{ display: "flex", gap: "32px", alignItems: "center" }}
        >
          {navLinks.map(([href, label]) => (
            <a
              key={label}
              href={href}
              style={linkStyle}
              onMouseEnter={hov}
              onMouseLeave={lv}
            >
              {label}
            </a>
          ))}
          <NavResume />
        </nav>
        <button
          className="mob-menu"
          onClick={() => setMobileOpen((o) => !o)}
          style={{
            display: "none",
            flexDirection: "column",
            gap: "5px",
            background: "none",
            border: "none",
            padding: "8px",
            cursor: "pointer",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: "22px",
                height: "2px",
                background: C.textSub,
                borderRadius: "2px",
                transition: "all 0.3s",
                transform: mobileOpen
                  ? i === 0
                    ? "rotate(45deg) translateY(7px)"
                    : i === 2
                      ? "rotate(-45deg) translateY(-7px)"
                      : "scaleX(0)"
                  : "none",
              }}
            />
          ))}
        </button>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="mob-drawer"
            style={{
              position: "fixed",
              top: "60px",
              left: 0,
              right: 0,
              zIndex: 499,
              background: "rgba(9,9,11,0.97)",
              backdropFilter: "blur(20px)",
              borderBottom: `1px solid ${C.border}`,
              padding: "24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {navLinks.map(([href, label]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "18px",
                  color: C.textSub,
                }}
              >
                {label}
              </a>
            ))}
            <Divider />
            <a
              href={RESUME_PATH}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "13px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.accent,
              }}
            >
              View Resume ↗
            </a>
            <a
              href={RESUME_PATH}
              download="Shivam_Kumar_Resume.pdf"
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "13px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.textSub,
              }}
            >
              ↓ Download Resume
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ═══ HERO ═══ */
const Hero = () => {
  const typed = useTypewriter([
    "Interfaces.",
    "Digital Products.",
    "Product Engineering.",
  ]);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  // Hero-specific reveal: cinematic, restrained stagger
  const heroReveal = (delay = 0) => ({
    hidden: { opacity: 0, y: 18, filter: "blur(2px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.65, delay, ease: REVEAL_EASE },
    },
  });

  return (
    <section
      id="top"
      ref={ref}
      className="hero-pad"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "120px 48px 80px",
      }}
    >
      <div style={{ maxWidth: "780px" }}>
        {/* Status badge — existing animation preserved */}
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: C.green,
              display: "inline-block",
              animation: "pulseDot 2.4s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "15px",
              color: C.textSub,
            }}
          >
            Available for full-time roles · Bangalore
          </span>
        </motion.div>

        {/* "I design and build" — hero heading line 1 */}
        <motion.h1
          variants={heroReveal(0.05)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "clamp(36px,7.5vw,88px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            color: C.text,
            textAlign: "left",
            willChange: "transform, opacity",
          }}
        >
          I design and build
        </motion.h1>

        {/* Typewriter line — hero heading line 2, reveals 150ms after line 1 */}
        <motion.div
          variants={heroReveal(0.2)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            marginTop: "12px",
            fontFamily: "'Sora',sans-serif",
            fontSize: "clamp(20px,6.5vw,88px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            color: C.textSub,
            marginBottom: "44px",
            minHeight: "1.05em",
            wordBreak: "break-word",
            textAlign: "left",
            willChange: "transform, opacity",
          }}
        >
          {typed}
          <span
            style={{
              animation: "blink 1s step-end infinite",
              color: C.accent,
              marginLeft: "3px",
            }}
          >
            |
          </span>
        </motion.div>

        {/* Supporting paragraph — fades in 120ms after typewriter line */}
        <motion.p
          variants={heroReveal(0.34)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            fontSize: "18px",
            color: C.textSub,
            maxWidth: "500px",
            lineHeight: 1.65,
            fontWeight: 400,
            marginBottom: "64px",
            willChange: "transform, opacity",
          }}
        >
          Design. Code. Ship. Shipped ZINC App. Software Interfaces. React.
          React Native • Product Design • Motion
        </motion.p>

        <motion.div
          variants={fadeUp(0.22)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="btn-row"
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "12px",
          }}
        >
          <BtnPrimary href="https://www.behance.net/gallery/251586725/Case-Study-Zinc-Finance-App">
            View ZINC →
          </BtnPrimary>
          <BtnOutline href="#contact">Get in Touch</BtnOutline>
        </motion.div>

        <motion.div
          variants={fadeUp(0.26)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="btn-row"
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
        >
          <BtnOutline href={RESUME_PATH} target="_blank">
            View Resume ↗
          </BtnOutline>
          <BtnOutline href={RESUME_PATH} download="Shivam_Kumar_Resume.pdf">
            ↓ Download Resume
          </BtnOutline>
        </motion.div>

        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="stats-row"
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "64px",
            flexWrap: "wrap",
          }}
        >
          {[
            ["7 yrs", "Motion Design"],
            ["React Native", "Primary Stack"],
            ["Bangalore", "India"],
          ].map(([v, l]) => (
            <div key={l}>
              <div
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: C.text,
                  letterSpacing: "-0.01em",
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "11px",
                  color: C.textMeta,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: "4px",
                  marginBottom: "-4px",
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SHARED: useVideoTabSwitcher hook
═══════════════════════════════════════════════════════════════ */
const useVideoTabSwitcher = (srcs, activeTab) => {
  const videoRef = useRef(null);
  const prevTab = useRef(null);
  const pendingTab = useRef(null);
  const isSwitching = useRef(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (el.paused && el.src) el.play().catch(() => {});
        } else {
          if (!el.paused) el.pause();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    prevTab.current = activeTab;

    const reveal = () => {
      setOpacity(1);
      el.play().catch(() => {});
    };

    if (el.readyState >= 3) {
      reveal();
    } else {
      el.addEventListener("canplay", reveal, { once: true });
      const safety = setTimeout(reveal, 5000);
      el.addEventListener("canplay", () => clearTimeout(safety), {
        once: true,
      });
    }

    return () => el.removeEventListener("canplay", reveal);
  }, []);

  const doSwitch = useCallback(
    (tab) => {
      const el = videoRef.current;
      if (!el || prevTab.current === tab) return;

      if (isSwitching.current) {
        pendingTab.current = tab;
        return;
      }

      isSwitching.current = true;
      prevTab.current = tab;

      setOpacity(0);

      setTimeout(() => {
        el.src = srcs[tab];

        const onReady = () => {
          el.play().catch(() => {});
          setOpacity(1);
          isSwitching.current = false;
          if (pendingTab.current && pendingTab.current !== tab) {
            const next = pendingTab.current;
            pendingTab.current = null;
            doSwitch(next);
          }
        };

        if (el.readyState >= 3) {
          onReady();
        } else {
          el.addEventListener("canplay", onReady, { once: true });
          el.load();
          const safety = setTimeout(() => {
            el.removeEventListener("canplay", onReady);
            setOpacity(1);
            el.play().catch(() => {});
            isSwitching.current = false;
            if (pendingTab.current && pendingTab.current !== tab) {
              const next = pendingTab.current;
              pendingTab.current = null;
              doSwitch(next);
            }
          }, 4000);
          el.addEventListener("canplay", () => clearTimeout(safety), {
            once: true,
          });
        }
      }, 150);
    },
    [srcs],
  );

  useEffect(() => {
    if (prevTab.current !== null) {
      doSwitch(activeTab);
    }
  }, [activeTab, doSwitch]);

  return { videoRef, opacity };
};

/* ═══════════════════════════════════════════════════════════════
   SHARED: PhoneShell
═══════════════════════════════════════════════════════════════ */
const PhoneShell = ({ children }) => (
  <div
    style={{
      width: "clamp(200px,24vw,270px)",
      aspectRatio: "9/19.5",
      background: "#07070a",
      borderRadius: "40px",
      border: "1.5px solid rgba(255,255,255,0.14)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      boxShadow:
        "0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: "14px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "68px",
        height: "9px",
        background: "#000",
        borderRadius: "8px",
        zIndex: 10,
      }}
    />
    <div style={{ height: "34px", flexShrink: 0 }} />
    <div
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#07070a",
      }}
    >
      {children}
    </div>
    <div
      style={{
        height: "26px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "34%",
          height: "4px",
          background: "rgba(255,255,255,0.16)",
          borderRadius: "2px",
        }}
      />
    </div>
  </div>
);

/* ═══ ZINC PHONE ═══ */
const ZINC_SRCS = {
  feature: "/videos/Feature.mp4",
  home: "/videos/Home.mp4",
  rewards: "/videos/Rewards.mp4",
};

const ZincPhone = ({ activeTab }) => {
  const { videoRef, opacity } = useVideoTabSwitcher(ZINC_SRCS, activeTab);

  return (
    <PhoneShell>
      <video
        ref={videoRef}
        src={ZINC_SRCS.feature}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#07070a",
          opacity,
          transition: "opacity 0.15s ease",
          willChange: "opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      />
    </PhoneShell>
  );
};

/* ═══ ENGINEERING PROOF STRIP ═══ */
const ENGINEERING_CHIPS = [
  "PDF Processing Pipeline",
  "Firebase Authentication",
  "OTP Verification",
  "Gemini Integration",
  "Subscription Detection",
  "SDK Migration",
  "Play Store Deployment",
  "SHA-256 Debugging",
];

const EngineeringStrip = ({ inView }) => (
  <motion.div
    variants={fadeUp(0.16)}
    initial="hidden"
    animate={inView ? "visible" : "hidden"}
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "52px",
      justifyContent: "center",
    }}
  >
    {ENGINEERING_CHIPS.map((label) => (
      <Chip key={label}>{label}</Chip>
    ))}
  </motion.div>
);

/* ═══ ZINC SECTION ═══ */
const ZincSection = () => {
  const [tab, setTab] = useState("feature");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const tabs = [
    {
      id: "feature",
      label: "Feature",
      desc: "Built the complete pipeline behind the feature, document picker, validation, PDF extraction, Gemini integration, response parsing, and subscription detection. Also handled SDK migrations, deprecated packages, and dependency issues while keeping the experience simple for users.",
    },
    {
      id: "home",
      label: "Home",
      desc: "Designed the dashboard to make financial insights easy to scan. Used visual hierarchy, motion, and progressive disclosure to keep complex data simple and actionable.",
    },
    {
      id: "rewards",
      label: "Rewards",
      desc: "Built the rewards system using Rive, After Effects, and React Native interactions. Focused on animation timing, feedback loops, and state management to make progress feel rewarding and engaging.",
    },
  ];

  return (
    <section
      id="zinc"
      ref={ref}
      className="section-pad"
      style={{
        padding: "120px 48px",
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <div
          className="zinc-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 290px",
            gap: "72px",
            alignItems: "center",
          }}
        >
          <motion.div
            variants={fadeUp(0.06)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxWidth: "560px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* Label → Heading → Paragraph stagger */}
            <motion.div
              variants={revealVariants(0)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                willChange: "transform, opacity",
                textAlign: "center",
                marginBottom: "32px",
              }}
            >
              <SectionLabel style={{ textAlign: "center", marginBottom: 0 }}>
                Featured Project
              </SectionLabel>
            </motion.div>

            <motion.h2
              variants={revealVariants(0.12)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(64px,10vw,120px)",
                fontWeight: 600,
                letterSpacing: "-0.05em",
                lineHeight: 0.85,
                color: C.text,
                marginBottom: "28px",
                textAlign: "center",
                width: "100%",
                willChange: "transform, opacity",
              }}
            >
              ZINC
            </motion.h2>

            <motion.p
              variants={revealVariants(0.24)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontSize: "17px",
                lineHeight: 1.8,
                color: C.textSub,
                maxWidth: "480px",
                marginBottom: "44px",
                textAlign: "center",
                willChange: "transform, opacity",
              }}
            >
              A subscription tracking app built from scratch
            </motion.p>

            <div
              className="chip-row"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "44px",
                justifyContent: "center",
              }}
            >
              {[
                "React Native",
                "React",
                "TypeScript",
                "Reanimated 3",
                "Product Design",
                "UX Strategy",
                "Firebase",
              ].map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>

            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "13px",
                color: C.textMeta,
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              Explore the Experience:
            </p>

            <div
              className="tab-row"
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              {tabs.map((t) => (
                <TabBtn
                  key={t.id}
                  label={t.label}
                  active={tab === t.id}
                  onClick={() => setTab(t.id)}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={tab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.22 }}
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "14px",
                  color: C.textSub,
                  lineHeight: 1.7,
                  maxWidth: "420px",
                  textAlign: "center",
                }}
              >
                {tabs.find((t) => t.id === tab)?.desc}
              </motion.p>
            </AnimatePresence>

            <EngineeringStrip inView={inView} />
          </motion.div>

          <motion.div
            variants={fadeUp(0.1)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="zinc-phone-col"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="zinc-phone-wrap">
              <ZincPhone activeTab={tab} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══ ONBOARDING PHONE ═══ */
const ONBOARDING_SRCS = {
  welcome: "/videos/Welcome.mp4",
  setup: "/videos/Setup.mp4",
  verify: "/videos/Verify.mp4",
};

const OnboardingPhone = ({ activeTab }) => {
  const { videoRef, opacity } = useVideoTabSwitcher(ONBOARDING_SRCS, activeTab);

  return (
    <PhoneShell>
      <video
        ref={videoRef}
        src={ONBOARDING_SRCS.welcome}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#07070a",
          opacity,
          transition: "opacity 0.15s ease",
          willChange: "opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      />
    </PhoneShell>
  );
};

/* ═══ ONBOARDING SECTION ═══ */
const OnboardingSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const steps = [
    {
      id: "welcome",
      label: "Welcome",
      desc: "Designed a custom welcome screen with Photoshop-crafted overlays and carefully tuned timing. While resources load in the background, users get a clear first impression of what ZINC does and why it matters.",
    },
    {
      id: "setup",
      label: "Setup",
      desc: "Built the setup flow with synchronized modal and overlay animations to keep attention focused on the active step. Every screen was kept intentionally minimal to reduce friction and improve clarity.",
    },
    {
      id: "verify",
      label: "Verify",
      desc: "Built a production-ready OTP verification flow using Firebase Authentication and reCAPTCHA. Solved complex deployment issues, including Play Store SHA-256 signing mismatches, to ensure a smooth and reliable verification experience.",
    },
  ];

  const [tab, setTab] = useState("welcome");

  return (
    <section
      id="onboarding"
      ref={ref}
      className="section-pad"
      style={{
        padding: "120px 180px",
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <div
          className="zinc-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 290px",
            gap: "72px",
            alignItems: "center",
          }}
        >
          <motion.div
            variants={fadeUp(0.06)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxWidth: "560px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* Label → Heading → Paragraph stagger */}
            <motion.div
              variants={revealVariants(0)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                willChange: "transform, opacity",
                textAlign: "center",
                marginBottom: "32px",
              }}
            >
              <SectionLabel style={{ textAlign: "center", marginBottom: 0 }}>
                ZINC — Onboarding
              </SectionLabel>
            </motion.div>

            <motion.h2
              variants={revealVariants(0.12)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(32px,5vw,64px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
                color: C.text,
                marginBottom: "28px",
                textAlign: "center",
                width: "100%",
                willChange: "transform, opacity",
              }}
            >
              Onboarding
            </motion.h2>

            <motion.p
              variants={revealVariants(0.24)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontSize: "17px",
                lineHeight: 1.8,
                color: C.textSub,
                maxWidth: "480px",
                marginBottom: "44px",
                textAlign: "center",
                willChange: "transform, opacity",
              }}
            >
              A motion driven onboarding flow designed to build trust and guide
              users through their first experience with minimal friction.
            </motion.p>

            <div
              className="chip-row"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "44px",
                justifyContent: "center",
              }}
            >
              {[
                "Reanimated 3",
                "Firebase Auth",
                "OTP Verification",
                "Lottie",
                "React Native",
              ].map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>

            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "13px",
                color: C.textMeta,
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              Explore the flow:
            </p>

            <div
              className="tab-row"
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              {steps.map((s) => (
                <TabBtn
                  key={s.id}
                  label={s.label}
                  active={tab === s.id}
                  onClick={() => setTab(s.id)}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={tab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.22 }}
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "14px",
                  color: C.textSub,
                  lineHeight: 1.7,
                  maxWidth: "420px",
                  textAlign: "center",
                }}
              >
                {steps.find((s) => s.id === tab)?.desc}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          <motion.div
            variants={fadeUp(0.1)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="zinc-phone-col"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="zinc-phone-wrap">
              <OnboardingPhone activeTab={tab} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══ ZINC DESIGN SYSTEM VIDEO SECTION ═══ */
const ZincDesignSystemSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const vRef = useRef(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = vRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else if (!el.paused) {
          el.pause();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="zinc-design-system"
      ref={ref}
      className="section-pad"
      style={{
        padding: "120px 48px",
        background: "transparent",
        borderTop: `1px solid ${C.border}`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(9,9,11,0.55)",
          backdropFilter: "blur(.5px)",
          WebkitBackdropFilter: "blur(2px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <motion.div
        variants={fadeUp(0)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{
          textAlign: "center",
          marginBottom: "48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Label not present in original — heading only with scroll reveal */}
        <motion.h2
          variants={revealVariants(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6%" }}
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "clamp(28px,5vw,56px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: C.text,
            willChange: "transform, opacity",
          }}
        >
          Zinc's Design System
        </motion.h2>
      </motion.div>

      <motion.div
        variants={fadeUp(0.08)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          background: "#000",
          position: "relative",
          zIndex: 1,
        }}
      >
        {!error ? (
          <video
            ref={vRef}
            src="/videos/Design_system.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setReady(true)}
            onError={() => setError(true)}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "contain",
              opacity: ready ? 1 : 0,
              transition: "opacity 0.4s",
            }}
          />
        ) : (
          <div
            style={{
              minHeight: "320px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: C.textMeta,
            }}
          >
            <span style={{ fontSize: "24px", opacity: 0.3 }}>▶</span>
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "11px",
                textAlign: "center",
                padding: "0 16px",
              }}
            >
              Could not load /videos/Design_system.mp4 — check filename casing,
              folder location (public/videos/), and that the format is H.264
              MP4.
            </span>
          </div>
        )}
      </motion.div>
    </section>
  );
};

/* ═══ MOTION SYSTEM VIDEO SECTION ═══ */
const MotionSystemSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const vRef = useRef(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = vRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else if (!el.paused) {
          el.pause();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="motion-system"
      ref={ref}
      className="section-pad"
      style={{
        padding: "120px 48px",
        background: "transparent",
        borderTop: `1px solid ${C.border}`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(9,9,11,0.55)",
          backdropFilter: "blur(.5px)",
          WebkitBackdropFilter: "blur(2px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <motion.div
        variants={fadeUp(0)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{
          textAlign: "center",
          marginBottom: "48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.h2
          variants={revealVariants(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6%" }}
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "clamp(28px,5vw,56px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: C.text,
            willChange: "transform, opacity",
          }}
        >
          Motion System
        </motion.h2>
      </motion.div>

      <motion.div
        variants={fadeUp(0.08)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          background: "#000",
          position: "relative",
          zIndex: 1,
        }}
      >
        {!error ? (
          <video
            ref={vRef}
            src="/videos/Motion_system.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setReady(true)}
            onError={() => setError(true)}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "contain",
              opacity: ready ? 1 : 0,
              transition: "opacity 0.4s",
            }}
          />
        ) : (
          <div
            style={{
              minHeight: "320px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: C.textMeta,
            }}
          >
            <span style={{ fontSize: "24px", opacity: 0.3 }}>▶</span>
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "11px",
                textAlign: "center",
                padding: "0 16px",
              }}
            >
              Could not load /videos/Motion_system.mp4 — check filename casing,
              folder location (public/videos/), and that the format is H.264
              MP4.
            </span>
          </div>
        )}
      </motion.div>
    </section>
  );
};

/* ═══ GLUATTA PHONE ═══ */
const GluattaPhone = () => {
  const videoRef = useRef(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const reveal = () => {
      setOpacity(1);
      el.play().catch(() => {});
    };

    if (el.readyState >= 3) {
      reveal();
    } else {
      el.addEventListener("canplay", reveal, { once: true });
      const safety = setTimeout(reveal, 5000);
      el.addEventListener("canplay", () => clearTimeout(safety), {
        once: true,
      });
    }

    return () => el.removeEventListener("canplay", reveal);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (el.paused) el.play().catch(() => {});
        } else {
          if (!el.paused) el.pause();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <PhoneShell>
      <video
        ref={videoRef}
        src="/videos/Gluatta.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#07070a",
          opacity,
          transition: "opacity 0.15s ease",
          willChange: "opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      />
    </PhoneShell>
  );
};

/* ═══ SECOND SECTION (Gluata) ═══ */
const SecondSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      id="second-section"
      ref={ref}
      className="section-pad"
      style={{
        padding: "120px 48px",
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <div
          className="zinc-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 290px",
            gap: "72px",
            alignItems: "center",
          }}
        >
          <motion.div
            variants={fadeUp(0.06)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxWidth: "560px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* Label → Heading → Paragraph stagger */}
            <motion.div
              variants={revealVariants(0)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                willChange: "transform, opacity",
                textAlign: "center",
                marginBottom: "32px",
              }}
            >
              <SectionLabel style={{ textAlign: "center", marginBottom: 0 }}>
                Emotional Release Through Space Ritual
              </SectionLabel>
            </motion.div>

            <motion.h2
              variants={revealVariants(0.12)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(32px,5vw,64px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
                color: C.text,
                marginBottom: "28px",
                textAlign: "center",
                width: "100%",
                willChange: "transform, opacity",
              }}
            >
              Gluata
            </motion.h2>

            <motion.p
              variants={revealVariants(0.24)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontSize: "17px",
                lineHeight: 1.8,
                color: C.textSub,
                maxWidth: "480px",
                marginBottom: "44px",
                textAlign: "center",
                willChange: "transform, opacity",
              }}
            >
              An experimental wellbeing experience that transforms emotional
              release into a cinematic space ritual through motion, interaction,
              and storytelling.
            </motion.p>

            <div
              className="chip-row"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "44px",
                justifyContent: "center",
              }}
            >
              {[
                "Product Thinking",
                "UX Strategy",
                "Typescript",
                "Reanimated",
                "React Native",
              ].map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>

            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "13px",
                color: C.textMeta,
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              Preview:
            </p>

            <div
              className="tab-row"
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              <TabBtn label="Preview" active={true} onClick={() => {}} />
            </div>

            <motion.p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "14px",
                color: C.textSub,
                lineHeight: 1.7,
                maxWidth: "420px",
                textAlign: "center",
              }}
            >
              An experimental motion concept exploring emotional ritual through
              spatial interaction design.
            </motion.p>
          </motion.div>

          <motion.div
            variants={fadeUp(0.1)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="zinc-phone-col"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="zinc-phone-wrap">
              <GluattaPhone />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══ WHY GLUATTA SECTION ═══ */
const WhyGluattaSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const paragraphs = [
    "Gluata started from a simple observation: a lot of people struggle with stress, overthinking, and emotional pressure. Most wellbeing apps respond with calm, clinical experiences. I wanted to explore a different approach",

    "Instead of sitting with the problem, users write it down, launch it into space, travel alongside it, place it on a planet, and finally destroy it. The goal isn't distraction—it's creating a feeling of release through motion, interaction, and storytelling",

    "Every animation and interaction serves a purpose. The space world, flight sequence, and destruction ritual are designed to turn a heavy moment into something more empowering and memorable",

    "Gluata is an experimental project exploring how design, motion, and technology can create a more engaging approach to emotional wellbeing. I'm currently exploring AI-driven reflections to make the experience feel even more personal and meaningful.",
  ];

  return (
    <section
      ref={ref}
      className="section-pad"
      style={{
        padding: "120px 48px",
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Label → Heading stagger, then first paragraph */}
        <motion.div
          variants={revealVariants(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6%" }}
          style={{ willChange: "transform, opacity" }}
        >
          <SectionLabel>Gluatta — Why I Built This</SectionLabel>
        </motion.div>

        <motion.h2
          variants={revealVariants(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6%" }}
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "clamp(28px,5vw,56px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: C.text,
            marginBottom: "36px",
            willChange: "transform, opacity",
          }}
        >
          Why I Built Gluata
        </motion.h2>

        {/* First paragraph gets the third stagger step */}
        <motion.p
          variants={revealVariants(0.24)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6%" }}
          style={{
            fontSize: "17px",
            lineHeight: 1.85,
            color: C.textSub,
            marginBottom: "20px",
            willChange: "transform, opacity",
          }}
        >
          {paragraphs[0]}
        </motion.p>

        {/* Remaining paragraphs — no scroll-reveal per spec */}
        {paragraphs.slice(1).map((p, i) => (
          <motion.p
            key={i}
            variants={fadeUp(0.04 * (i + 1))}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              fontSize: "17px",
              lineHeight: 1.85,
              color: C.textSub,
              marginBottom: "20px",
            }}
          >
            {p}
          </motion.p>
        ))}
      </div>
    </section>
  );
};

/* ═══ GLUATTA VIDEO SECTION ═══ */
const GluattaVideoSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const vRef = useRef(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = vRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else if (!el.paused) {
          el.pause();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="section-pad"
      style={{
        padding: "120px 48px",
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <motion.div
        variants={fadeUp(0)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          background: "#000",
          position: "relative",
        }}
      >
        {!error ? (
          <video
            ref={vRef}
            src="/videos/gluata.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setReady(true)}
            onError={() => setError(true)}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "contain",
              opacity: ready ? 1 : 0,
              transition: "opacity 0.4s",
            }}
          />
        ) : (
          <div
            style={{
              minHeight: "320px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: C.textMeta,
            }}
          >
            <span style={{ fontSize: "24px", opacity: 0.3 }}>▶</span>
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "11px",
                textAlign: "center",
                padding: "0 16px",
              }}
            >
              Could not load /videos/gluata.mp4 — check filename casing, folder
              location (public/videos/), and that the format is H.264 MP4.
            </span>
          </div>
        )}
      </motion.div>
    </section>
  );
};

/* ═══ CASE STUDY ═══ */
const CaseStudy = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const cards = [
    {
      label: "01 — Problem",
      body: "People often discover recurring subscriptions only after checking multiple bank statements manually. There was no simple, premium tool to surface these leaks without connecting a bank account.",
    },
    {
      label: "02 — User Insight",
      body: "People weren't struggling to find transactions. They were struggling to remember subscriptions they no longer used. The biggest frustration was realizing money had been quietly leaving their account without their awareness.",
    },
    {
      label: "03 — Product Strategy",
      body: "Instead of building another complex finance app, I focused on solving one high-frequency problem well. AI-assisted PDF statement analysis became the MVP because it delivers immediate value without requiring deep financial integrations or excessive user trust.",
    },
    {
      label: "04 — Motion System",
      body: "Motion was designed to feel calm, deliberate, and trustworthy using Reanimated 3. Every transition, overlay, modal, and feedback state was created to guide attention and reinforce confidence rather than entertain.",
    },
    {
      label: "05 — Technical Implementation",
      body: "Built as a real mobile application with production thinking — onboarding flows, feedback states, interaction locks, loading states, OTP verification via Firebase, and AI-powered PDF subscription analysis via Gemini API.",
    },
    {
      label: "06 — Key Learning",
      body: "Great products are not built screen by screen. They are built through hundreds of small decisions involving trust, communication, psychology, feedback, and user behavior — all of which I owned as the sole builder.",
    },
  ];

  return (
    <section
      ref={ref}
      className="section-pad"
      style={{
        padding: "120px 48px",
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            display: "flex",
            justifyContent:
              window.innerWidth <= 768 ? "center" : "space-between",
            alignItems: "flex-start",
            marginBottom: "48px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            {/* Label → Heading stagger */}
            <motion.div
              variants={revealVariants(0)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{ willChange: "transform, opacity" }}
            >
              <SectionLabel>ZINC — Case Study</SectionLabel>
            </motion.div>
            <motion.h2
              variants={revealVariants(0.12)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(22px,3.5vw,42px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: C.text,
                maxWidth: "520px",
                willChange: "transform, opacity",
              }}
            >
              Designed, built, and shipped — one decision at a time.
            </motion.h2>
          </div>
          <BtnOutline
            href="https://www.behance.net/gallery/251586725/Case-Study-Zinc-Finance-App"
            target="_blank"
            style={{ alignSelf: "flex-start" }}
          >
            Read Full Case Study ↗
          </BtnOutline>
        </motion.div>

        <div
          className="case-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            overflow: "hidden",
            borderRadius: "2px",
          }}
        >
          {cards.map(({ label, body }, i) => (
            <motion.div
              key={label}
              variants={fadeUp(0.04 * i)}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              style={{
                background: C.surface,
                padding: "32px 28px",
                transition: "background 0.2s",
                borderRight: `1px solid ${C.border}`,
                borderBottom: `1px solid ${C.border}`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = C.raised)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = C.surface)
              }
            >
              <SectionLabel style={{ marginBottom: "12px" }}>
                {label}
              </SectionLabel>
              <p
                style={{ fontSize: "14px", lineHeight: 1.8, color: C.textSub }}
              >
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══ MOTION WORK ═══ */
const MOTION_VIDEOS = [
  {
    id: 1,
    title: "Motion Piece 01",
    type: "Motion Design",
    src: "/motion/Motion_01.mp4",
  },
  {
    id: 2,
    title: "Motion Piece 02",
    type: "Motion Design",
    src: "/motion/Motion_02.mp4",
  },
  {
    id: 3,
    title: "Motion Piece 03",
    type: "Animation",
    src: "/motion/Motion_03.mp4",
  },
  {
    id: 4,
    title: "Motion Piece 04",
    type: "Motion Design",
    src: "/motion/Motion_04.mp4",
  },
];

const Lightbox = ({ video, onClose }) => {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "rgba(0,0,0,0.94)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ scale: 0.93 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.93 }}
        transition={{ duration: 0.28, ease: C.ease }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "960px",
          borderRadius: "12px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <video
          src={video.src}
          autoPlay
          loop
          controls
          playsInline
          style={{
            width: "100%",
            aspectRatio: "16/9",
            objectFit: "contain",
            display: "block",
            background: "#000",
          }}
        />
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            background: "rgba(0,0,0,0.7)",
            border: `1px solid ${C.border}`,
            color: C.textSub,
            fontFamily: "'DM Mono',monospace",
            fontSize: "11px",
            letterSpacing: "0.08em",
            padding: "6px 14px",
            borderRadius: "4px",
          }}
        >
          ESC / CLOSE
        </button>
      </motion.div>
    </motion.div>
  );
};

const MotionCard = ({ video, onOpen }) => {
  const [hov, setHov] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const vRef = useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: C.ease }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => !error && onOpen(video)}
      style={{
        background: C.surface,
        border: `1.5px solid ${hov ? C.borderHi : C.border}`,
        borderRadius: "10px",
        overflow: "hidden",
        cursor: error ? "default" : "pointer",
        transform: hov && !error ? "translateY(-3px)" : "translateY(0)",
        transition: "border-color 0.2s, transform 0.25s",
      }}
    >
      <div
        style={{
          aspectRatio: "16/9",
          background: C.raised,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {!error ? (
          <>
            <video
              ref={vRef}
              src={video.src}
              autoPlay
              muted
              loop
              playsInline
              onCanPlay={() => setReady(true)}
              onError={() => setError(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                opacity: ready ? 1 : 0,
                transition: "opacity 0.4s",
              }}
            />
            {!ready && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(90deg, ${C.raised} 0%, ${C.hover} 50%, ${C.raised} 100%)`,
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            )}
            {ready && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: hov ? "rgba(0,0,0,0.42)" : "rgba(0,0,0,0)",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.92)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: hov ? 1 : 0,
                    transition: "opacity 0.2s",
                  }}
                >
                  <span style={{ fontSize: "17px", marginLeft: "3px" }}>▶</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "24px", opacity: 0.3 }}>▶</span>
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "11px",
                color: C.textMeta,
                textAlign: "center",
                padding: "0 16px",
              }}
            >
              Add {video.src} to public folder
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "15px",
            fontWeight: 500,
            color: C.text,
            marginBottom: "4px",
          }}
        >
          {video.title}
        </div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "11px",
            color: C.textMeta,
            letterSpacing: "0.05em",
          }}
        >
          {video.type}
        </div>
      </div>
    </motion.div>
  );
};

const MotionWork = () => {
  const [lightbox, setLightbox] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      id="motion"
      ref={ref}
      className="section-pad"
      style={{
        padding: "120px 48px",
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            display: "flex",
            justifyContent:
              window.innerWidth <= 768 ? "center" : "space-between",
            alignItems: "flex-start",
            marginBottom: "48px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            {/* Label → Heading stagger */}
            <motion.div
              variants={revealVariants(0)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{ willChange: "transform, opacity" }}
            >
              <SectionLabel>Motion Work</SectionLabel>
            </motion.div>
            <motion.h2
              variants={revealVariants(0.12)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(22px,3.5vw,42px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: C.text,
                willChange: "transform, opacity",
              }}
            >
              7 years of making things move.
            </motion.h2>
          </div>
          <BtnOutline
            href="https://www.behance.net/shivam_kuma"
            target="_blank"
          >
            View on Behance ↗
          </BtnOutline>
        </motion.div>

        <motion.div
          variants={fadeUp(0.06)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="motion-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: "20px",
          }}
        >
          {MOTION_VIDEOS.map((v) => (
            <MotionCard key={v.id} video={v} onOpen={setLightbox} />
          ))}
        </motion.div>
      </div>
      <AnimatePresence>
        {lightbox && (
          <Lightbox video={lightbox} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

/* ═══ RESUME SECTION ═══ */
const ResumeSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      id="resume"
      ref={ref}
      className="section-pad"
      style={{
        padding: "100px 48px",
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <div
          className="resume-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "32px",
          }}
        >
          <motion.div
            variants={fadeUp(0)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{ maxWidth: "520px" }}
          >
            {/* Label → Heading stagger */}
            <motion.div
              variants={revealVariants(0)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{ willChange: "transform, opacity" }}
            >
              <SectionLabel>Resume</SectionLabel>
            </motion.div>
            <motion.h2
              variants={revealVariants(0.12)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(18px,2.8vw,32px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
                color: C.text,
                marginBottom: "16px",
                willChange: "transform, opacity",
              }}
            >
              Experience across product design, motion systems, and frontend
              engineering.
            </motion.h2>
            <motion.p
              variants={revealVariants(0.24)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontSize: "15px",
                lineHeight: 1.8,
                color: C.textSub,
                willChange: "transform, opacity",
              }}
            >
              Download a detailed overview of my work at Clevertize, PlaySimple
              Games, and MPS Limited — alongside the ZINC design engineering
              project.
            </motion.p>
          </motion.div>
          <motion.div
            variants={fadeUp(0.1)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="btn-row"
            style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
          >
            <BtnPrimary href={RESUME_PATH} download="Shivam_Kumar_Resume.pdf">
              ↓ Download Resume
            </BtnPrimary>
            <BtnOutline href={RESUME_PATH} target="_blank">
              View Resume ↗
            </BtnOutline>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══ ABOUT ═══ */
const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      id="about"
      ref={ref}
      className="section-pad"
      style={{
        padding: "120px 48px",
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        {/* Top-level section label */}
        <motion.div
          variants={revealVariants(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6%" }}
          style={{ willChange: "transform, opacity" }}
        >
          <SectionLabel>About</SectionLabel>
        </motion.div>

        <div
          className="two-col"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "72px",
          }}
        >
          <motion.div
            variants={fadeUp(0)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <motion.h2
              variants={revealVariants(0.12)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(18px,2.6vw,32px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.25,
                color: C.text,
                marginBottom: "28px",
                willChange: "transform, opacity",
              }}
            >
              The gap between design and engineering is where good products are
              built.
            </motion.h2>

            {/* First paragraph — third stagger step */}
            <motion.p
              variants={revealVariants(0.24)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6%" }}
              style={{
                fontSize: "15px",
                lineHeight: 1.85,
                color: C.textSub,
                marginBottom: "16px",
                willChange: "transform, opacity",
              }}
            >
              7 years across UI design, motion, and digital products taught me
              that the best interfaces feel inevitable—not designed. Today, I'm
              building the products I once handed off with React Native.
            </motion.p>

            {/* Second paragraph — not scroll-revealed per spec */}
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.85,
                color: C.textSub,
                marginBottom: "16px",
              }}
            >
              I care about the details where design meets engineering—motion,
              interaction, and performance.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp(0.08)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <div className="about-details">
              {[
                ["Currently Building", "Gluata — React Native App"],
                ["Role", "Design Engineer · Creative Frontend"],
                [
                  "Experience",
                  "Clevertize · PlaySimple Mobile Games · MPS Limited",
                ],
                ["Based", "Bangalore, India"],
                ["Open To", "Full-time · Contract"],
                ["Stack", "React Native · React · TypeScript · Reanimated 3"],
                [
                  "Design Tools",
                  "Figma · After Effects · Photoshop · Illustrator",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "16px 0",
                    borderBottom: `1px solid ${C.border}`,
                    gap: "20px",
                    flexWrap: "wrap",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "11px",
                      color: C.textMeta,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: C.textSub,
                      textAlign: "right",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══ CONTACT ═══ */
const Contact = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      id="contact"
      ref={ref}
      className="section-pad"
      style={{
        padding: "120px 48px 100px",
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Label → Heading → Paragraph stagger */}
        <motion.div
          variants={revealVariants(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6%" }}
          style={{ willChange: "transform, opacity" }}
        >
          <SectionLabel>Contact</SectionLabel>
        </motion.div>

        <motion.h2
          variants={revealVariants(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6%" }}
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "clamp(28px,5vw,58px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: C.text,
            marginBottom: "20px",
            willChange: "transform, opacity",
          }}
        >
          Open to Design Engineer and Creative Frontend roles.
        </motion.h2>

        <motion.p
          variants={revealVariants(0.24)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6%" }}
          style={{
            fontSize: "17px",
            lineHeight: 1.8,
            color: C.textSub,
            marginBottom: "44px",
            willChange: "transform, opacity",
          }}
        >
          Building products where motion, craft, and interaction design matter —
          let's talk.
        </motion.p>

        <motion.div
          variants={fadeUp(0.12)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="btn-row"
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <BtnPrimary href="mailto:contrastyouneed@gmail.com">
            contrastyouneed@gmail.com
          </BtnPrimary>
          <BtnOutline href="https://github.com/shivamcs50199" target="_blank">
            GitHub ↗
          </BtnOutline>
          <BtnOutline
            href="https://www.behance.net/search/users/shivam%20kumar"
            target="_blank"
          >
            Behance ↗
          </BtnOutline>
        </motion.div>

        <motion.div
          variants={fadeUp(0.15)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="btn-row"
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
        >
          <BtnOutline href={RESUME_PATH} download="Shivam_Kumar_Resume.pdf">
            ↓ Download Resume
          </BtnOutline>
          <BtnOutline href={RESUME_PATH} target="_blank">
            View Resume ↗
          </BtnOutline>
        </motion.div>

        <Divider style={{ marginTop: "72px", marginBottom: "28px" }} />

        <div
          className="contact-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: C.textMeta,
            }}
          >
            Shivam Kumar · Design Engineer · Bangalore · 2025
          </span>
          <a
            href="https://positive-relation-d99.notion.site/Privacy-Policy-3776a866524e80ff92b7ce6226087d60?pvs=73"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "11px",
              color: C.textMeta,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = C.textSub)}
            onMouseLeave={(e) => (e.target.style.color = C.textMeta)}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  return (
    <>
      <GlobalStyles />
      <ParticleBackground />
      <Nav />
      <main>
        <Hero />
        <ZincSection />
        <OnboardingSection />
        <ZincDesignSystemSection />
        <MotionSystemSection />
        <SecondSection />
        <WhyGluattaSection />
        <GluattaVideoSection />
        <CaseStudy />
        <MotionWork />
        <ResumeSection />
        <About />
        <Contact />
      </main>
    </>
  );
}
