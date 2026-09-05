import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { sportsService } from '../services/articleService';
import { SPORT_LABELS, statusLabel } from '../components/sports/MatchCard';
import { MatchSkeleton, TeamLogo } from '../components/sports/SportsUi';
import {
  OverviewPanel,
  PlayersPanel,
  ScoreStatsPanel,
  StandingsPanel,
  TimelinePanel,
  BallByBallPanel,
} from '../components/sports/SportPanels';

const MatchDetails = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [detail, setDetail] = useState(null);
  const [refreshSeconds, setRefreshSeconds] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) return;
      if (!silent) {
        setLoading(true);
        setError('');
      }
      try {
        const { data } = await sportsService.getPublicMatch(id);
        setMatch(data.data?.match || null);
        setDetail(data.data?.detail || null);
        setRefreshSeconds(data.data?.refreshIntervalSeconds || 15);
        if (!silent) setError('');
      } catch (err) {
        if (!silent) {
          setError(err?.response?.data?.message || 'Failed to load match details');
          setMatch(null);
          setDetail(null);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!match?.isLive && match?.status !== 'live' && match?.status !== 'halftime') return undefined;
    const timer = setInterval(() => load({ silent: true }), Math.max(refreshSeconds, 10) * 1000);
    return () => clearInterval(timer);
  }, [match?.isLive, match?.status, refreshSeconds, load]);

  const tabs = useMemo(() => {
    const sport = match?.sport;
    const avail = detail?.availability || {};
    const base = [
      { id: 'overview', label: 'Overview' },
      { id: 'score', label: sport === 'cricket' ? 'Scorecard' : 'Score / Stats' },
      { id: 'players', label: 'Players' },
      { id: 'standings', label: 'Points / Standings' },
      {
        id: 'timeline',
        label: sport === 'cricket' ? 'Timeline / Events' : 'Timeline / Events',
      },
    ];
    if (sport === 'cricket') {
      base.splice(2, 0, { id: 'ball', label: 'Ball by Ball' });
    }
    // Always show tabs; empty states inside panels when unavailable
    return base.map((t) => ({
      ...t,
      hint:
        t.id === 'players' && !avail.players
          ? 'empty'
          : t.id === 'standings' && !avail.standings
            ? 'empty'
            : t.id === 'ball' && !avail.ballByBall
              ? 'empty'
              : null,
    }));
  }, [match?.sport, detail?.availability]);

  useEffect(() => {
    if (!tabs.find((t) => t.id === tab)) setTab('overview');
  }, [tabs, tab]);

  const isLive = match?.status === 'live' || match?.status === 'halftime';
  const status = statusLabel(match?.status);

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>
          {match
            ? `${match.homeTeam} vs ${match.awayTeam} | ${SPORT_LABELS[match.sport] || 'Sports'}`
            : 'Match Details'}{' '}
          | The Great India News
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
            {match?.sport && (
              <>
                <span>/</span>
                <Link
                  to={`/live-sports?sport=${match.sport}`}
                  className="hover:text-brand-700 capitalize"
                >
                  {SPORT_LABELS[match.sport] || match.sport}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-slate-700 font-medium truncate max-w-[12rem] sm:max-w-none">
              {match ? `${match.homeTeam} vs ${match.awayTeam}` : 'Match'}
            </span>
          </nav>
          <Link to="/live-sports" className="text-xs font-semibold text-brand-700 hover:underline">
            ← Back to Live Sports
          </Link>
        </div>
      </div>

      <div className="container-news py-6 sm:py-8">
        {loading ? (
          <MatchSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-rose-800">Could not load match</p>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
            <button type="button" className="btn-secondary text-sm mt-4" onClick={() => load()}>
              Retry
            </button>
          </div>
        ) : !match ? (
          <p className="text-slate-500 text-sm">Match not found.</p>
        ) : (
          <>
            {/* Sticky match header */}
            <div className="sticky top-0 z-20 -mx-1 px-1 pb-3 pt-1 bg-stone-50/95 backdrop-blur">
              <header className="rounded-2xl border border-stone-200 bg-white shadow-sm p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">
                      {SPORT_LABELS[match.sport] || match.sport}
                      {match.competition ? ` · ${match.competition}` : ''}
                    </p>
                    {match.startTime && (
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(match.startTime).toLocaleString()}
                        {detail?.venue ? ` · ${detail.venue}` : match.venue ? ` · ${match.venue}` : ''}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      isLive
                        ? 'bg-rose-50 text-rose-700'
                        : status === 'Completed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {isLive ? '● Live' : status}
                    {match.statusDetail ? ` · ${match.statusDetail}` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 items-center">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 min-w-0 justify-self-end text-center sm:text-right">
                    <div className="sm:order-2">
                      <TeamLogo src={match.homeLogo || detail?.homeLogo} name={match.homeTeam} size="lg" />
                    </div>
                    <p className="text-sm sm:text-base font-bold text-slate-900 break-words sm:order-1">
                      {match.homeTeam}
                    </p>
                  </div>
                  <div className="text-center px-2 sm:px-4">
                    <p className="font-mono text-xl sm:text-3xl font-bold text-slate-900 leading-tight">
                      <span className="break-all">{match.homeScoreText || match.homeScore}</span>
                      <span className="text-slate-300 mx-1 sm:mx-2">–</span>
                      <span className="break-all">{match.awayScoreText || match.awayScore}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase">vs</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 min-w-0 justify-self-start text-center sm:text-left">
                    <TeamLogo src={match.awayLogo || detail?.awayLogo} name={match.awayTeam} size="lg" />
                    <p className="text-sm sm:text-base font-bold text-slate-900 break-words">
                      {match.awayTeam}
                    </p>
                  </div>
                </div>
                {detail?.summary && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-4 text-center border-t border-stone-100 pt-3">
                    {detail.summary}
                  </p>
                )}
              </header>

              <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`shrink-0 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      tab === t.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-stone-200 text-slate-600 hover:border-teal-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 transition-opacity duration-200">
              {tab === 'overview' && <OverviewPanel match={match} detail={detail} />}
              {tab === 'score' && <ScoreStatsPanel match={match} detail={detail} />}
              {tab === 'ball' && <BallByBallPanel ballByBall={detail?.ballByBall || detail?.cricket?.ballByBall} />}
              {tab === 'players' && <PlayersPanel matchId={match._id} players={detail?.players} />}
              {tab === 'standings' && (
                <StandingsPanel standings={detail?.standings} sport={match.sport} />
              )}
              {tab === 'timeline' && <TimelinePanel detail={detail} sport={match.sport} />}
            </div>

            {detail?.apiError && (
              <p className="text-[11px] text-amber-700 mt-6 text-center">
                Live enrichment warning: {detail.apiError}. Showing stored match data where available.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MatchDetails;
