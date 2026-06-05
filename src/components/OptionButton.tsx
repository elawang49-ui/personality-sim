import { getLabelToneClass } from '../utils/labelColorMap'

type OptionButtonProps = {
  label?: string
  description: string
  cornerLabel?: string
  onClick: () => void
}

export function OptionButton({
  label,
  description,
  cornerLabel,
  onClick,
}: OptionButtonProps) {
  return (
    <button className="option-button" type="button" onClick={onClick}>
      {cornerLabel && (
        <div className={`option-corner-label ${getLabelToneClass(cornerLabel)}`}>
          #{cornerLabel}
        </div>
      )}
      {label && <span>{label}</span>}
      <small>{description}</small>
    </button>
  )
}
