import { getLabelToneClass } from '../utils/labelColorMap'

type OptionButtonProps = {
  cornerLabel?: string
  label: string
  description: string
  onClick: () => void
}

export function OptionButton({
  cornerLabel,
  label,
  description,
  onClick,
}: OptionButtonProps) {
  return (
    <button className="option-button" type="button" onClick={onClick}>
      {cornerLabel && (
        <span
          className={`option-corner-label ${getLabelToneClass(cornerLabel)}`}
        >
          #{cornerLabel}
        </span>
      )}
      <span className="option-main-text">{cornerLabel ? description : label}</span>
      {!cornerLabel && (
        <small className="option-description">{description}</small>
      )}
    </button>
  )
}
