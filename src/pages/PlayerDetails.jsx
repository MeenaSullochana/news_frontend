import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { sportsService } from '../services/articleService';
import { SPORT_LABELS } from '../components/sports/MatchCard';
import { EmptyState, MatchSkeleton } from '../components/sports/SportsUi';

const Stat = ({ label, value }) => {
  if (value == null || value === '') return null;
  return (
    <div className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-900 mt-0.5 font-mono">{value}</p>
    </div>
  );
};

const PlayerDetails = () => {
  const { id, playerKey } = useParams();
  const [match, setMatch] = useState(null);
  const [player, setPlayer] = useState(null);
  const [sport, setSport] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !playerKey) return;
    setLoading(true);
    setError('');
    sportsService
      .getPublicMatchPlayer(id, playerKey)
      .then(({ data }) => {
        setMatch(data.data?.match || null);
        setPlayer(data.data?.player || null);
        setSport(data.data?.sport || data.data?.match?.sport || '');
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Player not found');
        setPlayer(null);
      })
      .finally(() => setLoading(false));
  }, [id, playerKey]);

  const stats = player?.stats || {};
  const role = String(player?.role || player?.position || '').toLowerCase();
  const isBowler = role.includes('bowl') || (stats.wickets != null && stats.runs != null && stats.overs != null);
  const isBatter = role.includes('bat') || (stats.balls != null || stats.strikeRate != null || stats.fours != null);

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>
          {player?.name ? `${player.name} | Player` : 'Player Details'} | The Great India News
        </title>
      </Helmet>

      <div className="border-b border-stone-200 bg-white/80">
        <div className="container-news py-4 sm:py-6">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-3">
            <Link to="/" className="hover:text-brand-700">
              Home
            </Link>
            <span>/</span>
            <Link to="/live-sports" className="hover:text-brand-700">
              Live Sports
            </Link>
            <span>/</span>
            <Link to={`/live-sports/match/${id}`} className="hover:text-brand-700 truncate max-w-[10rem]">
              Match
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">{player?.name || 'Player'}</span>
          </nav>
          <Link
            to={`/live-sports/match/${id}`}
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            ← Back to match
          </Link>
        </div>
      </div>

      <div className="container-news py-8">
        {loading ? (
          <MatchSkeleton />
        ) : error ? (
          <div className="space-y-4">
            <EmptyState title="Player unavailable" message={error} />
            <Link to={`/live-sports/match/${id}`} className="btn-secondary text-sm inline-flex">
              Return to match
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            <header className="rounded-2xl border border-stone-200 bg-white p-5 flex items-center gap-4">
              {player.photo ? (
                <img
                  src={player.photo}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover border border-stone-100"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center text-xl font-bold border border-teal-100">
                  {(player.name || '?')[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[11px] uppercase font-bold text-teal-700">
                  {SPORT_LABELS[sport] || sport}
                  {player.team ? ` · ${player.team}` : ''}
                </p>
                <h1 className="text-2xl font-headline font-bold text-slate-900 mt-0.5 break-words">
                  {player.name}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {[player.position || player.role, player.number != null && `#${player.number}`, player.status]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {match && (
                  <p className="text-xs text-slate-400 mt-2">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                )}
              </div>
            </header>

            {sport === 'cricket' && (isBatter || isBowler) ? (
              <section className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
                {isBatter && (
                  <>
                    <h2 className="text-sm font-bold">Batting</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <Stat label="Runs" value={stats.runs ?? player.runs} />
                      <Stat label="Balls" value={stats.balls ?? player.balls} />
                      <Stat label="4s" value={stats.fours ?? player.fours} />
                      <Stat label="6s" value={stats.sixes ?? player.sixes} />
                      <Stat label="Strike rate" value={stats.strikeRate ?? player.strikeRate} />
                      <Stat label="Dismissal" value={stats.dismissal ?? player.status} />
                    </div>
                  </>
                )}
                {isBowler && (
                  <>
                    <h2 className="text-sm font-bold">Bowling</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <Stat label="Overs" value={stats.overs ?? player.overs} />
                      <Stat label="Maidens" value={stats.maidens ?? player.maidens} />
                      <Stat label="Runs" value={stats.runs ?? player.runs} />
                      <Stat label="Wickets" value={stats.wickets ?? player.wickets} />
                      <Stat label="Economy" value={stats.economy ?? player.economy} />
                      <Stat label="Dot balls" value={stats.dots ?? player.dots} />
                      <Stat label="Boundaries conceded" value={stats.boundaries ?? player.boundaries} />
                    </div>
                  </>
                )}
              </section>
            ) : (
              <section className="rounded-2xl border border-stone-200 bg-white p-5">
                <h2 className="text-sm font-bold mb-3">Statistics</h2>
                {Object.keys(stats).length || player.points != null || player.performance != null ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Stat label="Points" value={player.points} />
                    <Stat label="Performance" value={player.performance} />
                    {Object.entries(stats).map(([k, v]) => (
                      <Stat key={k} label={k.replace(/_/g, ' ')} value={v} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No player statistics"
                    message="The sports API did not return individual stats for this player in this match."
                  />
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDetails;
