/** Shared icons for hub widgets — keyed by feature.icon / item.icon */
export const FeatureIcon = ({ name = 'spark', className = 'w-5 h-5' }) => {
  const props = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, viewBox: '0 0 24 24' };
  switch (name) {
    case 'cloud':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 19h11a4 4 0 000-8 5.5 5.5 0 00-10.4-1.5A3.5 3.5 0 006 19z" />
        </svg>
      );
    case 'gold':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.8 7.1 18.2l.9-5.5-4-3.9 5.5-.8L12 3z" />
        </svg>
      );
    case 'currency':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.2 0-4 1.1-4 2.5S9.8 13 12 13s4 1.1 4 2.5S14.2 18 12 18m0-14v2m0 12v2" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m0 14h16M8 15V9m4 6V7m4 8v-4" />
        </svg>
      );
    case 'fuel':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V6a2 2 0 012-2h6a2 2 0 012 2v14M8 8h4m6 0v8a2 2 0 002 2h0a2 2 0 002-2V9l-2-2" />
        </svg>
      );
    case 'traffic':
      return (
        <svg {...props}>
          <circle cx="12" cy="6" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="18" r="2" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M4 7h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v2m8-2v2M4 9h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
        </svg>
      );
    case 'cart':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1.5 6h13M10 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM7 6H5a2 2 0 000 4h2M17 6h2a2 2 0 010 4h-2" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zm9 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </svg>
      );
    case 'star':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.8 7.1 18.2l.9-5.5-4-3.9 5.5-.8L12 3z" />
        </svg>
      );
    case 'water':
    case 'power':
    case 'metro':
    case 'air':
    case 'pin':
    case 'trend':
    case 'alert':
    case 'news':
    case 'spark':
    case 'quiz':
    case 'history':
    case 'game':
    case 'doc':
    case 'wallet':
    case 'id':
    case 'flag':
    default:
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
        </svg>
      );
  }
};

export const colSpanClass = (span = 4) => {
  const map = {
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
    5: 'lg:col-span-5',
    6: 'lg:col-span-6',
    7: 'lg:col-span-7',
    8: 'lg:col-span-8',
    9: 'lg:col-span-9',
    12: 'lg:col-span-12',
  };
  return map[span] || 'lg:col-span-4';
};

export const StatusPill = ({ status }) => {
  const styles = {
    live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    beta: 'bg-amber-50 text-amber-700 border-amber-200',
    coming_soon: 'bg-slate-100 text-slate-600 border-slate-200',
    disabled: 'bg-red-50 text-red-600 border-red-200',
  };
  const labels = {
    live: 'Live',
    beta: 'Beta',
    coming_soon: 'Coming soon',
    disabled: 'Disabled',
  };
  return (
    <span className={`inline-flex text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${styles[status] || styles.coming_soon}`}>
      {labels[status] || status}
    </span>
  );
};
