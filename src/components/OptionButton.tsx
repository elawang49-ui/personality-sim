type OptionButtonProps = {
  label: string
  description: string
  onClick: () => void
}

export function OptionButton({
  label,
  description,
  onClick,
}: OptionButtonProps) {
  return (
    <button className="option-button" type="button" onClick={onClick}>
      <span>{label}</span>
      <small>{description}</small>
    </button>
  )
}
