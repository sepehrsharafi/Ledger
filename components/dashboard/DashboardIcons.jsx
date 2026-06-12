export function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function BellIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4a6 6 0 0 0-6 6v3.5L4 17h16l-2-3.5V10a6 6 0 0 0-6-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
      <path d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NavIcon({ name, className = "h-5 w-5" }) {
  const icons = {
    overview: (
      <path d="M5 16.5h4.5V7H5v9.5Zm5.25 0h4V11h-4v5.5Zm4.75 0H19V5h-4v11.5Z" />
    ),
    leads: (
      <>
        <circle cx="8" cy="8" r="2.75" />
        <path d="M3.5 16.5c.8-2.4 2.6-3.75 4.5-3.75s3.7 1.35 4.5 3.75" strokeLinecap="round" />
        <circle cx="16.5" cy="9" r="2.25" />
        <path d="M13.75 15.5c.55-1.65 1.8-2.75 3.25-2.75 1.2 0 2.3.7 3 1.9" strokeLinecap="round" />
      </>
    ),
    campaigns: (
      <>
        <path d="m4 12.5 16-7v13l-16-6Z" />
        <path d="M8 14.5v4" strokeLinecap="round" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5.5" width="16" height="14" rx="3" />
        <path d="M8 3.5v4M16 3.5v4M4 9.5h16" strokeLinecap="round" />
      </>
    ),
    tasks: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m8.5 12 2 2 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    approvals: (
      <>
        <path d="M12 3.5 5 6.25v5.1c0 4 2.45 7.2 7 9.15 4.55-1.95 7-5.15 7-9.15v-5.1L12 3.5Z" />
        <path d="m9.25 12.25 1.8 1.8 3.8-4.05" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    reports: (
      <>
        <path d="M5 18.5V10M10 18.5V5.5M15 18.5v-7M20 18.5V8" strokeLinecap="round" />
      </>
    ),
    projects: (
      <>
        <path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" />
        <path d="M6 10.75v4.75L12 18l6-2.5v-4.75" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    team: (
      <>
        <circle cx="8" cy="8" r="2.5" />
        <circle cx="16.5" cy="8.5" r="2" />
        <path d="M4 17c.7-2.2 2.35-3.5 4-3.5s3.3 1.3 4 3.5M13.5 16.5c.5-1.5 1.55-2.5 3-2.5 1 0 2 .5 2.75 1.55" strokeLinecap="round" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="2.75" />
        <path d="M19 12a7 7 0 0 0-.08-1l2.08-1.62-2-3.46-2.5 1a7.95 7.95 0 0 0-1.74-1l-.38-2.7h-4l-.38 2.7a7.95 7.95 0 0 0-1.74 1l-2.5-1-2 3.46L5.08 11A7 7 0 0 0 5 12c0 .34.03.67.08 1L3 14.62l2 3.46 2.5-1c.54.42 1.12.76 1.74 1l.38 2.7h4l.38-2.7c.62-.24 1.2-.58 1.74-1l2.5 1 2-3.46L18.92 13c.05-.33.08-.66.08-1Z" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    integrations: (
      <>
        <path d="M8 7.5h4a3 3 0 0 1 0 6H8" strokeLinecap="round" />
        <path d="M16 16.5h-4a3 3 0 1 1 0-6h4" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      {icons[name] || icons.settings}
    </svg>
  );
}
