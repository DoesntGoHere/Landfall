import { advisors } from '../data/gameData';
import { AdvisorComment } from '../types';

interface Props {
  comments: AdvisorComment[];
}

export function AdvisorPanel({ comments }: Props) {
  return (
    <section className="panel advisors-panel">
      <div className="panel-heading">
        <span className="eyebrow">Advisors</span>
        <h3>Competing briefs</h3>
      </div>
      <div className="advisor-list">
        {comments.map((comment) => {
          const advisor = advisors.find((entry) => entry.id === comment.advisorId);
          if (!advisor) return null;

          return (
            <article className="advisor-card" key={`${advisor.id}-${comment.text}`}>
              <div>
                <strong>{advisor.name}</strong>
                <span>{advisor.role}</span>
              </div>
              <p>{comment.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
