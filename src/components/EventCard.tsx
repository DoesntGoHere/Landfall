import { GameEvent, EventOption } from '../types';

interface Props {
  event: GameEvent;
  onChoose: (option: EventOption) => void;
}

export function EventCard({ event, onChoose }: Props) {
  return (
    <section className="panel event-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{event.chapter}</span>
          <h2>{event.title}</h2>
        </div>
        <span className="setting-pill">{event.setting}</span>
      </div>
      <p className="event-scenario">{event.scenario}</p>
      <p className="event-pressure">{event.pressure}</p>
      <div className="choices-grid">
        {event.options.map((option) => (
          <button className="choice-card" key={option.id} onClick={() => onChoose(option)}>
            <strong>{option.label}</strong>
            <span>{option.stance}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
