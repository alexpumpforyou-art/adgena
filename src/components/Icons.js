'use client';

// iOS-style line icons (SF Symbols inspired)
// All icons: 20x20 viewBox, 1.5px stroke, currentColor

const s = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

export function IconFire({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2c0 3-3 4.5-3 7.5a3 3 0 0 0 6 0c0-1.5-.5-2.5-1-3.5" />
        <path d="M10 18c-3.5 0-6-2.5-6-6 0-4 3-6 4.5-8 1.5 2 5.5 4 5.5 8 0 3.5-2.5 6-4 6z" />
      </svg>
    </span>
  );
}

export function IconDiamond({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7.5 10 17.5 17 7.5 14 2.5H6z" />
        <path d="M3 7.5h14" />
        <path d="M7.5 2.5 6 7.5 10 17.5 14 7.5 12.5 2.5" />
      </svg>
    </span>
  );
}

export function IconLeaf({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 16C4 16 5 6 14 3c0 0 1 9-7 13" />
        <path d="M4 16c3-3 6-5 10-6" />
      </svg>
    </span>
  );
}

export function IconSparkle({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.5 4.5l2 2M13.5 13.5l2 2M15.5 4.5l-2 2M6.5 13.5l-2 2" />
      </svg>
    </span>
  );
}

export function IconPhone({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="1.5" width="10" height="17" rx="2" />
        <line x1="8.5" y1="15.5" x2="11.5" y2="15.5" />
      </svg>
    </span>
  );
}

export function IconSun({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="3.5" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4" />
      </svg>
    </span>
  );
}

export function IconMoon({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.5 10.5a6.5 6.5 0 1 1-7-7 5 5 0 0 0 7 7z" />
      </svg>
    </span>
  );
}

export function IconWand({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17 13 7" />
        <path d="M11 5l4 4" />
        <path d="M15 2l3 3-2 2-3-3z" />
        <circle cx="5" cy="5" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="3" cy="8" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="8" cy="3" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

export function IconLoader({ size = 20, className }) {
  return (
    <span style={{ ...s, animation: 'spin 1s linear infinite' }} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M10 2a8 8 0 0 1 8 8" />
      </svg>
    </span>
  );
}

export function IconDownload({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 3v10M6 9l4 4 4-4" />
        <path d="M3 14v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2" />
      </svg>
    </span>
  );
}

export function IconRefresh({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 2.5v5h5" />
        <path d="M3.5 7.5A7 7 0 0 1 16.5 10" />
        <path d="M16.5 17.5v-5h-5" />
        <path d="M16.5 12.5A7 7 0 0 1 3.5 10" />
      </svg>
    </span>
  );
}

export function IconShield({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2 3 5v4c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V5z" />
      </svg>
    </span>
  );
}

export function IconClock({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="7.5" />
        <path d="M10 5.5V10l3 2" />
      </svg>
    </span>
  );
}

export function IconTrafficLight({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5.5" y="1.5" width="9" height="17" rx="2" />
        <circle cx="10" cy="6" r="1.5" />
        <circle cx="10" cy="10" r="1.5" />
        <circle cx="10" cy="14" r="1.5" />
      </svg>
    </span>
  );
}

export function IconChart({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17V9M7.5 17V6M12 17V3M16.5 17V8" />
      </svg>
    </span>
  );
}

export function IconWarning({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 3 2 17h16z" />
        <line x1="10" y1="8" x2="10" y2="12" />
        <circle cx="10" cy="14.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

export function IconCamera({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6.5a1 1 0 0 1 1-1h2.5l1.5-2h6l1.5 2H17a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
        <circle cx="10" cy="10.5" r="3" />
      </svg>
    </span>
  );
}

export function IconPalette({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2a8 8 0 0 0 0 16c1 0 2-1 2-2 0-.5-.2-1-.5-1.3-.3-.3-.5-.8-.5-1.2 0-1.1.9-2 2-2h2c2.8 0 5-2.2 5-5a8 8 0 0 0-10-7.5" />
        <circle cx="6" cy="8" r="1" fill="currentColor" stroke="none" />
        <circle cx="9" cy="5.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="13" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="5.5" cy="12" r="1" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

export function IconRocket({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 16s-2-1-4-1c0-2-.5-4-1-5 3-3 6-7 10-8-1 4-5 7-8 10" />
        <path d="M6 15c-1 1-2 2-3 2 0-1 1-2 2-3" />
        <circle cx="13" cy="7" r="1.5" />
      </svg>
    </span>
  );
}

export function IconPlus({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M10 4v12M4 10h12" />
      </svg>
    </span>
  );
}

export function IconMail({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="16" height="12" rx="1.5" />
        <path d="M2 5.5 10 11l8-5.5" />
      </svg>
    </span>
  );
}

export function IconUser({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="7" r="3.5" />
        <path d="M3 17.5c0-3 3-5.5 7-5.5s7 2.5 7 5.5" />
      </svg>
    </span>
  );
}

export function IconCrown({ size = 20, className }) {
  return (
    <span style={s} className={className}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14 2 6l4.5 3L10 4l3.5 5L18 6l-1 8z" />
        <path d="M3 14h14v2H3z" />
      </svg>
    </span>
  );
}
