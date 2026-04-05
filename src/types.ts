export type StatKey =
  | 'biodiversity'
  | 'ecosystem'
  | 'economy'
  | 'support'
  | 'legal'
  | 'sustainability';

export type Phase = 'title' | 'intro' | 'playing' | 'result' | 'ending';
export type EventStage = 'early' | 'mid' | 'late';

export type EthicalJudgment = 'Supported' | 'Criticized' | 'Morally conflicted';

export interface Stats {
  biodiversity: number;
  ecosystem: number;
  economy: number;
  support: number;
  legal: number;
  sustainability: number;
}

export interface Advisor {
  id: string;
  name: string;
  role: string;
  worldview: string;
}

export interface AdvisorComment {
  advisorId: string;
  text: string;
}

export interface EthicalPerspective {
  framework: 'Anthropocentrism' | 'Biocentrism' | 'Ecocentrism';
  standing: string;
  judgment: EthicalJudgment;
  analysis: string;
}

export interface OptionOutcome {
  summary: string;
  statChanges: Partial<Record<StatKey, number>>;
  legalNote: string;
  headline: string;
  ethicalAnalysis: EthicalPerspective[];
  addTags?: string[];
  philosophy: {
    anthropocentrism: number;
    biocentrism: number;
    ecocentrism: number;
    legalism: number;
  };
}

export interface EventOption {
  id: string;
  label: string;
  stance: string;
  outcome: OptionOutcome;
}

export interface GameEvent {
  id: string;
  chapter: string;
  stage: EventStage;
  imagePath: string;
  title: string;
  setting: string;
  scenario: string;
  pressure: string;
  advisors: AdvisorComment[];
  requirements?: {
    anyTags?: string[];
    allTags?: string[];
    noneTags?: string[];
  };
  variations?: Array<{
    anyTags?: string[];
    allTags?: string[];
    scenarioAppend?: string;
    pressureAppend?: string;
    advisors?: AdvisorComment[];
  }>;
  options: EventOption[];
}

export interface EndingProfile {
  key: string;
  title: string;
  summary: string;
  reflection: string;
}
