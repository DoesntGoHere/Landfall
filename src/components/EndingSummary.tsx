import { EndingProfile, Stats } from '../types';
import { statMeta } from '../data/gameData';

interface Props {
  ending: EndingProfile;
  stats: Stats;
  climate: string;
  dominantEthic: string;
  history: Array<{
    eventId: string;
    eventTitle: string;
    optionId: string;
    optionLabel: string;
    headline: string;
  }>;
  onRestart: () => void;
}

export function EndingSummary({ ending, stats, climate, dominantEthic, history, onRestart }: Props) {
  return (
    <section className="panel ending-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Final Summary</span>
          <h2>{ending.title}</h2>
        </div>
        <button className="ghost-button" onClick={onRestart}>Play again</button>
      </div>

      <div className="ending-copy">
        <p className="ending-lead">{ending.summary}</p>
        <p>{ending.reflection}</p>
        <p>{climate}</p>
      </div>

      <div className="ending-panels">
        <article className="result-card secondary">
          <h3>Leadership pattern</h3>
          <p>{dominantEthic}</p>
        </article>
        <article className="result-card secondary">
          <h3>Regional balance</h3>
          <div className="ending-stats">
            {statMeta.map((stat) => (
              <div key={stat.key}>
                <span>{stat.label}</span>
                <strong>{stats[stat.key]}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="result-card secondary">
        <h3>Final docket</h3>
        <div className="history-list">
          {history.slice(-4).map((entry) => (
            <div key={`${entry.eventId}-${entry.optionId}`}>
              <span>{entry.eventTitle}</span>
              <strong>{entry.optionLabel}</strong>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
