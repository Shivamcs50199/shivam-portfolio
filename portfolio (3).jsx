import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   TOKENS
═══════════════════════════════════════════════════════ */
const C = {
  bg:       "#09090b",
  surface:  "#111114",
  raised:   "#18181c",
  hover:    "#202026",
  border:   "rgba(255,255,255,0.12)",
  borderHi: "rgba(255,255,255,0.22)",
  text:     "#f0f0f0",
  textSub:  "#a8a8b3",
  textMeta: "#72728a",
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
    button { font-family: inherit; cursor: pointer; }
    @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.75)} }
    @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
    @media (max-width: 900px) {
      .two-col   { grid-template-columns: 1fr !important; }
      .zinc-grid { grid-template-columns: 1fr !important; }
      .hide-sm   { display: none !important; }
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════
   ATOMS
═══════════════════════════════════════════════════════ */
const SectionLabel = ({ children, style }) => (
  <p style={{ fontFamily:"'DM Mono',monospace", fontSize:"12px", letterSpacing:"0.12em", textTransform:"uppercase", color:C.textMeta, marginBottom:"20px", ...style }}>{children}</p>
);
const Divider = ({ style }) => <div style={{ height:"1px", background:C.border, ...style }} />;

const BtnPrimary = ({ children, href, onClick, download, style }) => {
  const s = { display:"inline-flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", fontSize:"15px", fontWeight:500, padding:"14px 32px", borderRadius:"8px", background:C.text, color:"#09090b", border:"none", transition:"opacity 0.2s", ...style };
  const hover = e => e.currentTarget.style.opacity = "0.88";
  const leave = e => e.currentTarget.style.opacity = "1";
  if (href) return <a href={href} download={download} target={download ? undefined : "_blank"} rel="noopener noreferrer" style={s} onMouseEnter={hover} onMouseLeave={leave}>{children}</a>;
  return <button onClick={onClick} style={s} onMouseEnter={hover} onMouseLeave={leave}>{children}</button>;
};

const BtnOutline = ({ children, href, onClick, target, download, style }) => {
  const [hov, setHov] = useState(false);
  const s = { display:"inline-flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", fontSize:"15px", fontWeight:400, padding:"13px 28px", borderRadius:"8px", border:`1.5px solid ${hov ? C.borderHi : C.border}`, color: hov ? C.text : C.textSub, background:"transparent", transition:"all 0.2s", ...style };
  if (href) return <a href={href} download={download} target={target} rel="noopener noreferrer" style={s} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>{children}</a>;
  return <button onClick={onClick} style={s} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>{children}</button>;
};

const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ fontFamily:"'DM Mono',monospace", fontSize:"13px", letterSpacing:"0.05em", padding:"10px 22px", borderRadius:"6px", border:`1.5px solid ${active ? C.borderHi : C.border}`, background: active ? C.raised : "transparent", color: active ? C.text : C.textSub, transition:"all 0.2s", fontWeight: active ? 500 : 400 }}>
    {label}
  </button>
);

const Chip = ({ children }) => (
  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"12px", letterSpacing:"0.04em", color:C.textSub, border:`1.5px solid ${C.border}`, borderRadius:"5px", padding:"5px 12px", display:"inline-block" }}>{children}</span>
);

const fadeUp = (delay=0) => ({
  hidden:  { opacity:0, y:20 },
  visible: { opacity:1, y:0, transition:{ duration:0.7, delay, ease:C.ease } },
});

/* ═══════════════════════════════════════════════════════
   TYPEWRITER
═══════════════════════════════════════════════════════ */
const useTypewriter = (words) => {
  const [wi,setWi]     = useState(0);
  const [text,setText] = useState("");
  const [del,setDel]   = useState(false);
  const [ci,setCi]     = useState(0);
  useEffect(() => {
    const word=words[wi], speed=del?30:65;
    const t=setTimeout(()=>{
      if(!del){ if(ci<word.length){setText(word.slice(0,ci+1));setCi(c=>c+1);}else setTimeout(()=>setDel(true),1900); }
      else    { if(ci>0){setText(word.slice(0,ci-1));setCi(c=>c-1);}else{setDel(false);setWi(w=>(w+1)%words.length);} }
    },speed);
    return ()=>clearTimeout(t);
  },[ci,del,wi]);
  return text;
};

/* ═══════════════════════════════════════════════════════
   ZINC PHONE — object-fit: contain so nothing is cropped
═══════════════════════════════════════════════════════ */
const ZincPhone = ({ activeTab }) => {
  const ref  = useRef(null);
  const prev = useRef(null);

  const srcs = {
    feature: "/videos/Feature.mp4",
    home:    "/videos/Home.mp4",
    rewards: "/videos/Rewards.mp4",
  };

  useEffect(()=>{
    if(!ref.current) return;
    ref.current.src = srcs[activeTab];
    ref.current.play().catch(()=>{});
    prev.current = activeTab;
  },[]);

  useEffect(()=>{
    if(!ref.current || prev.current===activeTab) return;
    prev.current = activeTab;
    const v=ref.current;
    v.style.opacity="0";
    setTimeout(()=>{ v.src=srcs[activeTab]; v.load(); v.play().catch(()=>{}); v.style.opacity="1"; },280);
  },[activeTab]);

  // Phone outer shell — sized by width, height derived from aspect ratio
  // Video inside uses object-fit: contain so the full UI is always visible
  const phoneW = "clamp(220px, 26vw, 280px)";

  return (
    <div style={{
      width: phoneW,
      aspectRatio: "9/19.5",
      background: "#08080b",
      borderRadius: "42px",
      border: `1.5px solid ${C.border}`,
      position: "relative",
      boxShadow: "0 48px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
      // No overflow:hidden — we let the video fill but use contain, not crop
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Dynamic island */}
      <div style={{ position:"absolute", top:"14px", left:"50%", transform:"translateX(-50%)", width:"72px", height:"10px", background:"#000", borderRadius:"8px", zIndex:10 }} />

      {/* Status bar spacer so video starts below dynamic island */}
      <div style={{ height:"36px", flexShrink:0 }} />

      {/* Video — contain keeps the full recording visible */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
        <video
          ref={ref}
          autoPlay muted loop playsInline
          style={{
            width:"100%",
            height:"100%",
            objectFit:"contain",   // ← KEY: shows entire UI, no crop
            transition:"opacity 0.28s ease",
            background:"#08080b",
          }}
        />
      </div>

      {/* Home bar */}
      <div style={{ height:"28px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:"36%", height:"4px", background:"rgba(255,255,255,0.18)", borderRadius:"2px" }} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   HLS VIDEO
═══════════════════════════════════════════════════════ */
const HLSVideo = ({ src, style, autoPlay=true, loop=true, muted=true, controls=false }) => {
  const ref=useRef(null);
  useEffect(()=>{
    if(!ref.current||!src) return;
    const v=ref.current;
    const load=async()=>{
      if(v.canPlayType("application/vnd.apple.mpegurl")){v.src=src;if(autoPlay)v.play().catch(()=>{});return;}
      if(!window.Hls){
        await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.12/hls.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
      }
      if(window.Hls?.isSupported()){
        const hls=new window.Hls({enableWorker:false});hls.loadSource(src);hls.attachMedia(v);
        hls.on(window.Hls.Events.MANIFEST_PARSED,()=>{if(autoPlay)v.play().catch(()=>{});});v._hls=hls;
      }
    };
    load();
    return()=>{if(v._hls){v._hls.destroy();v._hls=null;}};
  },[src]);
  return <video ref={ref} muted={muted} loop={loop} playsInline controls={controls} style={style}/>;
};

/* ═══════════════════════════════════════════════════════
   LIGHTBOX
═══════════════════════════════════════════════════════ */
const Lightbox = ({ video, onClose }) => {
  useEffect(()=>{
    const fn=e=>{if(e.key==="Escape")onClose();};
    window.addEventListener("keydown",fn);
    document.body.style.overflow="hidden";
    return()=>{window.removeEventListener("keydown",fn);document.body.style.overflow="";};
  },[]);
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.22}} onClick={onClose}
      style={{ position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.93)",display:"flex",alignItems:"center",justifyContent:"center",padding:"32px" }}
    >
      <motion.div initial={{scale:0.93}} animate={{scale:1}} exit={{scale:0.93}} transition={{duration:0.28,ease:C.ease}} onClick={e=>e.stopPropagation()}
        style={{ width:"100%",maxWidth:"960px",borderRadius:"12px",overflow:"hidden",position:"relative" }}
      >
        <HLSVideo src={video.src} autoPlay loop muted={false} controls style={{ width:"100%",aspectRatio:"16/9",objectFit:"cover" }}/>
        <button onClick={onClose} style={{ position:"absolute",top:"14px",right:"14px",background:"rgba(0,0,0,0.7)",border:`1px solid ${C.border}`,color:C.textSub,fontFamily:"'DM Mono',monospace",fontSize:"11px",letterSpacing:"0.08em",padding:"6px 14px",borderRadius:"4px" }}>
          ESC / CLOSE
        </button>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   NAV — ZINC · Motion Work · About · Contact · Resume
═══════════════════════════════════════════════════════ */
const Nav = () => {
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>48);
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);
  const lnk = { fontFamily:"'Inter',sans-serif", fontSize:"14px", fontWeight:400, color:C.textSub, transition:"color 0.2s", background:"none", border:"none", padding:0, cursor:"pointer" };
  const hover = e=>e.target.style.color=C.text;
  const leave = e=>e.target.style.color=C.textSub;
  return (
    <motion.header initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5}}
      style={{ position:"fixed",top:0,left:0,right:0,zIndex:500,height:"60px",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 48px",
        backdropFilter:scrolled?"blur(20px) saturate(180%)":"none",
        background:scrolled?"rgba(9,9,11,0.88)":"transparent",
        borderBottom:scrolled?`1px solid ${C.border}`:"1px solid transparent",
        transition:"background 0.35s, border-color 0.35s" }}
    >
      <a href="#top" style={{ fontFamily:"'Sora',sans-serif",fontSize:"16px",fontWeight:600,letterSpacing:"-0.02em",color:C.text }}>Shivam</a>
      <nav style={{ display:"flex",gap:"32px",alignItems:"center" }}>
        <a href="#zinc"    style={lnk} onMouseEnter={hover} onMouseLeave={leave}>ZINC</a>
        <a href="#motion"  style={lnk} onMouseEnter={hover} onMouseLeave={leave}>Motion Work</a>
        <a href="#about"   style={lnk} onMouseEnter={hover} onMouseLeave={leave}>About</a>
        <a href="#contact" style={lnk} onMouseEnter={hover} onMouseLeave={leave}>Contact</a>
        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer"
          style={{ fontFamily:"'DM Mono',monospace",fontSize:"12px",letterSpacing:"0.07em",textTransform:"uppercase",color:C.textSub,border:`1.5px solid ${C.border}`,borderRadius:"5px",padding:"7px 16px",transition:"all 0.2s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderHi;e.currentTarget.style.color=C.text;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSub;}}
        >Resume</a>
      </nav>
    </motion.header>
  );
};

/* ═══════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════ */
const Hero = () => {
  const typed = useTypewriter(["Design Engineer.","Motion Designer.","Product Builder."]);
  const ref   = useRef(null);
  const inView= useInView(ref,{once:true});
  return (
    <section id="top" ref={ref} style={{ minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"120px 48px 80px",maxWidth:"1000px" }}>
      <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"} style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"44px" }}>
        <span style={{ width:"8px",height:"8px",borderRadius:"50%",background:C.green,display:"inline-block",animation:"pulseDot 2.4s ease-in-out infinite" }}/>
        <span style={{ fontFamily:"'Inter',sans-serif",fontSize:"15px",color:C.textSub }}>Available for full-time roles · Bangalore</span>
      </motion.div>

      <motion.h1 variants={fadeUp(0.07)} initial="hidden" animate={inView?"visible":"hidden"}
        style={{ fontFamily:"'Sora',sans-serif",fontSize:"clamp(48px,8vw,96px)",fontWeight:600,letterSpacing:"-0.04em",lineHeight:1.0,color:C.text }}>
        I design and build
      </motion.h1>

      <motion.div variants={fadeUp(0.12)} initial="hidden" animate={inView?"visible":"hidden"}
        style={{ fontFamily:"'Sora',sans-serif",fontSize:"clamp(48px,8vw,96px)",fontWeight:600,letterSpacing:"-0.04em",lineHeight:1.0,color:C.textSub,marginBottom:"36px",minHeight:"1.05em" }}>
        {typed}<span style={{ animation:"blink 1s step-end infinite",color:C.accent,marginLeft:"3px" }}>|</span>
      </motion.div>

      <motion.p variants={fadeUp(0.17)} initial="hidden" animate={inView?"visible":"hidden"}
        style={{ fontSize:"19px",color:C.textSub,maxWidth:"560px",lineHeight:1.75,fontWeight:400 }}>
        7 years of motion design — now shipping in code. I build interfaces where interaction and animation are the same decision. Currently shipping{" "}
        <span style={{ color:C.text,fontWeight:500 }}>ZINC</span>, a premium fintech app for Android.
      </motion.p>

      <motion.div variants={fadeUp(0.22)} initial="hidden" animate={inView?"visible":"hidden"} style={{ display:"flex",gap:"14px",marginTop:"48px",flexWrap:"wrap" }}>
        <BtnPrimary href="#zinc">View ZINC →</BtnPrimary>
        <BtnOutline href="#contact">Get in Touch</BtnOutline>
      </motion.div>

      <motion.div variants={fadeUp(0.27)} initial="hidden" animate={inView?"visible":"hidden"} style={{ display:"flex",gap:"56px",marginTop:"72px",flexWrap:"wrap" }}>
        {[["7 yrs","Motion Design"],["React Native","Primary Stack"],["Bangalore","India"]].map(([v,l])=>(
          <div key={l}>
            <div style={{ fontFamily:"'Sora',sans-serif",fontSize:"16px",fontWeight:600,color:C.text,letterSpacing:"-0.01em" }}>{v}</div>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"12px",color:C.textMeta,letterSpacing:"0.07em",textTransform:"uppercase",marginTop:"4px" }}>{l}</div>
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
  const [tab,setTab] = useState("feature");
  const ref   = useRef(null);
  const inView= useInView(ref,{once:true,margin:"-8%"});
  const tabs  = [
    { id:"feature", label:"Feature",  desc:"Subscription & spending leak detector — core product value. Analyses PDF bank statements to surface recurring charges." },
    { id:"home",    label:"Home",     desc:"Dashboard showing available credit, usage bar, quick actions, and recent transactions at a glance." },
    { id:"rewards", label:"Rewards",  desc:"Cashback reveal with Lottie confetti animation and animated count-up — motion that feels earned, not decorative." },
  ];
  return (
    <section id="zinc" ref={ref} style={{ padding:"120px 48px",background:C.surface,borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"1200px",margin:"0 auto" }}>
        <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}>
          <SectionLabel>Featured Project — 2024–25</SectionLabel>
        </motion.div>

        {/* Main grid */}
        <div className="zinc-grid" style={{ display:"grid",gridTemplateColumns:"1fr 320px",gap:"80px",alignItems:"start" }}>

          {/* Left */}
          <motion.div variants={fadeUp(0.06)} initial="hidden" animate={inView?"visible":"hidden"}>
            <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:"clamp(72px,11vw,128px)",fontWeight:600,letterSpacing:"-0.05em",lineHeight:0.85,color:C.text,marginBottom:"32px" }}>ZINC</h2>
            <p style={{ fontSize:"18px",lineHeight:1.8,color:C.textSub,maxWidth:"520px",marginBottom:"32px" }}>
              A CRED-quality fintech app built from scratch with React Native — custom design system, premium motion, and real product thinking. Every screen designed, every animation implemented, every edge case handled. This is not a prototype.
            </p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"52px" }}>
              {["React Native","React","TypeScript","Reanimated 3","Lottie","EAS Build","Firebase"].map(t=><Chip key={t}>{t}</Chip>)}
            </div>
            <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"14px",color:C.textMeta,marginBottom:"14px" }}>Preview a screen:</p>
            <div style={{ display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"20px" }}>
              {tabs.map(t=><TabBtn key={t.id} label={t.label} active={tab===t.id} onClick={()=>setTab(t.id)}/>)}
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={tab} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:0.22}}
                style={{ fontFamily:"'Inter',sans-serif",fontSize:"15px",color:C.textSub,lineHeight:1.65,maxWidth:"460px" }}>
                {tabs.find(t=>t.id===tab)?.desc}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Right — phone (no justify:flex-end so it sits naturally) */}
          <motion.div variants={fadeUp(0.1)} initial="hidden" animate={inView?"visible":"hidden"}
            style={{ display:"flex",justifyContent:"center",alignItems:"flex-start",paddingTop:"8px" }}>
            <ZincPhone activeTab={tab}/>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   CASE STUDY
   ⚠️  Six cards below use STRUCTURAL LABELS only.
       Content is intentionally left as clear placeholders
       awaiting real text from your Notion case study.
       Paste your Notion content and I'll fill these in.
═══════════════════════════════════════════════════════ */
const CaseStudy = () => {
  const ref   = useRef(null);
  const inView= useInView(ref,{once:true,margin:"-8%"});

  // ─── PASTE YOUR NOTION CONTENT HERE ───────────────
  // Each card = { label, body }
  // body should be 2–3 sentences from your actual case study.
  // Replace every [placeholder] with real text.
  const cards = [
    {
      label: "01 — Problem",
      body:  "People lose money to forgotten subscriptions and recurring charges buried in bank statements. There was no simple, premium tool to surface these leaks without connecting a bank account.",
    },
    {
      label: "02 — User Insight",
      body:  "[Replace with actual user insight from your Notion case study — who the user is, what they struggle with, what they expect from a fintech app.]",
    },
    {
      label: "03 — Product Strategy",
      body:  "[Replace with your actual product decisions from your Notion case study — what features you chose, what you cut, and why.]",
    },
    {
      label: "04 — Motion System",
      body:  "[Replace with your actual motion design decisions from your Notion case study — easing choices, animation principles, how motion supports UX.]",
    },
    {
      label: "05 — Technical Implementation",
      body:  "[Replace with actual implementation details from your Notion case study — stack choices, architecture decisions, challenges solved.]",
    },
    {
      label: "06 — Key Learning",
      body:  "[Replace with actual outcome or learning from your Notion case study — what you would do differently, what the build taught you.]",
    },
  ];
  // ──────────────────────────────────────────────────

  return (
    <section ref={ref} style={{ padding:"120px 48px",background:C.bg,borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:"1200px",margin:"0 auto" }}>

        {/* Header */}
        <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"56px",flexWrap:"wrap",gap:"24px" }}>
          <div>
            <SectionLabel>ZINC — Case Study</SectionLabel>
            <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:"clamp(28px,3.5vw,44px)",fontWeight:600,letterSpacing:"-0.03em",lineHeight:1.15,color:C.text,maxWidth:"560px" }}>
              Designed, built, and shipped — not a prototype.
            </h2>
          </div>
          <BtnOutline href="https://www.notion.so/Case-Study-Zinc-3726a866524e808797b8de851bd64974" target="_blank" style={{ whiteSpace:"nowrap",alignSelf:"flex-start" }}>
            Read Full Case Study ↗
          </BtnOutline>
        </motion.div>

        {/* 6-card grid — always complete, never empty */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1px",background:C.border }}>
          {cards.map(({label,body},i)=>(
            <motion.div key={label} variants={fadeUp(0.04*i)} initial="hidden" animate={inView?"visible":"hidden"}
              style={{ background:C.surface,padding:"36px 32px",transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background=C.raised}
              onMouseLeave={e=>e.currentTarget.style.background=C.surface}
            >
              <SectionLabel style={{ marginBottom:"14px" }}>{label}</SectionLabel>
              <p style={{ fontSize:"15px",lineHeight:1.8,color:C.textSub }}>{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   MOTION WORK — inline section
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
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-5.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-6.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-7.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-8.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-9.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-10.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-11.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
#EXTINF:5,
https://cdn-prod-ccv.adobe.com/Tf-AqBV-pKL/rend/hls_1080/index-12.ts?hdnts=st%3D1780769985%7Eexp%3D1781029185%7Eacl%3D%2Fshared_assets%2Fimage%2F*%21%2Fz%2FTf-AqBV-pKL%2Frend%2F*%21%2Fi%2FTf-AqBV-pKL%2Frend%2F*%21%2FTf-AqBV-pKL%2Fimage%2F*%21%2FTf-AqBV-pKL%2Fcaptions%2F*%7Ehmac%3D19a31dd77088df85a7eeeb7a75bf49b80305840a2fd7b839a93387d8eb11e61f
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
  const [url,setUrl]=useState(null);
  useEffect(()=>{
    if(!m3u8) return;
    const blob=new Blob([m3u8],{type:"application/vnd.apple.mpegurl"});
    const u=URL.createObjectURL(blob);
    setUrl(u);
    return()=>URL.revokeObjectURL(u);
  },[]);
  return url;
};

const MOTION_VIDEOS=[
  {id:1,title:"Motion Piece 01",type:"Motion Design",m3u8:M1},
  {id:2,title:"Motion Piece 02",type:"Motion Design",m3u8:null},
  {id:3,title:"Motion Piece 03",type:"Animation",    m3u8:null},
  {id:4,title:"Motion Piece 04",type:"Motion Design",m3u8:null},
];

const MotionCard=({video,onOpen})=>{
  const blobUrl=useBlobUrl(video.m3u8);
  const [hov,setHov]=useState(false);
  return(
    <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6,ease:C.ease}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>blobUrl&&onOpen({src:blobUrl,title:video.title})}
      style={{ background:C.surface,border:`1.5px solid ${hov?C.borderHi:C.border}`,borderRadius:"10px",overflow:"hidden",cursor:blobUrl?"pointer":"default",transform:hov?"translateY(-3px)":"translateY(0)",transition:"border-color 0.2s, transform 0.25s" }}
    >
      <div style={{aspectRatio:"16/9",background:C.raised,position:"relative",overflow:"hidden"}}>
        {blobUrl
          ? <HLSVideo src={blobUrl} autoPlay loop muted style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:"13px",color:C.textMeta}}>Add /motion/Motion_0{video.id}.mp4</span>
            </div>
        }
        {blobUrl&&(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:hov?"rgba(0,0,0,0.45)":"rgba(0,0,0,0)",transition:"background 0.2s"}}>
            <div style={{width:"52px",height:"52px",borderRadius:"50%",background:"rgba(255,255,255,0.92)",display:"flex",alignItems:"center",justifyContent:"center",opacity:hov?1:0,transition:"opacity 0.2s"}}>
              <span style={{fontSize:"18px",marginLeft:"3px"}}>▶</span>
            </div>
          </div>
        )}
      </div>
      <div style={{padding:"18px 20px"}}>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:"15px",fontWeight:500,color:C.text,marginBottom:"5px"}}>{video.title}</div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:"12px",color:C.textMeta,letterSpacing:"0.05em"}}>{video.type}</div>
      </div>
    </motion.div>
  );
};

const MotionWork=()=>{
  const [lightbox,setLightbox]=useState(null);
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-8%"});
  return(
    <section id="motion" ref={ref} style={{padding:"120px 48px",background:C.surface,borderTop:`1px solid ${C.border}`}}>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"56px",flexWrap:"wrap",gap:"24px"}}>
          <div>
            <SectionLabel>Motion Work</SectionLabel>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(28px,3.5vw,44px)",fontWeight:600,letterSpacing:"-0.03em",lineHeight:1.15,color:C.text}}>
              7 years of making things move.
            </h2>
          </div>
          <BtnOutline href="https://www.behance.net/search/users/shivam%20kumar" target="_blank">View on Behance ↗</BtnOutline>
        </motion.div>
        <motion.div variants={fadeUp(0.06)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"20px"}}>
          {MOTION_VIDEOS.map(v=><MotionCard key={v.id} video={v} onOpen={setLightbox}/>)}
        </motion.div>
      </div>
      <AnimatePresence>{lightbox&&<Lightbox video={lightbox} onClose={()=>setLightbox(null)}/>}</AnimatePresence>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   ABOUT
═══════════════════════════════════════════════════════ */
const About=()=>{
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-8%"});
  return(
    <section id="about" ref={ref} style={{padding:"120px 48px",background:C.bg,borderTop:`1px solid ${C.border}`}}>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>
        <SectionLabel>About</SectionLabel>
        <div className="two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"80px"}}>
          <motion.div variants={fadeUp(0)} initial="hidden" animate={inView?"visible":"hidden"}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(22px,2.8vw,34px)",fontWeight:600,letterSpacing:"-0.03em",lineHeight:1.2,color:C.text,marginBottom:"32px"}}>
              The gap between design and engineering is where good products are built.
            </h2>
            {[
              "7 years as a motion designer taught me that the best interfaces feel inevitable — not designed. Every transition is a UX decision, not a visual one. I'm now coding what I used to hand off.",
              "I care about the 60ms between tap and response. The spring physics on a modal. The count-up animation that makes a number feel real. These are engineering problems that look like design problems.",
              "Targeting Design Engineer and Creative Frontend roles at companies where craft is a product differentiator.",
            ].map((p,i)=>(
              <p key={i} style={{fontSize:"16px",lineHeight:1.85,color:C.textSub,marginBottom:"18px"}}>{p}</p>
            ))}
          </motion.div>
          <motion.div variants={fadeUp(0.08)} initial="hidden" animate={inView?"visible":"hidden"}>
            {[
              ["Currently Building","ZINC — React Native Fintech App"],
              ["Role","Design Engineer · Creative Frontend"],
              ["Based","Bangalore, India"],
              ["Open To","Full-time · Contract"],
              ["Target Companies","CRED · Razorpay · Groww · Zepto"],
              ["Stack","React Native · React · TypeScript · Reanimated 3"],
              ["Design Tools","Figma · After Effects · Photoshop · Illustrator"],
            ].map(([label,value])=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"18px 0",borderBottom:`1px solid ${C.border}`,gap:"24px",flexWrap:"wrap",alignItems:"baseline"}}>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:"12px",color:C.textMeta,letterSpacing:"0.07em",textTransform:"uppercase",flexShrink:0}}>{label}</span>
                <span style={{fontSize:"15px",color:C.textSub,textAlign:"right"}}>{value}</span>
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
const Contact=()=>{
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-8%"});
  return(
    <section id="contact" ref={ref} style={{padding:"140px 48px 100px",background:C.surface,borderTop:`1px solid ${C.border}`}}>
      <div style={{maxWidth:"760px",margin:"0 auto"}}>
        <SectionLabel>Contact</SectionLabel>
        <motion.h2 variants={fadeUp(0.04)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(36px,5.5vw,64px)",fontWeight:600,letterSpacing:"-0.04em",lineHeight:1.05,color:C.text,marginBottom:"24px"}}>
          Open to Design Engineer and Creative Frontend roles.
        </motion.h2>
        <motion.p variants={fadeUp(0.08)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{fontSize:"18px",lineHeight:1.8,color:C.textSub,marginBottom:"52px"}}>
          Building products where motion, craft, and interaction design matter — let's talk.
        </motion.p>
        <motion.div variants={fadeUp(0.12)} initial="hidden" animate={inView?"visible":"hidden"}
          style={{display:"flex",gap:"14px",flexWrap:"wrap",marginBottom:"20px"}}>
          <BtnPrimary href="mailto:contrastyouneed@gmail.com">contrastyouneed@gmail.com</BtnPrimary>
          <BtnOutline href="https://github.com/shivamcs50199" target="_blank">GitHub ↗</BtnOutline>
          <BtnOutline href="https://www.behance.net/search/users/shivam%20kumar" target="_blank">Behance ↗</BtnOutline>
        </motion.div>
        <motion.div variants={fadeUp(0.15)} initial="hidden" animate={inView?"visible":"hidden"}>
          <BtnOutline href="/resume.pdf" download="Shivam_Resume.pdf" style={{marginTop:"8px"}}>
            ↓ Download Resume
          </BtnOutline>
        </motion.div>
        <Divider style={{marginTop:"80px",marginBottom:"32px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
          <span style={{fontFamily:"'Sora',sans-serif",fontSize:"14px",fontWeight:500,color:C.textMeta}}>Shivam · Design Engineer · Bangalore · 2025</span>
          <a href="https://www.notion.so/Privacy-Policy-3776a866524e80ff92b7ce6226087d60" target="_blank" rel="noopener noreferrer"
            style={{fontFamily:"'DM Mono',monospace",fontSize:"12px",color:C.textMeta,letterSpacing:"0.07em",textTransform:"uppercase",transition:"color 0.2s"}}
            onMouseEnter={e=>e.target.style.color=C.textSub} onMouseLeave={e=>e.target.style.color=C.textMeta}>
            Privacy Policy
          </a>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════ */
export default function App(){
  return(
    <>
      <GlobalStyles/>
      <Nav/>
      <main>
        <Hero/>
        <ZincSection/>
        <CaseStudy/>
        <MotionWork/>
        <About/>
        <Contact/>
      </main>
    </>
  );
}
