import { statMeta } from '../data/gameData';
import { Stats } from '../types';

interface Props {
  stats: Stats;
  deltas?: Partial<Record<keyof Stats, number>>;
}

export function StatDisplay({ stats, deltas }: Props) {
  return (
    <section className="panel stat-panel">
      <div className="panel-heading">
        <span className="eyebrow">Regional Ledger</span>
        <h3>Landfall indicators</h3>
      </div>
      <div className="stat-grid">
        {statMeta.map((stat) => {
          const value = stats[stat.key];
          const delta = deltas?.[stat.key] ?? 0;
          const riskDisplay = stat.key === 'legal';

          return (
            <article className="stat-card" key={stat.key}>
              <div className="stat-topline">
                <span>{stat.label}</span>
                <strong>{value}</strong>
              </div>
              <div className="stat-track">
                <span className="stat-fill" style={{ width: `${value}%`, background: stat.tint }} />
              </div>
              <div className="stat-foot">
                <span>{riskDisplay ? 'Lower is safer' : 'Higher is stronger'}</span>
                {deltas && delta !== 0 ? (
                  <span className={delta > 0 ? 'delta positive' : 'delta negative'}>
                    {delta > 0 ? '+' : ''}
                    {delta}
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
