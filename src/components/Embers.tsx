const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7 + 4) % 96}%`,
  delay: `${(i % 7) * 0.32}s`,
  size: 3 + (i % 4),
  duration: `${2 + (i % 5) * 0.35}s`,
}));

/** Ember particles that float upward from the forge while a poem is composed. */
export function Embers({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 overflow-hidden">
      {EMBERS.map((ember, i) => (
        <span
          key={i}
          className="animate-ember absolute bottom-0 rounded-full bg-ember"
          style={{
            left: ember.left,
            width: ember.size,
            height: ember.size,
            animationDelay: ember.delay,
            animationDuration: ember.duration,
          }}
        />
      ))}
    </div>
  );
}

/** Ambient ink-drop wash used behind hero sections. */
export function InkBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-ink bg-ink-drop absolute -inset-24 opacity-90 blur-3xl" />
    </div>
  );
}
