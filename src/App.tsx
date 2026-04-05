import { useEffect, useMemo, useState } from 'react';
import { AdvisorPanel } from './components/AdvisorPanel';
import { EndingSummary } from './components/EndingSummary';
import { EventCard } from './components/EventCard';
import { GuideModal } from './components/GuideModal';
import { OutcomePanel } from './components/OutcomePanel';
import { StatDisplay } from './components/StatDisplay';
import { endingProfiles, events, initialStats } from './data/gameData';
import { EventOption, Phase, Stats } from './types';
import { applyStatChanges, averageStats, describeClimate, pickNextEventId, resolveEvent } from './utils';
import { useAmbientAudio } from './useAmbientAudio';

interface PhilosophyLedger {
  anthropocentrism: number;
  biocentrism: number;
  ecocentrism: number;
  legalism: number;
}

interface HistoryEntry {
  eventId: string;
  eventTitle: string;
  optionId: string;
  optionLabel: string;
  headline: string;
}

interface GameSnapshot {
  phase: Exclude<Phase, 'title'>;
  turn: number;
  totalTurns: number;
  stats: Stats;
  currentEventId: string | null;
  remainingEventIds: string[];
  selectedOptionId: string | null;
  tags: string[];
  philosophy: PhilosophyLedger;
  history: HistoryEntry[];
  ambientEnabled: boolean;
}

const SAVE_KEY = 'landfall-save-v2';
const GUIDE_KEY = 'landfall-guide-seen-v1';
const TOTAL_TURNS = 10;
const emptyPhilosophy: PhilosophyLedger = {
  anthropocentrism: 0,
  biocentrism: 0,
  ecocentrism: 0,
  legalism: 0,
};

function inferEnding(stats: Stats, philosophy: PhilosophyLedger) {
  const ecologicalStrength = (stats.biodiversity + stats.ecosystem + stats.sustainability) / 3;
  const civicStrength = (stats.economy + stats.support + (100 - stats.legal)) / 3;
  const sorted = Object.entries(philosophy).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0]?.[0];
  const leadMargin = (sorted[0]?.[1] ?? 0) - (sorted[1]?.[1] ?? 0);

  if (stats.legal > 78 && stats.sustainability < 42 && philosophy.anthropocentrism >= philosophy.ecocentrism) {
    return endingProfiles.find((entry) => entry.key === 'collapse-era-opportunist')!;
  }

  if (dominant === 'ecocentrism' && ecologicalStrength > 72) {
    return endingProfiles.find((entry) => entry.key === 'ecocentric-restorationist')!;
  }

  if (dominant === 'biocentrism' && stats.biodiversity > 68) {
    return endingProfiles.find((entry) => entry.key === 'guardian-of-the-wild')!;
  }

  if (dominant === 'anthropocentrism' && stats.economy > 62 && stats.sustainability < 58) {
    return endingProfiles.find((entry) => entry.key === 'pragmatic-developer')!;
  }

  if (
    civicStrength > 61 &&
    stats.economy > 53 &&
    stats.support > 52 &&
    stats.sustainability >= 52 &&
    philosophy.anthropocentrism >= philosophy.biocentrism &&
    philosophy.anthropocentrism >= philosophy.ecocentrism
  ) {
    return endingProfiles.find((entry) => entry.key === 'human-centered-reformer')!;
  }

  if (dominant === 'legalism' && leadMargin >= 3 && stats.legal < 40 && civicStrength > 44 && civicStrength < 66) {
    return endingProfiles.find((entry) => entry.key === 'legally-cautious-administrator')!;
  }

  return endingProfiles.find((entry) => entry.key === 'conflicted-compromiser')!;
}

function describeDominantEthic(philosophy: PhilosophyLedger) {
  const [winner] = Object.entries(philosophy).sort((a, b) => b[1] - a[1]);

  switch (winner?.[0]) {
    case 'anthropocentrism':
      return 'Your record most often centered human welfare, employment, safety, and political durability, even when ecological loss remained plainly visible.';
    case 'biocentrism':
      return 'Your decisions repeatedly gave moral weight to species and nonhuman life, refusing to treat living beings as mere collateral in someone else\'s plan.';
    case 'ecocentrism':
      return 'You governed with ecosystems in view, treating integrity, resilience, and habitat continuity as political values rather than technical afterthoughts.';
    default:
      return 'You governed with unusual attention to procedure, liability, and defensibility, preferring decisions that could survive scrutiny as well as headlines.';
  }
}

function buildNewGame(): GameSnapshot {
  const allIds = events.map((event) => event.id);
  const firstEventId = pickNextEventId(events, allIds, 0, TOTAL_TURNS, []);

  return {
    phase: 'intro',
    turn: 0,
    totalTurns: TOTAL_TURNS,
    stats: initialStats,
    currentEventId: firstEventId,
    remainingEventIds: allIds.filter((id) => id !== firstEventId),
    selectedOptionId: null,
    tags: [],
    philosophy: emptyPhilosophy,
    history: [],
    ambientEnabled: false,
  };
}

function loadSnapshot() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameSnapshot;
  } catch {
    return null;
  }
}

export default function App() {
  const [game, setGame] = useState<GameSnapshot | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    const snapshot = loadSnapshot();
    setHasSave(Boolean(snapshot));
  }, []);

  useEffect(() => {
    if (!game) return;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    setHasSave(true);
  }, [game]);

  useAmbientAudio(game?.ambientEnabled ?? false);

  const currentEvent = useMemo(() => {
    if (!game?.currentEventId) return null;
    const event = events.find((entry) => entry.id === game.currentEventId);
    return event ? resolveEvent(event, game.tags) : null;
  }, [game]);

  const selectedOption = useMemo(() => {
    if (!game?.selectedOptionId || !currentEvent) return null;
    return currentEvent.options.find((option) => option.id === game.selectedOptionId) ?? null;
  }, [currentEvent, game]);

  const projectedStats = useMemo(() => {
    if (!game) return initialStats;
    return selectedOption ? applyStatChanges(game.stats, selectedOption.outcome.statChanges) : game.stats;
  }, [game, selectedOption]);

  const ending = useMemo(() => (game ? inferEnding(game.stats, game.philosophy) : endingProfiles[2]), [game]);
  const climate = useMemo(() => describeClimate(game?.stats ?? initialStats), [game]);
  const dominantEthic = useMemo(
    () => describeDominantEthic(game?.philosophy ?? emptyPhilosophy),
    [game],
  );

  const phase: Phase = game?.phase ?? 'title';

  const startNewGame = () => {
    setGame(buildNewGame());
    if (!window.localStorage.getItem(GUIDE_KEY)) {
      setGuideOpen(true);
      window.localStorage.setItem(GUIDE_KEY, 'seen');
    }
  };

  const continueSavedGame = () => {
    const snapshot = loadSnapshot();
    if (snapshot) {
      setGame(snapshot);
    }
  };

  const beginPlay = () => {
    setGame((previous) => (previous ? { ...previous, phase: 'playing' } : previous));
  };

  const chooseOption = (option: EventOption) => {
    setGame((previous) => (previous ? { ...previous, selectedOptionId: option.id, phase: 'result' } : previous));
  };

  const continueFromResult = () => {
    if (!game || !currentEvent || !selectedOption) return;

    const nextStats = applyStatChanges(game.stats, selectedOption.outcome.statChanges);
    const nextTags = Array.from(new Set([...game.tags, ...(selectedOption.outcome.addTags ?? [])]));
    const nextPhilosophy: PhilosophyLedger = {
      anthropocentrism: game.philosophy.anthropocentrism + selectedOption.outcome.philosophy.anthropocentrism,
      biocentrism: game.philosophy.biocentrism + selectedOption.outcome.philosophy.biocentrism,
      ecocentrism: game.philosophy.ecocentrism + selectedOption.outcome.philosophy.ecocentrism,
      legalism: game.philosophy.legalism + selectedOption.outcome.philosophy.legalism,
    };
    const history = [
      ...game.history,
      {
        eventId: currentEvent.id,
        eventTitle: currentEvent.title,
        optionId: selectedOption.id,
        optionLabel: selectedOption.label,
        headline: selectedOption.outcome.headline,
      },
    ];
    const nextTurn = game.turn + 1;
    const finished = nextTurn >= game.totalTurns || game.remainingEventIds.length === 0;

    if (finished) {
      setGame({
        ...game,
        phase: 'ending',
        turn: nextTurn,
        stats: nextStats,
        selectedOptionId: null,
        tags: nextTags,
        philosophy: nextPhilosophy,
        history,
      });
      return;
    }

    const nextEventId = pickNextEventId(events, game.remainingEventIds, nextTurn, game.totalTurns, nextTags);

    setGame({
      ...game,
      phase: 'playing',
      turn: nextTurn,
      stats: nextStats,
      currentEventId: nextEventId,
      remainingEventIds: game.remainingEventIds.filter((id) => id !== nextEventId),
      selectedOptionId: null,
      tags: nextTags,
      philosophy: nextPhilosophy,
      history,
    });
  };

  const toggleAmbient = () => {
    setGame((previous) => (previous ? { ...previous, ambientEnabled: !previous.ambientEnabled } : previous));
  };

  const saveAndQuit = () => {
    if (!game) return;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    setGame(null);
    setHasSave(true);
  };

  const restart = () => {
    window.localStorage.removeItem(SAVE_KEY);
    setHasSave(false);
    setGame(null);
  };

  return (
    <div className="app-shell" data-phase={phase}>
      <div className="backdrop" />
      <main className="app-frame">
        <header className="topbar">
          <div>
            <span className="eyebrow">Narrative Environmental Ethics Simulator</span>
            <h1>Landfall</h1>
          </div>
          <div className="topbar-meta">
            {game ? <span>{Math.min(game.turn + (phase === 'result' ? 1 : 0), game.totalTurns)} / {game.totalTurns} turns</span> : <span>10-turn campaign</span>}
            <button className="ghost-button topbar-button" onClick={() => setGuideOpen(true)}>Guide</button>
            {game ? <button className="ghost-button topbar-button" onClick={toggleAmbient}>{game.ambientEnabled ? 'Ambient on' : 'Ambient off'}</button> : null}
            {game ? <button className="ghost-button topbar-button" onClick={saveAndQuit}>Save & quit</button> : null}
          </div>
        </header>

        {phase === 'title' && (
          <section className="hero panel stage-panel">
            <div className="hero-copy">
              <span className="eyebrow">Landfall</span>
              <h2>A Narrative Environmental Ethics Simulator</h2>
              <p>
                You have been appointed to govern a vulnerable region of wetlands, forests, rivers,
                coasts, farmland, and towns under mounting ecological, political, and economic pressure.
                Each decision will be judged not only by outcomes, but by the moral framework it reveals.
              </p>
              <p>
                This revised prototype now reshuffles dilemmas between runs, reacts to some prior choices,
                autosaves your campaign, and pushes more sharply differentiated tradeoffs through the whole arc.
              </p>
              <div className="button-row">
                <button className="primary-button" onClick={startNewGame}>New campaign</button>
                {hasSave ? <button className="ghost-button" onClick={continueSavedGame}>Continue saved campaign</button> : null}
              </div>
            </div>
            <div className="hero-aside">
              <div className="hero-card">
                <span className="eyebrow">Campaign qualities</span>
                <ul>
                  <li>10-turn run selected from a larger event deck</li>
                  <li>Randomized order with light branching and callbacks</li>
                  <li>Autosave and resume from the title screen</li>
                  <li>Endings shaped by both statistics and ethical pattern</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {phase === 'intro' && game && (
          <section className="panel intro-panel stage-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Appointment Brief</span>
                <h2>The region you inherit</h2>
              </div>
              <button className="ghost-button" onClick={beginPlay}>Enter the council chamber</button>
            </div>
            <div className="intro-grid">
              <div>
                <p>
                  Landfall is a place of river mouths, old forests, fisheries, levees, migration belts,
                  eroding coasts, and towns that believe survival is always being negotiated somewhere else.
                </p>
                <p>
                  Development pressure is rising. Extraction firms, farmers, transport planners, coastal residents,
                  conservation groups, and ministries all insist that their urgency is the real one.
                </p>
              </div>
              <div>
                <p>
                  This campaign now runs as a shuffled policy docket. Some later dilemmas will shift in tone depending
                  on what you protected, what you accelerated, and which risks you asked the future to absorb.
                </p>
                <p>
                  Your first useful rule of thumb: rising `Economy` or `Support` can still hide a worsening long-term trajectory if `Legal Risk` climbs or ecological systems start to hollow out.
                </p>
                <p>{climate}</p>
              </div>
            </div>
            <StatDisplay stats={game.stats} />
          </section>
        )}

        {(phase === 'playing' || phase === 'result') && game && currentEvent && (
          <section className="game-grid stage-panel">
            <div className="main-column">
              {phase === 'playing' ? (
                <>
                  <div className="turn-banner panel compact">
                    <span className="eyebrow">Turn {game.turn + 1} of {game.totalTurns}</span>
                    <p>{describeClimate(game.stats)}</p>
                  </div>
                  <EventCard event={currentEvent} onChoose={chooseOption} />
                </>
              ) : selectedOption ? (
                <OutcomePanel
                  option={selectedOption}
                  updatedStats={projectedStats}
                  onContinue={continueFromResult}
                  isFinalTurn={game.turn === game.totalTurns - 1}
                />
              ) : null}
            </div>

            <aside className="side-column">
              <StatDisplay stats={phase === 'result' ? projectedStats : game.stats} deltas={selectedOption?.outcome.statChanges} />
              <AdvisorPanel comments={currentEvent.advisors} />
            </aside>
          </section>
        )}

        {phase === 'ending' && game && (
          <EndingSummary
            ending={ending}
            stats={game.stats}
            climate={climate}
            dominantEthic={dominantEthic}
            history={game.history}
            onRestart={restart}
          />
        )}

        <GuideModal
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
          ambientEnabled={game?.ambientEnabled ?? false}
          onToggleAmbient={() => {
            if (!game) return;
            toggleAmbient();
          }}
        />
      </main>
    </div>
  );
}
