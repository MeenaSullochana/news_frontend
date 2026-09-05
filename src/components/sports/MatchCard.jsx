import { Link } from 'react-router-dom';

export const SPORT_LABELS = {
  cricket: 'Cricket',
  football: 'Football',
  basketball: 'Basketball',
  tennis: 'Tennis',
  other: 'Other',
  chess: 'Chess',
};

export const statusLabel = (status) => {
  if (status === 'live' || status === 'halftime') return 'LIVE';
  if (status === 'finished') return 'Completed';
  if (status === 'scheduled') return 'Upcoming';
  if (status === 'postponed') return 'Postponed';
  if (status === 'cancelled') return 'Cancelled';
  return status || 'Upcoming';
};

export const scoreOf = (m) => {
  if (m?.homeScoreText || m?.awayScoreText) {
    return { home: m.homeScoreText || '—', away: m.awayScoreText || '—' };
  }
  return { home: String(m?.homeScore ?? 0), away: String(m?.awayScore ?? 0) };
};

/**
 * Existing sports card design — wrapped as a link to Match Details.
 */
const MatchCard = ({ match, className = '' }) => {
  if (!match) return null;
  const score = scoreOf(match);
  const isLive = match.status === 'live' || match.status === 'halftime';
  const status = statusLabel(match.status);
  const to = match._id ? `/live-sports/match/${match._id}` : '/live-sports';
  const league = match.league || match.competition || match.tournament;

  return (
    <Link
      to={to}
      className={`block rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-4 overflow-hidden transition-shadow hover:shadow-md hover:border-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${className}`}
    >
      <article>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-[10px] uppercase font-semibold tracking-wide text-teal-700 min-w-0 break-words">
            {SPORT_LABELS[match.sport] || match.sport}
            {league ? ` · ${league}` : ''}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase shrink-0 text-right max-w-[45%] break-words ${
              isLive ? 'text-rose-600' : status === 'Completed' ? 'text-slate-500' : 'text-amber-600'
            }`}
          >
            {isLive ? '● LIVE' : status}
            {match.statusDetail ? ` ${match.statusDetail}` : ''}
          </span>
        </div>

        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-900 break-words flex-1">{match.homeTeam}</span>
            <span className="font-mono text-xs font-bold text-slate-900 text-right shrink-0 max-w-[48%] break-all">
              {score.home}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-900 break-words flex-1">{match.awayTeam}</span>
            <span className="font-mono text-xs font-bold text-slate-900 text-right shrink-0 max-w-[48%] break-all">
              {score.away}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span className="flex-1 text-right text-sm font-semibold text-slate-900 line-clamp-2 break-words">
            {match.homeTeam}
          </span>
          <div className="shrink-0 text-center px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-100 min-w-[5rem] max-w-[40%]">
            <p className="font-mono text-xs sm:text-sm font-bold text-slate-900 break-all leading-snug">{score.home}</p>
            <p className="text-[9px] text-slate-400 my-0.5">vs</p>
            <p className="font-mono text-xs sm:text-sm font-bold text-slate-900 break-all leading-snug">{score.away}</p>
          </div>
          <span className="flex-1 text-sm font-semibold text-slate-900 line-clamp-2 break-words">
            {match.awayTeam}
          </span>
        </div>

        {match.startTime && (
          <p className="text-[10px] text-slate-400 mt-2.5 text-center">
            {new Date(match.startTime).toLocaleString()}
          </p>
        )}
      </article>
    </Link>
  );
};

export default MatchCard;
