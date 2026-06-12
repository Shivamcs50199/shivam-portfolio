import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

/* ─────────────────────────────────────────────
   TOKENS
───────────────────────────────────────────── */
const T = {
  bg0: "#09090b",       // true background
  bg1: "#0f0f12",       // card base
  bg2: "#141417",       // raised surface
  bg3: "#1c1c21",       // hover surface
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.12)",
  textPrimary: "#f4f4f5",
  textSecondary: "rgba(244,244,245,0.55)",
  textTertiary: "rgba(244,244,245,0.28)",
  accent: "#d4a853",    // warm champagne — used sparingly
  accentDim: "rgba(212,168,83,0.12)",
  green: "#22c55e",
  fontDisplay: "'Sora', sans-serif",
  fontBody: "'Plus Jakarta Sans', sans-serif",
  fontMono: "'DM Mono', monospace",
  ease: [0.22, 1, 0.36, 1],
};

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; font-size: 16px; }

    body {
      background: ${T.bg0};
      color: ${T.textPrimary};
      font-family: ${T.fontBody};
      font-weight: 300;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    ::selection { background: ${T.accent}; color: #09090b; }

    ::-webkit-scrollbar { width: 1px; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }

    a { color: inherit; text-decoration: none; }

    img { display: block; max-width: 100%; }

    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes breathe { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }

    @media(max-width:680px){
      .hide-mobile { display:none !important; }
      .grid-about { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────────── */
const Label = ({ children, style }) => (
  <p style={{
    fontFamily: T.fontMono, fontSize: "11px", letterSpacing: "0.1em",
    textTransform: "uppercase", color: T.textTertiary,
    ...style,
  }}>{children}</p>
);

const Divider = ({ style }) => (
  <div style={{ height: "1px", background: T.border, ...style }} />
);

const Tag = ({ children }) => (
  <span style={{
    fontFamily: T.fontMono, fontSize: "10px", letterSpacing: "0.06em",
    color: T.textTertiary,
    border: `1px solid ${T.border}`,
    borderRadius: "4px", padding: "3px 8px",
    display: "inline-block",
  }}>{children}</span>
);

/* ─────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────── */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: T.ease }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
        borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        background: scrolled ? "rgba(9,9,11,0.8)" : "transparent",
        transition: "background 0.4s, border-color 0.4s, backdrop-filter 0.4s",
      }}
    >
      <span style={{ fontFamily: T.fontDisplay, fontSize: "14px", fontWeight: 500, letterSpacing: "-0.01em", color: T.textPrimary }}>
        Shivam
      </span>
      <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        {["Work", "About", "Contact"].map(n => (
          <a key={n} href={`#${n.toLowerCase()}`}
            style={{ fontFamily: T.fontMono, fontSize: "11px", letterSpacing: "0.08em", color: T.textTertiary, textTransform: "uppercase", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = T.textSecondary}
            onMouseLeave={e => e.target.style.color = T.textTertiary}
          >{n}</a>
        ))}
      </nav>
    </motion.header>
  );
};

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
const Hero = () => {
  const words = ["Design Engineer.", "Motion Designer.", "Product Builder."];
  const [wi, setWi] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [charI, setCharI] = useState(0);

  useEffect(() => {
    const target = words[wi];
    const speed = deleting ? 30 : 55;
    const timer = setTimeout(() => {
      if (!deleting) {
        if (charI < target.length) {
          setDisplayed(target.slice(0, charI + 1));
          setCharI(c => c + 1);
        } else {
          setTimeout(() => setDeleting(true), 1800);
        }
      } else {
        if (charI > 0) {
          setDisplayed(target.slice(0, charI - 1));
          setCharI(c => c - 1);
        } else {
          setDeleting(false);
          setWi(w => (w + 1) % words.length);
        }
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charI, deleting, wi]);

  const stagger = (i) => ({ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: T.ease } } });

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 40px 80px", maxWidth: "860px" }}>

      {/* Availability */}
      <motion.div variants={stagger(0)} initial="hidden" animate="visible"
        style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "48px" }}
      >
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.green, display: "inline-block", animation: "pulseDot 2s ease-in-out infinite" }} />
        <span style={{ fontFamily: T.fontMono, fontSize: "11px", letterSpacing: "0.08em", color: T.textTertiary, textTransform: "uppercase" }}>Available for full-time roles</span>
      </motion.div>

      {/* Heading */}
      <motion.h1 variants={stagger(1)} initial="hidden" animate="visible"
        style={{ fontFamily: T.fontDisplay, fontSize: "clamp(36px, 6.5vw, 80px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "12px", color: T.textPrimary }}
      >
        I design and build<br />
        <span style={{ color: T.textSecondary }}>
          {displayed}
          <span style={{ animation: "blink 1s step-end infinite", marginLeft: "1px", color: T.accent }}>|</span>
        </span>
      </motion.h1>

      {/* Sub */}
      <motion.p variants={stagger(2)} initial="hidden" animate="visible"
        style={{ fontSize: "clamp(15px, 1.8vw, 18px)", color: T.textSecondary, maxWidth: "520px", lineHeight: 1.75, marginTop: "24px", fontWeight: 300 }}
      >
        7 years of motion design — now in code. I build interfaces where interaction and animation are the same decision.
        Currently shipping <span style={{ color: T.textPrimary, fontWeight: 400 }}>ZINC</span>, a premium fintech app for Android.
      </motion.p>

      {/* CTAs */}
      <motion.div variants={stagger(3)} initial="hidden" animate="visible"
        style={{ display: "flex", gap: "16px", marginTop: "48px", flexWrap: "wrap" }}
      >
        <a href="#zinc" style={{
          fontFamily: T.fontMono, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase",
          padding: "12px 24px", borderRadius: "6px",
          background: T.textPrimary, color: T.bg0,
          transition: "opacity 0.2s",
          fontWeight: 400,
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          View ZINC
        </a>
        <a href="#contact" style={{
          fontFamily: T.fontMono, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase",
          padding: "12px 24px", borderRadius: "6px",
          border: `1px solid ${T.border}`, color: T.textSecondary,
          transition: "border-color 0.2s, color 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.textPrimary; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecondary; }}
        >
          Get in Touch
        </a>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={stagger(4)} initial="hidden" animate="visible"
        style={{ display: "flex", gap: "40px", marginTop: "72px", flexWrap: "wrap" }}
      >
        {[["7 yrs", "Motion Design"], ["React Native", "Primary Stack"], ["Bangalore", "India"]].map(([v, l]) => (
          <div key={l}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "14px", fontWeight: 500, color: T.textPrimary, letterSpacing: "-0.01em" }}>{v}</div>
            <div style={{ fontFamily: T.fontMono, fontSize: "10px", color: T.textTertiary, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "3px" }}>{l}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   ZINC PHONE MOCKUP
───────────────────────────────────────────── */
const SCREENS = ["home", "pay", "rewards"];

const ZincScreen = ({ screen }) => {
  const screens = {
    home: (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2px" }}>
          <div>
            <div style={{ fontFamily: T.fontMono, fontSize: "8px", color: "rgba(244,244,245,0.35)", letterSpacing: "0.06em" }}>GOOD MORNING</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "13px", fontWeight: 500, color: T.textPrimary, marginTop: "1px" }}>Shivam</div>
          </div>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: T.bg3, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "10px", fontWeight: 600, color: T.accent }}>S</div>
          </div>
        </div>

        {/* Credit card */}
        <div style={{
          background: "linear-gradient(135deg, #1a1a1f 0%, #111114 100%)",
          border: `1px solid ${T.border}`,
          borderRadius: "14px", padding: "14px 14px 12px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: T.fontMono, fontSize: "7px", color: "rgba(244,244,245,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Available Credit</div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: "22px", fontWeight: 500, color: T.textPrimary, letterSpacing: "-0.03em", marginTop: "4px" }}>₹1,62,500</div>
            </div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "12px", fontWeight: 600, color: T.accent, letterSpacing: "0.02em" }}>ZINC</div>
          </div>
          <div style={{ marginTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <div style={{ fontFamily: T.fontMono, fontSize: "7px", color: "rgba(244,244,245,0.25)" }}>Used: ₹87,500</div>
              <div style={{ fontFamily: T.fontMono, fontSize: "7px", color: "rgba(244,244,245,0.25)" }}>35%</div>
            </div>
            <div style={{ height: "2px", background: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: "35%" }}
                transition={{ duration: 1.2, delay: 0.4, ease: T.ease }}
                style={{ height: "100%", background: T.accent, borderRadius: "2px" }}
              />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
          {[["↑", "Pay"], ["↓", "Repay"], ["◈", "EMI"], ["⊞", "More"]].map(([ic, lb]) => (
            <div key={lb} style={{
              background: T.bg2, border: `1px solid ${T.border}`,
              borderRadius: "10px", padding: "8px 4px", textAlign: "center",
            }}>
              <div style={{ fontSize: "10px", color: T.textSecondary, marginBottom: "3px" }}>{ic}</div>
              <div style={{ fontFamily: T.fontMono, fontSize: "6.5px", color: T.textTertiary, letterSpacing: "0.04em" }}>{lb}</div>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div style={{ marginTop: "2px" }}>
          <div style={{ fontFamily: T.fontMono, fontSize: "7px", color: T.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Recent</div>
          {[
            { name: "Swiggy", date: "Today", amt: "−₹340", cat: "Food" },
            { name: "Netflix", date: "Yesterday", amt: "−₹649", cat: "Sub" },
          ].map(t => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderTop: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: T.bg3, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: T.fontMono, fontSize: "7px", color: T.textTertiary }}>{t.cat}</div>
                </div>
                <div>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: "9px", fontWeight: 400, color: T.textPrimary }}>{t.name}</div>
                  <div style={{ fontFamily: T.fontMono, fontSize: "7px", color: T.textTertiary }}>{t.date}</div>
                </div>
              </div>
              <div style={{ fontFamily: T.fontMono, fontSize: "9px", color: T.textSecondary }}>{t.amt}</div>
            </div>
          ))}
        </div>
      </div>
    ),

    pay: (
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: "13px", fontWeight: 500, color: T.textPrimary }}>Pay Bill</div>
          <div style={{ fontFamily: T.fontMono, fontSize: "7px", color: T.textTertiary, marginTop: "2px" }}>Outstanding balance</div>
        </div>

        {/* Amount display */}
        <div style={{
          background: T.bg2, border: `1px solid ${T.border}`,
          borderRadius: "14px", padding: "18px 14px", textAlign: "center",
        }}>
          <div style={{ fontFamily: T.fontMono, fontSize: "8px", color: T.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Amount Due</div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: "32px", fontWeight: 500, letterSpacing: "-0.04em", color: T.textPrimary, marginTop: "6px" }}>
            ₹87,500
          </div>
          <div style={{ fontFamily: T.fontMono, fontSize: "7px", color: T.textTertiary, marginTop: "4px" }}>Due Jun 15 · No interest if paid now</div>
        </div>

        {/* Options */}
        {[
          { label: "Pay Full Amount", sub: "₹87,500", highlight: true },
          { label: "Pay Minimum", sub: "₹2,500" },
          { label: "Custom Amount", sub: "Enter manually" },
        ].map(o => (
          <div key={o.label} style={{
            background: o.highlight ? T.accentDim : T.bg2,
            border: `1px solid ${o.highlight ? "rgba(212,168,83,0.2)" : T.border}`,
            borderRadius: "10px", padding: "10px 12px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "9.5px", fontWeight: o.highlight ? 500 : 300, color: o.highlight ? T.accent : T.textSecondary }}>{o.label}</div>
            <div style={{ fontFamily: T.fontMono, fontSize: "8px", color: T.textTertiary }}>{o.sub}</div>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          background: T.textPrimary, borderRadius: "10px",
          padding: "11px", textAlign: "center",
          fontFamily: T.fontDisplay, fontSize: "10px", fontWeight: 500,
          color: T.bg0, letterSpacing: "-0.01em",
        }}>
          Proceed to Pay
        </div>
      </div>
    ),

    rewards: (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: "13px", fontWeight: 500, color: T.textPrimary }}>Rewards</div>
          <div style={{ fontFamily: T.fontMono, fontSize: "7px", color: T.textTertiary, marginTop: "2px" }}>Earned this cycle</div>
        </div>

        {/* Reward total */}
        <div style={{
          background: T.accentDim,
          border: "1px solid rgba(212,168,83,0.2)",
          borderRadius: "14px", padding: "16px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontFamily: T.fontMono, fontSize: "7px", color: "rgba(212,168,83,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Cashback Earned</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "28px", fontWeight: 500, color: T.accent, letterSpacing: "-0.04em", marginTop: "4px" }}>₹1,240</div>
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: "24px", color: "rgba(212,168,83,0.3)" }}>◎</div>
        </div>

        {/* Reward items */}
        {[
          { brand: "Swiggy", pct: "5%", earned: "₹17" },
          { brand: "Amazon", pct: "2%", earned: "₹86" },
          { brand: "BookMyShow", pct: "10%", earned: "₹120" },
        ].map(r => (
          <div key={r.brand} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 0", borderBottom: `1px solid ${T.border}`,
          }}>
            <div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: "9.5px", color: T.textPrimary, fontWeight: 400 }}>{r.brand}</div>
              <div style={{ fontFamily: T.fontMono, fontSize: "7px", color: T.textTertiary }}>{r.pct} cashback</div>
            </div>
            <div style={{ fontFamily: T.fontMono, fontSize: "9px", color: T.accent }}>{r.earned}</div>
          </div>
        ))}

        <div style={{
          background: T.bg2, border: `1px solid ${T.border}`,
          borderRadius: "10px", padding: "10px 12px", textAlign: "center",
          fontFamily: T.fontMono, fontSize: "8px", color: T.textSecondary, letterSpacing: "0.06em",
        }}>
          REDEEM REWARDS →
        </div>
      </div>
    ),
  };
  return screens[screen] || screens.home;
};

const ZincPhone = ({ activeScreen }) => (
  <div style={{
    width: "clamp(190px, 25vw, 255px)",
    aspectRatio: "9/19.5",
    background: T.bg1,
    borderRadius: "36px",
    border: `1px solid ${T.border}`,
    padding: "18px 14px 14px",
    display: "flex", flexDirection: "column",
    boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)`,
    position: "relative", overflow: "hidden",
    animation: "breathe 6s ease-in-out infinite",
  }}>
    {/* Dynamic island */}
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
      <div style={{ width: "70px", height: "10px", background: "#000", borderRadius: "8px" }} />
    </div>

    {/* Status bar */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", padding: "0 2px" }}>
      <span style={{ fontFamily: T.fontMono, fontSize: "8px", color: "rgba(244,244,245,0.3)" }}>9:41</span>
      <div style={{ display: "flex", gap: "3px", alignItems: "flex-end" }}>
        {[3, 2, 3, 4].map((h, i) => <div key={i} style={{ width: "2.5px", height: `${h * 1.2}px`, background: `rgba(244,244,245,${i === 3 ? 0.5 : 0.2})`, borderRadius: "1px" }} />)}
      </div>
    </div>

    {/* Screen content */}
    <div style={{ flex: 1, overflow: "hidden" }}>
      <AnimatePresence mode="wait">
        <motion.div key={activeScreen}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: T.ease }}
        >
          <ZincScreen screen={activeScreen} />
        </motion.div>
      </AnimatePresence>
    </div>

    {/* Home bar */}
    <div style={{ display: "flex", justifyContent: "center", paddingTop: "8px" }}>
      <div style={{ width: "36%", height: "3px", background: "rgba(255,255,255,0.12)", borderRadius: "2px" }} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   FEATURED PROJECT: ZINC HERO
───────────────────────────────────────────── */
const ZincHero = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const [screen, setScreen] = useState("home");

  useEffect(() => {
    const screens = ["home", "pay", "rewards"];
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % screens.length;
      setScreen(screens[i]);
    }, 3400);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="zinc" ref={ref} style={{ padding: "120px 40px", background: T.bg1, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <Label style={{ marginBottom: "48px" }}>Featured Project — 2024–25</Label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "80px", alignItems: "center" }}>

          {/* Left: narrative */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: T.ease }}
            >
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(52px, 8vw, 96px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 0.9, color: T.textPrimary, marginBottom: "24px" }}>
                ZINC
              </h2>
              <p style={{ fontSize: "15px", color: T.textSecondary, lineHeight: 1.75, maxWidth: "400px", marginBottom: "32px" }}>
                A CRED-quality fintech app built from scratch with React Native. Every screen, every interaction, every animation — designed and implemented without templates.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "40px" }}>
                {["React Native", "Reanimated 3", "Lottie", "EAS Build", "TypeScript"].map(t => <Tag key={t}>{t}</Tag>)}
              </div>

              {/* Screen switcher */}
              <div>
                <Label style={{ marginBottom: "12px" }}>Live Preview</Label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["home", "pay", "rewards"].map(s => (
                    <button key={s} onClick={() => setScreen(s)}
                      style={{
                        fontFamily: T.fontMono, fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase",
                        padding: "7px 14px", borderRadius: "5px", cursor: "pointer",
                        border: `1px solid ${screen === s ? T.borderHover : T.border}`,
                        background: screen === s ? T.bg3 : "transparent",
                        color: screen === s ? T.textPrimary : T.textTertiary,
                        transition: "all 0.2s",
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: phone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.15, ease: T.ease }}
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <ZincPhone activeScreen={screen} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   ZINC CASE STUDY
───────────────────────────────────────────── */
const useCountUp = (target, inView, duration = 1400) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return v;
};

const Metric = ({ value, suffix = "", label, inView, delay = 0 }) => {
  const v = useCountUp(value, inView);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: T.ease }}
      style={{ paddingTop: "28px", borderTop: `1px solid ${T.border}` }}
    >
      <div style={{ fontFamily: T.fontDisplay, fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 500, letterSpacing: "-0.04em", color: T.textPrimary, lineHeight: 1 }}>
        {v}{suffix}
      </div>
      <div style={{ fontFamily: T.fontMono, fontSize: "10px", color: T.textTertiary, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: "8px" }}>
        {label}
      </div>
    </motion.div>
  );
};

const CaseStudy = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const pillars = [
    {
      num: "01",
      title: "Motion System",
      body: "One easing curve — cubic-bezier(0.22, 1, 0.36, 1) — applied consistently across every transition. Motion as a design language, not decoration.",
      detail: "Reanimated 3 · Shared values · Layout animations",
    },
    {
      num: "02",
      title: "Onboarding Flow",
      body: "Phone number entry with keyboard-sync animation. OTP verification with demo code '1234'. Location + notification permission handled with trust-first UX.",
      detail: "KeyboardAvoidingView · Haptic feedback · Permission flow",
    },
    {
      num: "03",
      title: "Home Dashboard",
      body: "Count-up credit limit, live usage bar, quick actions, and transaction history. Designed to feel like a real financial tool, not an app demo.",
      detail: "withDelay · withTiming · Easing.bezier",
    },
    {
      num: "04",
      title: "Reward Modal",
      body: "Full-screen reward reveal with Lottie confetti, card animation, and spring physics on dismiss. Every interaction earns its motion.",
      detail: "Lottie · react-native-confetti · Spring config",
    },
    {
      num: "05",
      title: "Design System",
      body: "Token-based color palette, typography scale, spacing grid, and component library built before the first screen. Shipped, not prototyped.",
      detail: "Design tokens · Reusable components · Theme provider",
    },
    {
      num: "06",
      title: "Android Release",
      body: "EAS Build pipeline configured for Play Store submission. Real APK, real device testing, real product.",
      detail: "EAS Build · Play Console · Expo",
    },
  ];

  return (
    <section ref={ref} style={{ padding: "120px 40px", background: T.bg0, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <Label style={{ marginBottom: "48px" }}>ZINC — Case Study</Label>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "24px", marginBottom: "80px" }}>
          <Metric value={8} suffix="+" label="Screens Built" inView={inView} delay={0} />
          <Metric value={60} suffix=" fps" label="Animation Target" inView={inView} delay={0.08} />
          <Metric value={12} suffix="+" label="Components" inView={inView} delay={0.16} />
          <Metric value={100} suffix="%" label="Custom Code" inView={inView} delay={0.24} />
        </div>

        {/* Challenge / Approach */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", marginBottom: "80px" }}
          className="grid-about">
          {[
            {
              label: "Challenge",
              text: "Most portfolio apps look polished but feel hollow. The goal was to build something that behaves like a real product — with real edge cases, real motion constraints, and real UX decisions under pressure.",
            },
            {
              label: "Approach",
              text: "Motion design background applied to product engineering. Every animation decision justified by UX impact. Architecture designed for scale: state from parent, reusable components, no animation during reflows.",
            },
          ].map(({ label, text }) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: T.ease }}
            >
              <Label style={{ marginBottom: "14px" }}>{label}</Label>
              <p style={{ fontSize: "14px", lineHeight: 1.8, color: T.textSecondary }}>{text}</p>
            </motion.div>
          ))}
        </div>

        <Divider style={{ marginBottom: "64px" }} />

        {/* Build pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: T.border }}>
          {pillars.map(({ num, title, body, detail }, i) => (
            <motion.div key={num}
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.05 * i, ease: T.ease }}
              style={{
                background: T.bg1, padding: "32px 28px",
                transition: "background 0.25s",
                cursor: "default",
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg2}
              onMouseLeave={e => e.currentTarget.style.background = T.bg1}
            >
              <Label style={{ marginBottom: "16px" }}>{num}</Label>
              <div style={{ fontFamily: T.fontDisplay, fontSize: "15px", fontWeight: 500, color: T.textPrimary, marginBottom: "10px", letterSpacing: "-0.01em" }}>{title}</div>
              <p style={{ fontSize: "13px", lineHeight: 1.75, color: T.textSecondary, marginBottom: "16px" }}>{body}</p>
              <div style={{ fontFamily: T.fontMono, fontSize: "10px", color: T.textTertiary, letterSpacing: "0.04em" }}>{detail}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   SELECTED MOTION WORK
───────────────────────────────────────────── */
const MotionWork = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const works = [
    { index: "01", title: "Brand Identity Motion", client: "Fintech Startup", type: "Motion Design", year: "2024" },
    { index: "02", title: "Product Launch Film", client: "B2B SaaS", type: "Animation Direction", year: "2023" },
    { index: "03", title: "UI Animation System", client: "Mobile App", type: "Motion System", year: "2023" },
    { index: "04", title: "Explainer Series (×6)", client: "EdTech", type: "Motion Design", year: "2022" },
    { index: "05", title: "Title Sequence", client: "Documentary", type: "After Effects", year: "2022" },
  ];

  return (
    <section id="work" ref={ref} style={{ padding: "120px 40px", background: T.bg1, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
          <Label>Selected Motion Work</Label>
          <span style={{ fontFamily: T.fontMono, fontSize: "10px", color: T.textTertiary, letterSpacing: "0.06em" }}>2018 — 2024 · 7 years</span>
        </div>

        <div>
          {works.map((w, i) => (
            <motion.div key={w.index}
              initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.07, ease: T.ease }}
              style={{
                display: "grid", gridTemplateColumns: "36px 1fr auto auto",
                alignItems: "center", gap: "20px",
                padding: "20px 12px",
                borderBottom: `1px solid ${T.border}`,
                borderRadius: "6px",
                transition: "background 0.2s",
                cursor: "default",
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg2}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Label>{w.index}</Label>
              <div style={{ fontFamily: T.fontDisplay, fontSize: "15px", fontWeight: 400, color: T.textPrimary, letterSpacing: "-0.01em" }}>{w.title}</div>
              <div className="hide-mobile" style={{ fontFamily: T.fontMono, fontSize: "10px", color: T.textTertiary, letterSpacing: "0.06em" }}>{w.type}</div>
              <div style={{ fontFamily: T.fontMono, fontSize: "10px", color: T.textTertiary }}>{w.year}</div>
            </motion.div>
          ))}
        </div>

        {/* Tools */}
        <motion.div
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: T.ease }}
          style={{ marginTop: "56px", display: "flex", flexWrap: "wrap", gap: "8px" }}
        >
          {["After Effects", "Cinema 4D", "Lottie", "Premiere Pro", "Illustrator", "Figma", "React Native", "Framer Motion", "GSAP"].map(t => (
            <span key={t} style={{
              fontFamily: T.fontMono, fontSize: "10px", letterSpacing: "0.05em",
              color: T.textTertiary, padding: "6px 12px",
              border: `1px solid ${T.border}`, borderRadius: "4px",
            }}>{t}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   ABOUT
───────────────────────────────────────────── */
const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section id="about" ref={ref} style={{ padding: "120px 40px", background: T.bg0, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <Label style={{ marginBottom: "48px" }}>About</Label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px" }} className="grid-about">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: T.ease }}
          >
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.2, color: T.textPrimary, marginBottom: "28px" }}>
              The gap between design and engineering is where good products live.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {[
                "7 years as a motion designer taught me that the best interfaces feel inevitable. Every transition, every micro-interaction is a UX decision, not a visual one. I'm now coding what I used to hand off.",
                "I care about the 60ms between tap and response. The spring physics on a modal dismiss. The count-up animation that makes a number feel real. These are engineering problems that look like design problems.",
                "Currently targeting Design Engineer and Creative Frontend roles at companies building products where craft is a competitive advantage.",
              ].map((p, i) => (
                <p key={i} style={{ fontSize: "14px", lineHeight: 1.85, color: T.textSecondary }}>{p}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: T.ease }}
            style={{ paddingTop: "4px" }}
          >
            {[
              ["Role", "Design Engineer · Creative Frontend"],
              ["Currently Building", "ZINC — React Native Fintech App"],
              ["Based", "Bangalore, India"],
              ["Open To", "Full-time · Contract"],
              ["Target Companies", "CRED · Razorpay · Groww · Zepto"],
              ["Stack", "React Native · Reanimated 3 · TypeScript · Framer"],
              ["Design Tools", "Figma · After Effects · Illustrator · C4D"],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between",
                padding: "16px 0", borderBottom: `1px solid ${T.border}`,
                gap: "24px", flexWrap: "wrap",
              }}>
                <span style={{ fontFamily: T.fontMono, fontSize: "10px", color: T.textTertiary, letterSpacing: "0.07em", textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
                <span style={{ fontFamily: T.fontBody, fontSize: "13px", color: T.textSecondary, textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   CONTACT
───────────────────────────────────────────── */
const Contact = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section id="contact" ref={ref} style={{ padding: "120px 40px 80px", background: T.bg1, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <Label style={{ marginBottom: "32px" }}>Contact</Label>

        <motion.h2
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: T.ease }}
          style={{ fontFamily: T.fontDisplay, fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.1, color: T.textPrimary, marginBottom: "20px" }}
        >
          Open to Design Engineer and Creative Frontend roles.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: T.ease }}
          style={{ fontSize: "14px", lineHeight: 1.8, color: T.textSecondary, marginBottom: "48px" }}
        >
          If you're building a product where motion, craft, and interaction design matter — let's talk.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: T.ease }}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
        >
          <a href="mailto:hello@shivam.design" style={{
            fontFamily: T.fontMono, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "13px 28px", borderRadius: "6px",
            background: T.textPrimary, color: T.bg0,
            transition: "opacity 0.2s", fontWeight: 400,
            display: "inline-block",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Email Me
          </a>

          {[["LinkedIn", "#"], ["GitHub", "#"], ["Resume ↗", "#"]].map(([label, href]) => (
            <a key={label} href={href} style={{
              fontFamily: T.fontMono, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "13px 20px", borderRadius: "6px",
              border: `1px solid ${T.border}`, color: T.textTertiary,
              display: "inline-block", transition: "border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.textSecondary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textTertiary; }}
            >{label}</a>
          ))}
        </motion.div>

        <Divider style={{ marginTop: "80px", marginBottom: "32px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontFamily: T.fontDisplay, fontSize: "13px", fontWeight: 500, color: T.textTertiary, letterSpacing: "-0.01em" }}>Shivam</span>
          <span style={{ fontFamily: T.fontMono, fontSize: "10px", color: T.textTertiary, letterSpacing: "0.07em" }}>Design Engineer · Bangalore · 2025</span>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   APP
───────────────────────────────────────────── */
export default function Portfolio() {
  return (
    <>
      <G />
      <Nav />
      <main>
        <Hero />
        <ZincHero />
        <CaseStudy />
        <MotionWork />
        <About />
        <Contact />
      </main>
    </>
  );
}
