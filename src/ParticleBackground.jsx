import { useCallback, useEffect, useRef } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loadTextShape } from "@tsparticles/shape-text";

const CODE_GLYPHS = [
  "0",
  "1",
  "<>",
  "{}",
  "//",
  "Aa",
  "/*",
  "*/",
  "=>",
  "[]",
  "()",
  ";;",
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
      value: 120,
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
          font: "'Fira Code', 'JetBrains Mono', 'Courier New', monospace",
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
      value: { min: 12, max: 28 },
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
      drift: 0,
      warp: false,
      attract: { enable: false },
    },
    rotate: {
      value: { min: 0, max: 360 },
      direction: "random",
      animation: { enable: true, speed: 0.4, sync: false },
    },
    tilt: {
      enable: true,
      value: { min: 0, max: 30 },
      direction: "random",
      animation: { enable: true, speed: 0.3, sync: false },
    },
    links: { enable: false },
    collisions: { enable: false },
  },
  detectRetina: true,
  smooth: true,
};

function ParticlesInner() {
  console.log("ParticlesInner render");
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

  return (
    <Particles
      id="code-particles"
      options={options}
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
  console.log("ParticleBackground render");
  const initEngine = useCallback(async (engine) => {
    console.log("initEngine called");
    await loadSlim(engine);
    console.log("loadSlim done");
    await loadTextShape(engine);
    console.log("loadTextShape done");
  }, []);

  return (
    <ParticlesProvider init={initEngine}>
      <ParticlesInner />
    </ParticlesProvider>
  );
}
