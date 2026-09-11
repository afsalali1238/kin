import { Check } from 'lucide-react';

/** Toggle chip used across intake, daily check-in and session check-in. */
export default function ChoiceChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`choice-chip ${selected ? 'chosen' : ''}`} aria-pressed={selected} onClick={onClick}>
      {label}
      {selected && <Check size={15} />}
    </button>
  );
}
