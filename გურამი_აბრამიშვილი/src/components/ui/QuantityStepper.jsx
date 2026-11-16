const stepBtn = "inline-flex size-11 items-center justify-center text-lg font-semibold transition-colors hover:bg-surface-2 " +
    "focus-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";
export default function QuantityStepper({ value, min = 1, max, onChange, disabled = false, label = "Quantity" }) {
    return (<div role="group" aria-label={label} className="inline-flex items-center overflow-hidden rounded-lg border border-line bg-surface">
      <button type="button" className={stepBtn} onClick={() => onChange(value - 1)} disabled={disabled || value <= min} aria-label="Decrease quantity">
        −
      </button>
      <span className="min-w-10 px-2 text-center font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={stepBtn} onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="Increase quantity">
        +
      </button>
    </div>);
}
