'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
    baseX: number;
    baseY: number;
}

interface ParticleFieldProps {
    particleCount?: number;
    colors?: string[];
    maxSize?: number;
    speed?: number;
    interactive?: boolean;
    connectDistance?: number;
}

export default function ParticleField({
    particleCount = 80,
    colors = ['#6366f1', '#8b5cf6', '#a855f7', '#3b82f6', '#06b6d4'],
    maxSize = 3,
    speed = 0.3,
    interactive = true,
    connectDistance = 120,
}: ParticleFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();
    const dimensionsRef = useRef({ w: 0, h: 0 });

    const initParticles = useCallback((w: number, h: number) => {
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            particles.push({
                x,
                y,
                baseX: x,
                baseY: y,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                size: Math.random() * maxSize + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
        particlesRef.current = particles;
    }, [particleCount, colors, maxSize, speed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            dimensionsRef.current = { w: rect.width, h: rect.height };

            if (particlesRef.current.length === 0) {
                initParticles(rect.width, rect.height);
            }
        };

        resize();
        window.addEventListener('resize', resize);

        const handleMouseMove = (e: MouseEvent) => {
            if (!interactive) return;
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        const animate = () => {
            const { w, h } = dimensionsRef.current;
            ctx.clearRect(0, 0, w, h);

            const particles = particlesRef.current;
            const mouse = mouseRef.current;
            const mouseRadius = 150;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Mouse interaction - push particles away, creating a ripple effect
                if (interactive) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouseRadius) {
                        const force = (mouseRadius - dist) / mouseRadius;
                        const angle = Math.atan2(dy, dx);
                        p.vx -= Math.cos(angle) * force * 0.8;
                        p.vy -= Math.sin(angle) * force * 0.8;
                    }
                }

                // Apply slight drift back to base position
                p.vx += (p.baseX - p.x) * 0.001;
                p.vy += (p.baseY - p.y) * 0.001;

                // Friction
                p.vx *= 0.98;
                p.vy *= 0.98;

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around screen
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;
                if (p.y < -10) p.y = h + 10;
                if (p.y > h + 10) p.y = -10;

                // Pulsing opacity
                p.opacity = 0.1 + Math.sin(Date.now() * 0.001 + i) * 0.15 + 0.15;

                // Draw particle with glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace(')', `, ${p.opacity})`).replace('rgb', 'rgba').replace('#', '');

                // Parse hex color to rgba
                const hex = p.color;
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
                ctx.fill();

                // Glow effect for larger particles
                if (p.size > 1.5) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.1})`;
                    ctx.fill();
                }

                // Connect nearby particles with lines
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const ddx = p.x - p2.x;
                    const ddy = p.y - p2.y;
                    const distance = Math.sqrt(ddx * ddx + ddy * ddy);

                    if (distance < connectDistance) {
                        const lineOpacity = (1 - distance / connectDistance) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${lineOpacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [interactive, connectDistance, initParticles]);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="particle-canvas"
                aria-hidden="true"
            />
            <style jsx>{`
        .particle-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>
        </>
    );
}
