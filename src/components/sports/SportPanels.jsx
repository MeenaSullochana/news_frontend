import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Collapsible, DataTable, EmptyState, StatPair, TeamLogo } from './SportsUi';

const hideEmpty = (v) => v != null && v !== '' && !(typeof v === 'number' && Number.isNaN(v));

export const OverviewPanel = ({ match, detail }) => {
  const cricket = detail?.cricket;
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Match summary</h3>
        {detail?.summary ? (
          <p className="text-sm text-slate-700 leading-relaxed">{detail.summary}</p>
        ) : (
          <p className="text-sm text-slate-500">
            {match?.status === 'scheduled'
              ? 'Match has not started yet.'
              : match?.status === 'finished'
                ? 'Final result shown above.'
                : 'Live summary will appear when the provider sends status updates.'}
          </p>
        )}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-2">
          {match?.competition && (
            <div>
              <dt className="text-[11px] uppercase text-slate-400">Tournament / League</dt>
              <dd className="font-medium text-slate-800 mt-0.5">{match.competition}</dd>
            </div>
          )}
          {match?.startTime && (
            <div>
              <dt className="text-[11px] uppercase text-slate-400">Date & time</dt>
              <dd className="font-medium text-slate-800 mt-0.5">
                {new Date(match.startTime).toLocaleString()}
              </dd>
            </div>
          )}
          {detail?.venue && (
            <div>
              <dt className="text-[11px] uppercase text-slate-400">Venue</dt>
              <dd className="font-medium text-slate-800 mt-0.5">{detail.venue}</dd>
            </div>
          )}
          {match?.statusDetail && (
            <div>
              <dt className="text-[11px] uppercase text-slate-400">Status detail</dt>
              <dd className="font-medium text-slate-800 mt-0.5">{match.statusDetail}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Score snapshot</h3>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <TeamLogo src={match?.homeLogo || detail?.homeLogo} name={match?.homeTeam} />
            <span className="text-sm font-semibold truncate">{match?.homeTeam}</span>
          </div>
          <span className="font-mono font-bold text-lg shrink-0">{match?.homeScoreText || match?.homeScore}</span>
        </div>
        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-2 min-w-0">
            <TeamLogo src={match?.awayLogo || detail?.awayLogo} name={match?.awayTeam} />
            <span className="text-sm font-semibold truncate">{match?.awayTeam}</span>
          </div>
          <span className="font-mono font-bold text-lg shrink-0">{match?.awayScoreText || match?.awayScore}</span>
        </div>
        {match?.sport === 'cricket' && (cricket?.homeInnings || cricket?.awayInnings) && (
          <div className="mt-4 pt-3 border-t border-stone-100 space-y-1 text-xs text-slate-600">
            {cricket.homeInnings?.overs && (
              <p>
                {match.homeTeam}: {cricket.homeInnings.display || `${cricket.homeInnings.runs}/${cricket.homeInnings.wickets}`}
                {cricket.homeInnings.overs ? ` · ${cricket.homeInnings.overs} ov` : ''}
              </p>
            )}
            {cricket.awayInnings?.overs && (
              <p>
                {match.awayTeam}: {cricket.awayInnings.display || `${cricket.awayInnings.runs}/${cricket.awayInnings.wickets}`}
                {cricket.awayInnings.overs ? ` · ${cricket.awayInnings.overs} ov` : ''}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export const PlayersPanel = ({ matchId, players }) => {
  const home = players?.home || [];
  const away = players?.away || [];
  if (!home.length && !away.length) {
    return (
      <EmptyState
        title="Player list unavailable"
        message="Lineups and player stats were not included in the API response for this match."
      />
    );
  }

  const TeamBlock = ({ title, list }) => (
    <section className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/70">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-[11px] text-slate-400">{list.length} players</p>
      </div>
      {!list.length ? (
        <p className="p-4 text-sm text-slate-500">No players listed for this team.</p>
      ) : (
        <ul className="divide-y divide-stone-50">
          {list.map((p) => (
            <li key={p.key || p.name}>
              <Link
                to={`/live-sports/match/${matchId}/player/${encodeURIComponent(p.key || p.name)}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50/40 transition-colors"
              >
                {p.photo ? (
                  <img src={p.photo} alt="" className="h-10 w-10 rounded-full object-cover bg-stone-100" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    {(p.name || '?')[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {[p.position || p.role, p.number != null && `#${p.number}`, p.status]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                {(hideEmpty(p.points) || hideEmpty(p.performance)) && (
                  <div className="text-right text-xs shrink-0">
                    {hideEmpty(p.points) && <p className="font-mono font-bold">{p.points}</p>}
                    {hideEmpty(p.performance) && <p className="text-slate-400">{p.performance}</p>}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <TeamBlock title={home[0]?.team || 'Home'} list={home} />
      <TeamBlock title={away[0]?.team || 'Away'} list={away} />
    </div>
  );
};

export const StandingsPanel = ({ standings, sport }) => {
  if (!standings?.length) {
    return (
      <EmptyState
        title="Standings unavailable"
        message="Points table data was not returned for this competition."
      />
    );
  }
  const showNrr = sport === 'cricket' && standings.some((r) => hideEmpty(r.netRunRate));
  const showGf = standings.some((r) => hideEmpty(r.goalsFor));
  const columns = [
    { key: 'rank', label: 'Rank' },
    { key: 'team', label: sport === 'tennis' || sport === 'chess' ? 'Player' : 'Team', className: 'font-medium' },
    { key: 'played', label: 'Played' },
    { key: 'won', label: 'Won' },
    { key: 'drawn', label: 'Draw' },
    { key: 'lost', label: 'Lost' },
    ...(showGf
      ? [
          { key: 'goalsFor', label: 'GF' },
          { key: 'goalsAgainst', label: 'GA' },
        ]
      : []),
    ...(showNrr ? [{ key: 'netRunRate', label: 'NRR' }] : []),
    { key: 'points', label: 'Points', className: 'font-semibold' },
  ];
  return <DataTable columns={columns} rows={standings} emptyTitle="No standings rows" />;
};

export const TimelinePanel = ({ detail, sport }) => {
  if (sport === 'cricket' && detail?.ballByBall?.overs?.length) {
    return <BallByBallPanel ballByBall={detail.ballByBall} />;
  }
  const events = detail?.timeline || detail?.incidents || [];
  if (!events.length) {
    return (
      <EmptyState
        title="Timeline unavailable"
        message="Match events have not been published by the API yet."
      />
    );
  }
  return (
    <ol className="rounded-2xl border border-stone-200 bg-white divide-y divide-stone-50">
      {events.map((e, i) => (
        <li key={e.id || i} className="px-4 py-3 flex gap-3 text-sm">
          <span className="font-mono text-xs font-semibold text-teal-700 shrink-0 w-12">
            {e.minute != null && e.minute !== '' ? `${e.minute}` : '—'}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">
              {e.type || 'Event'}
              {e.player ? ` · ${e.player}` : ''}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {[e.team, e.assist && `Assist: ${e.assist}`, e.detail].filter(Boolean).join(' · ')}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
};

export const BallByBallPanel = ({ ballByBall }) => {
  const overs = ballByBall?.overs || [];
  if (!overs.length) {
    return (
      <EmptyState
        title="Ball-by-ball unavailable"
        message="Delivery-by-delivery commentary is not provided for this match. Add a CricLive API key in Admin for full cricket ball-by-ball when supported."
      />
    );
  }
  return (
    <div className="space-y-3">
      {[...overs].reverse().map((over) => (
        <Collapsible
          key={over.over}
          title={`Over ${over.over}`}
          badge={hideEmpty(over.runsInOver) ? `${over.runsInOver} runs` : undefined}
          defaultOpen={over.over === overs[overs.length - 1]?.over}
        >
          <ul className="space-y-2">
            {over.deliveries.map((d) => {
              let outcome = hideEmpty(d.runs) ? `${d.runs} run${d.runs === 1 ? '' : 's'}` : '0';
              if (d.boundary === 4) outcome = 'FOUR';
              if (d.boundary === 6) outcome = 'SIX';
              if (d.wicket) outcome = `WICKET${d.wicket.type ? ` (${d.wicket.type})` : ''}`;
              if (d.extrasType) outcome = `${outcome} · ${String(d.extrasType).replace('_', ' ')}`;
              return (
                <li
                  key={d.id}
                  className="text-sm rounded-xl bg-stone-50 border border-stone-100 px-3 py-2"
                >
                  <p className="font-mono text-xs text-teal-700 font-semibold">{d.label || `${d.over}.${d.ball}`}</p>
                  <p className="mt-0.5">
                    <span className="font-medium">{d.bowler || 'Bowler'}</span>
                    <span className="text-slate-400"> → </span>
                    <span className="font-medium">{d.batter || 'Batter'}</span>
                    <span className="text-slate-400"> — </span>
                    <span className="font-semibold">{outcome}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {[
                      hideEmpty(d.batterRuns) && `Batter runs: ${d.batterRuns}`,
                      hideEmpty(d.extras) && `Extras: ${d.extras}`,
                      hideEmpty(d.totalAfter) && `Total: ${d.totalAfter}`,
                      d.text,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </li>
              );
            })}
          </ul>
        </Collapsible>
      ))}
    </div>
  );
};

export const CricketScorePanel = ({ detail, match }) => {
  const scorecard = detail?.scorecard || detail?.cricket?.scorecard;
  const pairStats = detail?.pairStats || detail?.cricket?.pairStats || [];

  if (!scorecard?.innings?.length && !pairStats.length) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="Detailed scorecard unavailable"
          message="Innings batting/bowling tables are not in the current API response. Scores above still reflect the live total when provided. Configure CricLive (with API key) for full scorecards."
        />
        {(detail?.cricket?.homeInnings || detail?.cricket?.awayInnings) && (
          <div className="rounded-2xl border border-stone-200 bg-white p-4 grid sm:grid-cols-2 gap-3 text-sm">
            {detail.cricket.homeInnings && (
              <div>
                <p className="text-[11px] uppercase text-slate-400">{match.homeTeam}</p>
                <p className="font-mono font-bold text-lg mt-1">
                  {detail.cricket.homeInnings.display ||
                    `${detail.cricket.homeInnings.runs ?? '—'}${
                      detail.cricket.homeInnings.wickets != null
                        ? `/${detail.cricket.homeInnings.wickets}`
                        : ''
                    }`}
                </p>
              </div>
            )}
            {detail.cricket.awayInnings && (
              <div>
                <p className="text-[11px] uppercase text-slate-400">{match.awayTeam}</p>
                <p className="font-mono font-bold text-lg mt-1">
                  {detail.cricket.awayInnings.display ||
                    `${detail.cricket.awayInnings.runs ?? '—'}${
                      detail.cricket.awayInnings.wickets != null
                        ? `/${detail.cricket.awayInnings.wickets}`
                        : ''
                    }`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(scorecard?.innings || []).map((inn) => (
        <Collapsible
          key={inn.number || inn.team}
          title={`Innings ${inn.number || ''} ${inn.team ? `· ${inn.team}` : ''}`.trim()}
          badge={
            hideEmpty(inn.runs)
              ? `${inn.runs}${hideEmpty(inn.wickets) ? `/${inn.wickets}` : ''}${
                  hideEmpty(inn.overs) ? ` (${inn.overs} ov)` : ''
                }`
              : undefined
          }
          defaultOpen
        >
          <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-3">
            {hideEmpty(inn.runRate) && <span>RR: {inn.runRate}</span>}
            {hideEmpty(inn.target) && <span>Target: {inn.target}</span>}
            {hideEmpty(inn.requiredRunRate) && <span>RRR: {inn.requiredRunRate}</span>}
            {hideEmpty(inn.partnership) && (
              <span>
                Partnership:{' '}
                {typeof inn.partnership === 'object'
                  ? JSON.stringify(inn.partnership)
                  : inn.partnership}
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Batting</h4>
          <DataTable
            columns={[
              {
                key: 'player',
                label: 'Player',
                render: (r) =>
                  r.key ? (
                    <Link
                      className="text-teal-700 hover:underline font-medium"
                      to={`/live-sports/match/${match._id}/player/${encodeURIComponent(r.key)}`}
                    >
                      {r.player}
                    </Link>
                  ) : (
                    r.player
                  ),
              },
              { key: 'runs', label: 'R' },
              { key: 'balls', label: 'B' },
              { key: 'fours', label: '4s' },
              { key: 'sixes', label: '6s' },
              { key: 'strikeRate', label: 'SR' },
              { key: 'status', label: 'Status', className: 'text-slate-500 max-w-[10rem]' },
            ]}
            rows={inn.batting || []}
            emptyTitle="No batting rows"
          />
          <h4 className="text-xs font-bold uppercase text-slate-500 mb-2 mt-4">Bowling</h4>
          <DataTable
            columns={[
              {
                key: 'bowler',
                label: 'Bowler',
                render: (r) =>
                  r.key ? (
                    <Link
                      className="text-teal-700 hover:underline font-medium"
                      to={`/live-sports/match/${match._id}/player/${encodeURIComponent(r.key)}`}
                    >
                      {r.bowler}
                    </Link>
                  ) : (
                    r.bowler
                  ),
              },
              { key: 'overs', label: 'O' },
              { key: 'maidens', label: 'M' },
              { key: 'runs', label: 'R' },
              { key: 'wickets', label: 'W' },
              { key: 'economy', label: 'ECO' },
            ]}
            rows={inn.bowling || []}
            emptyTitle="No bowling rows"
          />
        </Collapsible>
      ))}
      {!!pairStats.length && (
        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <h3 className="text-sm font-bold mb-2">Match stats</h3>
          {pairStats.map((s) => (
            <StatPair key={s.label} label={s.label} home={s.home} away={s.away} />
          ))}
        </section>
      )}
    </div>
  );
};

export const FootballScorePanel = ({ detail, match }) => {
  const fb = detail?.football || {};
  const stats = fb.pairStats || detail?.pairStats || [];
  const goals = fb.goals || [];
  const hasAny = stats.length || goals.length || hideEmpty(fb.homeHtScore);

  if (!hasAny) {
    return (
      <EmptyState
        title="Football stats unavailable"
        message="Possession, shots, and lineups were not included for this fixture. Goal events appear in Timeline when the API sends them."
      />
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <h3 className="text-sm font-bold mb-2">Score & stats</h3>
        <p className="font-mono text-2xl font-bold text-center mb-3">
          {match.homeScoreText || match.homeScore} – {match.awayScoreText || match.awayScore}
        </p>
        {(hideEmpty(fb.homeHtScore) || hideEmpty(fb.awayHtScore)) && (
          <p className="text-xs text-center text-slate-500 mb-3">
            HT {fb.homeHtScore ?? '—'} – {fb.awayHtScore ?? '—'}
          </p>
        )}
        {stats.map((s) => (
          <StatPair key={s.label} label={s.label} home={s.home} away={s.away} />
        ))}
        {!stats.length && <p className="text-xs text-slate-500">Detailed pair stats not provided.</p>}
      </section>
      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <h3 className="text-sm font-bold mb-2">Goals</h3>
        {!goals.length ? (
          <p className="text-sm text-slate-500">No goal events in API response.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {goals.map((g, i) => (
              <li key={i} className="flex gap-2 border-b border-stone-50 pb-2">
                <span className="font-mono text-xs text-teal-700 w-10 shrink-0">{g.minute}&apos;</span>
                <div>
                  <p className="font-semibold">{g.player || 'Player N/A'}</p>
                  <p className="text-xs text-slate-500">
                    {[g.team, g.assist && `Assist: ${g.assist}`].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!!fb.cards?.length && (
          <>
            <h3 className="text-sm font-bold mb-2 mt-4">Cards</h3>
            <ul className="text-sm space-y-1">
              {fb.cards.map((c, i) => (
                <li key={i}>
                  {c.minute}&apos; · {c.type} · {c.player || c.team}
                </li>
              ))}
            </ul>
          </>
        )}
        {!!fb.substitutions?.length && (
          <>
            <h3 className="text-sm font-bold mb-2 mt-4">Substitutions</h3>
            <ul className="text-sm space-y-1">
              {fb.substitutions.map((s, i) => (
                <li key={i}>
                  {s.minute}&apos; · {s.player || s.detail || s.type}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
};

export const BasketballScorePanel = ({ detail, match }) => {
  const bb = detail?.basketball || {};
  const quarters = bb.quarters || [];
  const stats = bb.pairStats || detail?.pairStats || [];
  const pbp = bb.playByPlay || [];

  if (!quarters.length && !stats.length && !pbp.length) {
    return (
      <EmptyState
        title="Basketball stats unavailable"
        message="Quarter scores and player box-score data were not returned for this game."
      />
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-stone-200 bg-white p-4 overflow-x-auto">
        <h3 className="text-sm font-bold mb-3">Quarter-by-quarter</h3>
        {quarters.length ? (
          <table className="w-full text-sm min-w-[280px]">
            <thead>
              <tr className="text-slate-400 text-xs">
                <th className="text-left py-1">Team</th>
                {quarters.map((q) => (
                  <th key={q.label} className="px-2 py-1">
                    {q.label}
                  </th>
                ))}
                <th className="px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium py-1">{match.homeTeam}</td>
                {quarters.map((q) => (
                  <td key={`h-${q.label}`} className="text-center font-mono">
                    {q.home ?? '—'}
                  </td>
                ))}
                <td className="text-center font-mono font-bold">{match.homeScoreText || match.homeScore}</td>
              </tr>
              <tr>
                <td className="font-medium py-1">{match.awayTeam}</td>
                {quarters.map((q) => (
                  <td key={`a-${q.label}`} className="text-center font-mono">
                    {q.away ?? '—'}
                  </td>
                ))}
                <td className="text-center font-mono font-bold">{match.awayScoreText || match.awayScore}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-500">Quarter breakdown not provided.</p>
        )}
      </section>
      {!!stats.length && (
        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <h3 className="text-sm font-bold mb-2">Team stats</h3>
          {stats.map((s) => (
            <StatPair key={s.label} label={s.label} home={s.home} away={s.away} />
          ))}
        </section>
      )}
      {!!pbp.length && (
        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <h3 className="text-sm font-bold mb-2">Play-by-play</h3>
          <DataTable
            columns={[
              { key: 'time', label: 'Time' },
              { key: 'player', label: 'Player' },
              { key: 'event', label: 'Event' },
              { key: 'points', label: 'Points' },
            ]}
            rows={pbp}
          />
        </section>
      )}
    </div>
  );
};

export const TennisScorePanel = ({ detail, match }) => {
  const tn = detail?.tennis || {};
  const stats = tn.pairStats || detail?.pairStats || [];
  if (!stats.length && !tn.sets && !match.homeScoreText) {
    return <EmptyState title="Tennis stats unavailable" message="Set scores and point stats were not returned." />;
  }
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <section className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
        <h3 className="text-sm font-bold">Set score</h3>
        <p className="font-mono text-xl font-bold text-center">
          {match.homeScoreText || match.homeScore} – {match.awayScoreText || match.awayScore}
        </p>
        {tn.statusText && <p className="text-xs text-center text-slate-500">{tn.statusText}</p>}
        {tn.serve && (
          <p className="text-xs text-center text-teal-700 font-semibold">Serving: {tn.serve}</p>
        )}
        <dl className="text-sm space-y-2">
          {match.competition && (
            <div>
              <dt className="text-[11px] text-slate-400 uppercase">Tournament</dt>
              <dd>{match.competition}</dd>
            </div>
          )}
          {match.tournament && (
            <div>
              <dt className="text-[11px] text-slate-400 uppercase">Round</dt>
              <dd>{match.tournament}</dd>
            </div>
          )}
        </dl>
      </section>
      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <h3 className="text-sm font-bold mb-2">Point stats</h3>
        {stats.length ? (
          stats.map((s) => <StatPair key={s.label} label={s.label} home={s.home} away={s.away} />)
        ) : (
          <p className="text-sm text-slate-500">
            Aces, double faults, break points, and serve % appear when the API provides them.
          </p>
        )}
      </section>
    </div>
  );
};

/** Minimal chess UI: Lichess embed + move list navigation */
export const ChessScorePanel = ({ detail, match }) => {
  const chess = detail?.chess;
  const moves = chess?.moves || [];
  const [ply, setPly] = useState(moves.length);
  const gameId = match?.externalId || '';

  const pairs = useMemo(() => {
    const out = [];
    for (let i = 0; i < moves.length; i += 2) {
      out.push({ n: i / 2 + 1, w: moves[i], b: moves[i + 1] });
    }
    return out;
  }, [moves]);

  if (!chess && !gameId) {
    return <EmptyState title="Chess game data unavailable" message="Could not load moves from Lichess." />;
  }

  const embedSrc = gameId
    ? `https://lichess.org/embed/game/${encodeURIComponent(gameId)}#${Math.max(ply, 0)}`
    : null;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <section className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        {embedSrc ? (
          <iframe
            title="Chess board"
            src={embedSrc}
            className="w-full aspect-square max-h-[480px] border-0"
            allow="fullscreen"
          />
        ) : (
          <div className="aspect-square flex items-center justify-center text-sm text-slate-500">
            Board unavailable
          </div>
        )}
        <div className="flex items-center justify-center gap-2 p-3 border-t border-stone-100">
          <button type="button" className="btn-secondary text-xs" onClick={() => setPly(0)} disabled={ply <= 0}>
            Start
          </button>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => setPly((p) => Math.max(0, p - 1))}
            disabled={ply <= 0}
          >
            Prev
          </button>
          <span className="text-xs font-mono text-slate-500 px-2">
            Move {ply}/{moves.length}
          </span>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => setPly((p) => Math.min(moves.length, p + 1))}
            disabled={ply >= moves.length}
          >
            Next
          </button>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => setPly(moves.length)}
            disabled={ply >= moves.length}
          >
            End
          </button>
        </div>
      </section>
      <section className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
        <h3 className="text-sm font-bold">Game info</h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-[11px] text-slate-400 uppercase">White</dt>
            <dd className="font-semibold">
              {chess?.white?.name || match.homeTeam}
              {hideEmpty(chess?.white?.rating) ? ` (${chess.white.rating})` : ''}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-400 uppercase">Black</dt>
            <dd className="font-semibold">
              {chess?.black?.name || match.awayTeam}
              {hideEmpty(chess?.black?.rating) ? ` (${chess.black.rating})` : ''}
            </dd>
          </div>
          {chess?.opening && (
            <div className="col-span-2">
              <dt className="text-[11px] text-slate-400 uppercase">Opening</dt>
              <dd>{chess.opening}</dd>
            </div>
          )}
          {chess?.status && (
            <div>
              <dt className="text-[11px] text-slate-400 uppercase">Status</dt>
              <dd className="capitalize">{chess.status}</dd>
            </div>
          )}
          {chess?.winner && (
            <div>
              <dt className="text-[11px] text-slate-400 uppercase">Result</dt>
              <dd className="capitalize">{chess.winner} wins</dd>
            </div>
          )}
          {hideEmpty(chess?.moveNumber) && (
            <div>
              <dt className="text-[11px] text-slate-400 uppercase">Move</dt>
              <dd>{chess.moveNumber}</dd>
            </div>
          )}
        </dl>
        <h4 className="text-xs font-bold uppercase text-slate-500 pt-2">Moves</h4>
        {!pairs.length ? (
          <p className="text-sm text-slate-500">Move list not available.</p>
        ) : (
          <ol className="max-h-64 overflow-y-auto text-sm space-y-1 font-mono">
            {pairs.map((row) => (
              <li key={row.n} className="flex gap-2">
                <span className="text-slate-400 w-6">{row.n}.</span>
                <button
                  type="button"
                  className={`px-1.5 rounded ${ply === row.n * 2 - 1 ? 'bg-teal-100' : 'hover:bg-stone-100'}`}
                  onClick={() => setPly(row.n * 2 - 1)}
                >
                  {row.w}
                </button>
                {row.b && (
                  <button
                    type="button"
                    className={`px-1.5 rounded ${ply === row.n * 2 ? 'bg-teal-100' : 'hover:bg-stone-100'}`}
                    onClick={() => setPly(row.n * 2)}
                  >
                    {row.b}
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
        {chess?.sourceUrl && (
          <a
            href={chess.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs text-teal-700 hover:underline"
          >
            Open on Lichess →
          </a>
        )}
      </section>
    </div>
  );
};

export const ScoreStatsPanel = ({ match, detail }) => {
  switch (match?.sport) {
    case 'cricket':
      return <CricketScorePanel match={match} detail={detail} />;
    case 'football':
      return <FootballScorePanel match={match} detail={detail} />;
    case 'basketball':
      return <BasketballScorePanel match={match} detail={detail} />;
    case 'tennis':
      return <TennisScorePanel match={match} detail={detail} />;
    case 'chess':
      return <ChessScorePanel match={match} detail={detail} />;
    default:
      return (
        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          {(detail?.pairStats || []).length ? (
            detail.pairStats.map((s) => (
              <StatPair key={s.label} label={s.label} home={s.home} away={s.away} />
            ))
          ) : (
            <EmptyState title="Stats unavailable" />
          )}
        </section>
      );
  }
};
