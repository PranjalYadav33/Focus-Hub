let animeLib: any;
async function getAnime() {
  if (!animeLib) {
    const mod: any = await import('animejs');
    animeLib = mod.default || mod;
  }
  return animeLib;
}

export const motion = {
  // Durations
  d100: 120,
  d150: 160,
  d200: 200,
  d300: 280,
  d400: 360,
  d500: 480,

  // Easing
  easeStandard: 'easeOutQuad',
  easeEmphasis: 'easeOutQuint',
  easeInOut: 'easeInOutQuad',
};

export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  // Explicit app preference overrides system if set to 'reduced'
  const pref = localStorage.getItem('motion_preference');
  if (pref === 'reduced') return true;
  if (pref === 'normal') return false;
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export async function animateIn(el: Element | Element[] | NodeListOf<Element>, options?: any) {
  if (prefersReducedMotion()) return;
  const anime = await getAnime();
  anime({
    targets: el as any,
    opacity: [0, 1],
    translateY: [8, 0],
    duration: motion.d300,
    easing: motion.easeStandard,
    ...options,
  });
}

export async function animateStagger(selector: string, options?: any) {
  if (prefersReducedMotion()) return;
  const anime = await getAnime();
  anime({
    targets: selector,
    opacity: [0, 1],
    translateY: [8, 0],
    delay: anime.stagger(60),
    duration: motion.d400,
    easing: motion.easeEmphasis,
    ...options,
  });
}

// Confetti burst micro-interaction for delightful feedback on completion
export async function confettiBurst(x: number, y: number, opts?: { count?: number }) {
  if (prefersReducedMotion()) return;
  const anime = await getAnime();
  const count = opts?.count ?? 16;
  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    'hsl(var(--muted))',
    '#22c55e', '#f97316', '#eab308'
  ];
  const container = document.body;
  const pieces: HTMLSpanElement[] = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.style.position = 'fixed';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = el.style.height = `${Math.random() * 6 + 4}px`;
    el.style.background = colors[i % colors.length];
    el.style.borderRadius = '9999px';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '9999';
    container.appendChild(el);
    pieces.push(el);
  }
  anime({
    targets: pieces,
    translateX: () => (Math.random() - 0.5) * 160,
    translateY: () => (Math.random() - 0.8) * 220,
    scale: [1, 0.8],
    opacity: [{ value: 1, duration: 150 }, { value: 0, duration: 400, delay: 200 }],
    rotate: () => Math.random() * 260,
    easing: 'easeOutQuad',
    duration: 700,
    complete: () => pieces.forEach(p => p.remove()),
  });
}
