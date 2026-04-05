import { EthicalPerspective, EventOption } from '../types';
import { StatDisplay } from './StatDisplay';

interface Props {
  option: EventOption;
  updatedStats: {
    biodiversity: number;
    ecosystem: number;
    economy: number;
    support: number;
    legal: number;
    sustainability: number;
  };
  onContinue: () => void;
  isFinalTurn: boolean;
}

function EthicsCard({ perspective }: { perspective: EthicalPerspective }) {
  return (
    <article className="ethics-card">
      <div className="ethics-topline">
        <h4>{perspective.framework}</h4>
        <span className={`judgment ${perspective.judgment.toLowerCase().replace(/\s+/g, '-')}`}>{perspective.judgment}</span>
      </div>
      <p><strong>Moral standing:</strong> {perspective.standing}</p>
      <p>{perspective.analysis}</p>
    </article>
  );
}

export function OutcomePanel({ option, updatedStats, onContinue, isFinalTurn }: Props) {
  return (
    <section className="panel outcome-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Decision Recorded</span>
          <h2>{option.label}</h2>
        </div>
        <button className="ghost-button" onClick={onContinue}>
          {isFinalTurn ? 'View final reckoning' : 'Continue'}
        </button>
      </div>

      <div className="outcome-layout">
        <div className="outcome-story">
          <article className="result-card">
            <h3>Regional consequence</h3>
            <p>{option.outcome.summary}</p>
          </article>
          <article className="result-card secondary">
            <h3>Governance and law</h3>
            <p>{option.outcome.legalNote}</p>
          </article>
          <article className="headline-card">
            <span className="eyebrow">Public reaction</span>
            <p>{option.outcome.headline}</p>
          </article>
        </div>

        <StatDisplay stats={updatedStats} deltas={option.outcome.statChanges} />
      </div>

      <div className="ethics-grid">
        {option.outcome.ethicalAnalysis.map((perspective) => (
          <EthicsCard key={perspective.framework} perspective={perspective} />
        ))}
      </div>
    </section>
  );
}
