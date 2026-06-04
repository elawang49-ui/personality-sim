import { copy } from '../data/copy'
import type { AttentionHook } from '../engine/types'

type AttentionHooksProps = {
  hooks: AttentionHook[]
}

export function AttentionHooks({ hooks }: AttentionHooksProps) {
  return (
    <section className="attention-panel reveal-panel">
      <p className="eyebrow">{copy.attentionReveal.eyebrow}</p>
      <h2>{copy.attentionReveal.title}</h2>
      <div className="attention-list">
        {hooks.map((hook, index) => (
          <div
            className="attention-hook revealed"
            key={hook.id}
            style={{ animationDelay: `${index * 140}ms` }}
          >
            <div className="attention-title">
              <span>{hook.label}</span>
            </div>
            <p>{hook.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
