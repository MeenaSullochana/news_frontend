import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sportsService } from '../services/articleService';
import MatchCard, { SPORT_LABELS } from './sports/MatchCard';

const WIDGET_TITLES = {
  live_score: 'Live Scores',
  upcoming: 'Upcoming Matches',
  results: 'Recent Results',
  standings: 'Standings',
  team_info: 'Teams',
  player_stats: 'Player Stats',
  match_details: 'Match Details',
};

const StandingsTable = ({ table, maxRows = 8 }) => {
  if (!table) return null;
  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="px-3 sm:px-4 py-3 border-b border-stone-100">
        <h4 className="text-sm font-semibold text-slate-900 break-words">{table.league}</h4>
        <p className="text-[10px] text-slate-400 uppercase">{SPORT_LABELS[table.sport] || table.sport}</p>
      </div>
      <div className="overflow-x-auto -mx-0">
        <table className="w-full text-xs sm:text-sm min-w-[280px]">
          <thead>
            <tr className="text-left text-slate-400 border-b border-stone-100">
              <th className="px-2 sm:px-3 py-2 font-medium">#</th>
              <th className="px-2 sm:px-3 py-2 font-medium">Team</th>
              <th className="px-2 sm:px-3 py-2 font-medium">P</th>
              <th className="px-2 sm:px-3 py-2 font-medium">W</th>
              <th className="px-2 sm:px-3 py-2 font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {(table.rows || []).slice(0, maxRows).map((row, i) => (
              <tr key={`${row.team || 't'}-${i}`} className="border-b border-stone-50 last:border-0">
                <td className="px-2 sm:px-3 py-2 text-slate-500 whitespace-nowrap">{row.rank || i + 1}</td>
                <td className="px-2 sm:px-3 py-2 font-medium text-slate-900 break-words">{row.team}</td>
                <td className="px-2 sm:px-3 py-2 whitespace-nowrap">{row.played ?? '—'}</td>
                <td className="px-2 sm:px-3 py-2 whitespace-nowrap">{row.won ?? '—'}</td>
                <td className="px-2 sm:px-3 py-2 font-semibold whitespace-nowrap">{row.points ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * @param {'homepage'|'category'|'article'} page
 * @param {string} [sport] optional sport filter
 * @param {string} [className]
 */
const SportsWidgets = ({ page = 'homepage', sport = '', className = '' }) => {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    sportsService
      .getPublic({ page, sport: sport || undefined })
      .then(({ data }) => setPayload(data))
      .catch(() => setPayload(null))
      .finally(() => setLoading(false));
  }, [page, sport]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    const mins = Number(payload?.refreshIntervalMinutes);
    if (!Number.isFinite(mins) || mins < 1) return undefined;
    const ms = Math.min(Math.max(mins, 1), 60) * 60 * 1000;
    const id = setInterval(load, ms);
    return () => clearInterval(id);
  }, [payload?.refreshIntervalMinutes, load]);

  if (loading || !payload?.enabled || !payload?.data?.widgets?.length) return null;

  const { widgets = [], matches = {}, standings = [] } = payload.data;
  const live = matches.live || [];
  const upcoming = matches.upcoming || [];
  const results = matches.results || [];
  const all = matches.all || [];

  const hasContent = widgets.some((w) => {
    if (!w?.enabled) return false;
    if (w.type === 'live_score') return live.length > 0;
    if (w.type === 'upcoming') return upcoming.length > 0;
    if (w.type === 'results') return results.length > 0;
    if (w.type === 'standings') return standings.length > 0;
    if (w.type === 'team_info' || w.type === 'player_stats' || w.type === 'match_details') {
      return all.length > 0 || live.length > 0;
    }
    return false;
  });

  if (!hasContent) return null;

  return (
    <section className={`mb-10 min-w-0 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold font-headline text-slate-900 break-words">
          <Link to="/live-sports" className="hover:text-brand-700 transition-colors">
            {payload.title || 'Live Sports'}
          </Link>
        </h2>
        <div className="flex items-center gap-3 shrink-0">
          {payload.lastUpdatedAt && (
            <Link
              to="/live-sports"
              className="text-[10px] text-slate-400 hover:text-brand-600 transition-colors"
            >
              Updated {new Date(payload.lastUpdatedAt).toLocaleTimeString()}
            </Link>
          )}
          <Link to="/live-sports" className="text-sm text-brand-600 hover:underline font-medium">
            அனைத்தும் →
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {widgets.map((w, idx) => {
          if (!w?.enabled) return null;
          const max = Math.min(20, Math.max(1, w.maxItems || 6));
          const title = w.title || WIDGET_TITLES[w.type] || w.type;
          const key = `${w.type}-${idx}`;

          if (w.type === 'live_score' && live.length) {
            return (
              <div key={key} className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  {title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {live.slice(0, max).map((m) => (
                    <MatchCard key={m._id || m.fingerprint} match={m} />
                  ))}
                </div>
              </div>
            );
          }

          if (w.type === 'upcoming' && upcoming.length) {
            return (
              <div key={key} className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {upcoming.slice(0, max).map((m) => (
                    <MatchCard key={m._id || m.fingerprint} match={m} />
                  ))}
                </div>
              </div>
            );
          }

          if (w.type === 'results' && results.length) {
            return (
              <div key={key} className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {results.slice(0, max).map((m) => (
                    <MatchCard key={m._id || m.fingerprint} match={m} />
                  ))}
                </div>
              </div>
            );
          }

          if (w.type === 'standings' && standings.length) {
            return (
              <div key={key} className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {standings.slice(0, 2).map((t) => (
                    <StandingsTable key={t._id || `${t.sport}-${t.league}`} table={t} maxRows={max} />
                  ))}
                </div>
              </div>
            );
          }

          if (w.type === 'player_stats') {
            const withPlayers = [...(all.length ? all : live)]
              .filter((m) => Array.isArray(m.players) && m.players.length)
              .slice(0, max);
            if (!withPlayers.length) return null;
            return (
              <div key={key} className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {withPlayers.map((m) => (
                    <div key={m._id || m.fingerprint} className="rounded-2xl border border-stone-200 bg-white p-4 overflow-hidden">
                      <p className="text-xs text-slate-400 mb-2 break-words">
                        {m.homeTeam} vs {m.awayTeam}
                      </p>
                      <ul className="space-y-1.5">
                        {m.players.slice(0, 4).map((p, i) => (
                          <li key={`${p.name || 'p'}-${i}`} className="text-sm flex justify-between gap-2 min-w-0">
                            <span className="font-medium text-slate-800 break-words min-w-0">{p.name}</span>
                            <span className="text-xs text-slate-500 shrink-0">{p.role || p.team}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (w.type === 'team_info' || w.type === 'match_details') {
            const list = (live.length ? live : all).slice(0, max);
            if (!list.length) return null;
            return (
              <div key={key} className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {list.map((m) => (
                    <div key={m._id || m.fingerprint} className="rounded-2xl border border-stone-200 bg-white p-4 text-sm overflow-hidden">
                      <p className="font-semibold text-slate-900 mb-1 break-words">
                        {m.homeTeam} vs {m.awayTeam}
                      </p>
                      <p className="text-xs text-slate-500 mb-2 break-words">{m.venue || m.league || '—'}</p>
                      {m.stats && typeof m.stats === 'object' && Object.keys(m.stats).length > 0 && (
                        <pre className="text-[10px] text-slate-500 overflow-x-auto bg-stone-50 rounded-lg p-2 max-w-full">
                          {JSON.stringify(m.stats)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </section>
  );
};

export default SportsWidgets;
