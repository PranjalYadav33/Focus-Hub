export function uid(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return (crypto as any).randomUUID();
    }
  } catch {}
  // Fallback: RFC4122 v4-ish using random values
  const rnd = (len = 16) => Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${rnd(8)}-${rnd(4)}-4${rnd(3)}-8${rnd(3)}-${rnd(12)}`;
}

