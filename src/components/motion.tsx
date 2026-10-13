"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { stagger, useAnimate, useInView, useReducedMotion } from "motion/react";

// Scroll-triggered entrance animations (Motion, formerly Framer Motion).
// Content is always visible in the server HTML. After hydration, only elements that are still
// below the fold are hidden and then animated in as they scroll into view, so nothing flashes
// and no-JS visitors and crawlers always see everything.

const ease = [0.22, 1, 0.36, 1] as const;

function useEntrance(targets: (root: HTMLElement) => HTMLElement[], delayEach = 0) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { once: true, margin: "0px 0px -60px 0px" });
  const reduced = useReducedMotion();
  const armed = useRef(false);

  useLayoutEffect(() => {
    const root = scope.current;
    if (reduced || !root || root.getBoundingClientRect().top < window.innerHeight) return;
    for (const el of targets(root)) {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
    }
    armed.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    if (!inView || !armed.current || !scope.current) return;
    armed.current = false;
    animate(targets(scope.current), { opacity: 1, transform: "translateY(0px)" }, { duration: 0.55, ease, delay: stagger(delayEach) });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- targets is stable per component
  }, [inView]);

  return scope;
}

/** Fades a single block up into view. */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const scope = useEntrance((root) => [root]);
  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}

/** A grid whose direct children fade up one after another. */
export function RevealGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  const scope = useEntrance((root) => Array.from(root.children) as HTMLElement[], 0.07);
  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
