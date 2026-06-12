import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

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

    /* ── Nav ── */
    .nav-links  { display: flex !important; }
    .mob-menu   { display: none !important; }

    /* ── Layout helpers ── */
    .zinc-grid  { grid-template-columns: 1fr 290px; }
    .two-col    { grid-template-columns: 1fr 1fr; }

    /* ── Section padding ── */
    .section-pad { padding: 120px 48px; }
    .hero-pad    { padding: 120px 48px 80px; }

    /* ═══ TABLET (≤960px) ═══ */
    @media (max-width: 960px) {
      .zinc-grid  { grid-template-columns: 1fr !important; }
      .two-col    { grid-template-columns: 1fr !important; }
      .nav-links  { display: none !important; }
      .mob-menu   { display: flex !important; }
      .section-pad { padding: 80px 32px !important; }
      .hero-pad    { padding: 100px 32px 60px !important; }
      .zinc-phone-col { justify-content: flex-start !important; }
      .stats-row { gap: 28px !important; }
      .contact-footer { flex-direction: column !important; align-items: flex-start !important; }
      .resume-row { flex-direction: column !important; gap: 24px !important; align-items: flex-start !important; }
    }

    /* ═══ MOBILE (≤600px) ═══ */
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

    /* ═══ SMALL LAPTOP (961px–1100px) ═══ */
    @media (min-width: 961px) and (max-width: 1100px) {
      .section-pad { padding: 100px 40px !important; }
      .hero-pad    { padding: 110px 40px 70px !important; }
      .zinc-grid   { gap: 40px !important; }
    }
  `}</style>
);

const SectionLabel = ({ children, style }) => (
  <p style={{
    fontFamily: "'DM Mono',monospace",
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: C.textMeta,
    marginBottom: "16px",
    ...style,
  }}>{children}</p>
);

const Divider = ({ style }) => (
  <div style={{ height: "1px", background: C.border, ...style }} />
);

const BtnPrimary = ({ children, href, onClick, download, style }) => {
  const s = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Inter',sans-serif", fontSize: "15px", fontWeight: 500,
    padding: "13px 28px", borderRadius: "8px",
    background: C.text, color: "#09090b",
    border: "none", transition: "opacity 0.2s",
    whiteSpace: "nowrap", ...style,
  };
  const hov = e => e.currentTarget.style.opacity = "0.85";
  const lv  = e => e.currentTarget.style.opacity = "1";
  if (href) return (
    <a href={href} download={download} target={download ? undefined : "_blank"}
      rel="noopener noreferrer" style={s} onMouseEnter={hov} onMouseLeave={lv}>
      {children}
    </a>
  );
  return <button onClick={onClick} style={s} onMouseEnter={hov} onMouseLeave={lv}>{children}</button>;
};

const BtnOutline = ({ children, href, onClick, target, download, style }) => {
  const [hov, setHov] = useState(false);
  const s = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Inter',sans-serif", fontSize: "15px", fontWeight: 400,
    padding: "12px 24px", borderRadius: "8px",
    border: `1.5px solid ${hov ? C.borderHi : C.border}`,
    color: hov ? C.text : C.textSub,
    background: "transparent", transition: "all 0.2s",
    whiteSpace: "nowrap", ...style,
  };
  const p = { style: s, onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false) };
  if (href) return <a href={href} download={download} target={target} rel="noopener noreferrer" {...p}>{children}</a>;
  return <button onClick={onClick} {...p}>{children}</button>;
};

const NavResume = () => {
  const [hov, setHov] = useState(false);
  return (
    <a href={RESUME_PATH} target="_blank" rel="noopener noreferrer"
      style={{
        fontFamily: "'DM Mono',monospace", fontSize: "11px",
        letterSpacing: "0.08em", textTransform: "uppercase",
        padding: "7px 16px", borderRadius: "5px",
        border: `1.5px solid ${hov ? C.borderHi : C.border}`,
        color: hov ? C.text : C.textSub,
        transition: "all 0.2s", whiteSpace: "nowrap",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >Resume ↗</a>
  );
};

const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    fontFamily: "'DM Mono',monospace", fontSize: "12px", letterSpacing: "0.05em",
    padding: "10px 20px", borderRadius: "6px",
    border: `1.5px solid ${active ? C.borderHi : C.border}`,
    background: active ? C.raised : "transparent",
    color: active ? C.text : C.textSub,
    transition: "all 0.2s", fontWeight: active ? 500 : 400,
  }}>{label}</button>
);

const Chip = ({ children }) => (
  <span style={{
    fontFamily: "'DM Mono',monospace", fontSize: "11px", letterSpacing: "0.04em",
    color: C.textSub, border: `1.5px solid ${C.border}`,
    borderRadius: "5px", padding: "5px 11px", display: "inline-block",
  }}>{children}</span>
);

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: C.ease } },
});

const useTypewriter = (words) => {
  const [wi, setWi]     = useState(0);
  const [text, setText] = useState("");
  const [del, setDel]   = useState(false);
  const [ci, setCi]     = useState(0);
  useEffect(() => {
    const word = words[wi], speed = del ? 30 : 65;
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

/* ═══ NAV ═══ */
const Nav = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const linkStyle = {
    fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 400,
    color: C.textSub, transition: "color 0.2s",
    background: "none", border: "none", padding: 0, cursor: "pointer",
  };
  const hov = e => e.target.style.color = C.text;
  const lv  = e => e.target.style.color = C.textSub;
  const navLinks = [["#zinc","ZINC"],["#motion","Motion Work"],["#about","About"],["#contact","Contact"]];

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        className="nav-header"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
          height: "60px", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 48px",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          background: scrolled ? "rgba(9,9,11,0.9)" : "transparent",
          borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
          transition: "background 0.35s, border-color 0.35s",
        }}
      >
        <a href="#top" style={{ fontFamily:"'Sora',sans-serif", fontSize:"16px", fontWeight:600, letterSpacing:"-0.02em", color:C.text }}>
          Shivam
        </a>
        <nav className="nav-links" style={{ display:"flex", gap:"32px", alignItems:"center" }}>
          {navLinks.map(([href, label]) => (
            <a key={label} href={href} style={linkStyle} onMouseEnter={hov} onMouseLeave={lv}>{label}</a>
          ))}
          <NavResume />
        </nav>
        <button className="mob-menu" onClick={() => setMobileOpen(o => !o)}
          style={{ display:"none", flexDirection:"column", gap:"5px", background:"none", border:"none", padding:"8px", cursor:"pointer" }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              width:"22px", height:"2px", background:C.textSub, borderRadius:"2px", transition:"all 0.3s",
              transform: mobileOpen
                ? i===0 ? "rotate(45deg) translateY(7px)" : i===2 ? "rotate(-45deg) translateY(-7px)" : "scaleX(0)"
                : "none",
            }} />
          ))}
        </button>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            transition={{ duration:0.22 }}
            className="mob-drawer"
            style={{
              position:"fixed", top:"60px", left:0, right:0, zIndex:499,
              background:"rgba(9,9,11,0.97)", backdropFilter:"blur(20px)",
              borderBottom:`1px solid ${C.border}`,
              padding:"24px 32px", display:"flex", flexDirection:"column", gap:"20px",
            }}
          >
            {navLinks.map(([href, label]) => (
              <a key={label} href={href} onClick={() => setMobileOpen(false)}
                style={{ fontFamily:"'Inter',sans-serif", fontSize:"18px", color:C.textSub }}>
                {label}
              </a>
            ))}
            <Divider />
            <a href={RESUME_PATH} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily:"'DM Mono',monospace", fontSize:"13px", letterSpacing:"0.08em", textTransform:"uppercase", color:C.accent }}>
              View Resume ↗
            </a>
            <a href={RESUME_PATH} download="Shivam_Kumar_Resume.pdf"
              style={{ fontFamily:"'DM Mono',monospace", fontSize:"13px", letterSpacing:"0.08em", textTransform:"uppercase", color:C.textSub }}>
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
  const typed = useTypewriter(["Design Systems.", "Digital Products.", "UX Engineering."]);
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="top" ref={ref} className="hero-pad"
      style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"120px 48px 80px" }}>
      <div style={{ maxWidth:"780px" }}>

        <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"40px" }}>
          <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:C.green, display:"inline-block", animation:"pulseDot 2.4s ease-in-out infinite" }} />
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"15px", color:C.textSub }}>Available for full-time roles · Bangalore</span>
        </motion.div>

        <motion.h1 variants={fadeUp(0.07)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(36px,7.5vw,88px)", fontWeight:600, letterSpacing:"-0.04em", lineHeight:1.0, color:C.text, textAlign:"left" }}>
          I design and build
        </motion.h1>

        <motion.div variants={fadeUp(0.12)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(20px,6.5vw,88px)", fontWeight:600, letterSpacing:"-0.04em", lineHeight:1.0, color:C.textSub, marginBottom:"44px", minHeight:"1.05em", wordBreak:"break-word", textAlign:"left" }}>
          {typed}<span style={{ animation:"blink 1s step-end infinite", color:C.accent, marginLeft:"3px" }}>|</span>
        </motion.div>

        <motion.p variants={fadeUp(0.17)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ fontSize:"18px", color:C.textSub, maxWidth:"500px", lineHeight:1.65, fontWeight:400, marginBottom:"64px" }}>
          Design Engineer with 7 years of experience across motion design, UX, and frontend development. I design and build digital products where interaction, motion, and usability work together to create meaningful user experiences. Recently shipped{" "}
          <span style={{ color:C.text, fontWeight:500 }}>ZINC</span>, a React Native fintech application built from concept to production.
        </motion.p>

        <motion.div variants={fadeUp(0.22)} initial="hidden" animate={inView?"visible":"hidden"}
          className="btn-row" style={{ display:"flex", gap:"12px", flexWrap:"wrap", marginBottom:"12px" }}>
          <BtnPrimary href="#zinc">View ZINC →</BtnPrimary>
          <BtnOutline href="#contact">Get in Touch</BtnOutline>
        </motion.div>

        <motion.div variants={fadeUp(0.26)} initial="hidden" animate={inView?"visible":"hidden"}
          className="btn-row" style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
          <BtnOutline href={RESUME_PATH} target="_blank">View Resume ↗</BtnOutline>
          <BtnOutline href={RESUME_PATH} download="Shivam_Kumar_Resume.pdf">↓ Download Resume</BtnOutline>
        </motion.div>

        <motion.div variants={fadeUp(0.3)} initial="hidden" animate={inView?"visible":"hidden"}
          className="stats-row" style={{ display:"flex", gap:"48px", marginTop:"64px", flexWrap:"wrap" }}>
          {[["7 yrs","Motion Design"],["React Native","Primary Stack"],["Bangalore","India"]].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:"16px", fontWeight:600, color:C.text, letterSpacing:"-0.01em" }}>{v}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"11px", color:C.textMeta, letterSpacing:"0.08em", textTransform:"uppercase", marginTop:"4px", marginBottom:"-4px" }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* ═══ ZINC PHONE ═══
   CHANGE: video uses image-rendering crisp-edges + will-change:transform
   for maximum sharpness. No other change to layout, sizing, or positioning.
═══════════════════════════════════════════════════════════════════════════ */
const ZincPhone = ({ activeTab }) => {
  const ref  = useRef(null);
  const prev = useRef(null);
  const srcs = { feature:"/videos/Feature.mp4", home:"/videos/Home.mp4", rewards:"/videos/Rewards.mp4" };

  useEffect(() => {
    if (!ref.current) return;
    ref.current.src = srcs[activeTab];
    ref.current.play().catch(() => {});
    prev.current = activeTab;
  }, []);

  useEffect(() => {
    if (!ref.current || prev.current === activeTab) return;
    prev.current = activeTab;
    const v = ref.current;
    v.style.opacity = "0";
    setTimeout(() => { v.src = srcs[activeTab]; v.load(); v.play().catch(() => {}); v.style.opacity = "1"; }, 260);
  }, [activeTab]);

  return (
    <div style={{
      width: "clamp(200px,24vw,270px)",
      aspectRatio: "9/19.5",
      background: "#07070a",
      borderRadius: "40px",
      border: `1.5px solid rgba(255,255,255,0.14)`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      boxShadow: "0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
      flexShrink: 0,
    }}>
      {/* Dynamic island */}
      <div style={{ position:"absolute", top:"14px", left:"50%", transform:"translateX(-50%)", width:"68px", height:"9px", background:"#000", borderRadius:"8px", zIndex:10 }} />

      {/* Status bar spacer */}
      <div style={{ height:"34px", flexShrink:0 }} />

      {/* Video container */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <video
          ref={ref}
          autoPlay muted loop playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transition: "opacity 0.26s ease",
            background: "#07070a",
            /* ── SHARPNESS FIX ──
               Prevent browser from applying subpixel blending or
               bicubic downscaling on the video frame.
               image-rendering only applies to images/canvas but
               will-change:transform forces GPU compositing layer
               which preserves native pixel output from the decoder. */
            willChange: "transform",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />
      </div>

      {/* Home bar */}
      <div style={{ height:"26px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:"34%", height:"4px", background:"rgba(255,255,255,0.16)", borderRadius:"2px" }} />
      </div>
    </div>
  );
};

/* ═══ ZINC SECTION ═══ */
const ZincSection = () => {
  const [tab, setTab] = useState("feature");
  const ref   = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-8%" });

  const tabs = [
    { id:"feature", label:"Feature",  desc:"Subscription & spending leak detector — core product value. Analyses PDF bank statements to surface recurring charges automatically." },
    { id:"home",    label:"Home",     desc:"Dashboard showing available credit, usage bar, quick actions, and recent transactions at a glance." },
    { id:"rewards", label:"Rewards",  desc:"Cashback reveal with Lottie confetti animation and animated count-up — motion that feels earned, not decorative." },
  ];

  return (
    <section id="zinc" ref={ref} className="section-pad"
      style={{ padding:"120px 48px", background:C.surface, borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"1160px", margin:"0 auto" }}>

        <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}>
          <SectionLabel>Featured Project</SectionLabel>
        </motion.div>

        <div className="zinc-grid" style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:"72px", alignItems:"center" }}>

          {/* Left */}
          <motion.div variants={fadeUp(0.06)} initial="hidden" animate={inView?"visible":"hidden"}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", maxWidth:"560px", marginLeft:"-25px" }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(64px,10vw,120px)", fontWeight:600, letterSpacing:"-0.05em", lineHeight:0.85, color:C.text, marginBottom:"28px" }}>
              ZINC
            </h2>
            <p style={{ fontSize:"17px", lineHeight:1.8, color:C.textSub, maxWidth:"480px", marginBottom:"44px" }}>
              ZINC began with a problem I personally faced — forgotten subscriptions quietly draining money every month. After speaking with friends, family members, and working professionals, I realized the problem was far more common than I expected. Rather than building a feature-heavy finance app, I focused on solving one problem really well. I designed and built ZINC from scratch, creating the product strategy, user experience, motion system, and frontend implementation around a single goal: helping users become more aware of where their money goes.
            </p>

            <div className="chip-row" style={{ display:"flex", flexWrap:"wrap", gap:"12px", marginBottom:"44px", justifyContent:"center" }}>
              {["React Native","React","TypeScript","Reanimated 3","Lottie","EAS Build","Firebase"].map(t => <Chip key={t}>{t}</Chip>)}
            </div>

            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13px", color:C.textMeta, marginBottom:"12px" }}>Preview a screen:</p>

            <div className="tab-row" style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"16px" }}>
              {tabs.map(t => <TabBtn key={t.id} label={t.label} active={tab===t.id} onClick={() => setTab(t.id)} />)}
            </div>

            <AnimatePresence mode="wait">
              <motion.p key={tab}
                initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }}
                transition={{ duration:0.22 }}
                style={{ fontFamily:"'Inter',sans-serif", fontSize:"14px", color:C.textSub, lineHeight:1.7, maxWidth:"420px" }}>
                {tabs.find(t => t.id === tab)?.desc}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Right — phone */}
          <motion.div variants={fadeUp(0.1)} initial="hidden" animate={inView?"visible":"hidden"}
            className="zinc-phone-col"
            style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
            <div className="zinc-phone-wrap">
              <ZincPhone activeTab={tab} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══ CASE STUDY ═══
   CHANGE: Removed the gap:1px + background:C.border vertical-line technique.
   Replaced with: gap:0, no background on wrapper, explicit borderRight +
   borderBottom on each card. This removes ALL vertical lines while keeping
   the same visual card separation appearance.
   Everything else — padding, font sizes, hover states, animations — unchanged.
═══════════════════════════════════════════════════════════════════════════ */
const CaseStudy = () => {
  const ref   = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-8%" });

  const cards = [
    { label:"01 — Problem",                body:"People often discover recurring subscriptions only after checking multiple bank statements manually. There was no simple, premium tool to surface these leaks without connecting a bank account." },
    { label:"02 — User Insight",           body:"People weren't struggling to find transactions. They were struggling to remember subscriptions they no longer used. The biggest frustration was realizing money had been quietly leaving their account without their awareness." },
    { label:"03 — Product Strategy",       body:"Instead of building another complex finance app, I focused on solving one high-frequency problem well. AI-assisted PDF statement analysis became the MVP because it delivers immediate value without requiring deep financial integrations or excessive user trust." },
    { label:"04 — Motion System",          body:"Motion was designed to feel calm, deliberate, and trustworthy using Reanimated 3. Every transition, overlay, modal, and feedback state was created to guide attention and reinforce confidence rather than entertain." },
    { label:"05 — Technical Implementation", body:"Built as a real mobile application with production thinking — onboarding flows, feedback states, interaction locks, loading states, OTP verification via Firebase, and AI-powered PDF subscription analysis via Gemini API." },
    { label:"06 — Key Learning",           body:"Great products are not built screen by screen. They are built through hundreds of small decisions involving trust, communication, psychology, feedback, and user behavior — all of which I owned as the sole builder." },
  ];

  return (
    <section ref={ref} className="section-pad"
      style={{ padding:"120px 48px", background:C.bg, borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"1160px", margin:"0 auto" }}>

        <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"48px", flexWrap:"wrap", gap:"20px" }}>
          <div>
            <SectionLabel>ZINC — Case Study</SectionLabel>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(22px,3.5vw,42px)", fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.15, color:C.text, maxWidth:"520px" }}>
              Designed, built, and shipped — one decision at a time.
            </h2>
          </div>
          <BtnOutline href="https://www.notion.so/Case-Study-Zinc-3726a866524e808797b8de851bd64974" target="_blank" style={{ alignSelf:"flex-start" }}>
            Read Full Case Study ↗
          </BtnOutline>
        </motion.div>

        {/*
          ── FIX: Removed gap:"1px" + background:C.border from wrapper.
          ── Now using explicit borderRight + borderBottom per card.
          ── borderRight removed on last card in each row via nth-child logic
             which isn't available inline — instead we use borderRight on all
             cards and clip with overflow:hidden on the wrapper. The wrapper
             has no background so no bleed-through lines appear.
        */}
        <div
          className="case-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            /* NO gap, NO background — lines removed */
            overflow: "hidden",
            borderRadius: "2px",
          }}
        >
          {cards.map(({ label, body }, i) => (
            <motion.div key={label}
              variants={fadeUp(0.04 * i)} initial="hidden" animate={inView?"visible":"hidden"}
              style={{
                background: C.surface,
                padding: "32px 28px",
                transition: "background 0.2s",
                /* Each card draws its own right + bottom border.
                   The wrapper overflow:hidden clips the rightmost and
                   bottommost edges so no orphan lines appear. */
                borderRight:  `1px solid ${C.border}`,
                borderBottom: `1px solid ${C.border}`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.raised}
              onMouseLeave={e => e.currentTarget.style.background = C.surface}
            >
              <SectionLabel style={{ marginBottom:"12px" }}>{label}</SectionLabel>
              <p style={{ fontSize:"14px", lineHeight:1.8, color:C.textSub }}>{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══ MOTION WORK ═══ */
const MOTION_VIDEOS = [
  { id:1, title:"Motion Piece 01", type:"Motion Design", src:"/motion/Motion_01.mp4" },
  { id:2, title:"Motion Piece 02", type:"Motion Design", src:"/motion/Motion_02.mp4" },
  { id:3, title:"Motion Piece 03", type:"Animation",     src:"/motion/Motion_03.mp4" },
  { id:4, title:"Motion Piece 04", type:"Motion Design", src:"/motion/Motion_04.mp4" },
];

const Lightbox = ({ video, onClose }) => {
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      transition={{ duration:0.22 }} onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(0,0,0,0.94)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <motion.div
        initial={{ scale:0.93 }} animate={{ scale:1 }} exit={{ scale:0.93 }}
        transition={{ duration:0.28, ease:C.ease }}
        onClick={e => e.stopPropagation()}
        style={{ width:"100%", maxWidth:"960px", borderRadius:"12px", overflow:"hidden", position:"relative" }}>
        <video src={video.src} autoPlay loop controls playsInline
          style={{ width:"100%", aspectRatio:"16/9", objectFit:"contain", display:"block", background:"#000" }} />
        <button onClick={onClose} style={{
          position:"absolute", top:"14px", right:"14px",
          background:"rgba(0,0,0,0.7)", border:`1px solid ${C.border}`,
          color:C.textSub, fontFamily:"'DM Mono',monospace", fontSize:"11px",
          letterSpacing:"0.08em", padding:"6px 14px", borderRadius:"4px",
        }}>ESC / CLOSE</button>
      </motion.div>
    </motion.div>
  );
};

const MotionCard = ({ video, onOpen }) => {
  const [hov, setHov]     = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const vRef = useRef(null);

  return (
    <motion.div
      initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }} transition={{ duration:0.55, ease:C.ease }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => !error && onOpen(video)}
      style={{
        background: C.surface, border:`1.5px solid ${hov ? C.borderHi : C.border}`,
        borderRadius:"10px", overflow:"hidden",
        cursor: error ? "default" : "pointer",
        transform: hov && !error ? "translateY(-3px)" : "translateY(0)",
        transition:"border-color 0.2s, transform 0.25s",
      }}>
      <div style={{ aspectRatio:"16/9", background:C.raised, position:"relative", overflow:"hidden" }}>
        {!error ? (
          <>
            <video ref={vRef} src={video.src} autoPlay muted loop playsInline
              onCanPlay={() => setReady(true)} onError={() => setError(true)}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", opacity:ready?1:0, transition:"opacity 0.4s" }} />
            {!ready && (
              <div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg, ${C.raised} 0%, ${C.hover} 50%, ${C.raised} 100%)`, backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" }} />
            )}
            {ready && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:hov?"rgba(0,0,0,0.42)":"rgba(0,0,0,0)", transition:"background 0.2s" }}>
                <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"rgba(255,255,255,0.92)", display:"flex", alignItems:"center", justifyContent:"center", opacity:hov?1:0, transition:"opacity 0.2s" }}>
                  <span style={{ fontSize:"17px", marginLeft:"3px" }}>▶</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            <span style={{ fontSize:"24px", opacity:0.3 }}>▶</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"11px", color:C.textMeta, textAlign:"center", padding:"0 16px" }}>
              Add {video.src} to public folder
            </span>
          </div>
        )}
      </div>
      <div style={{ padding:"16px 20px" }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:"15px", fontWeight:500, color:C.text, marginBottom:"4px" }}>{video.title}</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"11px", color:C.textMeta, letterSpacing:"0.05em" }}>{video.type}</div>
      </div>
    </motion.div>
  );
};

const MotionWork = () => {
  const [lightbox, setLightbox] = useState(null);
  const ref   = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-8%" });

  return (
    <section id="motion" ref={ref} className="section-pad"
      style={{ padding:"120px 48px", background:C.surface, borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"1160px", margin:"0 auto" }}>
        <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"48px", flexWrap:"wrap", gap:"20px" }}>
          <div>
            <SectionLabel>Motion Work</SectionLabel>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(22px,3.5vw,42px)", fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.15, color:C.text }}>
              7 years of making things move.
            </h2>
          </div>
          <BtnOutline href="https://www.behance.net/shivam_kuma" target="_blank">View on Behance ↗</BtnOutline>
        </motion.div>

        <motion.div variants={fadeUp(0.06)} initial="hidden" animate={inView?"visible":"hidden"}
          className="motion-grid"
          style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"20px" }}>
          {MOTION_VIDEOS.map(v => <MotionCard key={v.id} video={v} onOpen={setLightbox} />)}
        </motion.div>
      </div>
      <AnimatePresence>
        {lightbox && <Lightbox video={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </section>
  );
};

/* ═══ RESUME SECTION ═══ */
const ResumeSection = () => {
  const ref   = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-8%" });

  return (
    <section id="resume" ref={ref} className="section-pad"
      style={{ padding:"100px 48px", background:C.bg, borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"1160px", margin:"0 auto" }}>
        <div className="resume-row" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"32px" }}>
          <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"} style={{ maxWidth:"520px" }}>
            <SectionLabel>Resume</SectionLabel>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,2.8vw,32px)", fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.2, color:C.text, marginBottom:"16px" }}>
              Experience across product design, motion systems, and frontend engineering.
            </h2>
            <p style={{ fontSize:"15px", lineHeight:1.8, color:C.textSub }}>
              Download a detailed overview of my work at Clevertize, PlaySimple Games, and MPS Limited — alongside the ZINC design engineering project.
            </p>
          </motion.div>
          <motion.div variants={fadeUp(0.1)} initial="hidden" animate={inView?"visible":"hidden"}
            className="btn-row" style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
            <BtnPrimary href={RESUME_PATH} download="Shivam_Kumar_Resume.pdf">↓ Download Resume</BtnPrimary>
            <BtnOutline href={RESUME_PATH} target="_blank">View Resume ↗</BtnOutline>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══ ABOUT ═══ */
const About = () => {
  const ref   = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-8%" });

  return (
    <section id="about" ref={ref} className="section-pad"
      style={{ padding:"120px 48px", background:C.surface, borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"1160px", margin:"0 auto" }}>
        <SectionLabel>About</SectionLabel>
        <div className="two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"72px" }}>

          <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,2.6vw,32px)", fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.25, color:C.text, marginBottom:"28px" }}>
              The gap between design and engineering is where good products are built.
            </h2>
            {[
              "7 years as a motion designer taught me that the best interfaces feel inevitable — not designed. Every transition is a UX decision, not a visual one. I'm now coding what I used to hand off.",
              "I care about the 60ms between tap and response. The spring physics on a modal dismiss. The count-up animation that makes a number feel real. These are engineering problems that look like design problems.",
              "Targeting Design Engineer and Creative Frontend roles at companies where craft is a product differentiator.",
            ].map((p, i) => (
              <p key={i} style={{ fontSize:"15px", lineHeight:1.85, color:C.textSub, marginBottom:"16px" }}>{p}</p>
            ))}
          </motion.div>

          <motion.div variants={fadeUp(0.08)} initial="hidden" animate={inView?"visible":"hidden"}>
            <div className="about-details">
              {[
                ["Currently Building", "ZINC — React Native Fintech App"],
                ["Role",               "Design Engineer · Creative Frontend"],
                ["Experience",         "Clevertize · PlaySimple Games · MPS Limited"],
                ["Based",              "Bangalore, India"],
                ["Open To",            "Full-time · Contract"],
                ["Stack",              "React Native · React · TypeScript · Reanimated 3"],
                ["Design Tools",       "Figma · After Effects · Photoshop · Illustrator"],
              ].map(([label, value]) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"16px 0", borderBottom:`1px solid ${C.border}`, gap:"20px", flexWrap:"wrap", alignItems:"baseline" }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"11px", color:C.textMeta, letterSpacing:"0.08em", textTransform:"uppercase", flexShrink:0 }}>{label}</span>
                  <span style={{ fontSize:"14px", color:C.textSub, textAlign:"right" }}>{value}</span>
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
  const ref   = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-8%" });

  return (
    <section id="contact" ref={ref} className="section-pad"
      style={{ padding:"120px 48px 100px", background:C.bg, borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"720px", margin:"0 auto" }}>
        <SectionLabel>Contact</SectionLabel>

        <motion.h2 variants={fadeUp(0.04)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(28px,5vw,58px)", fontWeight:600, letterSpacing:"-0.04em", lineHeight:1.05, color:C.text, marginBottom:"20px" }}>
          Open to Design Engineer and Creative Frontend roles.
        </motion.h2>

        <motion.p variants={fadeUp(0.08)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ fontSize:"17px", lineHeight:1.8, color:C.textSub, marginBottom:"44px" }}>
          Building products where motion, craft, and interaction design matter — let's talk.
        </motion.p>

        <motion.div variants={fadeUp(0.12)} initial="hidden" animate={inView?"visible":"hidden"}
          className="btn-row" style={{ display:"flex", gap:"12px", flexWrap:"wrap", marginBottom:"16px" }}>
          <BtnPrimary href="mailto:contrastyouneed@gmail.com">contrastyouneed@gmail.com</BtnPrimary>
          <BtnOutline href="https://github.com/shivamcs50199" target="_blank">GitHub ↗</BtnOutline>
          <BtnOutline href="https://www.behance.net/search/users/shivam%20kumar" target="_blank">Behance ↗</BtnOutline>
        </motion.div>

        <motion.div variants={fadeUp(0.15)} initial="hidden" animate={inView?"visible":"hidden"}
          className="btn-row" style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
          <BtnOutline href={RESUME_PATH} download="Shivam_Kumar_Resume.pdf">↓ Download Resume</BtnOutline>
          <BtnOutline href={RESUME_PATH} target="_blank">View Resume ↗</BtnOutline>
        </motion.div>

        <Divider style={{ marginTop:"72px", marginBottom:"28px" }} />

        <div className="contact-footer" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
          <span style={{ fontFamily:"'Sora',sans-serif", fontSize:"13px", fontWeight:500, color:C.textMeta }}>
            Shivam Kumar · Design Engineer · Bangalore · 2025
          </span>
          <a href="https://www.notion.so/Privacy-Policy-3776a866524e80ff92b7ce6226087d60"
            target="_blank" rel="noopener noreferrer"
            style={{ fontFamily:"'DM Mono',monospace", fontSize:"11px", color:C.textMeta, letterSpacing:"0.07em", textTransform:"uppercase", transition:"color 0.2s" }}
            onMouseEnter={e => e.target.style.color = C.textSub}
            onMouseLeave={e => e.target.style.color = C.textMeta}>
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
      <Nav />
      <main>
        <Hero />
        <ZincSection />
        <CaseStudy />
        <MotionWork />
        <ResumeSection />
        <About />
        <Contact />
      </main>
    </>
  );
}
