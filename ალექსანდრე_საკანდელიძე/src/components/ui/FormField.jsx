/** The inset field look. Exported so selects and text areas can share it. */
export const inputStyles = "h-11 w-full rounded-md border-0 bg-well px-3 text-[15px] text-ink shadow-[inset_0_2px_5px_rgb(0_0_0/0.14),inset_0_0_0_1px_var(--edge-bright)] placeholder:text-ink-soft focus:shadow-[inset_0_0_0_2px_var(--color-focus)] aria-invalid:shadow-[inset_0_0_0_2px_var(--color-sold-out)]";
/** The small label above a field. Exported for the catalog's controls, which aren't built with FormField. */
export const labelStyles = "grid gap-1 text-[13px] text-ink-soft";
/**
 * A field's error line. It is always on the page and keeps its height when empty. Without that, an error
 * appearing or disappearing moves everything below it. Leaving a field is what triggers the check, so this
 * happens in the middle of a click: the button slides away between mouse down and mouse up, and the click
 * is lost. See DEBUG-LOG.md. `grid-cols-2` in the forms starts at `md`, where every message fits on one line.
 */
export function FieldError({ id, message }) {
    return (<p id={id} className="min-h-[18px] text-[13px] leading-[18px] font-semibold text-error">
      {message}
    </p>);
}
export default function FormField({ id, label, error, ...inputProps }) {
    const errorId = `${id}-error`;
    return (<div className="grid gap-1">
      <label htmlFor={id} className="text-[13px] text-ink-soft">
        {label}
      </label>
      {/* aria-describedby makes screen readers read the error out when the field gets focus. */}
      <input id={id} className={inputStyles} aria-invalid={error !== undefined} aria-describedby={error !== undefined ? errorId : undefined} {...inputProps}/>
      <FieldError id={errorId} message={error}/>
    </div>);
}
