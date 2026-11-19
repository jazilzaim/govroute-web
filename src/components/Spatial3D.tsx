import React, { useEffect, useRef, useState } from 'react';

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}

/**
 * Interactive 3D perspective tilt container with cursor-tracked specular sheen.
 */
export function Tilt3DCard({
  children,
  className = '',
  maxTilt = 8,
  glare = true,
}: Tilt3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>(
    'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
  );
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * (maxTilt * 2);
    const rotateX = (0.5 - py) * (maxTilt * 2);

    setTransform(
      `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`
    );
    if (glare) {
      setGlarePos({ x: px * 100, y: py * 100, opacity: 1 });
    }
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.11), transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}

interface Reveal3DProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}

/**
 * Scroll-triggered 3D spatial reveal (rotateX + translateY + scale settling into plane).
 */
export function Reveal3D({ children, delayMs = 0, className = '' }: Reveal3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(el);
          }
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delayMs}ms`,
        transform: visible
          ? 'perspective(1100px) translateY(0px) rotateX(0deg) scale(1)'
          : 'perspective(1100px) translateY(36px) rotateX(10deg) scale(0.97)',
        opacity: visible ? 1 : 0,
        transition:
          'transform 750ms cubic-bezier(0.16, 1, 0.3, 1), opacity 650ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

const CHAPTERS = [
  { id: 'preview', num: '01', label: 'CORE' },
  { id: 'features', num: '02', label: 'EXPLODE' },
  { id: 'industries', num: '03', label: 'SECTORS' },
  { id: 'workflow', num: '04', label: 'LOCK' },
] as const;

/**
 * Minimalist right-edge scroll keyframe HUD synced with the 3D scene choreography.
 */
export function ScrollKeyframeHud() {
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const p = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      setProgress(p);

      if (p < 0.22) setActiveIdx(0);
      else if (p < 0.54) setActiveIdx(1);
      else if (p < 0.84) setActiveIdx(2);
      else setActiveIdx(3);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <aside
      aria-label="3D Scene Scroll Chapters"
      className="hidden 2xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-3"
    >
      <div className="font-mono text-[9px] tracking-[0.22em] text-neutral-500 uppercase">
        3D TIMELINE · {String(Math.round(progress * 100)).padStart(2, '0')}%
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-2.5">
          {CHAPTERS.map((ch, idx) => {
            const active = activeIdx === idx;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => jumpTo(ch.id)}
                className={`font-mono text-[10px] tracking-[0.18em] uppercase transition-all cursor-pointer flex items-center gap-2 ${
                  active ? 'text-white font-semibold' : 'text-neutral-600 hover:text-neutral-300'
                }`}
              >
                <span>
                  {ch.num} · {ch.label}
                </span>
                <span
                  className={`h-1.5 rounded-full transition-all ${
                    active ? 'w-4 bg-white' : 'w-1.5 bg-white/20'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="w-[2px] h-28 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="w-full bg-white rounded-full transition-all duration-150"
            style={{ height: `${Math.max(10, progress * 100)}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
