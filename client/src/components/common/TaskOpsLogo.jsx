import React from 'react';

export function TaskOpsLogo({ size = 32, showText = true, textColor = 'dark', subtitle = null }) {
  const isDark = textColor === 'light' || textColor === 'white';

  const iconSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      aria-label="TaskOps Logo"
    >
      <defs>
        <linearGradient id="taskOpsBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D7ECF" />
          <stop offset="100%" stopColor="#1B5792" />
        </linearGradient>
        <linearGradient id="opsGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#236DB4" />
        </linearGradient>
      </defs>

      {/* Rounded Hex-Squircle Shield */}
      <rect width="36" height="36" rx="8" fill="url(#taskOpsBg)" />

      {/* Operations dynamic orbit line */}
      <path
        d="M9 14.5C9.8 11.2 13 8.8 17 8.8C22.1 8.8 26.2 12.9 26.2 18C26.2 19.8 25.7 21.5 24.8 22.8"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Inner Precision Task Check & Velocity Arrow */}
      <path
        d="M11 18.2L16 23.2L25.5 13.2"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Ops Active Pulse Beacon */}
      <circle cx="26" cy="10.5" r="2.2" fill="#38BDF8" />
    </svg>
  );

  if (!showText) {
    return iconSvg;
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      {iconSvg}
      <div style={{ minWidth: 0, overflow: 'hidden' }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: size > 36 ? '1.35rem' : '1.02rem',
            letterSpacing: '-0.025em',
            color: isDark ? '#FFFFFF' : '#111827',
            display: 'flex',
            alignItems: 'center',
            lineHeight: 1.15,
          }}
        >
          <span>Task</span>
          <span style={{ color: isDark ? '#60A5FA' : 'var(--primary-600)' }}>Ops</span>
        </div>
        {subtitle !== null ? (
          <div
            style={{
              fontSize: '0.66rem',
              color: isDark ? '#94A3B8' : '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
              marginTop: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}
