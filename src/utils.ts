import { GameEvent, Stats } from './types';

export const clampStat = (value: number) => Math.max(0, Math.min(100, value));

export const applyStatChanges = (stats: Stats, changes: Partial<Record<keyof Stats, number>>): Stats => ({
  biodiversity: clampStat(stats.biodiversity + (changes.biodiversity ?? 0)),
  ecosystem: clampStat(stats.ecosystem + (changes.ecosystem ?? 0)),
  economy: clampStat(stats.economy + (changes.economy ?? 0)),
  support: clampStat(stats.support + (changes.support ?? 0)),
  legal: clampStat(stats.legal + (changes.legal ?? 0)),
  sustainability: clampStat(stats.sustainability + (changes.sustainability ?? 0)),
});

export const averageStats = (stats: Stats) =>
  (stats.biodiversity + stats.ecosystem + stats.economy + stats.support + (100 - stats.legal) + stats.sustainability) / 6;

export const describeClimate = (stats: Stats) => {
  if (stats.ecosystem < 35 || stats.biodiversity < 35) {
    return 'The region feels thinned and reactive, as if every decision now lands on already-tired ground.';
  }

  if (stats.sustainability > 70 && stats.ecosystem > 65) {
    return 'Landfall still feels pressured, but not hollow. Ecological systems are beginning to hold more of their own weight.';
  }

  if (stats.economy > 68 && stats.support > 60) {
    return 'The public mood is steadier than the landscape beneath it. Prosperity is visible, but so are its edges.';
  }

  return 'The region remains governable, though every constituency can point to something vital it believes you have asked it to lose.';
};

export const shuffle = <T,>(items: T[]) => {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
};

const matchesTags = (
  tags: string[],
  requirement?: { anyTags?: string[]; allTags?: string[]; noneTags?: string[] },
) => {
  if (!requirement) return true;
  const hasAny = !requirement.anyTags?.length || requirement.anyTags.some((tag) => tags.includes(tag));
  const hasAll = !requirement.allTags?.length || requirement.allTags.every((tag) => tags.includes(tag));
  const hasNone = !requirement.noneTags?.length || requirement.noneTags.every((tag) => !tags.includes(tag));

  return hasAny && hasAll && hasNone;
};

export const resolveEvent = (event: GameEvent, tags: string[]): GameEvent => {
  const matchingVariations = event.variations?.filter((variation) =>
    matchesTags(tags, {
      anyTags: variation.anyTags,
      allTags: variation.allTags,
    }),
  );

  if (!matchingVariations?.length) {
    return event;
  }

  return matchingVariations.reduce(
    (resolved, variation) => ({
      ...resolved,
      scenario: variation.scenarioAppend ? `${resolved.scenario} ${variation.scenarioAppend}` : resolved.scenario,
      pressure: variation.pressureAppend ? `${resolved.pressure} ${variation.pressureAppend}` : resolved.pressure,
      advisors: variation.advisors ? [...resolved.advisors, ...variation.advisors] : resolved.advisors,
    }),
    event,
  );
};

export const getStageForTurn = (turn: number, totalTurns: number) => {
  const progress = turn / totalTurns;

  if (progress < 0.3) return 'early';
  if (progress < 0.75) return 'mid';
  return 'late';
};

export const pickNextEventId = (
  events: GameEvent[],
  remainingIds: string[],
  turn: number,
  totalTurns: number,
  tags: string[],
) => {
  const remainingEvents = events.filter((event) => remainingIds.includes(event.id));
  const stage = getStageForTurn(turn, totalTurns);
  const stageEligible = remainingEvents.filter(
    (event) => event.stage === stage && matchesTags(tags, event.requirements),
  );

  const crossStageEligible = remainingEvents.filter((event) => matchesTags(tags, event.requirements));
  const pool = stageEligible.length ? stageEligible : crossStageEligible.length ? crossStageEligible : remainingEvents;
  const [selected] = shuffle(pool);

  return selected?.id ?? null;
};
