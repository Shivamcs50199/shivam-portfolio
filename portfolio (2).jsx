import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS — CLARITY FIRST
   Rule: nothing important below 70% opacity.
   Labels: 75%. Body: 85%. Primary: 100%.
   Borders: visible, not ghost.
═══════════════════════════════════════════════════════ */
const C = {
  bg:       "#09090b",
  surface:  "#111114",
  raised:   "#18181c",
  hover:    "#202026",
  border:   "rgba(255,255,255,0.12)",
  borderHi: "rgba(255,255,255,0.22)",
  text:     "#f0f0f0",        // primary — 100%
  textSub:  "#a8a8b3",        // body copy — clearly readable
  textMeta: "#72728a",        // metadata — still readable
  accent:   "#d4a853",
  green:    "#4ade80",
  ease:     [0.22, 1, 0.36, 1],
};

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════ */
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
    button { font-family: inherit; }

    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.5; transform: scale(0.75); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .two-col { grid-template-columns: 1fr !important; }
      .hide-sm  { display: none !important; }
      .ph-wrap  { justify-content: center !important; }
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════
   SHARED ATOMS
═══════════════════════════════════════════════════════ */
const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: "'DM Mono', monospace",
    fontSize: "12px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: C.textMeta,
    marginBottom: "20px",
  }}>{children}</p>
);

const Divider = ({ style }) => (
  <div style={{ height: "1px", background: C.border, ...style }} />
);

/* Primary CTA button */
const BtnPrimary = ({ children, href, onClick, style }) => {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500,
    padding: "14px 32px", borderRadius: "8px",
    background: C.text, color: "#09090b",
    cursor: "pointer", border: "none",
    transition: "opacity 0.2s",
    ...style,
  };
  if (href) return <a href={href} style={base}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
  >{children}</a>;
  return <button onClick={onClick} style={base}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
  >{children}</button>;
};

/* Secondary outlined button */
const BtnOutline = ({ children, href, onClick, target, style }) => {
  const [hov, setHov] = useState(false);
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 400,
    padding: "13px 28px", borderRadius: "8px",
    border: `1.5px solid ${hov ? C.borderHi : C.border}`,
    color: hov ? C.text : C.textSub,
    background: "transparent",
    cursor: "pointer", transition: "all 0.2s",
    ...style,
  };
  const props = { style: base, onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false) };
  if (href) return <a href={href} target={target} rel="noopener noreferrer" {...props}>{children}</a>;
  return <button onClick={onClick} {...props}>{children}</button>;
};

/* Tab button for ZINC switcher */
const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    fontFamily: "'DM Mono', monospace",
    fontSize: "13px", letterSpacing: "0.05em",
    padding: "10px 22px", borderRadius: "6px",
    border: `1.5px solid ${active ? C.borderHi : C.border}`,
    background: active ? C.raised : "transparent",
    color: active ? C.text : C.textSub,
    cursor: "pointer", transition: "all 0.2s",
    fontWeight: active ? "500" : "400",
  }}>{label}</button>
);

/* Tech chip */
const Chip = ({ children }) => (
  <span style={{
    fontFamily: "'DM Mono', monospace", fontSize: "12px", letterSpacing: "0.04em",
    color: C.textSub, border: `1.5px solid ${C.border}`,
    borderRadius: "5px", padding: "5px 12px", display: "inline-block",
  }}>{children}</span>
);

const ease = C.ease;
const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease } },
});

/* ═══════════════════════════════════════════════════════
   TYPEWRITER
═══════════════════════════════════════════════════════ */
const useTypewriter = (words) => {
  const [wi, setWi]   = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  const [ci, setCi]   = useState(0);
  useEffect(() => {
    const word  = words[wi];
    const speed = del ? 30 : 65;
    const t = setTimeout(() => {
      if (!del) {
        if (ci < word.length) { setText(word.slice(0, ci + 1)); setCi(c => c + 1); }
        else setTimeout(() => setDel(true), 1900);
      } else {
        if (ci > 0) { setText(word.slice(0, ci - 1)); setCi(c => c - 1); }
        else { setDel(false); setWi(w => (w + 1) % words.length); }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [ci, del, wi]);
  return text;
};

/* ═══════════════════════════════════════════════════════
   ZINC PHONE — real video inside real phone frame
═══════════════════════════════════════════════════════ */
const ZincPhone = ({ activeTab }) => {
  const ref = useRef(null);
  const prev = useRef(null);

  const src = {
    feature: "/videos/Feature.mp4",
    home:    "/videos/Home.mp4",
    rewards: "/videos/Rewards.mp4",
  };

  useEffect(() => {
    if (!ref.current || prev.current === activeTab) return;
    prev.current = activeTab;
    const v = ref.current;
    v.style.opacity = "0";
    setTimeout(() => {
      v.src = src[activeTab];
      v.load();
      v.play().catch(() => {});
      v.style.opacity = "1";
    }, 280);
  }, [activeTab]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.src = src[activeTab];
    ref.current.play().catch(() => {});
  }, []);

  return (
    /* Phone shell */
    <div style={{
      width: "clamp(240px, 28vw, 300px)",
      aspectRatio: "9/19.5",
      background: "#0a0a0d",
      borderRadius: "40px",
      border: `1.5px solid ${C.border}`,
      overflow: "hidden",
      position: "relative",
      boxShadow: "0 48px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
    }}>
      {/* Dynamic island */}
      <div style={{
        position: "absolute", top: "16px", left: "50%",
        transform: "translateX(-50%)",
        width: "76px", height: "10px",
        background: "#000", borderRadius: "8px", zIndex: 10,
      }} />

      <video ref={ref} autoPlay muted loop playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.28s ease" }}
      />

      {/* Home bar */}
      <div style={{
        position: "absolute", bottom: "12px", left: 0, right: 0,
        display: "flex", justifyContent: "center", zIndex: 10, pointerEvents: "none",
      }}>
        <div style={{ width: "38%", height: "4px", background: "rgba(255,255,255,0.18)", borderRadius: "2px" }} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   HLS VIDEO (motion work)
═══════════════════════════════════════════════════════ */
const HLSVideo = ({ src, style, autoPlay = true, loop = true, muted = true, controls = false }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !src) return;
    const v = ref.current;
    const load = async () => {
      if (v.canPlayType("application/vnd.apple.mpegurl")) {
        v.src = src; if (autoPlay) v.play().catch(() => {}); return;
      }
      if (!window.Hls) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.12/hls.min.js";
          s.onload = res; s.onerror = rej; document.head.appendChild(s);
        });
      }
      if (window.Hls?.isSupported()) {
        const hls = new window.Hls({ enableWorker: false });
        hls.loadSource(src); hls.attachMedia(v);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => { if (autoPlay) v.play().catch(() => {}); });
        v._hls = hls;
      }
    };
    load();
    return () => { if (v._hls) { v._hls.destroy(); v._hls = null; } };
  }, [src]);
  return <video ref={ref} muted={muted} loop={loop} playsInline controls={controls} style={style} />;
};

/* ═══════════════════════════════════════════════════════
   LIGHTBOX
═══════════════════════════════════════════════════════ */
const Lightbox = ({ video, onClose }) => {
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }} onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.93)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "32px",
      }}
    >
      <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
        transition={{ duration: 0.28, ease }}
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "960px", borderRadius: "12px", overflow: "hidden", position: "relative" }}
      >
        <HLSVideo src={video.src} autoPlay loop muted={false} controls
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
        />
        <button onClick={onClose} style={{
          position: "absolute", top: "14px", right: "14px",
          background: "rgba(0,0,0,0.7)", border: `1px solid ${C.border}`,
          color: C.textSub, fontFamily: "'DM Mono', monospace", fontSize: "11px",
          letterSpacing: "0.08em", padding: "6px 14px", borderRadius: "4px", cursor: "pointer",
        }}>ESC / CLOSE</button>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════ */
const Nav = ({ setPage }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const linkStyle = {
    fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 400,
    color: C.textSub, transition: "color 0.2s", cursor: "pointer",
    background: "none", border: "none", padding: 0,
  };

  return (
    <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
        height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        background: scrolled ? "rgba(9,9,11,0.88)" : "transparent",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "background 0.35s, border-color 0.35s",
      }}
    >
      <a href="#top" style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: 600, letterSpacing: "-0.02em", color: C.text }}>
        Shivam
      </a>
      <nav style={{ display: "flex", gap: "36px", alignItems: "center" }}>
        {[["#zinc","ZINC"], ["#motion","Motion Work"], ["#about","About"], ["#contact","Contact"]].map(([href, label]) => (
          label === "Motion Work"
            ? <button key={label} onClick={() => { document.getElementById("motion")?.scrollIntoView({ behavior: "smooth" }); }}
                style={linkStyle}
                onMouseEnter={e => e.target.style.color = C.text}
                onMouseLeave={e => e.target.style.color = C.textSub}
              >{label}</button>
            : <a key={label} href={href} style={linkStyle}
                onMouseEnter={e => e.target.style.color = C.text}
                onMouseLeave={e => e.target.style.color = C.textSub}
              >{label}</a>
        ))}
      </nav>
    </motion.header>
  );
};

/* ═══════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════ */
const Hero = () => {
  const typed = useTypewriter(["Design Engineer.", "Motion Designer.", "Product Builder."]);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="top" ref={ref} style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "120px 48px 80px",
      maxWidth: "1000px",
    }}>
      {/* Availability */}
      <motion.div variants={fadeUp(0)} initial="hidden" animate={inView ? "visible" : "hidden"}
        style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "44px" }}
      >
        <span style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: C.green, display: "inline-block",
          animation: "pulseDot 2.4s ease-in-out infinite",
        }} />
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: "15px",
          color: C.textSub, fontWeight: 400,
        }}>
          Available for full-time roles · Bangalore
        </span>
      </motion.div>

      {/* Main heading */}
      <motion.h1 variants={fadeUp(0.07)} initial="hidden" animate={inView ? "visible" : "hidden"}
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "clamp(48px, 8vw, 96px)",
          fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.0,
          color: C.text, marginBottom: "0",
        }}
      >I design and build</motion.h1>

      {/* Typewriter line */}
      <motion.div variants={fadeUp(0.12)} initial="hidden" animate={inView ? "visible" : "hidden"}
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "clamp(48px, 8vw, 96px)",
          fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.0,
          color: C.textSub, marginBottom: "36px", minHeight: "1.05em",
        }}
      >
        {typed}
        <span style={{ animation: "blink 1s step-end infinite", color: C.accent, marginLeft: "3px" }}>|</span>
      </motion.div>

      {/* Body */}
      <motion.p variants={fadeUp(0.17)} initial="hidden" animate={inView ? "visible" : "hidden"}
        style={{ fontSize: "19px", color: C.textSub, maxWidth: "560px", lineHeight: 1.75, fontWeight: 400 }}
      >
        7 years of motion design — now shipping in code. I build interfaces where
        interaction and animation are the same decision. Currently shipping{" "}
        <span style={{ color: C.text, fontWeight: 500 }}>ZINC</span>,
        a premium fintech app for Android.
      </motion.p>

      {/* CTAs */}
      <motion.div variants={fadeUp(0.22)} initial="hidden" animate={inView ? "visible" : "hidden"}
        style={{ display: "flex", gap: "14px", marginTop: "48px", flexWrap: "wrap" }}
      >
        <BtnPrimary href="#zinc">View ZINC →</BtnPrimary>
        <BtnOutline href="#contact">Get in Touch</BtnOutline>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp(0.27)} initial="hidden" animate={inView ? "visible" : "hidden"}
        style={{ display: "flex", gap: "56px", marginTop: "72px", flexWrap: "wrap" }}
      >
        {[["7 yrs", "Motion Design"], ["React Native", "Primary Stack"], ["Bangalore", "India"]].map(([v, l]) => (
          <div key={l}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "16px", fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>{v}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: C.textMeta, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: "4px" }}>{l}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   ZINC SECTION
═══════════════════════════════════════════════════════ */
const ZincSection = () => {
  const [tab, setTab] = useState("feature");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const tabs = [
    { id: "feature", label: "Feature",  desc: "Subscription & spending leak detector — the core product value proposition." },
    { id: "home",    label: "Home",     desc: "Dashboard showing credit overview, usage bar, and recent transactions." },
    { id: "rewards", label: "Rewards",  desc: "Cashback reveal with Lottie confetti animation and animated count-up." },
  ];

  return (
    <section id="zinc" ref={ref} style={{ padding: "120px 48px", background: C.surface, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>

        <motion.div variants={fadeUp(0)} initial="hidden" animate={inView ? "visible" : "hidden"}>
          <SectionLabel>Featured Project — 2024–25</SectionLabel>
        </motion.div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "80px",
          alignItems: "start",
        }} className="two-col">

          {/* Left column */}
          <motion.div variants={fadeUp(0.06)} initial="hidden" animate={inView ? "visible" : "hidden"}>

            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(72px, 11vw, 128px)",
              fontWeight: 600, letterSpacing: "-0.05em",
              lineHeight: 0.85, color: C.text, marginBottom: "32px",
            }}>ZINC</h2>

            <p style={{ fontSize: "18px", lineHeight: 1.8, color: C.textSub, maxWidth: "500px", marginBottom: "32px" }}>
              A CRED-quality fintech app built from scratch with React Native.
              Every screen designed, every animation implemented, every edge case handled.
              This is not a prototype — it's a real Android app.
            </p>

            {/* Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "52px" }}>
              {["React Native", "Reanimated 3", "Lottie", "TypeScript", "EAS Build", "Firebase"].map(t => <Chip key={t}>{t}</Chip>)}
            </div>

            {/* Tab switcher label */}
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: C.textMeta, fontWeight: 400, marginBottom: "14px" }}>
              Preview a screen:
            </p>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
              {tabs.map(t => <TabBtn key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />)}
            </div>

            {/* Tab description */}
            <AnimatePresence mode="wait">
              <motion.p key={tab}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.22 }}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: C.textSub, lineHeight: 1.65, maxWidth: "420px" }}
              >
                {tabs.find(t => t.id === tab)?.desc}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Right column: phone */}
          <motion.div variants={fadeUp(0.1)} initial="hidden" animate={inView ? "visible" : "hidden"}
            className="ph-wrap"
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <ZincPhone activeTab={tab} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   CASE STUDY
═══════════════════════════════════════════════════════ */
const CaseStudy = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const highlights = [
    { label: "Problem",        body: "Most fintech apps hide your spending leaks across multiple bank statements. ZINC surfaces recurring payments automatically by analysing PDF uploads." },
    { label: "Approach",       body: "Motion design principles applied to product engineering — every animation decision justified by UX impact, not aesthetics. Form follows function." },
    { label: "Motion System",  body: "One easing curve across all transitions: cubic-bezier(0.22, 1, 0.36, 1). Consistent, intentional motion used as a design language throughout the app." },
    { label: "Implementation", body: "React Native with Reanimated 3 for 60fps performance. Firebase phone auth, Gemini API for PDF analysis, EAS Build for Play Store submission." },
  ];

  return (
    <section ref={ref} style={{ padding: "120px 48px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>

        {/* Header row */}
        <motion.div variants={fadeUp(0)} initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "56px", flexWrap: "wrap", gap: "24px" }}
        >
          <div>
            <SectionLabel>ZINC — Case Study</SectionLabel>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, color: C.text, maxWidth: "540px" }}>
              From motion designer to product engineer — designed, built, and shipped.
            </h2>
          </div>
          <BtnOutline href="https://www.notion.so/Case-Study-Zinc-3726a866524e808797b8de851bd64974" target="_blank" style={{ whiteSpace: "nowrap", alignSelf: "flex-start" }}>
            Read Full Case Study ↗
          </BtnOutline>
        </motion.div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1px", background: C.border }}>
          {highlights.map(({ label, body }, i) => (
            <motion.div key={label}
              variants={fadeUp(0.05 * i)} initial="hidden" animate={inView ? "visible" : "hidden"}
              style={{ background: C.surface, padding: "36px 32px", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.raised}
              onMouseLeave={e => e.currentTarget.style.background = C.surface}
            >
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: C.textMeta, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>{label}</p>
              <p style={{ fontSize: "15px", lineHeight: 1.8, color: C.textSub }}>{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   MOTION WORK — inline section (scroll to it naturally)
═══════════════════════════════════════════════════════ */
const M1 = `#EXTM3U
#EXT-X-TARGETDURATION:7
#EXT-X-PLAYLIST-TYPE:VOD
#EXTINF:6,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-1.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-2.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-3.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-4.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-5.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-6.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-7.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-8.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-9.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-10.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-11.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-12.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:6,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-13.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-14.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-15.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-16.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-17.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-18.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-19.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-20.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-21.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-22.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-23.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:1,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-24.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXT-X-ENDLIST`;

const useBlobUrl = (m3u8) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!m3u8) return;
    const blob = new Blob([m3u8], { type: "application/vnd.apple.mpegurl" });
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, []);
  return url;
};

const MOTION_VIDEOS = [
  { id: 1, title: "Motion Piece 01", type: "Motion Design", m3u8: M1 },
  { id: 2, title: "Motion Piece 02", type: "Motion Design", m3u8: null },
  { id: 3, title: "Motion Piece 03", type: "Animation",     m3u8: null },
  { id: 4, title: "Motion Piece 04", type: "Motion Design", m3u8: null },
];

const MotionCard = ({ video, onOpen }) => {
  const blobUrl = useBlobUrl(video.m3u8);
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.6, ease }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => blobUrl && onOpen({ src: blobUrl, title: video.title })}
      style={{
        background: C.surface, border: `1.5px solid ${hov ? C.borderHi : C.border}`,
        borderRadius: "10px", overflow: "hidden",
        cursor: blobUrl ? "pointer" : "default",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition: "border-color 0.2s, transform 0.25s",
      }}
    >
      {/* Video thumbnail */}
      <div style={{ aspectRatio: "16/9", background: C.raised, position: "relative", overflow: "hidden" }}>
        {blobUrl
          ? <HLSVideo src={blobUrl} autoPlay loop muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "12px", color: C.textMeta }}>Video {video.id}</span>
            </div>
        }
        {/* Play overlay */}
        {blobUrl && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: hov ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
            transition: "background 0.2s",
          }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center",
              opacity: hov ? 1 : 0, transition: "opacity 0.2s",
            }}>
              <span style={{ fontSize: "18px", marginLeft: "3px" }}>▶</span>
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div style={{ padding: "18px 20px" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: 500, color: C.text, marginBottom: "5px" }}>{video.title}</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: C.textMeta, letterSpacing: "0.05em" }}>{video.type}</div>
      </div>
    </motion.div>
  );
};

const MotionWork = () => {
  const [lightbox, setLightbox] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section id="motion" ref={ref} style={{ padding: "120px 48px", background: C.surface, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>

        <motion.div variants={fadeUp(0)} initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "56px", flexWrap: "wrap", gap: "24px" }}
        >
          <div>
            <SectionLabel>Motion Work</SectionLabel>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, color: C.text }}>
              7 years of making things move.
            </h2>
          </div>
          <BtnOutline href="https://www.behance.net/search/users/shivam%20kumar" target="_blank">
            View on Behance ↗
          </BtnOutline>
        </motion.div>

        <motion.div variants={fadeUp(0.06)} initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}
        >
          {MOTION_VIDEOS.map(v => <MotionCard key={v.id} video={v} onOpen={setLightbox} />)}
        </motion.div>
      </div>

      <AnimatePresence>
        {lightbox && <Lightbox video={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   ABOUT
═══════════════════════════════════════════════════════ */
const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section id="about" ref={ref} style={{ padding: "120px 48px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <SectionLabel>About</SectionLabel>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px" }} className="two-col">

          <motion.div variants={fadeUp(0)} initial="hidden" animate={inView ? "visible" : "hidden"}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(22px, 2.8vw, 34px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.2, color: C.text, marginBottom: "32px" }}>
              The gap between design and engineering is where good products are built.
            </h2>
            {[
              "7 years as a motion designer taught me that the best interfaces feel inevitable — not designed. Every transition is a UX decision, not a visual one. I'm now coding what I used to hand off.",
              "I care about the 60ms between tap and response. The spring physics on a modal. The count-up animation that makes a number feel real. These are engineering problems that look like design problems.",
              "Targeting Design Engineer and Creative Frontend roles at companies where craft is a product differentiator — CRED, Razorpay, Groww, Zepto.",
            ].map((p, i) => (
              <p key={i} style={{ fontSize: "16px", lineHeight: 1.85, color: C.textSub, marginBottom: "18px" }}>{p}</p>
            ))}
          </motion.div>

          <motion.div variants={fadeUp(0.08)} initial="hidden" animate={inView ? "visible" : "hidden"}>
            {[
              ["Currently Building",  "ZINC — React Native Fintech App"],
              ["Role",                "Design Engineer · Creative Frontend"],
              ["Based",               "Bangalore, India"],
              ["Open To",             "Full-time · Contract"],
              ["Stack",               "React Native · Reanimated 3 · TypeScript"],
              ["Design Tools",        "After Effects · Figma · Illustrator · C4D"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "18px 0", borderBottom: `1px solid ${C.border}`, gap: "24px", flexWrap: "wrap", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: C.textMeta, letterSpacing: "0.07em", textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: "15px", color: C.textSub, textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   CONTACT
═══════════════════════════════════════════════════════ */
const Contact = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section id="contact" ref={ref} style={{ padding: "140px 48px 100px", background: C.surface, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: "740px", margin: "0 auto" }}>
        <SectionLabel>Contact</SectionLabel>

        <motion.h2 variants={fadeUp(0.04)} initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05, color: C.text, marginBottom: "24px" }}
        >
          Open to Design Engineer and Creative Frontend roles.
        </motion.h2>

        <motion.p variants={fadeUp(0.08)} initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ fontSize: "18px", lineHeight: 1.8, color: C.textSub, marginBottom: "52px" }}
        >
          Building products where motion, craft, and interaction design matter — let's talk.
        </motion.p>

        <motion.div variants={fadeUp(0.12)} initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}
        >
          <BtnPrimary href="mailto:contrastyouneed@gmail.com">
            contrastyouneed@gmail.com
          </BtnPrimary>
          <BtnOutline href="https://github.com/shivamcs50199" target="_blank">GitHub ↗</BtnOutline>
          <BtnOutline href="https://www.behance.net/search/users/shivam%20kumar" target="_blank">Behance ↗</BtnOutline>
        </motion.div>

        <Divider style={{ marginTop: "80px", marginBottom: "32px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "14px", fontWeight: 500, color: C.textMeta }}>Shivam · Design Engineer · Bangalore · 2025</span>
          <a href="https://www.notion.so/Privacy-Policy-3776a866524e80ff92b7ce6226087d60" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: C.textMeta, letterSpacing: "0.07em", textTransform: "uppercase", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = C.textSub}
            onMouseLeave={e => e.target.style.color = C.textMeta}
          >Privacy Policy</a>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════ */
export default function App() {
  return (
    <>
      <GlobalStyles />
      <Nav setPage={() => {}} />
      <main>
        <Hero />
        <ZincSection />
        <CaseStudy />
        <MotionWork />
        <About />
        <Contact />
      </main>
    </>
  );
}
