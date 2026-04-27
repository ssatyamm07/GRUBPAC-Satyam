const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconLive({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="7" width="14" height="10" rx="1.5" {...stroke} />
      <path d="M16 12l4-3v6l-4-3" {...stroke} />
    </svg>
  )
}

export function IconTeacher({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...stroke} />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" {...stroke} />
      <path d="M8 7h8M8 11h6" {...stroke} />
    </svg>
  )
}

export function IconPrincipal({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...stroke} />
      <path d="m9 12 2 2 4-4" {...stroke} />
    </svg>
  )
}

export function IconSignIn({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" {...stroke} />
      <path d="M10 17l5-5-5-5" {...stroke} />
      <path d="M15 12H3" {...stroke} />
    </svg>
  )
}

export function IconSidebarCollapse({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M15 6 9 12l6 6M3 12h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconMenu({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4 6h16M4 12h16M4 18h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
