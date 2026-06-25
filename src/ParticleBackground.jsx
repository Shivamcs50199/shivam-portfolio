import { useCallback, useEffect, useRef, useState } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loadTextShape } from "@tsparticles/shape-text";

const CODE_GLYPHS = [
  "0",
  "1",
  "<>",
  "{}",
  "//",
  "0101",
  "===",
  "*/",
  "=>",
  "[]",
  "()",
  ";:",
  "&&",
  "||",
  "!=",
  "+=",
];

const options = {
  fullScreen: { enable: true, zIndex: -1 },
  background: { color: { value: "#050810" } },
  fpsLimit: 60,
  interactivity: {
    detectsOn: "window",
    events: {
      onHover: { enable: true, mode: ["attract", "parallax"] },
      onClick: { enable: false },
      resize: { enable: true },
    },
    modes: {
      attract: {
        distance: 180,
        duration: 0.4,
        speed: 1.2,
        factor: 4,
        maxSpeed: 50,
        easing: "ease-out-quad",
      },
      parallax: { enable: true, force: 18, smooth: 14 },
    },
  },
  particles: {
    number: {
      value: 170,
      density: { enable: true, width: 1440, height: 900 },
    },
    color: {
      value: ["#c8cfe8", "#8891b8", "#4a5280", "#6b7aaa", "#a0aac8"],
    },
    shape: {
      type: "text",
      options: {
        text: {
          value: CODE_GLYPHS,
          font: "'Fira Code', 'Courier New', monospace",
          style: "",
          weight: "400",
          fill: true,
        },
      },
    },
    opacity: {
      value: { min: 0.25, max: 0.6 },
      animation: { enable: true, speed: 0.35, sync: false },
    },
    size: {
      value: { min: 12, max: 25 },
      animation: { enable: true, speed: 0.6, sync: false },
    },
    move: {
      enable: true,
      speed: { min: 0.15, max: 0.55 },
      direction: "none",
      random: true,
      straight: false,
      outModes: { default: "out" },
      gravity: { enable: true, acceleration: -0.018, maxSpeed: 0.5 },
      attract: { enable: false },
    },
    rotate: {
      value: { min: 0, max: 360 },
      direction: "random",
      animation: { enable: true, speed: 0.4, sync: false },
    },
    links: { enable: false },
    collisions: { enable: false },
  },
  detectRetina: true,
  smooth: true,
};

function LoadingSplash({ visible }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#050810",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Only start fading AFTER visible goes false
        opacity: visible ? 1 : 0,
        // pointer-events off immediately so UI is clickable during fade
        pointerEvents: visible ? "all" : "none",
        transition: "opacity 0.5s ease",
      }}
    >
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#8891b8",
              animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes splashDot {
          0%, 100% { opacity: 0.2; transform: translateY(0); }
          50%       { opacity: 1;   transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

function ParticlesInner({ onReady }) {
  const scrollVelRef = useRef(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let rafId;
    const onScroll = () => {
      const dy = window.scrollY - lastScrollY.current;
      lastScrollY.current = window.scrollY;
      scrollVelRef.current = Math.max(-3, Math.min(3, dy * 0.12));
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const decay = () => {
          scrollVelRef.current *= 0.92;
          if (Math.abs(scrollVelRef.current) > 0.01)
            rafId = requestAnimationFrame(decay);
        };
        decay();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // particlesLoaded fires when tsparticles has actually painted
  // the first frame — this is the true "ready" signal
  const handleParticlesLoaded = useCallback(async () => {
    onReady();
  }, [onReady]);

  return (
    <Particles
      id="code-particles"
      options={options}
      particlesLoaded={handleParticlesLoaded}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}

export default function ParticleBackground() {
  const [splashVisible, setSplashVisible] = useState(true);

  const initEngine = useCallback(async (engine) => {
    // Engine plugin registration — NOT the ready signal
    await loadSlim(engine);
    await loadTextShape(engine);
    // Do NOT hide splash here — particles aren't painted yet at this point
  }, []);

  const handleParticlesReady = useCallback(() => {
    // This fires when the first frame is actually drawn on screen
    // This is the correct moment to hide the splash
    setSplashVisible(false);
  }, []);

  return (
    <>
      <LoadingSplash visible={splashVisible} />
      <ParticlesProvider init={initEngine}>
        <ParticlesInner onReady={handleParticlesReady} />
      </ParticlesProvider>
    </>
  );
}
