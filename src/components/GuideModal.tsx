import { statMeta } from '../data/gameData';

interface Props {
  open: boolean;
  onClose: () => void;
  ambientEnabled: boolean;
  onToggleAmbient: () => void;
}

const frameworkNotes = [
  {
    title: 'Anthropocentrism',
    text: 'Judges policy by how it affects human welfare, safety, jobs, and future human flourishing.',
  },
  {
    title: 'Biocentrism',
    text: 'Treats living beings and species as morally important even when they are not useful to people.',
  },
  {
    title: 'Ecocentrism',
    text: 'Focuses on ecosystems, habitat integrity, resilience, and the health of the land as a whole.',
  },
];

export function GuideModal({ open, onClose, ambientEnabled, onToggleAmbient }: Props) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Landfall guide">
      <section className="panel guide-modal">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Guide</span>
            <h2>How to read Landfall</h2>
          </div>
          <button className="ghost-button" onClick={onClose}>Close</button>
        </div>

        <div className="guide-grid">
          <article className="result-card secondary">
            <h3>How a run works</h3>
            <p>Each turn presents one dilemma. You read the scenario, weigh advisor tensions, choose a policy response, and then see the narrative, legal, and ethical consequences.</p>
            <p>There are no clean answers. Strong short-term gains often create hidden ecological or legal debt later.</p>
          </article>

          <article className="result-card secondary">
            <h3>Quick controls</h3>
            <p>The campaign autosaves after each change. Use the top-bar controls to toggle ambient audio or save and return to the title screen.</p>
            <button className="ghost-button inline-button" onClick={onToggleAmbient}>
              Ambient {ambientEnabled ? 'on' : 'off'}
            </button>
          </article>
        </div>

        <article className="result-card secondary">
          <h3>What the stats mean</h3>
          <div className="guide-stats">
            {statMeta.map((stat) => (
              <div key={stat.key}>
                <strong>{stat.label}</strong>
                <span>
                  {stat.key === 'biodiversity' && 'Species richness and habitat variety across the region.'}
                  {stat.key === 'ecosystem' && "How stable Landfall's wetlands, forests, rivers, and coasts remain as systems."}
                  {stat.key === 'economy' && 'Jobs, fiscal confidence, trade, and visible material stability.'}
                  {stat.key === 'support' && 'Public trust, legitimacy, and political tolerance for your decisions.'}
                  {stat.key === 'legal' && 'Regulatory exposure, litigation risk, and how defensible your process is. Lower is better.'}
                  {stat.key === 'sustainability' && 'Whether your administration is preserving options for the future instead of spending them now.'}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="result-card secondary">
          <h3>How the ethical analysis works</h3>
          <div className="framework-grid">
            {frameworkNotes.map((framework) => (
              <div key={framework.title}>
                <strong>{framework.title}</strong>
                <span>{framework.text}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
