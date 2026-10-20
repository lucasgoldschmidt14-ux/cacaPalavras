interface Props {
  className?: string
}

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function IconeAjuda({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.2a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8v.3" />
      <path d="M12 17.2h.01" />
    </svg>
  )
}

export function IconeGrafico({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  )
}

export function IconeCalendario({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}

export function IconeVoltar({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

export function IconeCompartilhar({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  )
}

export function IconeFechar({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IconeApagar({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M21 5H9L3 12l6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" />
      <path d="M13 9l4 6M17 9l-4 6" />
    </svg>
  )
}

export function IconeFogo({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3s5 4.2 5 8.4A5 5 0 0 1 7 11.4C7 8.6 9 6.6 10 5c.4 1.6 1.2 2.6 2 3 0-1.8 0-3.4 0-5z" />
    </svg>
  )
}
