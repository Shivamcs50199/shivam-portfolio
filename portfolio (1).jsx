import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ─── DESIGN TOKENS ─────────────────────────────── */
const C = {
  bg:        "#09090b",
  surface:   "#0f0f12",
  raised:    "#141417",
  hover:     "#1c1c21",
  border:    "rgba(255,255,255,0.07)",
  borderMd:  "rgba(255,255,255,0.11)",
  text:      "#f4f4f5",
  textSub:   "rgba(244,244,245,0.55)",
  textDim:   "rgba(244,244,245,0.28)",
  accent:    "#d4a853",
  accentBg:  "rgba(212,168,83,0.08)",
  green:     "#22c55e",
  ease:      [0.22, 1, 0.36, 1],
};

/* ─── GLOBAL CSS ────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{background:${C.bg};color:${C.text};font-family:'Plus Jakarta Sans',sans-serif;font-weight:300;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
    ::selection{background:${C.accent};color:#09090b}
    ::-webkit-scrollbar{width:1px}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08)}
    a{color:inherit;text-decoration:none}
    video{display:block}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  `}</style>
);

/* ─── PRIMITIVES ────────────────────────────────── */
const Label = ({ children, style }) => (
  <p style={{ fontFamily:"'DM Mono',monospace", fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:C.textDim, ...style }}>{children}</p>
);
const HR = ({ style }) => (
  <div style={{ height:"1px", background:C.border, ...style }} />
);
const Tag = ({ children }) => (
  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"10px", letterSpacing:"0.05em", color:C.textDim, border:`1px solid ${C.border}`, borderRadius:"4px", padding:"3px 8px", display:"inline-block" }}>{children}</span>
);

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, delay, ease: C.ease } }
});

/* ─── TYPEWRITER ────────────────────────────────── */
const useTypewriter = (words) => {
  const [wi, setWi] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  const [ci, setCi] = useState(0);
  useEffect(() => {
    const word = words[wi];
    const speed = del ? 28 : 60;
    const t = setTimeout(() => {
      if (!del) {
        if (ci < word.length) { setText(word.slice(0, ci+1)); setCi(c=>c+1); }
        else setTimeout(() => setDel(true), 1800);
      } else {
        if (ci > 0) { setText(word.slice(0, ci-1)); setCi(c=>c-1); }
        else { setDel(false); setWi(w=>(w+1)%words.length); }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [ci, del, wi]);
  return text;
};

/* ─── ZINC VIDEO PHONE ──────────────────────────── */
const ZincPhone = ({ activeTab }) => {
  const videoRef = useRef(null);
  const prevTab = useRef(null);

  const videos = {
    feature: "/videos/Feature.mp4",
    home:    "/videos/Home.mp4",
    rewards: "/videos/Rewards.mp4",
  };

  useEffect(() => {
    if (!videoRef.current) return;
    if (prevTab.current === activeTab) return;
    prevTab.current = activeTab;
    const v = videoRef.current;
    v.style.opacity = "0";
    v.style.transition = "opacity 0.3s ease";
    setTimeout(() => {
      v.src = videos[activeTab];
      v.load();
      v.play().catch(()=>{});
      v.style.opacity = "1";
    }, 300);
  }, [activeTab]);

  useEffect(() => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    v.src = videos[activeTab];
    v.load();
    v.play().catch(()=>{});
  }, []);

  return (
    <div style={{
      width:"clamp(200px,24vw,260px)", aspectRatio:"9/19.5",
      background:"#0a0a0d",
      borderRadius:"38px",
      border:`1px solid ${C.borderMd}`,
      display:"flex", flexDirection:"column",
      boxShadow:`0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)`,
      overflow:"hidden", position:"relative",
    }}>
      {/* Dynamic island */}
      <div style={{ position:"absolute", top:"14px", left:"50%", transform:"translateX(-50%)", width:"72px", height:"10px", background:"#000", borderRadius:"8px", zIndex:10 }} />
      
      {/* Video fills entire phone screen */}
      <video
        ref={videoRef}
        autoPlay muted loop playsInline
        style={{ width:"100%", height:"100%", objectFit:"cover", transition:"opacity 0.3s ease" }}
      />

      {/* Home indicator overlay */}
      <div style={{
        position:"absolute", bottom:"10px", left:0, right:0,
        display:"flex", justifyContent:"center", zIndex:10,
        pointerEvents:"none",
      }}>
        <div style={{ width:"36%", height:"3px", background:"rgba(255,255,255,0.15)", borderRadius:"2px" }} />
      </div>
    </div>
  );
};

/* ─── HLS VIDEO PLAYER (Motion Work) ───────────── */
const HLSPlayer = ({ src, style, autoPlay = true, loop = true, muted = true }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loadHls = async () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        if (autoPlay) video.play().catch(()=>{});
        return;
      }
      // Dynamically load HLS.js
      if (!window.Hls) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.12/hls.min.js";
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new window.Hls({ enableWorker: false });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) video.play().catch(()=>{});
        });
      }
    };

    loadHls();
    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [src]);

  return <video ref={videoRef} muted={muted} loop={loop} playsInline style={style} />;
};

/* ─── MOTION VIDEO LIGHTBOX ─────────────────────── */
const Lightbox = ({ video, onClose }) => {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(0,0,0,0.92)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px",
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.3, ease: C.ease }}
        onClick={e => e.stopPropagation()}
        style={{ width:"100%", maxWidth:"900px", borderRadius:"12px", overflow:"hidden", position:"relative" }}
      >
        <HLSPlayer
          src={video.src}
          autoPlay={true} loop={true} muted={false}
          style={{ width:"100%", aspectRatio:"16/9", objectFit:"cover", display:"block" }}
        />
        <button onClick={onClose} style={{
          position:"absolute", top:"16px", right:"16px",
          background:"rgba(0,0,0,0.6)", border:`1px solid ${C.border}`,
          color:C.textSub, fontFamily:"'DM Mono',monospace", fontSize:"11px",
          letterSpacing:"0.06em", padding:"6px 12px", borderRadius:"4px",
          cursor:"pointer",
        }}>ESC / CLOSE</button>
      </motion.div>
    </motion.div>
  );
};

/* ─── NAVIGATION ────────────────────────────────── */
const Nav = ({ page, setPage }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position:"fixed", top:0, left:0, right:0, zIndex:500,
        height:"56px", display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 48px",
        backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        background: scrolled ? "rgba(9,9,11,0.85)" : "transparent",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition:"background 0.35s, border-color 0.35s",
      }}
    >
      <button onClick={() => { setPage("home"); window.scrollTo(0,0); }}
        style={{ fontFamily:"'Sora',sans-serif", fontSize:"15px", fontWeight:500, letterSpacing:"-0.02em", color:C.text, background:"none", border:"none", cursor:"pointer" }}
      >Shivam</button>
      <nav style={{ display:"flex", gap:"32px", alignItems:"center" }}>
        {["work","about","contact"].map(id => (
          <a key={id} href={`#${id}`}
            style={{ fontFamily:"'DM Mono',monospace", fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase", color:C.textDim, transition:"color 0.2s" }}
            onMouseEnter={e=>e.target.style.color=C.textSub}
            onMouseLeave={e=>e.target.style.color=C.textDim}
          >{id}</a>
        ))}
        <button onClick={() => setPage("motion")} style={{
          fontFamily:"'DM Mono',monospace", fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase",
          color:C.textDim, background:"none", border:"none", cursor:"pointer", transition:"color 0.2s",
          padding:0,
        }}
          onMouseEnter={e=>e.target.style.color=C.textSub}
          onMouseLeave={e=>e.target.style.color=C.textDim}
        >Motion</button>
      </nav>
    </motion.header>
  );
};

/* ─── HERO ──────────────────────────────────────── */
const Hero = () => {
  const typed = useTypewriter(["Design Engineer.", "Motion Designer.", "Product Builder."]);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"120px 48px 80px", maxWidth:"900px" }}>

      <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}
        style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"40px" }}
      >
        <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:C.green, display:"inline-block", animation:"pulse 2.4s ease-in-out infinite" }} />
        <Label>Available for full-time roles — Bangalore</Label>
      </motion.div>

      <motion.h1 variants={fadeUp(0.08)} initial="hidden" animate={inView?"visible":"hidden"}
        style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(40px,7vw,88px)", fontWeight:500, letterSpacing:"-0.04em", lineHeight:1.0, color:C.text, marginBottom:"8px" }}
      >
        I design and build
      </motion.h1>

      <motion.div variants={fadeUp(0.14)} initial="hidden" animate={inView?"visible":"hidden"}
        style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(40px,7vw,88px)", fontWeight:500, letterSpacing:"-0.04em", lineHeight:1.0, color:C.textSub, marginBottom:"32px", minHeight:"1.05em" }}
      >
        {typed}
        <span style={{ animation:"blink 1s step-end infinite", marginLeft:"2px", color:C.accent }}>|</span>
      </motion.div>

      <motion.p variants={fadeUp(0.2)} initial="hidden" animate={inView?"visible":"hidden"}
        style={{ fontSize:"clamp(16px,1.8vw,19px)", color:C.textSub, maxWidth:"520px", lineHeight:1.8, fontWeight:300 }}
      >
        7 years of motion design — now shipping in code. I build interfaces where interaction
        and animation are the same decision. Currently shipping{" "}
        <span style={{ color:C.text, fontWeight:500 }}>ZINC</span>,
        a premium fintech app for Android.
      </motion.p>

      <motion.div variants={fadeUp(0.26)} initial="hidden" animate={inView?"visible":"hidden"}
        style={{ display:"flex", gap:"12px", marginTop:"44px", flexWrap:"wrap" }}
      >
        <a href="#zinc" style={{
          fontFamily:"'DM Mono',monospace", fontSize:"12px", letterSpacing:"0.06em", textTransform:"uppercase",
          padding:"13px 28px", borderRadius:"6px", background:C.text, color:C.bg, fontWeight:400,
          transition:"opacity 0.2s", display:"inline-block",
        }}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}
        >View ZINC →</a>
        <a href="#contact" style={{
          fontFamily:"'DM Mono',monospace", fontSize:"12px", letterSpacing:"0.06em", textTransform:"uppercase",
          padding:"13px 28px", borderRadius:"6px", border:`1px solid ${C.border}`, color:C.textSub,
          transition:"border-color 0.2s, color 0.2s", display:"inline-block",
        }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderMd;e.currentTarget.style.color=C.text}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSub}}
        >Get in Touch</a>
      </motion.div>

      <motion.div variants={fadeUp(0.32)} initial="hidden" animate={inView?"visible":"hidden"}
        style={{ display:"flex", gap:"48px", marginTop:"72px", flexWrap:"wrap" }}
      >
        {[["7 yrs","Motion Design"],["React Native","Primary Stack"],["Bangalore","India"]].map(([v,l])=>(
          <div key={l}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:"14px", fontWeight:500, color:C.text, letterSpacing:"-0.01em" }}>{v}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"10px", color:C.textDim, letterSpacing:"0.07em", textTransform:"uppercase", marginTop:"3px" }}>{l}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

/* ─── ZINC SECTION ──────────────────────────────── */
const ZincSection = () => {
  const [tab, setTab] = useState("feature");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const tabs = [
    { id:"feature", label:"Feature",  desc:"Subscription & spending leak detector — core product value" },
    { id:"home",    label:"Home",     desc:"Dashboard with credit overview and recent transactions" },
    { id:"rewards", label:"Rewards",  desc:"Cashback reveal with Lottie animation and count-up" },
  ];

  return (
    <section id="zinc" ref={ref} style={{ padding:"120px 48px", background:C.surface, borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>

        <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}>
          <Label style={{ marginBottom:"48px" }}>Featured Project — 2024–25</Label>
        </motion.div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"80px", alignItems:"start" }}>

          {/* Left */}
          <motion.div variants={fadeUp(0.06)} initial="hidden" animate={inView?"visible":"hidden"}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(56px,9vw,112px)", fontWeight:600, letterSpacing:"-0.05em", lineHeight:0.88, color:C.text, marginBottom:"28px" }}>
              ZINC
            </h2>
            <p style={{ fontSize:"17px", lineHeight:1.8, color:C.textSub, maxWidth:"460px", marginBottom:"28px" }}>
              A premium fintech app built from scratch with React Native — CRED-quality motion system, custom design tokens, and real product thinking. Every screen designed, every animation implemented, every edge case handled.
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"48px" }}>
              {["React Native","Reanimated 3","Lottie","TypeScript","EAS Build","Firebase"].map(t=><Tag key={t}>{t}</Tag>)}
            </div>

            {/* Tab switcher */}
            <Label style={{ marginBottom:"12px" }}>Preview</Label>
            <div style={{ display:"flex", gap:"6px", marginBottom:"28px", flexWrap:"wrap" }}>
              {tabs.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  fontFamily:"'DM Mono',monospace", fontSize:"11px", letterSpacing:"0.06em", textTransform:"uppercase",
                  padding:"8px 16px", borderRadius:"5px", cursor:"pointer",
                  border:`1px solid ${tab===t.id ? C.borderMd : C.border}`,
                  background: tab===t.id ? C.hover : "transparent",
                  color: tab===t.id ? C.text : C.textDim,
                  transition:"all 0.2s",
                }}>{t.label}</button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={tab}
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
                transition={{ duration:0.25 }}
                style={{ fontFamily:"'DM Mono',monospace", fontSize:"12px", color:C.textDim, letterSpacing:"0.04em", maxWidth:"360px" }}
              >
                {tabs.find(t=>t.id===tab)?.desc}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Right: Phone */}
          <motion.div variants={fadeUp(0.12)} initial="hidden" animate={inView?"visible":"hidden"}
            style={{ display:"flex", justifyContent:"center" }}
          >
            <ZincPhone activeTab={tab} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ─── CASE STUDY ────────────────────────────────── */
const CaseStudy = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const highlights = [
    { label:"Problem", body:"Most fintech apps hide your spending leaks across multiple bank statements. ZINC surfaces them automatically from PDF uploads." },
    { label:"Approach", body:"Motion design background applied to product engineering — every animation decision justified by UX impact, not aesthetics." },
    { label:"Motion System", body:"One easing curve across all transitions: cubic-bezier(0.22, 1, 0.36, 1). Motion as a design language, consistent and intentional." },
    { label:"Implementation", body:"React Native with Reanimated 3 for 60fps performance. EAS Build for Android release. Firebase for auth. Gemini API for PDF analysis." },
  ];

  return (
    <section style={{ padding:"120px 48px", background:C.bg, borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }} ref={ref}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"64px", flexWrap:"wrap", gap:"24px" }}>
          <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}>
            <Label style={{ marginBottom:"16px" }}>ZINC — Case Study</Label>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(28px,3.5vw,42px)", fontWeight:500, letterSpacing:"-0.03em", lineHeight:1.15, color:C.text, maxWidth:"520px" }}>
              From motion designer to product engineer — built and shipped a real app.
            </h2>
          </motion.div>

          <motion.div variants={fadeUp(0.1)} initial="hidden" animate={inView?"visible":"hidden"}>
            <a href="https://www.notion.so/Case-Study-Zinc-3726a866524e808797b8de851bd64974" target="_blank" rel="noopener noreferrer" style={{
              fontFamily:"'DM Mono',monospace", fontSize:"12px", letterSpacing:"0.06em", textTransform:"uppercase",
              padding:"13px 24px", borderRadius:"6px", border:`1px solid ${C.border}`, color:C.textSub,
              display:"inline-block", transition:"border-color 0.2s, color 0.2s", whiteSpace:"nowrap",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderMd;e.currentTarget.style.color=C.text}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSub}}
            >Read Full Case Study ↗</a>
          </motion.div>
        </div>

        {/* Highlights grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"1px", background:C.border }}>
          {highlights.map(({label,body},i)=>(
            <motion.div key={label}
              variants={fadeUp(0.06*i)} initial="hidden" animate={inView?"visible":"hidden"}
              style={{ background:C.surface, padding:"36px 32px", transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background=C.raised}
              onMouseLeave={e=>e.currentTarget.style.background=C.surface}
            >
              <Label style={{ marginBottom:"16px" }}>{label}</Label>
              <p style={{ fontSize:"14px", lineHeight:1.8, color:C.textSub }}>{body}</p>
            </motion.div>
          ))}
        </div>

        {/* Placeholder notice */}
        <motion.div variants={fadeUp(0.2)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ marginTop:"32px", padding:"20px 24px", border:`1px solid ${C.border}`, borderRadius:"6px", background:C.surface }}
        >
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:"11px", color:C.textDim, letterSpacing:"0.04em" }}>
            ↑ Highlights above are drawn from the actual Notion case study. Full process, screens, and decisions documented at the link above.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

/* ─── ABOUT ─────────────────────────────────────── */
const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section id="about" ref={ref} style={{ padding:"120px 48px", background:C.surface, borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <Label style={{ marginBottom:"48px" }}>About</Label>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"80px" }}>
          <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(24px,3vw,36px)", fontWeight:500, letterSpacing:"-0.03em", lineHeight:1.25, color:C.text, marginBottom:"28px" }}>
              The gap between design and engineering is where good products are built.
            </h2>
            {[
              "7 years as a motion designer taught me that the best interfaces feel inevitable — not designed. Every transition is a UX decision, not a visual one. I'm now coding what I used to hand off.",
              "I care about the 60ms between tap and response. The spring physics on a modal. The count-up animation that makes a number feel real. These are engineering problems that look like design problems.",
              "Targeting Design Engineer and Creative Frontend roles at companies where craft is a product differentiator.",
            ].map((p,i)=>(
              <p key={i} style={{ fontSize:"15px", lineHeight:1.85, color:C.textSub, marginBottom:"18px" }}>{p}</p>
            ))}
          </motion.div>

          <motion.div variants={fadeUp(0.08)} initial="hidden" animate={inView?"visible":"hidden"}>
            {[
              ["Currently Building","ZINC — React Native Fintech App"],
              ["Role","Design Engineer · Creative Frontend"],
              ["Based","Bangalore, India"],
              ["Open To","Full-time · Contract"],
              ["Target Companies","CRED · Razorpay · Groww · Zepto"],
              ["Stack","React Native · Reanimated 3 · TypeScript"],
              ["Design","After Effects · Figma · Illustrator · C4D"],
            ].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"16px 0", borderBottom:`1px solid ${C.border}`, gap:"24px", flexWrap:"wrap" }}>
                <Label>{l}</Label>
                <span style={{ fontSize:"13px", color:C.textSub, textAlign:"right" }}>{v}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ─── CONTACT ───────────────────────────────────── */
const Contact = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section id="contact" ref={ref} style={{ padding:"120px 48px 80px", background:C.bg, borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"640px", margin:"0 auto" }}>
        <Label style={{ marginBottom:"32px" }}>Contact</Label>

        <motion.h2 variants={fadeUp(0.04)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(30px,5vw,56px)", fontWeight:500, letterSpacing:"-0.04em", lineHeight:1.05, color:C.text, marginBottom:"20px" }}
        >
          Open to Design Engineer and Creative Frontend roles.
        </motion.h2>

        <motion.p variants={fadeUp(0.1)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ fontSize:"16px", lineHeight:1.8, color:C.textSub, marginBottom:"44px" }}
        >
          Building products where motion, craft, and interaction design matter. Let's talk.
        </motion.p>

        <motion.div variants={fadeUp(0.16)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"56px" }}
        >
          <a href="mailto:contrastyouneed@gmail.com" style={{
            fontFamily:"'DM Mono',monospace", fontSize:"12px", letterSpacing:"0.06em", textTransform:"uppercase",
            padding:"13px 28px", borderRadius:"6px", background:C.text, color:C.bg, fontWeight:400,
            transition:"opacity 0.2s", display:"inline-block",
          }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}
          >Email Me</a>

          {[
            ["GitHub","https://github.com/shivamcs50199"],
            ["Behance","https://www.behance.net/search/users/shivam%20kumar"],
          ].map(([label,href])=>(
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
              fontFamily:"'DM Mono',monospace", fontSize:"12px", letterSpacing:"0.06em", textTransform:"uppercase",
              padding:"13px 20px", borderRadius:"6px", border:`1px solid ${C.border}`, color:C.textDim,
              transition:"border-color 0.2s, color 0.2s", display:"inline-block",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderMd;e.currentTarget.style.color=C.textSub}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textDim}}
            >{label} ↗</a>
          ))}
        </motion.div>

        <HR style={{ marginBottom:"28px" }} />

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
          <span style={{ fontFamily:"'Sora',sans-serif", fontSize:"13px", fontWeight:500, color:C.textDim }}>Shivam</span>
          <div style={{ display:"flex", gap:"20px" }}>
            <a href="/privacy" style={{ fontFamily:"'DM Mono',monospace", fontSize:"10px", color:C.textDim, letterSpacing:"0.07em", textTransform:"uppercase", transition:"color 0.2s" }}
              onMouseEnter={e=>e.target.style.color=C.textSub}
              onMouseLeave={e=>e.target.style.color=C.textDim}
            >Privacy Policy</a>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"10px", color:C.textDim, letterSpacing:"0.07em" }}>Design Engineer · 2025</span>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── MOTION WORK PAGE ──────────────────────────── */
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

const MOTION_VIDEOS = [
  { id:1, title:"Motion Piece 01", type:"Motion Design", m3u8: M1 },
  { id:2, title:"Motion Piece 02", type:"Motion Design", m3u8: null, token: "RHt7VFarK5t" },
  { id:3, title:"Motion Piece 03", type:"Animation",     m3u8: null, token: "ADAN2LjW7q-" },
  { id:4, title:"Motion Piece 04", type:"Motion Design", m3u8: null, token: "DenfRuWniKk" },
];

const useBlobUrl = (m3u8Content) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!m3u8Content) return;
    const blob = new Blob([m3u8Content], { type:"application/vnd.apple.mpegurl" });
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [m3u8Content]);
  return url;
};

const MotionCard = ({ video, onOpen }) => {
  const m3uSrc = useBlobUrl(video.m3u8);
  const src = m3uSrc || (video.token ? `https://cdn-prod-ccv.adobe.com/${video.token}/rend/hls_1080/index-1.ts` : null);

  return (
    <motion.div
      initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }} transition={{ duration:0.6, ease:C.ease }}
      onClick={() => src && onOpen({ src: m3uSrc || video.token, title: video.title })}
      style={{
        background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:"10px", overflow:"hidden", cursor:"pointer",
        transition:"border-color 0.2s, transform 0.2s",
      }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.borderMd; e.currentTarget.style.transform="translateY(-2px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform="translateY(0)"; }}
    >
      <div style={{ aspectRatio:"16/9", background:C.raised, position:"relative", overflow:"hidden" }}>
        {m3uSrc ? (
          <HLSPlayer src={m3uSrc} autoPlay loop muted style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Label>Video {video.id}</Label>
          </div>
        )}
        {/* Play overlay on hover */}
        <div style={{
          position:"absolute", inset:0, background:"rgba(0,0,0,0)", display:"flex", alignItems:"center", justifyContent:"center",
          transition:"background 0.2s",
        }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.4)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0)"}
        >
          <div style={{
            width:"44px", height:"44px", borderRadius:"50%",
            background:"rgba(255,255,255,0.9)", display:"flex", alignItems:"center", justifyContent:"center",
            opacity:0, transition:"opacity 0.2s", pointerEvents:"none",
          }}
            className="play-btn"
          >
            <span style={{ fontSize:"14px", marginLeft:"2px" }}>▶</span>
          </div>
        </div>
      </div>
      <div style={{ padding:"16px 18px" }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:"14px", fontWeight:400, color:C.text, marginBottom:"4px" }}>{video.title}</div>
        <Label>{video.type}</Label>
      </div>
    </motion.div>
  );
};

const MotionPage = ({ setPage }) => {
  const [lightbox, setLightbox] = useState(null);
  useEffect(() => { window.scrollTo(0,0); }, []);

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <style>{`.motion-card:hover .play-btn{opacity:1!important}`}</style>

      <div style={{ padding:"100px 48px 80px", maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"64px", flexWrap:"wrap", gap:"16px" }}>
          <div>
            <Label style={{ marginBottom:"12px" }}>Motion Design Work</Label>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:500, letterSpacing:"-0.04em", color:C.text }}>7 years of making things move.</h1>
          </div>
          <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
            <a href="https://www.behance.net/search/users/shivam%20kumar" target="_blank" rel="noopener noreferrer" style={{
              fontFamily:"'DM Mono',monospace", fontSize:"11px", letterSpacing:"0.06em", textTransform:"uppercase",
              padding:"10px 20px", borderRadius:"5px", border:`1px solid ${C.border}`, color:C.textDim,
              transition:"border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderMd;e.currentTarget.style.color=C.textSub}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textDim}}
            >View Behance ↗</a>
            <button onClick={()=>setPage("home")} style={{
              fontFamily:"'DM Mono',monospace", fontSize:"11px", letterSpacing:"0.06em", textTransform:"uppercase",
              padding:"10px 20px", borderRadius:"5px", border:`1px solid ${C.border}`, color:C.textDim,
              background:"none", cursor:"pointer", transition:"border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderMd;e.currentTarget.style.color=C.textSub}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textDim}}
            >← Back to Portfolio</button>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"20px" }}>
          {MOTION_VIDEOS.map(v => (
            <MotionCard key={v.id} video={v} onOpen={setLightbox} />
          ))}
        </div>

        <div style={{ marginTop:"64px", paddingTop:"32px", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"center" }}>
          <a href="https://www.behance.net/search/users/shivam%20kumar" target="_blank" rel="noopener noreferrer" style={{
            fontFamily:"'DM Mono',monospace", fontSize:"12px", letterSpacing:"0.06em", textTransform:"uppercase",
            padding:"13px 32px", borderRadius:"6px", background:C.text, color:C.bg,
            transition:"opacity 0.2s", display:"inline-block",
          }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}
          >View Full Portfolio on Behance ↗</a>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && <Lightbox video={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  );
};

/* ─── APP ───────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("home");

  return (
    <>
      <GlobalStyles />
      <Nav page={page} setPage={setPage} />
      <AnimatePresence mode="wait">
        {page === "motion" ? (
          <motion.div key="motion" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
            <MotionPage setPage={setPage} />
          </motion.div>
        ) : (
          <motion.main key="home" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
            <Hero />
            <ZincSection />
            <CaseStudy />
            <About />
            <Contact />
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}
