import React, { useCallback, useEffect, useRef } from "react";

// Interactive canvas backdrop for the login screen: floating network nodes,
// mouse-follow particles and ripples. Purely decorative — no state or
// business logic lives here, so it is isolated from the auth flow.
const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let W = window.innerWidth,
      H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      color: string;
      life: number;
      maxLife: number;
    };
    const particles: Particle[] = [];

    type Node = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    };
    const COLS = ["rgba(24,95,165,", "rgba(55,138,221,", "rgba(12,68,124,"];
    const nodes: Node[] = Array.from({ length: 22 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 2 + Math.random() * 3,
      alpha: 0.15 + Math.random() * 0.25,
    }));

    type Ripple = {
      x: number;
      y: number;
      r: number;
      maxR: number;
      alpha: number;
    };
    const ripples: Ripple[] = [];
    let lastMouse = { x: -999, y: -999 };
    let frameCount = 0;

    const spawnParticle = (x: number, y: number) => {
      if (particles.length > 80) return;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.2;
      const maxLife = 60 + Math.random() * 60;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1 + Math.random() * 2.5,
        alpha: 0.5 + Math.random() * 0.4,
        color: COLS[Math.floor(Math.random() * COLS.length)],
        life: 0,
        maxLife,
      });
    };

    const draw = () => {
      frameCount++;
      W = canvas.width;
      H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      if (mx > 0 && my > 0 && frameCount % 3 === 0) {
        spawnParticle(
          mx + (Math.random() - 0.5) * 30,
          my + (Math.random() - 0.5) * 30,
        );
      }

      const dx = mx - lastMouse.x,
        dy = my - lastMouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 18 && frameCount % 12 === 0 && mx > 0) {
        ripples.push({
          x: mx,
          y: my,
          r: 4,
          maxR: 80 + Math.random() * 40,
          alpha: 0.35,
        });
        lastMouse = { x: mx, y: my };
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += (rp.maxR - rp.r) * 0.06;
        rp.alpha -= 0.008;
        if (rp.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(24,95,165,${rp.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        const ndx = n.x - mx,
          ndy = n.y - my;
        const nd = Math.sqrt(ndx * ndx + ndy * ndy);
        if (nd < 120) {
          const force = ((120 - nd) / 120) * 0.4;
          n.vx += (ndx / nd) * force;
          n.vy += (ndy / nd) * force;
        }
        n.vx *= 0.99;
        n.vy *= 0.99;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(24,95,165,${n.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j];
          const dx2 = a.x - b.x,
            dy2 = a.y - b.y;
          const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (d2 < 160) {
            const alpha = (1 - d2 / 160) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(24,95,165,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        const progress = p.life / p.maxLife;
        const alpha = p.alpha * (1 - progress);
        const radius = p.r * (1 - progress * 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      if (mx > 0 && my > 0) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
        grd.addColorStop(0, "rgba(24,95,165,0.06)");
        grd.addColorStop(1, "rgba(24,95,165,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", onResize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default AnimatedBackground;
