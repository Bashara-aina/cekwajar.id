"use client";

import { useEffect } from "react";

export function ConfettiEffect({
  trigger,
}: {
  trigger?: boolean;
}) {
  useEffect(() => {
    if (!trigger) return;

    let animationId: number;
    let canvasEl: HTMLCanvasElement;

    const canvas2d = document.createElement("canvas");
    canvasEl = canvas2d;
    canvas2d.style.position = "fixed";
    canvas2d.style.top = "0";
    canvas2d.style.left = "0";
    canvas2d.style.width = "100%";
    canvas2d.style.height = "100%";
    canvas2d.style.pointerEvents = "none";
    canvas2d.style.zIndex = "9999";
    document.body.appendChild(canvas2d);

    const ctx = canvas2d.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas2d.width = window.innerWidth;
      canvas2d.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;
    }[] = [];

    const colors = ["#10b981", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        life: 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
      let alive = false;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.008;

        if (p.life > 0 && p.y < canvas2d.height + 20) {
          alive = true;
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.size, p.size, 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      if (alive) {
        animationId = requestAnimationFrame(animate);
      } else {
        if (document.body.contains(canvas2d)) {
          document.body.removeChild(canvas2d);
        }
      }
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationId) cancelAnimationFrame(animationId);
      if (document.body.contains(canvas2d)) {
        document.body.removeChild(canvas2d);
      }
    };
  }, [trigger]);

  return null;
}
